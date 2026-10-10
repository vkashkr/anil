"""Copy public Google Drive folder images to S3 as ``{index}/profile.jpg``."""

from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path
import tempfile

import boto3
import gdown
from PIL import Image, ImageOps, UnidentifiedImageError


SOURCE_FOLDER = (
    "https://drive.google.com/drive/u/1/folders/"
    "1Jq3ogs5unr7n05SxQqOdZrlBDStYnb_d"
)
DEFAULT_BUCKET = "gif-gif"
DEFAULT_REGION = "us-east-1"
IMAGE_SUFFIXES = {
    ".bmp",
    ".gif",
    ".jpeg",
    ".jpg",
    ".png",
    ".tif",
    ".tiff",
    ".webp",
}


def _jpeg_bytes(image_path: Path) -> bytes:
    """Return a JPEG representation of an image, flattening transparency to white."""
    with Image.open(image_path) as source_image:
        image = ImageOps.exif_transpose(source_image)
        if "A" in image.getbands():
            rgba_image = image.convert("RGBA")
            rgb_image = Image.new("RGB", rgba_image.size, "white")
            rgb_image.paste(rgba_image, mask=rgba_image.getchannel("A"))
        else:
            rgb_image = image.convert("RGB")

        output = BytesIO()
        rgb_image.save(output, format="JPEG", quality=95)
        return output.getvalue()


def sync_images(
    folder_url: str,
    bucket: str,
    region: str,
    *,
    dry_run: bool = False,
) -> int:
    """Download folder images and upload them to indexed S3 profile keys."""
    with tempfile.TemporaryDirectory(prefix="drive-s3-sync-") as temporary_directory:
        downloaded_paths = gdown.download_folder(
            folder_url,
            output=temporary_directory,
            quiet=False,
            use_cookies=False,
        )
        if not downloaded_paths:
            raise RuntimeError("No files were downloaded from the Drive folder.")

        image_paths = [
            Path(path)
            for path in downloaded_paths
            if Path(path).is_file() and Path(path).suffix.lower() in IMAGE_SUFFIXES
        ]
        if not image_paths:
            raise RuntimeError("The Drive folder contains no supported image files.")

        for image_path in image_paths:
            try:
                with Image.open(image_path) as image:
                    image.verify()
            except (UnidentifiedImageError, OSError) as error:
                raise RuntimeError(
                    f"Could not read image {image_path.name!r}: {error}"
                ) from error

        if dry_run:
            for index, image_path in enumerate(image_paths):
                print(f"{image_path.name} -> s3://{bucket}/{index}/profile.jpg")
            print(f"Dry run: {len(image_paths)} image(s); nothing uploaded.")
            return len(image_paths)

        s3 = boto3.client("s3", region_name=region)
        for index, image_path in enumerate(image_paths):
            s3_key = f"{index}/profile.jpg"
            s3.put_object(
                Bucket=bucket,
                Key=s3_key,
                Body=_jpeg_bytes(image_path),
                ContentType="image/jpeg",
            )
            print(f"Uploaded {image_path.name} -> s3://{bucket}/{s3_key}")

        print(f"Uploaded {len(image_paths)} image(s) to s3://{bucket}/")
        return len(image_paths)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Copy images from a public Google Drive folder to "
            "S3 as {zero-based-index}/profile.jpg."
        )
    )
    parser.add_argument("--source", default=SOURCE_FOLDER, help="Google Drive folder URL")
    parser.add_argument("--bucket", default=DEFAULT_BUCKET, help="Destination S3 bucket")
    parser.add_argument("--region", default=DEFAULT_REGION, help="AWS region")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List destination keys without uploading",
    )
    args = parser.parse_args()

    sync_images(args.source, args.bucket, args.region, dry_run=args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())