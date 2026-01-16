// Utility to generate S3 image URLs
export function getS3ImageUrl(filename: string) {
  return `https://gif-gif.s3.amazonaws.com/ann-images/${filename}`;
}
