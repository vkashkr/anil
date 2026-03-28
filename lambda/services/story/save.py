import boto3
import os
import json
import base64
import uuid
import logging
from decimal import Decimal
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# Configuration from environment variables
STORY_TABLE_NAME = os.environ.get('STORY_TABLE_NAME', 'story-gif')
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'www.aliyaescort.com')

story_table = dynamodb.Table(STORY_TABLE_NAME)


def _sanitize_for_dynamo(obj):
    """
    Recursively removes None values and empty strings (DynamoDB rejects them)
    and converts floats to Decimal (DynamoDB rejects float).
    """
    if isinstance(obj, dict):
        return {
            k: _sanitize_for_dynamo(v)
            for k, v in obj.items()
            if v is not None and v != ''
        }
    if isinstance(obj, list):
        return [_sanitize_for_dynamo(i) for i in obj if i is not None and i != '']
    if isinstance(obj, float):
        return Decimal(str(obj))
    return obj


def _detect_content_type(header: str) -> str:
    """
    Parses content type from a data URI header like 'data:image/png;base64'.
    Defaults to image/jpeg.
    """
    try:
        return header.split(':')[1].split(';')[0]
    except (IndexError, AttributeError):
        return 'image/jpeg'


def save_story(event):
    """
    Saves or updates a story in DynamoDB.
    Handles base64 image uploads to S3 when src starts with 'data:image'.
    EXPECTS: event['body'] as JSON string with the full story object.
    """
    try:
        body = json.loads(event.get('body', '{}'))

        # 1. Validate required fields
        story_id = body.get('id')
        if not story_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing 'id' in story data"})}

        # 2. Process images — upload any base64-encoded images to S3
        updated_images = []
        for img in body.get('images', []):
            src = img.get('src', '')
            if src.startswith('data:image'):
                header, data = src.split(',', 1) if ',' in src else ('data:image/jpeg;base64', src)
                content_type = _detect_content_type(header)
                ext = content_type.split('/')[-1].replace('jpeg', 'jpg')
                s3_key = f"stories/{story_id}/{uuid.uuid4()}.{ext}"
                _upload_base64_to_s3(data, s3_key, content_type)
                img['src'] = f"https://{BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
            updated_images.append(img)
        body['images'] = updated_images

        # 3. Build DynamoDB item
        item = {
            'PK': story_id,
            'slug': body.get('slug'),
            'title': body.get('title'),
            'metadata': body.get('metadata'),
            'characters': body.get('characters'),
            'paragraphs': body.get('paragraphs'),
            'images': body.get('images'),
            'updatedAt': datetime.utcnow().isoformat()
        }

        # Remove None/empty and convert floats to Decimal for DynamoDB
        item = _sanitize_for_dynamo(item)

        story_table.put_item(Item=item)
        logger.info(f"Story saved: PK={story_id}")

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Story saved successfully", "id": story_id})
        }

    except Exception as e:
        logger.error(f"Error saving story: {e}")
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}


def _upload_base64_to_s3(base64_data: str, key: str, content_type: str = 'image/jpeg'):
    """
    Uploads raw base64-decoded bytes to S3.
    Does NOT set ACL — relies on bucket policy for access control.
    """
    try:
        binary_data = base64.b64decode(base64_data)
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=binary_data,
            ContentType=content_type
        )
        logger.info(f"Uploaded to S3: {key}")
    except Exception as e:
        logger.error(f"S3 upload failed for {key}: {e}")
        raise


# Keep old name as alias for backward compatibility
def upload_base64_to_s3(base64_string, key):
    """
    Helper to upload a base64 data URI to S3.
    """
    try:
        # Split headers if present (e.g. "data:image/jpeg;base64,...")
        if ',' in base64_string:
            header, data = base64_string.split(',', 1)
        else:
            data = base64_string

        binary_data = base64.b64decode(data)
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=key,
            Body=binary_data,
            ContentType='image/jpeg'
        )
        logger.info(f"Uploaded {key} to S3")
    except Exception as e:
        logger.error(f"S3 Upload failed: {e}")
        raise e
