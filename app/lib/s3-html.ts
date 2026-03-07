const API_URL = 'https://4k1gg1dlc3.execute-api.us-east-1.amazonaws.com/dvp/admin';

export async function uploadHtmlToS3(filename: string, content: string, contentType: string = 'text/html') {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'upload_file',
        filename,
        content,
        contentType
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Gateway Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Upload failed');
    }

    return { success: true, url: data.url };
  } catch (error) {
    console.error("Error uploading via API:", error);
    throw error;
  }
}

export function generateProfileHtml(profile: any) {
  // A basic HTML template that includes Tailwind via CDN for standalone rendering
  // In a real production app, you might want to link to your actual CSS file
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.seoTitle || profile.name + " - Aliya Escort Ahmedabad"}</title>
    <meta name="description" content="${profile.seoDescription || profile.description?.substring(0, 160)}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Custom Admin CSS */
      ${profile.customCss || ''}
      
      .gradient-text {
        background: linear-gradient(to right, #ec4899, #a855f7, #facc15);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    </style>
</head>
<body class="bg-zinc-900 text-gray-100 font-sans">
    <nav className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
          <a href="/" className="text-pink-400 font-bold text-xl flex items-center gap-2 hover:text-pink-300 transition">
            <span>←</span> Back to Home
          </a>
          <div className="text-lg font-bold text-white">
            ${profile.name}
          </div>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 md:p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <!-- Left Column: Image Gallery -->
            <div class="space-y-4">
                <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                    <img src="${profile.images?.[0] || 'https://via.placeholder.com/400x600'}" alt="${profile.name}" class="object-cover w-full h-full">
                </div>
                ${profile.images?.length > 1 ? `
                <div class="flex gap-2 overflow-x-auto py-2">
                    ${profile.images.map((img: string) => `
                    <div class="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-transparent">
                        <img src="${img}" alt="Thumbnail" class="object-cover w-full h-full">
                    </div>`).join('')}
                </div>` : ''}
            </div>

            <!-- Right Column: Details -->
            <div class="flex flex-col gap-6">
                <div class="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
                    <h1 class="text-4xl md:text-5xl font-extrabold gradient-text mb-2">
                        ${profile.name}
                    </h1>
                    
                    <div class="flex flex-wrap gap-3 mb-6">
                        <span class="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm font-semibold border border-pink-500/30">
                            ${profile.age} Years Old
                        </span>
                        <span class="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                            📍 ${profile.location}
                        </span>
                        <span class="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30 capitalize">
                            ${profile.gender}
                        </span>
                    </div>

                    <div class="space-y-4 text-gray-300 text-lg leading-relaxed">
                        <h2 class="text-xl font-bold text-white border-b border-white/10 pb-2">About Me</h2>
                        <div class="whitespace-pre-line text-gray-200">
                            ${profile.description || 'No description available.'}
                        </div>
                    </div>
                    
                    ${profile.services?.length ? `
                    <div class="mt-6">
                        <h3 class="text-lg font-bold text-white mb-2">Services</h3>
                        <div class="flex flex-wrap gap-2">
                            ${profile.services.map((s: string) => `
                            <span class="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm">${s}</span>
                            `).join('')}
                        </div>
                    </div>` : ''}

                    <div class="mt-8 pt-6 border-t border-white/10">
                        <h3 class="text-lg font-bold text-white mb-4">Contact Information</h3>
                        <a href="tel:+919974599843" class="block w-full text-center bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200 mb-4">
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
  `;
}
