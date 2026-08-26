import json
import base64
import boto3
import os
import logging
from datetime import datetime
from review import handle_add_review
from user_auth import handle_signup, handle_verify_otp, handle_user_login, handle_resend_otp, handle_google_signin
from services.story import save_story, get_story_by_pk, get_all_stories_by_pk, list_all_stories

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

BUCKET = os.environ.get('BUCKET_NAME', 'gif-gif')
SITE_BUCKET = os.environ.get('SITE_BUCKET_NAME', 'www.aliyaescort.com')
TABLE_NAME = os.environ.get('TABLE_NAME', 'gif-gif')
STORY_TABLE_NAME = os.environ.get('STORY_TABLE_NAME', 'story-gif')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    logger.info(f"Event: {event}")
    
    # Handle API Gateway v2 (original) or REST API (fallback)
    routeKey = event.get('routeKey')
    if not routeKey:
         http_method = event.get('httpMethod')
         path = event.get('path')
         if http_method and path:
             routeKey = f"{http_method} {path}"

    logger.info(f"Received {routeKey} request")
    
    if routeKey == 'POST /upload':
        return post_images(event)
    elif routeKey == 'GET /view':
        return list_images(event)
    elif routeKey == 'GET /get-profiles':
        return list_profile_images(event)
    elif routeKey == 'DELETE /delete-image':
        return delete_image(event)
    elif routeKey == 'POST /admin':
        return admin_handler(event)
    elif routeKey == 'POST /user-auth':
        return user_auth_handler(event)
    elif routeKey == 'POST /story':
        return save_story(event)
    elif routeKey == 'GET /story':
        qs = event.get('queryStringParameters') or {}
        pk = qs.get('id')
        if not pk:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing 'id'"})}
        item = get_story_by_pk(pk)
        if not item:
            return {"statusCode": 404, "body": json.dumps({"error": "Story not found"})}
        return {"statusCode": 200, "body": json.dumps(item, default=str)}
    elif routeKey == 'GET /stories':
        qs = event.get('queryStringParameters') or {}
        pk = qs.get('id')
        if not pk:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing 'id'"})}
        items = get_all_stories_by_pk(pk)
        return {"statusCode": 200, "body": json.dumps(items, default=str)}
    elif routeKey == 'GET /story-list':
        try:
            items = list_all_stories()
            return {"statusCode": 200, "body": json.dumps({"stories": items}, default=str)}
        except Exception as e:
            return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
    else:
        return {"statusCode": 405, "body": "Method Not Allowed"}

def delete_image(event):
    try:
        qs = event.get('queryStringParameters') or {}
        filename = qs.get('filename')
        if not filename:
            return {"statusCode": 400, "body": "Missing 'filename' query parameter."}
        logger.info(f"Requested deletion of image: {filename}")
        s3.delete_object(Bucket=BUCKET, Key=filename)
        return {
            "statusCode": 200,
            "body": json.dumps({"success": True, "filename": filename})
        }
    except Exception as e:
        logger.info(f"Error deleting image: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"success": False, "error": str(e)})
        }

