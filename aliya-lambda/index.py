import json
import base64
import boto3
import os
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3 = boto3.client('s3')
BUCKET = os.environ.get('BUCKET_NAME', 'gif-gif')

def lambda_handler(event, context):
    logger.info(f"Event: {event}")
    routeKey = event['routeKey']
    logger.info(f"Received {routeKey} request")
    if routeKey == 'POST /upload':
        return post_images(event)
    elif routeKey == 'GET /view':
        logger.info("Listing images")
        return list_images(event)
    elif routeKey == 'GET /get-profiles':
        logger.info("Listing profile images")
        return list_profile_images(event)
    elif routeKey == 'DELETE /delete-image':
        logger.info("Delete image - Not implemented")
        return delete_image(event)
    else:
        return {"statusCode": 405, "body": "Method Not Allowed"}

def delete_image(event):
    try:
        filename = event['queryStringParameters'].get('filename')
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
        id = event['queryStringParameters'].get('id')
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
        response = s3.list_objects_v2(Bucket=BUCKET)
        images = []
        for obj in response.get('Contents', []):
            key = obj['Key']
            if key.endswith('profile.jpg'):
                head = s3.head_object(Bucket=BUCKET, Key=key)
                metadata = head.get('Metadata', {})
                full_path = f"https://{BUCKET}.s3.amazonaws.com/{key}"
                images.append({
                    "filename": key,
                    "full_path": full_path,
                    "metadata": metadata
                })
        logger.info(f"Found {len(images)} images")
        return {
            "statusCode": 200,
            "body": json.dumps({"images": images})
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
                    Key=f"{id}/{s3_filename}",
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
            "statusCode": 200,
            "body": json.dumps(results)
        }
    except Exception as e:
        return {"statusCode": 500, "body": f"Internal error: {str(e)}"}

