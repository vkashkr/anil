'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminProfileEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/profile?id=${id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.profile) {
                // Ensure default values for arrays
                const p = data.profile;
                if (!p.services) p.services = [];
                if (!p.images) p.images = [];
                // Check string fields to avoid undefined
                p.name = p.name || '';
                p.age = p.age || '';
                p.location = p.location || '';
                p.description = p.description || '';
                p.customCss = p.customCss || '';
                p.seoTitle = p.seoTitle || '';
                p.seoDescription = p.seoDescription || '';
                
                setProfile(p);
            }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    age: '',
    gender: 'female',
    location: 'Ahmedabad',
    description: '',
    services: [] as string[],
    images: [] as string[],
    customCss: '',
    seoTitle: '',
    seoDescription: '',
    isVisible: true,
    extraProperties: {} as Record<string, string>
  });
  const [newService, setNewService] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropValue, setNewPropValue] = useState('');
  
  // Ensure we don't switch from controlled to uncontrolled
  // The state initialization handles this, but let's double check data fetching doesn't introduce undefineds
  useEffect(() => {
    setProfile(p => ({
        ...p,
        name: p.name || '',
        age: p.age || '',
        location: p.location || '',
        description: p.description || '',
        customCss: p.customCss || '',
        seoTitle: p.seoTitle || '',
        seoDescription: p.seoDescription || '',
    }));
  }, [profile.id]); // Re-run sanitization when ID changes (which triggers fetch)


  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Add Service
  const addService = () => {
    if (newService.trim()) {
      setProfile(prev => ({ ...prev, services: [...prev.services, newService] }));
      setNewService('');
    }
  };

  // Remove Service
  const removeService = (index: number) => {
    setProfile(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
  };

  // Add Image URL (In a real app, this would be a file upload to S3 first)
  const addImage = () => {
    if (newImageUrl.trim()) {
      setProfile(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
      setNewImageUrl('');
    }
  };
  
  const removeImage = (index: number) => {
     setProfile(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addExtraProperty = () => {
    if (newPropKey.trim() && newPropValue.trim()) {
      setProfile(prev => ({
        ...prev,
        extraProperties: { ...prev.extraProperties, [newPropKey.trim()]: newPropValue.trim() }
      }));
      setNewPropKey('');
      setNewPropValue('');
    }
  };

  const removeExtraProperty = (key: string) => {
    setProfile(prev => {
        const next = { ...prev.extraProperties };
        delete next[key];
        return { ...prev, extraProperties: next };
    });
  };

  // Submit Handler
  const handleSubmit = async (action: 'save' | 'publish') => {
    if (!profile.id || !profile.name) {
      alert('ID and Name are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, profile }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Profile ${action}ed successfully!`);
        if(data.s3Url) {
            console.log("Published to:", data.s3Url);
        }
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      alert('An expected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Profile Editor</h1>
        
        <div className="space-y-6">
          {/* Base Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Profile ID (Unique)</label>
              <input type="text" name="id" value={profile.id} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. pooja-patel-123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" name="age" value={profile.age} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={profile.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="trans">Trans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" value={profile.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          {/* Detailed Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">About Description</label>
            <textarea name="description" value={profile.description} onChange={handleChange} rows={5} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Services</label>
            <div className="flex gap-2 mt-1 mb-2">
              <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2" placeholder="Add service (e.g. Massage)" />
              <button onClick={addService} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.services.map((s, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {s} <button onClick={() => removeService(idx)} className="text-red-500 font-bold">&times;</button>
                </span>
              ))}
            </div>
          </div>
          
           {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URLs (AWS S3)</label>
            <div className="flex gap-2 mt-1 mb-2">
              <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2" placeholder="https://..." />
              <button onClick={addImage} className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
            </div>
             <div className="flex flex-wrap gap-2">
              {profile.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24">
                  <img src={img} alt="preview" className="w-full h-full object-cover rounded bg-gray-200" />
                  <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Properties */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Extra Properties (Key-Value)</label>
            <div className="flex gap-2 mt-1 mb-2">
              <input type="text" value={newPropKey} onChange={(e) => setNewPropKey(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2" placeholder="Key (e.g. Height)" />
              <input type="text" value={newPropValue} onChange={(e) => setNewPropValue(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2" placeholder="Value (e.g. 5'6)" />
              <button onClick={addExtraProperty} className="bg-purple-500 text-white px-4 py-2 rounded">Add</button>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {profile.extraProperties && Object.entries(profile.extraProperties).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-2 rounded">
                  <span className="font-semibold text-gray-700">{key}:</span>
                  <span className="text-gray-600">{value}</span>
                  <button onClick={() => removeExtraProperty(key)} className="text-red-500 font-bold ml-2">&times;</button>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced / Styling */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Advanced: Styling & SEO</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700">Custom CSS (Injected into page)</label>
                 <textarea name="customCss" value={profile.customCss} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm bg-gray-50" placeholder=".profile-card { border: 2px solid pink; }" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SEO Title</label>
                <input type="text" name="seoTitle" value={profile.seoTitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SEO Description</label>
                 <textarea name="seoDescription" value={profile.seoDescription} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button 
              onClick={() => handleSubmit('save')} 
              disabled={loading}
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save Draft (DynamoDB)'}
            </button>
            <button 
              onClick={() => handleSubmit('publish')} 
              disabled={loading}
              className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition font-bold disabled:opacity-50"
            >
             {loading ? 'Processing...' : 'Publish to S3 & Sitemap'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminProfileEditor() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <AdminProfileEditorContent />
    </Suspense>
  );
}
