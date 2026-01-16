import Image from "next/image";
import { getS3ImageUrl } from "./escort/s3Utils";

const imageFiles = [
  "OIP (1).webp",
  "OIP (2).webp",
  "OIP (3).webp",
  "OIP (4).webp",
  "OIP.webp"
];
const profiles = [
  {
    name: "Anjali",
    age: 22,
    location: "Ahmedabad",
    description: "Young, open-minded independent call girl in Ahmedabad. Real companionship and intimate services tailored for you.",
    whatsapp: "910000000000",
    phone: "910000000000"
  },
  {
    name: "Bhavna",
    age: 25,
    location: "Ahmedabad",
    description: "100% real call girl service at low rate nearby you in Ahmedabad. Contact by WhatsApp or phone call.",
    whatsapp: "910000000001",
    phone: "910000000001"
  },
  {
    name: "Suhana",
    age: 24,
    location: "Ahmedabad",
    description: "Expertise and experience in the field. Book for a passionate night and unforgettable memories.",
    whatsapp: "910000000002",
    phone: "910000000002"
  },
  {
    name: "Anjali",
    age: 22,
    location: "Ahmedabad",
    description: "Young, open-minded independent call girl in Ahmedabad. Real companionship and intimate services tailored for you.",
    whatsapp: "910000000003",
    phone: "910000000003"
  },
  {
    name: "Karishma",
    age: 26,
    location: "Ahmedabad",
    description: "Professional and experienced call girl in Ahmedabad. Providing intimate companionship and memorable experiences.",
    whatsapp: "910000000004",
    phone: "910000000004"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 font-sans dark:bg-black flex flex-col">
      <div className="w-full bg-pink-100 py-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-pink-700 mb-2 text-center">Ahmedabad Call Girl Services 👄</h1>
        <p className="text-lg text-gray-700 max-w-2xl text-center mb-4">Book Ahmedabad Call Girls to Relax & Enjoy Tonight! Fast, safe, and affordable call girl services across Ahmedabad. Choose from high-profile, independent, and friendly companions for home or hotel delivery.</p>
        <span className="text-pink-600 font-semibold">1000+ profiles listed</span>
      </div>
      <div className="flex flex-wrap justify-center gap-8 py-10 px-4">
        {profiles.map((profile, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 max-w-xs flex flex-col items-center">
            <Image
              src={getS3ImageUrl(imageFiles[idx])}
              alt={profile.name}
              width={220}
              height={220}
              className="rounded-lg object-cover border mb-4"
            />
            <h2 className="text-xl font-bold text-pink-700 mb-1">{profile.name}</h2>
            <p className="text-gray-600 mb-1"><strong>Age:</strong> {profile.age}</p>
            <p className="text-gray-600 mb-1"><strong>Location:</strong> {profile.location}</p>
            <p className="text-gray-600 text-center mb-2">{profile.description}</p>
            <div className="flex gap-3 mt-2">
              <a href={`https://wa.me/${profile.whatsapp}`} target="_blank" rel="noopener" className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">WhatsApp</a>
              <a href={`tel:${profile.phone}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Call</a>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full bg-pink-50 py-8 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-pink-700 mb-2">Why Choose Us?</h3>
        <ul className="text-gray-700 text-lg list-disc pl-6 max-w-2xl">
          <li>100% Genuine Call Girls</li>
          <li>Affordable & Transparent Pricing</li>
          <li>Fast, Free home/hotel Delivery</li>
          <li>24x7 Customer Support</li>
          <li>Wide Choice: College girls, housewives, VIP models</li>
          <li>Safe, private, and secure experience</li>
        </ul>
      </div>
      <footer className="w-full bg-gray-900 text-gray-100 py-6 text-center mt-auto">
        <div>Copyright © 2026 Ahmedabad Escort Directory</div>
      </footer>
    </div>
  );
}
