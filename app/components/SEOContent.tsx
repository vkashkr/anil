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
            Ahmedabad Escort Service and Local Profiles
          </h2>
          
          <div className="space-y-4">
            <p>
              Explore local profiles and information about <span className="font-bold text-yellow-400">escort services in Ahmedabad</span>. This page brings together profile details for people comparing Ahmedabad escorts and local listings.
            </p>
            <p>
              Searches such as <span className="text-pink-400 font-bold">“escort Ahmedabad,” “Ahmedabad escort service,”</span> and <span className="text-fuchsia-400 font-bold">“call girl in Ahmedabad”</span> often reflect a need for local information. Review each listing for its available details and use the listed contact options if you need clarification.
            </p>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-fuchsia-400 text-2xl tracking-wide drop-shadow-pink mb-4">Browse Ahmedabad escort listings</h3>
            <ul className="list-disc pl-6 text-pink-400 font-semibold space-y-2">
              <li>Browse profiles listed for Ahmedabad and nearby areas.</li>
              <li>Review the information and photos shown on each profile page.</li>
              <li>Check the listing details and contact options before making arrangements.</li>
              <li>Use the area coverage section to find listings by Ahmedabad neighborhood.</li>
            </ul>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg text-fuchsia-400 uppercase tracking-wider mb-2">Area Coverage</h3>
            <p className="text-gray-200 mb-4">Listings include Ahmedabad neighborhoods such as:</p>
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
              For listing information, call or WhatsApp <a href={`tel:+919974599843`} className="font-extrabold text-pink-400 underline underline-offset-4">{PHONE_DISPLAY}</a>. Availability and response times vary.
            </p>
          </div>
          
          <div className="mt-8">
            <h3 className="font-bold text-lg text-fuchsia-400 uppercase tracking-wider mb-4">Frequently Asked Questions (FAQs)</h3>
            <div className="space-y-2">
              {[
                { q: "Are all listed profiles for adults?", a: "This website is intended only for people aged 18 or older. Individual listings should be reviewed directly, and providers must confirm that all parties are consenting adults." },
                { q: "How can I check the details of a profile?", a: "Open a profile to review its description, location, photos, and listed contact information, then contact the provider directly to confirm current availability and terms." },
                { q: "What payment methods are available?", a: "Payment methods and rates vary by individual provider. Confirm the full terms, duration, and travel charges directly before agreeing to a meeting." },
                { q: "How quickly can I arrange a meeting?", a: "Response and availability times vary by listing and location. Contact the provider directly for current availability rather than relying on a fixed delivery time." },
                { q: "Do listings cover areas outside Ahmedabad?", a: "The main directory focuses on Ahmedabad and nearby areas including SG Highway, Satellite, Vastrapur, Prahlad Nagar, Bodakdev, Gandhinagar, and Sanand when listed." },
                { q: "Can I choose a specific profile?", a: "Yes. Browse the profiles and mention the profile name or listing ID when you contact the provider. Availability is subject to confirmation." },
                { q: "What is the minimum meeting duration?", a: "Duration and scheduling differ by listing. Ask the provider directly about availability, duration, and all related charges before confirming." },
                { q: "Are there hidden charges?", a: "Any rate or travel charge should be confirmed directly before an arrangement is agreed. Review all terms with the provider and do not send money based on unclear details." },
                { q: "Do listings offer incall or outcall?", a: "Some providers may offer one or both options. The profile or direct conversation should confirm the meeting location, consent, availability, and applicable terms." },
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
              <li>अहमदाबाद और आसपास की प्रोफाइल्स देखें।</li>
              <li>हर प्रोफाइल पर उपलब्ध जानकारी और तस्वीरें पढ़ें।</li>
              <li>किसी भी व्यवस्था से पहले प्रोफाइल में दी गई जानकारी की पुष्टि करें।</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}