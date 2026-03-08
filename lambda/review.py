import json
from datetime import datetime

def handle_add_review(body, table):
    review_id = body.get('id')
    review = body.get('review')
    if not review_id or not review:
        return {
            'statusCode': 400,
            'body': json.dumps({'success': False, 'message': 'Missing id or review data'})
        }
    try:
        # Sanitize review fields
        clean_review = {
            'name': str(review.get('name', 'Anonymous'))[:50],
            'rating': max(1, min(5, int(review.get('rating', 5)))),
            'text': str(review.get('text', ''))[:500],
            'date': str(review.get('date', datetime.utcnow().strftime('%b %Y')))[:20]
        }
        # Get current reviews, cap at 7 (overwrite oldest if full)
        resp = table.get_item(Key={'PK': review_id}, ProjectionExpression='reviews')
        current = resp.get('Item', {}).get('reviews', [])
        current.append(clean_review)
        if len(current) > 7:
            current = current[-7:]
        table.update_item(
            Key={'PK': review_id},
            UpdateExpression='SET reviews = :r',
            ExpressionAttributeValues={':r': current}
        )
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'OPTIONS,POST'},
            'body': json.dumps({'success': True, 'message': 'Review added successfully', 'review': clean_review})
        }
    except Exception as e:
        print(f"Error adding review: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }
