import json
import os
import boto3
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# Configuration
TABLE_NAME = os.environ.get('TABLE_NAME', 'gif-gif')
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'www.aliyaescort.com')
table = dynamodb.Table(TABLE_NAME)

def generate_profile_html(profile):
    """
    Generates a static HTML string for the profile.
    Mirroring the logic from app/lib/s3-html.ts
    """
    name = profile.get('name', 'Unknown')
    seo_title = profile.get('seoTitle') or f"{name} - Aliya Escort Ahmedabad"
    description = profile.get('description', '')
    seo_description = profile.get('seoDescription') or description[:160]
    custom_css = profile.get('customCss', '')
    
    images = profile.get('images', [])
    main_image = images[0] if images else 'https://via.placeholder.com/400x600'
    
    # Safely handle lists for services and images
    service_tags = ""
    if profile.get('services'):
        tags = "".join([f'<span class="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm">{s}</span>' for s in profile['services']])
        service_tags = f"""
        <div class="mt-6">
            <h3 class="text-lg font-bold text-white mb-2">Services</h3>
            <div class="flex flex-wrap gap-2">
                {tags}
            </div>
        </div>
        """
        
    thumbnails = ""
    if len(images) > 1:
        thumbs_html = "".join([f"""
        <div class="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent">
            <img src="{img}" alt="Thumbnail" class="object-cover w-full h-full">
        </div>""" for img in images])
        thumbnails = f'<div class="flex gap-2 overflow-x-auto py-2">{thumbs_html}</div>'

    html_content = f"""
<!DOCTYPE html>
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
      
      .gradient-text {{
        background: linear-gradient(to right, #ec4899, #a855f7, #facc15);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }}
    </style>
</head>
<body class="bg-zinc-900 text-gray-100 font-sans">
    <nav className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <a href="/" className="text-pink-400 font-bold text-xl flex items-center gap-2 hover:text-pink-300 transition">
            <span>←</span> Back to Home
          </a>
          <div className="text-lg font-bold text-white">
            {name}
          </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <!-- Left Column: Image Gallery -->
            <div class="space-y-4">
                <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                    <img src="{main_image}" alt="{name}" class="object-cover w-full h-full">
                </div>
                {thumbnails}
            </div>

            <!-- Right Column: Details -->
            <div class="flex flex-col gap-6">
                <div class="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
                    <h1 class="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
                        {name}
                    </h1>
                    
                    <div class="flex flex-wrap gap-3 mb-6">
                        <span class="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm font-semibold border border-pink-500/30">
                            {profile.get('age', '')} Years Old
                        </span>
                        <span class="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                            📍 {profile.get('location', '')}
                        </span>
                        <span class="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30 capitalize">
                            {profile.get('gender', '')}
                        </span>
                    </div>

                    <div class="space-y-4 text-gray-300 text-lg leading-relaxed">
                        <h2 class="text-xl font-bold text-white border-b border-white/10 pb-2">About Me</h2>
                        <div class="whitespace-pre-line text-gray-200">
                            {description}
                        </div>
                    </div>
                    
                    {service_tags}

                    <div class="mt-8 pt-6 border-t border-white/10">
                        <h3 class="text-lg font-bold text-white mb-4">Contact Information</h3>
                        <a href="tel:+919999999999" class="block w-full text-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200 mb-4">
                            Details: 📞 Call Now
                        </a>
                         <a href="https://wa.me/9199999999" class="block w-full text-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200">
                            💬 WhatsApp Me
                        </a>
                        <p class="text-center text-xs text-gray-500 mt-4">
                          * Please mention you saw my profile on Aliya Escort
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <footer class="w-full bg-black text-gray-500 py-6 text-center mt-12 border-t border-gray-800">
        <div>Copyright © 2026 Aliya Escort Ahmedabad</div>
    </footer>
</body>
</html>
    """
    return html_content

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    # Handle API Gateway Proxy Integration
    body = event
    if 'body' in event:
        try:
            body = json.loads(event['body'])
        except Exception as e:
            print(f"Error parsing body: {e}")
            return {
                'statusCode': 400,
                'body': json.dumps({'success': False, 'message': 'Invalid JSON body'})
            }
            
    action = body.get('action')
    profile = body.get('profile')
    
    if not profile or not profile.get('id'):
        return {
            'statusCode': 400,
            'body': json.dumps({'success': False, 'message': 'Missing profile data or ID'})
        }
        
    try:
        # 1. Always save to DynamoDB
        profile['updatedAt'] = datetime.utcnow().isoformat()
        table.put_item(Item=profile)
        print(f"Saved profile {profile['id']} to DynamoDB")
        
        response_data = {'success': True, 'message': 'Profile saved successfully'}
        
        # 2. If action is publish, generate HTML and upload to S3
        if action == 'publish':
            html_content = generate_profile_html(profile)
            filename = f"profiles/{profile['id']}.html"
            
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=filename,
                Body=html_content,
                ContentType='text/html',
                CacheControl='max-age=3600'
            )
            
            s3_url = f"https://{BUCKET_NAME}/{filename}"
            print(f"Uploaded profile to {s3_url}")
            response_data['message'] = 'Profile published successfully'
            response_data['s3Url'] = s3_url
            
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'message': str(e)})
        }
