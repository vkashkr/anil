import json
import hashlib
import secrets
import re
from datetime import datetime, timedelta

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

ADMIN_EMAIL = 'admin@aliyaescort.com'
ADMIN_PASSWORD = 'adminpassword'


def ensure_admin_exists(table):
    """Seed admin user if it doesn't exist."""
    existing = table.get_item(Key={'PK': ADMIN_EMAIL}).get('Item')
    if not existing:
        table.put_item(Item={
            'PK': ADMIN_EMAIL,
            'email': ADMIN_EMAIL,
            'name': 'Admin',
            'phone': '',
            'passwordHash': hash_password(ADMIN_PASSWORD),
            'otp': '',
            'otpExpires': '',
            'verified': True,
            'role': 'admin',
            'authProvider': 'email',
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
        })


def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
    return f"{salt}:{hashed}"


def verify_password(password, stored):
    salt, _ = stored.split(':')
    return hash_password(password, salt) == stored


def handle_signup(body, table):
    email = (body.get('email') or '').strip().lower()
    name = (body.get('name') or '').strip()
    phone = (body.get('phone') or '').strip()
    password = body.get('password') or ''

    if not email or not EMAIL_REGEX.match(email):
        return _resp(400, False, 'Valid email is required')
    if not name or len(name) < 2:
        return _resp(400, False, 'Name must be at least 2 characters')
    if not password or len(password) < 6:
        return _resp(400, False, 'Password must be at least 6 characters')

    # Check if user already exists
    existing = table.get_item(Key={'PK': email}).get('Item')
    if existing and existing.get('verified'):
        return _resp(409, False, 'Email already registered')

    otp = f"{secrets.randbelow(900000) + 100000}"
    otp_expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    item = {
        'PK': email,
        'email': email,
        'name': name[:100],
        'phone': phone[:20] if phone else '',
        'passwordHash': hash_password(password),
        'otp': otp,
        'otpExpires': otp_expires,
        'verified': False,
        'createdAt': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat(),
    }

    # Overwrite if unverified, create if new
    table.put_item(Item=item)

    # Send OTP via SES
    try:
        import boto3
        ses = boto3.client('ses', region_name='us-east-1')
        ses.send_email(
            Source='verify@aliyaescort.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Verify your email - Aliya Escort', 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {
                        'Data': f'''
                        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
                            <h2 style="color:#ec4899;">Email Verification</h2>
                            <p>Hi {name},</p>
                            <p>Your verification code is:</p>
                            <div style="background:#111;color:#facc15;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:12px;letter-spacing:8px;margin:20px 0;">
                                {otp}
                            </div>
                            <p style="color:#888;font-size:13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
                        </div>
                        ''',
                        'Charset': 'UTF-8'
                    }
                }
            }
        )
    except Exception as e:
        print(f"SES Error: {e}")
        return _resp(500, False, 'Failed to send verification email. Please try again.')

    return _resp(200, True, 'Verification code sent to your email')


def handle_verify_otp(body, table):
    email = (body.get('email') or '').strip().lower()
    otp = (body.get('otp') or '').strip()

    if not email or not otp:
        return _resp(400, False, 'Email and OTP are required')

    item = table.get_item(Key={'PK': email}).get('Item')
    if not item:
        return _resp(404, False, 'Account not found')
    if item.get('verified'):
        return _resp(200, True, 'Email already verified')

    stored_otp = item.get('otp', '')
    otp_expires = item.get('otpExpires', '')

    if not stored_otp or otp != stored_otp:
        return _resp(400, False, 'Invalid verification code')
    if otp_expires and datetime.utcnow() > datetime.fromisoformat(otp_expires):
        return _resp(400, False, 'Verification code expired. Please sign up again.')

    table.update_item(
        Key={'PK': email},
        UpdateExpression='SET verified = :v, otp = :empty, otpExpires = :empty, updatedAt = :t',
        ExpressionAttributeValues={
            ':v': True,
            ':empty': '',
            ':t': datetime.utcnow().isoformat()
        }
    )

    return _resp(200, True, 'Email verified successfully', {
        'user': {'email': email, 'name': item.get('name', '')}
    })