def list_profile_images(event):
    try:
        qs = event.get('queryStringParameters') or {}
        id = qs.get('id')
        if not id:
            return {"statusCode": 400, "body": "Missing 'id' query parameter."}
        response = s3.list_objects_v2(Bucket=BUCKET , Prefix=f"{id}/")
        images = []
        for obj in response.get('Contents', []):
            key = obj['Key']
            head = s3.head_object(Bucket=BUCKET, Key=key)
            full_path = f"https://{BUCKET}.s3.amazonaws.com/{key}"
            images.append({
                    "filename": key,
                    "full_path": full_path
                })
        logger.info(f"Found {len(images)} profile images")
        return {
            "statusCode": 200,
            "body": json.dumps({"images": images})
        }
    except Exception as e:
        logger.info(f"Error listing profile images: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
def list_images(event):
    try:
        qs = event.get('queryStringParameters') or {}
        limit = int(qs.get('limit', 50))
        next_token = qs.get('next_token')
        
        list_params = {
            'Bucket': BUCKET,
            'MaxKeys': limit
        }
        if next_token:
            list_params['ContinuationToken'] = next_token

        response = s3.list_objects_v2(**list_params)
        images = []
        
        for obj in response.get('Contents', []):
            key = obj['Key']
            is_profile = key.endswith('profile.jpg')
            metadata = {}
            
            if is_profile:
                try:
                    head = s3.head_object(Bucket=BUCKET, Key=key)
                    metadata = head.get('Metadata', {})
                except Exception as e:
                    logger.error(f"Error getting metadata for {key}: {e}")

            full_path = f"https://{BUCKET}.s3.amazonaws.com/{key}"
            
            img_data = {
                "id": key.split('/')[0],
                "filename": key,
                "full_path": full_path,
                "metadata": metadata
            }
            images.append(img_data)

        logger.info(f"Found {len(images)} images in batch")
        
        result = {
            "images": images
        }
        
        if response.get('IsTruncated'):
            # The key is NextContinuationToken, not NextToken
            result['next_token'] = response.get('NextContinuationToken')

        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }
    except Exception as e:
        logger.info(f"Error listing images: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

def post_images(event):
    try:
        body = event.get('body')
        if body is None:
            return {"statusCode": 400, "body": "Missing request body."}
        if isinstance(body, str):
            body = json.loads(body)

        # Accept either a single object or a list of objects
        images = body if isinstance(body, list) else [body]
        results = []
        for idx, img in enumerate(images):
            image_b64 = img.get('image')
            filename = img.get('filename')
            metadata = img.get('metadata', {})
            name = metadata.get('name')
            age = metadata.get('age')
            gender = metadata.get('gender')
            id = metadata.get('id')
            description = metadata.get('description')

            if not metadata:
                s3_filename = filename
                logger.info(f"Updating image {s3_filename}")
                try:
                    image_bytes = base64.b64decode(image_b64)
                except Exception:
                    logger.info(f"Invalid base64 image data: ...")
                    results.append({"success": False, "filename": filename, "error": "Invalid base64 image data."})
                    continue
                logger.info(f"Uploading image: {filename}, {BUCKET}")
                s3.put_object(
                    Bucket=BUCKET,
                    Key=f"{s3_filename}",
                    Body=image_bytes,
                    Metadata=metadata,
                    ContentType="image/jpeg"  # or detect from filename
                )
                continue

            if not all([image_b64, filename, name, age, gender, id]):
                results.append({"success": False, "filename": filename, "error": "Missing required fields."})
                continue

            # Decode image
            try:
                image_bytes = base64.b64decode(image_b64)
            except Exception:
                results.append({"success": False, "filename": filename, "error": "Invalid base64 image data."})
                continue

            # Prepare metadata for S3 (must be strings) for profile only
            s3_filename = "profile.jpg" if idx == 0 else filename
            if idx == 0:
                s3_metadata = {
                    "name": str(name),
                    "age": str(age),
                    "gender": str(gender),
                    "description": str(description) if description else ""
                }
            else:
                s3_metadata = {}

            try:
                s3.put_object(
                    Bucket=BUCKET,
                    Key=f"{id}/{s3_filename}",
                    Body=image_bytes,
                    Metadata=s3_metadata,
                    ContentType="image/jpeg"  # or detect from filename
                )
                results.append({"success": True, "filename": s3_filename})
            except Exception as e:
                results.append({"success": False, "filename": s3_filename, "error": str(e)})

        # If only one image, return single result for backward compatibility
        if len(results) == 1:
            return {
                "statusCode": 200 if results[0]["success"] else 400,
                "body": json.dumps(results[0])
            }
        
        return {
            "statusCode": 207, # Multi-Status
            "body": json.dumps(results)
        }

    except Exception as e:
        logger.error(f"Error in post_images: {str(e)}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

def user_auth_handler(event):
    logger.info("Processing User Auth Request")
    body = event.get('body')
    if body:
        try:
            if isinstance(body, str):
                body = json.loads(body)
        except Exception:
            return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Invalid JSON body'})}
    else:
        return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Missing body'})}

    USER_TABLE_NAME = os.environ.get('USER_TABLE_NAME', 'user-gif')
    user_table = dynamodb.Table(USER_TABLE_NAME)

    action = body.get('action')
    if action == 'signup':
        return handle_signup(body, user_table)
    elif action == 'verify_otp':
        return handle_verify_otp(body, user_table)
    elif action == 'login':
        return handle_user_login(body, user_table)
    elif action == 'resend_otp':
        return handle_resend_otp(body, user_table)
    elif action == 'google_signin':
        return handle_google_signin(body, user_table)
    else:
        return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': f'Unknown auth action: {action}'})}

def admin_handler(event):
    logger.info("Processing Admin Request")
    body = event.get('body')
    if body:
        try:
            if isinstance(body, str):
                body = json.loads(body)
        except Exception:
            return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Invalid JSON body'})}
    else:
        return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Missing body'})}
            
    action = body.get('action')
    filename = body.get('filename')
    content = body.get('content')
    content_type = body.get('contentType', 'text/html')
    profile = body.get('profile')
    
    if action == 'upload_file':
        if not filename or not content:
            return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Missing filename or content'})}
            
        try:
            s3.put_object(
                Bucket=SITE_BUCKET,
                Key=filename,
                Body=content,
                ContentType=content_type,
                CacheControl='max-age=3600'
            )
            s3_url = f"https://{SITE_BUCKET}/{filename}"
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'success': True, 'message': 'File uploaded successfully', 'url': s3_url})
            }
        except Exception as e:
             return {'statusCode': 500, 'body': json.dumps({'success': False, 'message': str(e)})}

    if not profile and action not in ['get_profile', 'scan_profiles', 'delete_profile', 'add_review']:
        if not profile or not profile.get('id'):
            return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Missing profile data or ID'})}
        
    try:
        if action == 'get_profile':
            id = body.get('id')
            if not id:
                 return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Missing ID'})}
            
            # Use PK as the partition key
            response = table.get_item(Key={'PK': id})
            item = response.get('Item')
            
            # Ensure 'id' is present for frontend compatibility
            if item and 'PK' in item and 'id' not in item:
                item['id'] = item['PK']
                
            return {
                'statusCode': 200,
                 'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'success': True, 'profile': item}, default=str)
            }

        elif action == 'scan_profiles':
            response = table.scan()
            items = response.get('Items', [])
            
            # Map PK to id for frontend compatibility
            for item in items:
                if 'PK' in item and 'id' not in item:
                    item['id'] = item['PK']
            
            return {
                'statusCode': 200,
                 'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'success': True, 'profiles': items}, default=str)
            }

        elif action == 'delete_profile':
            id = body.get('id')
            if not id:
                 return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': 'Missing ID'})}
            
            # Use PK for deletion
            table.delete_item(Key={'PK': id})
            return {
                'statusCode': 200,
                 'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'success': True, 'message': 'Profile deleted'})
            }

        elif action == 'add_review':
            return handle_add_review(body, table)

        # 1. Save to DynamoDB (default action for 'save' or 'publish')
        if action in ['save', 'publish']:
            # Ensure PK is set from id
            if 'id' in profile:
                profile['PK'] = profile['id']
            
            profile['updatedAt'] = datetime.utcnow().isoformat()
            table.put_item(Item=profile)
        
            response_data = {'success': True, 'message': 'Profile saved successfully'}
        
            # 2. Publish to S3 if requested
            if action == 'publish':
                html_content = generate_profile_html(profile)
                filename = f"profiles/{profile['id']}.html"
                
                s3.put_object(
                    Bucket=SITE_BUCKET,
                    Key=filename,
                    Body=html_content,
                    ContentType='text/html',
                    CacheControl='max-age=3600'
                )
                
                s3_url = f"https://{SITE_BUCKET}/{filename}"
                response_data['message'] = 'Profile published successfully'
                response_data['s3Url'] = s3_url
                
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps(response_data)
            }
        
        return {'statusCode': 400, 'body': json.dumps({'success': False, 'message': f'Unknown action: {action}'})}
        
    except Exception as e:
        logger.error(f"Admin Handler Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }

def generate_profile_html(profile):
    name = profile.get('name', 'Unknown')
    seo_title = profile.get('seoTitle') or f"{name} - Escort Ahmedabad "
    description = profile.get('description', '')
    seo_description = profile.get('seoDescription') or description[:160]
    custom_css = profile.get('customCss', '')
    
    images = profile.get('images', [])
    main_image = images[0] if images else 'https://via.placeholder.com/400x600'
    
    service_tags = ""
    if profile.get('services'):
        tags = "".join([f'<span class="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm">{s}</span>' for s in profile['services']])
        service_tags = f'<div class="mt-6"><h3 class="text-lg font-bold text-white mb-2">Services</h3><div class="flex flex-wrap gap-2">{tags}</div></div>'
        
    thumbnails = ""
    if len(images) > 1:
        thumbs_html = "".join([f'<div class="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent"><img src="{img}" alt="Thumbnail" class="object-cover w-full h-full"></div>' for img in images])
        thumbnails = f'<div class="flex gap-2 overflow-x-auto py-2">{thumbs_html}</div>'

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{seo_title}</title>
    <meta name="description" content="{seo_description}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Custom Admin CSS */
      {custom_css}
      .gradient-text {{ background: linear-gradient(to right, #ec4899, #a855f7, #facc15); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
    </style>
</head>
<body class="bg-zinc-900 text-gray-100 font-sans">
    <nav class="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div class="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <a href="/" class="text-pink-400 font-bold text-xl flex items-center gap-2 hover:text-pink-300 transition"><span>←</span> Back to Home</a>
          <div class="text-lg font-bold text-white">{name}</div>
        </div>
    </nav>
    <main class="max-w-6xl mx-auto p-4 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div class="space-y-4">
                <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                    <img src="{main_image}" alt="{name}" class="object-cover w-full h-full">
                </div>
                {thumbnails}
            </div>
            <div class="flex flex-col gap-6">
                <div class="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
                    <h1 class="text-4xl md:text-5xl font-extrabold gradient-text mb-2">{name}</h1>
                    <div class="flex flex-wrap gap-3 mb-6">
                        <span class="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm font-semibold border border-pink-500/30">{profile.get('age', '')} Years Old</span>
                        <span class="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">📍 {profile.get('location', '')}</span>
                        <span class="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30 capitalize">{profile.get('gender', '')}</span>
                    </div>
                    <div class="space-y-4 text-gray-300 text-lg leading-relaxed"><h2 class="text-xl font-bold text-white border-b border-white/10 pb-2">About Me</h2><div class="whitespace-pre-line text-gray-200">{description}</div></div>
                    {service_tags}
                    <div class="mt-8 pt-6 border-t border-white/10">
                        <h3 class="text-lg font-bold text-white mb-4">Contact Information</h3>
                        <a href="tel:+919157204082" class="block w-full text-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200 mb-4">Details: 📞 Call Now</a>
                         <a href="https://wa.me/919157204082" class="block w-full text-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200">💬 WhatsApp Me</a>
                        <p class="text-center text-xs text-gray-500 mt-4">* Please mention you saw my profile on Aliya Escort</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <footer class="w-full bg-black text-gray-500 py-6 text-center mt-12 border-t border-gray-800"><div>Copyright © 2026 Escort Ahmedabad </div></footer>
</body>
</html>"""