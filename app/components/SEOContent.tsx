'use client';
import React, { useState } from 'react';
import { PHONE_DISPLAY } from '@/app/lib/constants';

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index < 2);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-all duration-200 hover:border-fuchsia-500/40">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-white/5 hover:bg-fuchsia-900/20 transition"
      >
        <span className="font-semibold text-fuchsia-300 text-sm md:text-base">{q}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-pink-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* Answer always in DOM (CSS visibility) so Google indexes all FAQ text */}
      <div className={`px-4 py-3 text-gray-200 text-sm md:text-base leading-relaxed bg-black/30 border-t border-white/5 ${open ? '' : 'hidden'}`}>
        {a}
      </div>
    </div>
  );
}

export default function SEOContent() {
  return (
    <section className="w-full px-0 py-8 bg-gradient-to-br from-black via-fuchsia-950 to-gray-900 relative">
      {/* English SEO Block */}
      <div className="max-w-3xl mx-auto rounded-3xl shadow-2xl bg-black/60 backdrop-blur-lg border border-fuchsia-700/40 p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,0,128,0.12) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,255,0,0.10) 0, transparent 70%)'}}></div>
        <div className="relative z-10 text-base md:text-lg leading-relaxed text-gray-100">
          <h2 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-fuchsia-500 to-yellow-300 text-3xl md:text-4xl drop-shadow-pink animate-pulse mb-6">
            Welcome to Escort Ahmedabad 
          </h2>
          
          <div className="space-y-4">
            <p>
              The Ultimate Destination for <span className="underline decoration-wavy decoration-pink-400">Premium <span className="text-pink-400">Call Girls</span></span> and <span className="font-bold text-yellow-400">Escort Services</span> in Ahmedabad.
            </p>
            <p>
              <span className="text-pink-400 font-bold">Are you searching for the best <span className="italic underline decoration-wavy decoration-fuchsia-400">call girls in Ahmedabad</span>?</span> <span className="text-gray-200">Escort Ahmedabad  is your <span className="font-bold text-fuchsia-400">one-stop solution</span> for <span className="italic text-pink-400">luxury companionship</span> with genuine independent profiles.</span>
            </p>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-fuchsia-400 text-2xl tracking-wide drop-shadow-pink mb-4">Why Choose Escort Ahmedabad ?</h3>
            <ul className="list-disc pl-6 text-pink-400 font-semibold space-y-2">
              <li><span className="font-bold text-yellow-600">2000+ Verified Profiles:</span> Choose from a vast selection of real, independent call girls.</li>
              <li><span className="font-bold text-fuchsia-600">Fastest Service:</span> Doorstep delivery in 30 minutes, 24/7 availability.</li>
              <li><span className="font-bold text-pink-600">Cash Payment & No Advance:</span> Hassle-free booking with complete privacy.</li>
              <li><span className="font-bold text-yellow-500">Exclusive Discounts:</span> Enjoy up to 60% off your first booking.</li>
              <li><span className="font-bold text-fuchsia-700">Safe & Discreet:</span> Licensed agency, strict confidentiality.</li>
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg text-fuchsia-400 uppercase tracking-wider mb-2">Area Coverage</h3>
            <p className="text-gray-200 mb-4">We serve all major locations in Ahmedabad, including:</p>
            <ul className="list-disc pl-6 text-yellow-400 font-semibold grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1">
              {['Satellite', 'SG Highway', 'Vastrapur', 'Navrangpura', 'Prahlad Nagar', 'Bodakdev', 'Maninagar', 'Ellisbridge', 'Paldi', 'Thaltej', 'Ambawadi', 'Naranpura', 'Chandkheda', 'Bopal', 'Gota', 'Sola', 'Memnagar'].map(loc => (
                <li key={loc}>{loc}</li>
              ))}
              <li>And more...</li>
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg text-yellow-400 uppercase tracking-wider mb-2">Contact Us</h3>
            <p className="text-fuchsia-300 font-semibold">
              For instant booking, call or WhatsApp us at <span className="font-extrabold text-pink-400 animate-pulse">+91-9157204082</span>. Our support team is available <span className="italic text-yellow-400">24/7</span> to assist you.
            </p>
          </div>
          
          <div className="mt-8">
            <h3 className="font-bold text-lg text-fuchsia-400 uppercase tracking-wider mb-4">Frequently Asked Questions (FAQs)</h3>
            <div className="space-y-2">
              {[
                { q: "Are your call girls real and verified?", a: "Yes, every profile on Aliya Escort is 100% genuine and manually verified. We conduct identity checks and ensure all photos are recent and unedited. You get exactly what you see on the profile." },
                { q: "Is my privacy and identity completely safe?", a: "Absolutely. We maintain strict confidentiality — your personal details, booking history, and contact information are never shared with anyone. All communication is encrypted and our staff follows a strict privacy protocol." },
                { q: "What payment methods do you accept?", a: "We accept cash payment on delivery for your convenience. No advance payment or online transfer is required. You pay only when you are satisfied with the service." },
                { q: "How fast can I book a call girl?", a: "Our average delivery time is just 30 minutes within Ahmedabad city limits. We operate 24/7 including holidays. Simply call or WhatsApp us and we'll arrange everything immediately." },
                { q: "Do you serve areas outside Ahmedabad?", a: "Yes! While our primary service area is Ahmedabad (SG Highway, Satellite, Vastrapur, Prahlad Nagar, Bodakdev, etc.), we also serve Gandhinagar, Sanand, and nearby cities within Gujarat on request." },
                { q: "Can I choose a specific girl from the website?", a: "Of course! Browse our profiles, pick your preferred companion, and mention her name/ID when you call. If she's available, we'll send her to your location. If not, we'll suggest similar options." },
                { q: "What is the minimum booking duration?", a: "The minimum booking is typically 1 hour. Extended bookings for overnight stays, dinner dates, or travel companionship are also available at special rates." },
                { q: "Are there any hidden charges?", a: "No hidden charges whatsoever. The rate you see is the rate you pay. Travel charges may apply for locations outside city limits, which will be communicated upfront before confirmation." },
                { q: "Do you offer incall and outcall services?", a: "Yes, we offer both. Incall means you visit our safe, clean, and private location. Outcall means the escort visits your hotel, home, or any private location of your choice." },
                { q: `How do I contact you for booking?`, a: `You can reach us anytime via phone call or WhatsApp at ${PHONE_DISPLAY}. Our support team is available 24 hours a day, 7 days a week to assist with bookings and queries.` }
              ].map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hindi SEO Block */}
      <div className="max-w-3xl mx-auto rounded-3xl shadow-2xl bg-black/60 backdrop-blur-lg border border-yellow-600/40 p-6 md:p-10 mt-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0" style={{background: 'radial-gradient(circle at 80% 10%, rgba(255,255,0,0.10) 0, transparent 70%), radial-gradient(circle at 10% 90%, rgba(255,0,128,0.10) 0, transparent 70%)'}}></div>
        <div className="relative z-10 text-base md:text-lg leading-relaxed text-gray-100">
          <h2 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-500 text-3xl md:text-4xl drop-shadow-pink animate-pulse mb-6">
            अहमदाबाद की लोकल कॉल गर्ल्स और एस्कॉर्ट सर्विस – पूरी जानकारी
          </h2>
          
          <p className="mb-4">
            <span className="italic text-fuchsia-400 font-semibold">नमस्कार!</span> <span className="text-yellow-400 font-bold">अगर आप अहमदाबाद के <span className="underline decoration-wavy decoration-pink-400">Satellite, Vastrapur, Maninagar</span>, या किसी भी मोहल्ले में रहते हैं</span> और <span className="font-bold text-fuchsia-400">एकदम लोकल, भरोसेमंद</span> और <span className="italic text-pink-400">दिल से सेवा देने वाली कॉल गर्ल्स</span> की तलाश में हैं, तो <span className="font-bold text-yellow-300">Escort Ahmedabad </span> आपके लिए सबसे सही ठिकाना है।
          </p>

          <div className="mt-6">
            <h3 className="font-bold text-2xl text-fuchsia-400 tracking-wide drop-shadow-pink mb-4">क्यों चुनें Escort Ahmedabad ?</h3>
            <ul className="list-disc pl-6 text-pink-400 font-semibold space-y-2">
              <li>2000+ असली लोकल प्रोफाइल्स</li>
              <li>सबसे तेज़ डिलीवरी, सिर्फ 30 मिनट में</li>
              <li>कैश पेमेंट, कोई एडवांस नहीं</li>
              <li>24x7 सर्विस, जब चाहें बुक करें</li>
              <li>हर बुकिंग पर डिस्काउंट और ऑफर</li>
            </ul>
          </div>
          
          <div className="mt-8 text-yellow-300 font-semibold italic text-sm leading-relaxed opacity-80">
            अहमदाबाद कॉल गर्ल्स, लोकल गर्ल्स अहमदाबाद, सस्ती कॉल गर्ल्स अहमदाबाद, रशियन कॉल गर्ल्स अहमदाबाद, कॉलेज गर्ल्स अहमदाबाद, हाउसवाइफ एस्कॉर्ट्स अहमदाबाद, VIP एस्कॉर्ट्स अहमदाबाद, इंडिपेंडेंट कॉल गर्ल्स अहमदाबाद, बेस्ट कॉल गर्ल सर्विस अहमदाबाद.
          </div>
        </div>
      </div>
    </section>
  );
}