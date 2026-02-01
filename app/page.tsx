'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";

type Profile = {
  id: string | number;
  name: string;
  age: string | number;
  gender?: string;
  description?: string;
  location?: string;
  filename?: string;
  full_path: string;
  metadata?: any;
};

export default function Home() {
  const [profilesById, setProfilesById] = useState<{ [id: string]: Profile[] }>({});
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    fetch("/bff/api/profiles", {})
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.images) {
          const mapped = data.data.images.map((img: any) => ({
            id: (img.metadata && img.metadata.id) || (img.filename ? img.filename.split('/')[0] : img.filename),
            name: img.metadata?.name || "-",
            age: img.metadata?.age || "-",
            gender: img.metadata?.gender,
            description: img.metadata?.description,
            location: img.metadata?.location,
            filename: img.filename,
            full_path: img.full_path,
            metadata: img.metadata || {},
          }));
          // Group by id and attach metadata from profile.jpg
          const grouped: { [id: string]: Profile[] } = {};
          const metaById: { [id: string]: any } = {};
          mapped.forEach((profile: Profile) => {
            if (!grouped[profile.id]) grouped[profile.id] = [];
            grouped[profile.id].push(profile);
            if (profile.filename && profile.filename.endsWith('profile.jpg')) {
              metaById[profile.id] = profile.metadata;
            }
          });
          // Attach metadata from profile.jpg to all images in the group
          Object.entries(grouped).forEach(([id, images]) => {
            if (metaById[id]) {
              grouped[id] = images.map(img => ({ ...img, ...metaById[id] }));
            }
          });
          setProfilesById(grouped);
          // Initialize carousel index for each id
          const initialIndex: { [id: string]: number } = {};
          Object.keys(grouped).forEach(id => { initialIndex[id] = 0; });
          setCarouselIndex(initialIndex);
        }
        setLoading(false);
      })
      .catch((error) => { console.error("Error fetching profiles:", error); setLoading(false); })
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans dark:bg-black flex flex-col">
      <div className="w-full bg-gradient-to-br from-black via-fuchsia-950 to-pink-900 py-10 px-2 flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.08) 0, transparent 70%)'}}></div>
        <h1 className="relative z-10 text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-center leading-tight drop-shadow-pink animate-pulse mb-3">
          Ahmedabad Escort & Local Call Girls <span className="inline-block animate-bounce">👄</span>
        </h1>
        <p className="relative z-10 text-lg sm:text-xl text-gray-100 max-w-xl sm:max-w-2xl text-center mb-4 font-medium">
          <span className="bg-black/30 px-3 py-2 rounded-2xl shadow-lg backdrop-blur-sm inline-block">
            Welcome to <span className="font-bold text-pink-300">Aliya Escort Ahmedabad</span> – your trusted directory for <span className="text-fuchsia-300 font-semibold">genuine, independent call girls</span> and <span className="text-yellow-200 font-semibold">premium escort services</span> in Ahmedabad.<br className="hidden sm:block"/> Book local girls for home or hotel delivery, enjoy <span className="italic text-pink-200">safe, private, and affordable companionship</span>. <span className="text-yellow-300 font-bold">No advance payment</span>, <span className="text-fuchsia-200 font-bold">100% privacy</span>, and <span className="text-pink-200 font-bold">real profiles only</span>.
          </span>
        </p>
        <span className="relative z-10 text-pink-200 font-semibold text-base sm:text-lg bg-black/20 px-4 py-1 rounded-full shadow-md tracking-wide animate-pulse mt-1">
          Ahmedabad’s <span className="text-yellow-200 font-bold">#1 Local Girl Service</span> | <span className="text-fuchsia-200 font-bold">1000+ Verified Profiles</span>
        </span>
      </div>      <div className="w-full max-w-4xl mx-auto my-6 px-2">
        <video 
          className="w-full h-auto rounded-lg shadow-2xl" 
          controls 
          autoPlay 
          muted 
          loop
        >
          <source src="/title.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4 px-2">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading profiles...</div>
        ) : (
          Object.entries(profilesById).map(([id, images]) => {
            const idx = carouselIndex[id] || 0;
            const profile = images[idx];
            return (
              <div
                key={id}
                className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-transform duration-200 hover:scale-105"
              >
                <div className="relative aspect-[3/4] w-full flex items-center justify-center bg-gray-100">
                  {profile.full_path ? (
                    <div className="relative w-full h-[440px] flex items-center justify-center">
                      <Image
                        key={profile.full_path + idx}
                        src={profile.full_path}
                        alt={profile.name}
                        width={340}
                        height={700}
                        className="object-cover w-full h-full transition-transform transition-opacity duration-500 ease-in-out scale-95 opacity-0 animate-pink-fade-in"
                        style={{ borderRadius: '16px 16px 0 0' }}
                        onLoadingComplete={img => { img.classList.remove('opacity-0'); img.classList.add('opacity-100', 'scale-100'); }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                      />
                      {/* Top-right badge */}
                      <div className="absolute top-3 right-3 bg-fuchsia-600 bg-opacity-90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow z-20">
                        Aliya <span className="ml-1 text-fuchsia-200">♥</span>
                      </div>
                      {/* Carousel arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow-lg z-30 hover:bg-fuchsia-600 hover:text-white transition-colors border border-white"
                            style={{ zIndex: 30 }}
                            onClick={() => setCarouselIndex(prev => ({ ...prev, [id]: (prev[id] - 1 + images.length) % images.length }))}
                            aria-label="Previous image"
                          >
                            <span className="text-xl font-bold text-fuchsia-600">{'<'}</span>
                          </button>
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent bg-opacity-80 text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow-lg z-30 hover:bg-fuchsia-600 hover:text-white transition-colors border border-white"
                            style={{ zIndex: 30 }}
                            onClick={() => setCarouselIndex(prev => ({ ...prev, [id]: (prev[id] + 1) % images.length }))}
                            aria-label="Next image"
                          >
                            <span className="text-xl font-bold text-fuchsia-600">{'>'}</span>
                          </button>
                        </>
                      )}
                      {/* Image count badge */}
                      {images.length > 1 && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1 z-20"
                          style={{ zIndex: 20 }}
                        >
                          {(() => {
                            const total = images.length;
                            let start = 0;
                            let end = total;
                            if (total > 3) {
                              if (idx === 0) {
                                start = 0; end = 3;
                              } else if (idx === total - 1) {
                                start = total - 3; end = total;
                              } else {
                                start = idx - 1; end = idx + 2;
                              }
                            }
                            return Array.from({ length: Math.min(3, total) }, (_, j) => {
                              const i = (total > 3) ? start + j : j;
                              const isSelected = i === idx;
                              return (
                                <span
                                  key={i}
                                  className={
                                    `w-4 h-4 flex items-center justify-center rounded-full border border-white/80 ` +
                                    (isSelected
                                      ? 'bg-black/90 text-white font-bold scale-110 shadow-lg'
                                      : 'bg-black/40 text-white/60')
                                  }
                                  style={{ transition: 'all 0.2s' }}
                                >
                                  <span className="text-[10px] font-bold select-none leading-none flex items-center justify-center w-full h-full" style={{fontVariantNumeric:'tabular-nums'}}>
                                    {isSelected ? (i + 1) : ''}
                                  </span>
                                </span>
                              );
                            });
                          })()}
                        </div>
                      )}
                      {/* Bottom left: name and location, Bottom right: age */}
                      <div className="absolute bottom-0 left-0 w-full flex justify-between items-end px-4 pb-3 z-20 pointer-events-none">
                        <div className="flex flex-col items-start">
                          {profile.name && profile.name !== '-' && (
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-0 leading-tight drop-shadow pointer-events-auto">{profile.name}</h2>
                          )}
                          <div className="text-gray-200 text-xs sm:text-sm font-medium mt-0.5 drop-shadow flex items-center pointer-events-auto">
                            <span role="img" aria-label="Location">📍</span> {profile.location || 'Ahmedabad'}
                          </div>
                        </div>
                        {profile.age && profile.age !== '-' && (
                          <div className="bg-pink-600 text-white text-xs font-bold rounded-full px-3 py-1 drop-shadow pointer-events-auto">
                            {profile.age}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">No Image</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* SEO and content blocks moved below the grid */}
      <section className="w-full px-0 py-8 bg-gradient-to-br from-black via-fuchsia-950 to-gray-900 relative">
        <div className="max-w-3xl mx-auto rounded-3xl shadow-2xl bg-black/60 backdrop-blur-lg border border-fuchsia-700/40 p-6 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.12) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.10) 0, transparent 70%)'}}></div>
          <div className="relative z-10 text-base md:text-lg leading-relaxed text-gray-100">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-3xl md:text-4xl drop-shadow-pink animate-pulse">Welcome to Aliya Escort Ahmedabad</span>
            <span className="block italic text-fuchsia-400 font-semibold mt-2 text-xl">The Ultimate Destination for <span className="underline decoration-wavy decoration-pink-400">Premium <span className="text-pink-400">Call Girls</span></span> and <span className="font-bold text-yellow-400">Escort Services</span> in Ahmedabad</span><br/><br/>
            <span className="text-pink-400 font-bold">Are you searching for the most <span className="italic underline decoration-wavy decoration-fuchsia-400">trusted</span>, <span className="font-extrabold text-fuchsia-400">genuine</span>, and <span className="text-yellow-400">high-profile</span> call girls in Ahmedabad?</span> <span className="text-gray-200">Aliya Escort Ahmedabad is your <span className="font-bold text-fuchsia-400">one-stop solution</span> for <span className="italic text-pink-400">luxury companionship</span>, offering a wide range of <span className="font-bold text-yellow-400">beautiful</span>, <span className="italic text-fuchsia-400">independent escorts</span>, college girls, housewives, Russian models, and VIP companions.</span><br/><br/>
            <span className="font-bold text-fuchsia-400 text-2xl tracking-wide drop-shadow-pink">Why Choose Aliya Escort Ahmedabad?</span><br/>
            <ul className="list-disc pl-6 text-pink-400 font-semibold space-y-1">
              <li><span className="font-bold text-yellow-600">2000+ Verified Profiles:</span> Choose from a vast selection of real, independent call girls.</li>
              <li><span className="font-bold text-fuchsia-600">Fastest Service:</span> Doorstep delivery in 30 minutes, 24/7 availability.</li>
              <li><span className="font-bold text-pink-600">Cash Payment & No Advance:</span> Hassle-free booking with complete privacy.</li>
              <li><span className="font-bold text-yellow-500">Exclusive Discounts:</span> Enjoy up to 60% off your first booking.</li>
              <li><span className="font-bold text-fuchsia-700">Safe & Discreet:</span> Licensed agency, strict confidentiality, and hygiene standards.</li>
              <li><span className="font-bold text-pink-700">Flexible Packages:</span> Incall, outcall, short-term, and long-term companionship.</li>
              <li><span className="font-bold text-yellow-600">Multilingual Support:</span> English, Hindi, and more.</li>
            </ul>
            <span className="block mt-4 text-fuchsia-400 font-bold">Our call girls are available for <span className="italic text-yellow-400">private parties</span>, <span className="underline decoration-wavy decoration-pink-400">dinner dates</span>, hotel stays, and more. <span className="text-pink-400">We understand the importance of privacy and discretion</span>, ensuring that your experience remains confidential.</span>
            <span className="block mt-2 text-gray-200">Our agency is <span className="font-bold text-fuchsia-400">licensed</span>, reputable, and trusted by thousands of satisfied clients. <span className="italic text-yellow-400">Book your dream companion today</span> and enjoy a <span className="font-bold text-pink-400">world-class escort experience</span> in Ahmedabad.</span>
            <span className="block mt-4 font-bold text-lg text-fuchsia-400 uppercase tracking-wider">Area Coverage</span>
            <span className="block text-gray-200">We serve all major locations in Ahmedabad, including:</span>
            <ul className="list-disc pl-6 text-yellow-400 font-semibold grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1">
              <li>Satellite</li>
              <li>SG Highway</li>
              <li>Vastrapur</li>
              <li>Navrangpura</li>
              <li>Prahlad Nagar</li>
              <li>Bodakdev</li>
              <li>Maninagar</li>
              <li>Ellisbridge</li>
              <li>Paldi</li>
              <li>Thaltej</li>
              <li>Ambawadi</li>
              <li>Naranpura</li>
              <li>Chandkheda</li>
              <li>Bopal</li>
              <li>Gota</li>
              <li>Sola</li>
              <li>Memnagar</li>
              <li>And more...</li>
            </ul>
            <span className="block mt-4 font-bold text-lg text-pink-400 uppercase tracking-wider">Special Offers</span>
            <ul className="list-disc pl-6 text-fuchsia-400 font-semibold space-y-1">
              <li>First-time clients enjoy up to <span className="font-extrabold text-yellow-500">60% discount</span>.</li>
              <li>Free home/hotel delivery.</li>
              <li>No advance payment required.</li>
              <li>Real photos and verified profiles.</li>
            </ul>
            <span className="block mt-4 font-bold text-lg text-yellow-400 uppercase tracking-wider">Contact Us</span>
            <span className="block text-fuchsia-300 font-semibold">For instant booking, call or WhatsApp us at <span className="font-extrabold text-pink-400 animate-pulse">+91-9999999999</span>. Our support team is available <span className="italic text-yellow-400">24/7</span> to assist you.</span>
            <span className="block mt-4 font-bold text-lg text-fuchsia-400 uppercase tracking-wider">Frequently Asked Questions (FAQs)</span>
            <div className="mt-2 space-y-2">
              <div className="transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2"><span className="font-bold text-yellow-400">Q:</span> <span className="italic text-fuchsia-300">Are your call girls real and verified?</span><br/><span className="font-bold text-pink-400">A:</span> <span className="text-gray-100">Yes, all profiles are genuine and verified for authenticity.</span></div>
              <div className="transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2"><span className="font-bold text-yellow-400">Q:</span> <span className="italic text-fuchsia-300">Is my privacy guaranteed?</span><br/><span className="font-bold text-pink-400">A:</span> <span className="text-gray-100">Absolutely. We maintain strict confidentiality for all clients.</span></div>
              <div className="transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2"><span className="font-bold text-yellow-400">Q:</span> <span className="italic text-fuchsia-300">What payment options are available?</span><br/><span className="font-bold text-pink-400">A:</span> <span className="text-gray-100">We accept cash payment on delivery for your convenience.</span></div>
              <div className="transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2"><span className="font-bold text-yellow-400">Q:</span> <span className="italic text-fuchsia-300">How fast can I book a call girl?</span><br/><span className="font-bold text-pink-400">A:</span> <span className="text-gray-100">Doorstep delivery in 30 minutes, 24/7 availability.</span></div>
            </div>
            <span className="block mt-4 font-bold text-lg text-fuchsia-400 uppercase tracking-wider">You are at the right place to make your day and night more cool:</span>
            <span className="block text-yellow-400 font-semibold italic">Ahmedabad call girls, Ahmedabad escort service, local girls Ahmedabad, Russian call girls Ahmedabad, college girls Ahmedabad, housewife escorts Ahmedabad, VIP escorts Ahmedabad, independent call girls Ahmedabad, best call girl service Ahmedabad, real call girls Ahmedabad, cash payment call girls Ahmedabad, 24/7 call girls Ahmedabad, instant booking call girls Ahmedabad, safe escort service Ahmedabad, discreet call girls Ahmedabad, hotel delivery call girls Ahmedabad, home delivery call girls Ahmedabad, affordable call girls Ahmedabad, premium escort Ahmedabad, trusted call girls Ahmedabad, verified profiles Ahmedabad, privacy guaranteed Ahmedabad, top escort agency Ahmedabad, sexy call girls Ahmedabad, beautiful call girls Ahmedabad, mature escorts Ahmedabad, young call girls Ahmedabad, high-profile call girls Ahmedabad, incall outcall Ahmedabad, satisfaction guaranteed Ahmedabad, exclusive escort Ahmedabad, best rates call girls Ahmedabad, genuine call girls Ahmedabad, no advance payment call girls Ahmedabad.</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto rounded-3xl shadow-2xl bg-black/60 backdrop-blur-lg border border-yellow-600/40 p-6 md:p-10 mt-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,255,0,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,0,128,0.10) 0, transparent 70%)'}}></div>
          <div className="relative z-10 text-base md:text-lg leading-relaxed text-gray-100">
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 text-3xl md:text-4xl drop-shadow-pink animate-pulse">अहमदाबाद की लोकल कॉल गर्ल्स और एस्कॉर्ट सर्विस – पूरी जानकारी</span><br/><br/>
            <span className="italic text-fuchsia-400 font-semibold">नमस्कार!</span> <span className="text-yellow-400 font-bold">अगर आप अहमदाबाद के <span className="underline decoration-wavy decoration-pink-400">Satellite, Vastrapur, Maninagar</span>, या किसी भी मोहल्ले में रहते हैं</span> और <span className="font-bold text-fuchsia-400">एकदम लोकल, भरोसेमंद</span> और <span className="italic text-pink-400">दिल से सेवा देने वाली कॉल गर्ल्स</span> की तलाश में हैं, तो <span className="font-bold text-yellow-300">Aliya Escort Ahmedabad</span> आपके लिए सबसे सही ठिकाना है।<br/><br/>
            <span className="text-pink-400 font-bold">यहाँ आपको मिलेंगी ऐसी गर्ल्स जो न सिर्फ खूबसूरत हैं, बल्कि आपकी हर बात को समझती हैं और दोस्ताना माहौल देती हैं।</span><br/><br/>
            <span className="block text-fuchsia-400 font-bold">हमारे पास:</span>
            <ul className="list-disc pl-6 text-yellow-300 font-semibold grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-1">
              <li>कॉलेज की लड़कियाँ</li>
              <li>घर की गृहिणियाँ</li>
              <li>रशियन मॉडल्स</li>
              <li>VIP एस्कॉर्ट्स</li>
            </ul>
            <span className="block mt-2 text-gray-200">आप चाहें तो होटल या अपने घर पर सर्विस ले सकते हैं, और पेमेंट हमेशा <span className="font-bold text-pink-400">कैश में</span> होता है – कोई एडवांस नहीं, कोई झंझट नहीं। बुकिंग बहुत आसान है, बस कॉल या व्हाट्सएप करें और <span className="font-bold text-yellow-300">30 मिनट में आपकी पसंदीदा गर्ल आपके दरवाजे पर होगी।</span></span><br/>
            <span className="block mt-2 text-fuchsia-400 font-bold">अहमदाबाद के हर इलाके में – चाहे वह Law Garden हो, या Kalupur, या फिर Bopal – हमारी सर्विस <span className="italic text-yellow-300">24x7 उपलब्ध</span> है।</span><br/><br/>
            <span className="font-bold text-2xl text-fuchsia-400 tracking-wide drop-shadow-pink">क्यों चुनें Aliya Escort Ahmedabad?</span>
            <ul className="list-disc pl-6 text-pink-400 font-semibold space-y-1">
              <li>2000+ असली लोकल प्रोफाइल्स</li>
              <li>सबसे तेज़ डिलीवरी, सिर्फ 30 मिनट में</li>
              <li>कैश पेमेंट, कोई एडवांस नहीं</li>
              <li>24x7 सर्विस, जब चाहें बुक करें</li>
              <li>हर बुकिंग पर डिस्काउंट और ऑफर</li>
              <li>पूरी गोपनीयता और सुरक्षा</li>
            </ul>
            <span className="block mt-4 text-fuchsia-400 font-bold">हमारी गर्ल्स सिर्फ खूबसूरत ही नहीं, बल्कि बहुत समझदार, मिलनसार और दिल से सेवा देने वाली हैं। चाहे आप पहली बार बुक कर रहे हों या रेगुलर क्लाइंट हों, आपको हर बार <span className="italic text-yellow-300">VIP ट्रीटमेंट</span> मिलेगा।</span><br/>
            <span className="block mt-2 text-yellow-300 font-semibold italic">अहमदाबाद कॉल गर्ल्स, लोकल गर्ल्स अहमदाबाद, सस्ती कॉल गर्ल्स अहमदाबाद, रशियन कॉल गर्ल्स अहमदाबाद, कॉलेज गर्ल्स अहमदाबाद, हाउसवाइफ एस्कॉर्ट्स अहमदाबाद, VIP एस्कॉर्ट्स अहमदाबाद, इंडिपेंडेंट कॉल गर्ल्स अहमदाबाद, बेस्ट कॉल गर्ल सर्विस अहमदाबाद, रियल कॉल गर्ल्स अहमदाबाद, कैश पेमेंट कॉल गर्ल्स अहमदाबाद, 24x7 कॉल गर्ल्स अहमदाबाद, इंस्टेंट बुकिंग कॉल गर्ल्स अहमदाबाद, सेफ एस्कॉर्ट सर्विस अहमदाबाद, डिस्क्रीट कॉल गर्ल्स अहमदाबाद, होटल डिलीवरी कॉल गर्ल्स अहमदाबाद, होम डिलीवरी कॉल गर्ल्स अहमदाबाद, अफोर्डेबल कॉल गर्ल्स अहमदाबाद, प्रीमियम एस्कॉर्ट अहमदाबाद, ट्रस्टेड कॉल गर्ल्स अहमदाबाद, वेरिफाइड प्रोफाइल्स अहमदाबाद, प्राइवेसी गारंटीड अहमदाबाद, टॉप एस्कॉर्ट एजेंसी अहमदाबाद, सेक्सी कॉल गर्ल्स अहमदाबाद, खूबसूरत कॉल गर्ल्स अहमदाबाद, यंग कॉल गर्ल्स अहमदाबाद, हाई-प्रोफाइल कॉल गर्ल्स अहमदाबाद, इनकॉल आउटकॉल अहमदाबाद, संतुष्टि गारंटीड अहमदाबाद, एक्सक्लूसिव एस्कॉर्ट अहमदाबाद, बेस्ट रेट्स कॉल गर्ल्स अहमदाबाद, जेन्युइन कॉल गर्ल्स अहमदाबाद, बिना एडवांस पेमेंट कॉल गर्ल्स अहमदाबाद।</span><br/>
            <span className="block mt-4 font-bold text-lg text-fuchsia-400 uppercase tracking-wider">हमारी सर्विस के लोकल फायदे</span>
            <ul className="list-disc pl-6 text-yellow-300 font-semibold grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1">
              <li>हर क्लाइंट को VIP ट्रीटमेंट, जैसे अपने घर का मेहमान</li>
              <li>असली फोटो और प्रोफाइल्स, कोई फेक नहीं</li>
              <li>कोई छुपा चार्ज नहीं, सबकुछ खुल्लमखुल्ला</li>
              <li>लोकल सपोर्ट टीम, हर समय मदद के लिए तैयार</li>
              <li>अहमदाबाद की बोली, अहमदाबाद का अपनापन</li>
            </ul>
            <span className="block mt-4 font-bold text-lg text-pink-400 uppercase tracking-wider">बुकिंग कैसे करें?</span>
            <ul className="list-disc pl-6 text-fuchsia-400 font-semibold space-y-1">
              <li>वेबसाइट पर प्रोफाइल देखें, पसंदीदा गर्ल चुनें</li>
              <li>कॉल या व्हाट्सएप करें, और अपनी भाषा में बात करें</li>
              <li>30 मिनट में सर्विस आपके पास, बिना किसी टेंशन के</li>
            </ul>
            <span className="block mt-4 font-bold text-lg text-yellow-300 uppercase tracking-wider">ग्राहक क्या कहते हैं?</span>
            <div className="mt-2 space-y-2">
              <div className="italic text-fuchsia-400 transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2">"Aliya Escort Ahmedabad की सर्विस एकदम लोकल है, गर्ल्स बहुत फ्रेंडली और समझदार हैं।"</div>
              <div className="italic text-yellow-300 transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2">"यहाँ की प्राइवेसी और सेफ्टी सबसे बेस्ट है, कोई डर नहीं।"</div>
              <div className="italic text-pink-400 transition-all duration-200 hover:scale-105 hover:bg-fuchsia-900/30 rounded-xl p-2">"बुकिंग प्रोसेस बहुत आसान और फास्ट है, एकदम घर जैसा फील आता है।"</div>
            </div>
            <span className="block mt-4 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 text-3xl md:text-4xl drop-shadow-pink animate-pulse">अहमदाबाद में सबसे भरोसेमंद, लोकल और दिल से सेवा देने वाली कॉल गर्ल्स सर्विस – Aliya Escort Ahmedabad</span>
          </div>
        </div>
      </section>
      <div className="w-full flex flex-col items-center mt-8 py-8 px-2 relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-fuchsia-900/80 via-black/80 to-yellow-900/70 border border-yellow-400/30 backdrop-blur-lg">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.10) 0, transparent 70%)'}}></div>
        <h4 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 animate-pulse mb-2 text-center tracking-wider drop-shadow-pink flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          18+ DISCLAIMER
        </h4>
        <p className="relative z-10 text-center max-w-xl sm:max-w-2xl text-base sm:text-lg text-yellow-100 font-medium bg-black/30 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border border-pink-400/20">
          This website offers <span className="font-bold text-pink-300">adult services</span> intended for individuals <span className="font-bold text-yellow-300">18 years and older</span>.<br className="hidden sm:block"/> All bookings and services are strictly for adults. <span className="text-pink-200 font-semibold">Privacy</span> and <span className="text-yellow-200 font-semibold">discretion</span> are our top priorities.<br className="hidden sm:block"/> If you are seeking <span className="font-bold text-fuchsia-300">Aliya escort female services in Ahmedabad</span>, contact us directly. The base fee applies to all services and reservations. By using this site, you confirm you are of legal age and agree to our privacy policy.
        </p>
      </div>
      <footer className="w-full bg-gray-900 text-gray-100 py-6 text-center mt-auto">
        <div>Copyright © 2026 Aliya Escort Ahmedabad | Local Girl Directory</div>
      </footer>
    </div>
  );
}