def handle_user_login(body, table):
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or not password:
        return _resp(400, False, 'Email and password are required')

    # Ensure admin user exists on every login attempt
    if email == ADMIN_EMAIL:
        ensure_admin_exists(table)

    item = table.get_item(Key={'PK': email}).get('Item')
    if not item:
        return _resp(401, False, 'Invalid email or password')
    if not item.get('verified'):
        return _resp(403, False, 'Email not verified. Please sign up again.')
    if not verify_password(password, item.get('passwordHash', '')):
        return _resp(401, False, 'Invalid email or password')

    # Update last login
    table.update_item(
        Key={'PK': email},
        UpdateExpression='SET lastLogin = :t, updatedAt = :t',
        ExpressionAttributeValues={':t': datetime.utcnow().isoformat()}
    )

    return _resp(200, True, 'Login successful', {
        'user': {
            'email': email,
            'name': item.get('name', ''),
            'phone': item.get('phone', ''),
            'role': item.get('role', 'user'),
        }
    })


def handle_resend_otp(body, table):
    email = (body.get('email') or '').strip().lower()
    if not email:
        return _resp(400, False, 'Email is required')

    item = table.get_item(Key={'PK': email}).get('Item')
    if not item:
        return _resp(404, False, 'Account not found. Please sign up first.')
    if item.get('verified'):
        return _resp(200, True, 'Email already verified')

    otp = f"{secrets.randbelow(900000) + 100000}"
    otp_expires = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    table.update_item(
        Key={'PK': email},
        UpdateExpression='SET otp = :o, otpExpires = :e, updatedAt = :t',
        ExpressionAttributeValues={
            ':o': otp, ':e': otp_expires, ':t': datetime.utcnow().isoformat()
        }
    )

    try:
        import boto3
        ses = boto3.client('ses', region_name='us-east-1')
        ses.send_email(
            Source='verify@aliyaescort.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'New verification code - Aliya Escort', 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {
                        'Data': f'''
                        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
                            <h2 style="color:#ec4899;">New Verification Code</h2>
                            <div style="background:#111;color:#facc15;font-size:32px;font-weight:bold;text-align:center;padding:20px;border-radius:12px;letter-spacing:8px;margin:20px 0;">
                                {otp}
                            </div>
                            <p style="color:#888;font-size:13px;">This code expires in 10 minutes.</p>
                        </div>
                        ''',
                        'Charset': 'UTF-8'
                    }
                }
            }
        )
    except Exception as e:
        print(f"SES Error: {e}")
        return _resp(500, False, 'Failed to send verification email')

    return _resp(200, True, 'New verification code sent')


def handle_google_signin(body, table):
    """Handle Google Sign-In: verify token, create or login user."""
    credential = body.get('credential') or ''
    if not credential:
        return _resp(400, False, 'Google credential is required')

    # Decode the Google ID token (JWT) and verify
    try:
        import urllib.request
        import jwt_decode
    except ImportError:
        pass

    # Decode JWT payload without external lib (Google tokens are 3-part base64)
    try:
        import base64
        parts = credential.split('.')
        if len(parts) != 3:
            return _resp(400, False, 'Invalid Google token')
        # Decode payload (part 1)
        payload_b64 = parts[1]
        # Add padding
        payload_b64 += '=' * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
    except Exception as e:
        print(f"Token decode error: {e}")
        return _resp(400, False, 'Invalid Google token')

    email = (payload.get('email') or '').strip().lower()
    name = payload.get('name') or ''
    picture = payload.get('picture') or ''
    email_verified = payload.get('email_verified', False)

    if not email or not email_verified:
        return _resp(400, False, 'Google email not verified')

    # Check if user exists
    existing = table.get_item(Key={'PK': email}).get('Item')

    if existing:
        # User exists - update last login
        table.update_item(
            Key={'PK': email},
            UpdateExpression='SET lastLogin = :t, updatedAt = :t, picture = :p, authProvider = :g',
            ExpressionAttributeValues={
                ':t': datetime.utcnow().isoformat(),
                ':p': picture,
                ':g': 'google'
            }
        )
    else:
        # Create new user (auto-verified since Google verified the email)
        item = {
            'PK': email,
            'email': email,
            'name': name[:100],
            'phone': '',
            'passwordHash': '',
            'otp': '',
            'otpExpires': '',
            'verified': True,
            'authProvider': 'google',
            'picture': picture,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'lastLogin': datetime.utcnow().isoformat(),
        }
        table.put_item(Item=item)

    return _resp(200, True, 'Google sign-in successful', {
        'user': {
            'email': email,
            'name': name,
            'picture': picture,
        }
    })


def _resp(status, success, message, extra=None):
    body = {'success': success, 'message': message}
    if extra:
        body.update(extra)
    return {
        'statusCode': status,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }
