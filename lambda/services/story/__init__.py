import os
import boto3
import logging
from boto3.dynamodb.conditions import Key
from .save import save_story  # Expose the save function

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')

STORY_TABLE_NAME = os.environ.get('STORY_TABLE_NAME', 'story-gif')
story_table = dynamodb.Table(STORY_TABLE_NAME)


def get_story_by_pk(pk: str) -> dict | None:
    """
    Get a single item from story-gif by its exact PK.
    Returns the item dict or None if not found.
    """
    try:
        response = story_table.get_item(Key={'PK': pk})
        item = response.get('Item')
        if not item:
            logger.info(f"No item found for PK={pk}")
        return item
    except Exception as e:
        logger.error(f"get_story_by_pk error for PK={pk}: {e}")
        raise


def get_all_stories_by_pk(pk: str) -> list[dict]:
    """
    Query all items in story-gif that share the same PK (partition key).
    Use this when the table has a composite key (PK + SK) and you want
    every sort-key variant under a given partition key.
    Returns a list of item dicts (empty list if none found).
    """
    try:
        items = []
        kwargs = {
            'KeyConditionExpression': Key('PK').eq(pk)
        }

        while True:
            response = story_table.query(**kwargs)
            items.extend(response.get('Items', []))

            # DynamoDB paginates at 1 MB — follow the cursor until done
            last_key = response.get('LastEvaluatedKey')
            if not last_key:
                break
            kwargs['ExclusiveStartKey'] = last_key

        logger.info(f"get_all_stories_by_pk: found {len(items)} item(s) for PK={pk}")
        return items
    except Exception as e:
        logger.error(f"get_all_stories_by_pk error for PK={pk}: {e}")
        raise


def list_all_stories(limit: int = 100) -> list[dict]:
    """
    Scans the story-gif table and returns summary fields for every story.
    Only returns PK, slug, title, metadata (for cover/genre/summary) and
    the cover image entry so the listing page stays lightweight.
    """
    try:
        items = []
        kwargs = {
            'ProjectionExpression': 'PK, slug, title, metadata, images',
            'Limit': limit,
        }
        while True:
            response = story_table.scan(**kwargs)
            items.extend(response.get('Items', []))
            last_key = response.get('LastEvaluatedKey')
            if not last_key:
                break
            kwargs['ExclusiveStartKey'] = last_key
        logger.info(f"list_all_stories: found {len(items)} stories")
        return items
    except Exception as e:
        logger.error(f"list_all_stories error: {e}")
        raise
