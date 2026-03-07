'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileData {
  filename?: string;
  full_path?: string;
  metadata?: any;
  // DynamoDB Fields
  id: string;
  name?: string;
  age?: string | number;
  gender?: string;
  location?: string;
  description?: string;
  images?: string[];
  services?: string[];
  customCss?: string;
  extraProperties?: Record<string, string>;
}

// Helper component to wrap the profile content
function ProfileContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');
  const queryName = searchParams.get('name');
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [id, setId] = useState<string | null>(queryId);

  useEffect(() => {
    // If ID is not in query, try to get from localStorage using name
    if (!id && queryName && typeof window !== 'undefined') {
       const storedId = localStorage.getItem(`profile_id_${queryName}`);
       if (storedId) {
         setId(storedId);
       } else {
         setError('Profile ID not found locally. Please try accessing from the home page.');
         setLoading(false);
       }
    } else if (!id && !queryName) {
       setError('No profile identifier provided');
       setLoading(false);
    }
  }, [queryId, queryName]);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/status');
        const data = await res.json();
        if (data && data.isAdmin) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Auth check failed', err);
      }
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!id) {
       // Only start fetch if we have an ID (which might be set from localStorage effect)
       if (queryName && !localStorage.getItem(`profile_id_${queryName}`) && !queryId) {
           setError('Profile ID not found. Please navigate from home page.');
           setLoading(false);
       }
       return;
    }

    async function fetchProfile() {
      try {
        // Fetch from DynamoDB (Metadata)
        const dynRes = await fetch(`/api/profile?id=${encodeURIComponent(id!)}`); // Use state id
        let dynData_profile = null;
        if (dynRes.ok) {
           const data = await dynRes.json();
           if (data.success && data.profile) {
                dynData_profile = data.profile;
           }
        }

        // Fetch from S3 (Images) - Always fetch to get latest images
        const s3Res = await fetch(`/bff/api/get-profiles?id=${encodeURIComponent(id!)}`);
        const s3Data = await s3Res.json();
        let s3Images: string[] = [];

        if (s3Data.success && s3Data.data && s3Data.data.images) {
            let imgs = s3Data.data.images;
            if (!Array.isArray(imgs)) imgs = [imgs];
            s3Images = imgs.map((i: any) => i.full_path);
        }

        if (dynData_profile) {
            // Merge: Use DynamoDB metadata, but prefer S3 images if available
            const finalProfile = { ...dynData_profile };
            if (s3Images.length > 0) {
                finalProfile.images = s3Images;
            }
            // Ensure images array exists
            if (!finalProfile.images) finalProfile.images = [];
            
            setProfile(finalProfile);
            if (finalProfile.images.length > 0) {
                setSelectedImage(finalProfile.images[0]);
            }
            setLoading(false);
            return;
        }
        
        // Fallback: If no DynamoDB profile, try to build from S3 data (Legacy/Fallback)
        if (s3Images.length > 0) {
            // We have images but no metadata record in DynamoDB. 
            // Try to extract metadata from the first image's S3 metadata if available (the BFF might return it)
            // The BFF returns { filename, full_path, metadata? }
            // Let's check the structure returned by BFF again.
            // list_profile_images in lambda returns { filename, full_path } mostly.
            // But list_images for main grid returned metadata. 
            // list_profile_images for details page might NOT return metadata for all images.
            // However, usually the first image might have metadata preserved if uploaded via old tool.
            
            // For now, just show images with defaults
            setProfile({
                id: id!,
                name: profile?.name || 'Aliya', // Fallback name
                age: profile?.age || '23', // Fallback age
                gender: 'female',
                description: 'Ahmedabad Escort Service - Contact for Booking and Inquiries.',
                location: 'Ahmedabad',
                images: s3Images,
            });
            setSelectedImage(s3Images[0]);
            setLoading(false);
            return;
        }

        setError('Profile not found');

      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-300 mb-8">{error || 'Profile not found'}</p>
        <Link href="/" className="px-6 py-2 bg-pink-600 rounded-full hover:bg-pink-700 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  // Use the profile state
  const { name, age, gender, description, location } = profile;
  const images = profile.images || [];

  return (
    <div className="min-h-screen bg-zinc-900 text-gray-100 font-sans pb-12">
      {/* Dynamic Style Injection */}
      {profile.customCss && (
          <style dangerouslySetInnerHTML={{ __html: profile.customCss }} />
      )}
      
      {/* Header / Nav */}
      <nav className="p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-pink-400 font-bold text-xl flex items-center gap-2 hover:text-pink-300 transition">
            <span>←</span> Back
          </Link>
          <div className="text-lg font-bold text-white">
            {name || 'Profile Details'}
          </div>
        </div>
      </nav>

      {/* Admin Quick Actions */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
           <Link href={`/admin/profile?id=${id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105">
              Edit / Manage
           </Link>
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={name || 'Profile Image'}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-pink-500 ring-2 ring-pink-500/50' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col gap-6">
            <div className="bg-black/40 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
              <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300 mb-2">
                {name || 'Unknown'}
              </h1>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {age && (
                  <span className="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm font-semibold border border-pink-500/30">
                    {age} Years Old
                  </span>
                )}
                {location && (
                  <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                    📍 {location}
                  </span>
                )}
                {gender && (
                  <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-semibold border border-purple-500/30 capitalize">
                    {gender}
                  </span>
                )}
                {/* Extra Properties */}
                {profile.extraProperties && Object.entries(profile.extraProperties).map(([key, value]) => (
                   <span key={key} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                     <strong className="text-white/80 mr-1">{key}:</strong> {value}
                   </span>
                ))}
              </div>

              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">About Me</h2>
                <p className="whitespace-pre-line text-gray-200">
                  {description || 'No description available.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
                <a 
                  href="tel:+919974599843" 
                  className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="text-2xl">📞</span>
                  <span>Call Now for Booking</span>
                </a>
                <a 
                  href={`https://wa.me/+919974599843?text=${encodeURIComponent(`hello, ${name || 'Aliya'} I saw your profile on Aliya Escort`)}`}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-3 w-full mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="text-2xl">💬</span>
                  <span>WhatsApp Me</span>
                </a>
                <p className="text-center text-xs text-gray-500 mt-4">
                  * you can directly call for the service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
