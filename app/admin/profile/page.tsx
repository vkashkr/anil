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
                p.country = p.country || 'India';
                p.state = p.state || 'Gujarat';
                p.district = p.district || '';
                p.city = p.city || 'Ahmedabad';
                p.place = p.place || '';
                p.location = p.location || '';
                p.description = p.description || '';
                p.customCss = p.customCss || '';
                p.seoTitle = p.seoTitle || '';
                p.seoDescription = p.seoDescription || '';
                
                setProfile(p);
            }
        })
        .catch(err => console.error('[AdminProfile] load error:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    age: '',
    gender: 'female',
    country: 'India',
    state: 'Gujarat',
    district: '',
    city: 'Ahmedabad',
    place: '',
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

  const descEditorRef = React.useRef<HTMLDivElement>(null);
  const seoTitleRef = React.useRef<HTMLInputElement>(null);
  const seoDescRef = React.useRef<HTMLTextAreaElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSeoTitleEmoji, setShowSeoTitleEmoji] = useState(false);
  const [showSeoDescEmoji, setShowSeoDescEmoji] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState<{id: number; title: string; description: string}[]>([]);
  const [showSeoSuggest, setShowSeoSuggest] = useState(false);
  const [seoSuggestQuery, setSeoSuggestQuery] = useState('');
  const [showSource, setShowSource] = useState(false);
  const descInitialized = React.useRef(false);

  const CSS_PRESETS = [
    { label: 'Pink Border Card', value: '.profile-card { border: 2px solid #ec4899; border-radius: 16px; }' },
    { label: 'Glow Shadow', value: 'img { box-shadow: 0 0 20px rgba(236, 72, 153, 0.5); }' },
    { label: 'Gradient Background', value: 'body { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }' },
    { label: 'Rounded Images', value: 'img { border-radius: 20px; }' },
    { label: 'Neon Pink Text', value: 'h1, h2 { color: #ff6ec7; text-shadow: 0 0 10px #ff6ec7, 0 0 20px #ff6ec7; }' },
    { label: 'Gold Accent', value: 'h1, h2 { color: #ffd700; } a { color: #ffd700; }' },
    { label: 'Dark Glassmorphism', value: '.bg-black\\/40 { background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }' },
    { label: 'Animate Pulse Name', value: 'h1 { animation: pulse 2s infinite; }' },
    { label: 'Hide Contact Section', value: '.mt-8.pt-6 { display: none; }' },
    { label: 'Large Font Body', value: 'body { font-size: 18px; }' },
  ];

  const insertEmojiIntoField = (emoji: string, field: 'seoTitle' | 'seoDescription') => {
    const ref = field === 'seoTitle' ? seoTitleRef.current : seoDescRef.current;
    if (!ref) return;
    const start = ref.selectionStart || 0;
    const text = profile[field];
    const newText = text.substring(0, start) + emoji + text.substring(start);
    setProfile(prev => ({ ...prev, [field]: newText }));
    setTimeout(() => {
      ref.focus();
      ref.selectionStart = ref.selectionEnd = start + emoji.length;
    }, 0);
  };

  const EMOJI_LIST = ['😊','😍','💋','❤️','🔥','💃','👄','✨','💎','🌹','👸','🥰','😘','💕','🎀','💖','🫦','🍑','💅','🦋'];

  const COLORS = ['#000000','#e11d48','#db2777','#a855f7','#3b82f6','#059669','#eab308','#f97316','#ffffff'];

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    descEditorRef.current?.focus();
    syncDescription();
  };

  const syncDescription = () => {
    if (descEditorRef.current) {
      setProfile(prev => ({ ...prev, description: descEditorRef.current?.innerHTML || '' }));
    }
  };

  const insertEmojiIntoEditor = (emoji: string) => {
    descEditorRef.current?.focus();
    document.execCommand('insertText', false, emoji);
    syncDescription();
  };
  const [newService, setNewService] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropValue, setNewPropValue] = useState('');
  
  // Ensure we don't switch from controlled to uncontrolled
  // The state initialization handles this, but let's double check data fetching doesn't introduce undefineds
  // NOTE: The sanitization useEffect below was removed (fix #16) — it was redundant
  // because the fetch useEffect above already applies defaults, and running setProfile
  // on every profile.id change caused unnecessary re-renders.


  // Handle Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Load SEO suggestions from seo.json
  useEffect(() => {
    fetch('/data/seo.json')
      .then(res => res.json())
      .then(data => setSeoSuggestions(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Initialize WYSIWYG editor content (only once after data loads)
  useEffect(() => {
    if (descEditorRef.current && profile.description && !descInitialized.current) {
      descEditorRef.current.innerHTML = profile.description;
      descInitialized.current = true;
    }
  }, [profile.description]);

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
          </div>

          {/* Location Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Location Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input type="text" name="country" value={profile.country} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input type="text" name="state" value={profile.state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">District / Municipality</label>
                <input type="text" name="district" value={profile.district} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Ahmedabad District" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="city" value={profile.city} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Place / Area</label>
                <input type="text" name="place" value={profile.place} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. CG Road, Navrangpura" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Display Location (legacy)</label>
                <input type="text" name="location" value={profile.location} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
          </div>

          {/* Detailed Info with WYSIWYG Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About Description</label>
            {/* Rich Text Toolbar */}
            <div className="flex flex-wrap items-center gap-1 bg-gray-100 border border-gray-300 rounded-t-md p-2">
              <button type="button" onClick={() => execCmd('bold')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 font-bold text-sm" title="Bold">B</button>
              <button type="button" onClick={() => execCmd('italic')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 italic text-sm" title="Italic">I</button>
              <button type="button" onClick={() => execCmd('underline')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 underline text-sm" title="Underline">U</button>
              <button type="button" onClick={() => execCmd('strikeThrough')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 line-through text-sm" title="Strikethrough">S</button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <select onChange={(e) => { if (e.target.value) { execCmd('formatBlock', e.target.value); e.target.value = ''; }}} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-200" defaultValue="">
                <option value="" disabled>Heading</option>
                <option value="h1">H1 - Largest</option>
                <option value="h2">H2 - Large</option>
                <option value="h3">H3 - Medium</option>
                <option value="h4">H4 - Small</option>
                <option value="p">Paragraph</option>
              </select>
              <select onChange={(e) => { if (e.target.value) { execCmd('fontSize', e.target.value); e.target.value = ''; }}} className="px-2 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-200" defaultValue="">
                <option value="" disabled>Size</option>
                <option value="1">Tiny</option>
                <option value="2">Small</option>
                <option value="3">Normal</option>
                <option value="4">Large</option>
                <option value="5">X-Large</option>
                <option value="6">XX-Large</option>
                <option value="7">Huge</option>
              </select>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button type="button" onClick={() => execCmd('justifyLeft')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Align Left">⬅</button>
              <button type="button" onClick={() => execCmd('justifyCenter')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Center">⬛</button>
              <button type="button" onClick={() => execCmd('justifyRight')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Align Right">➡</button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button type="button" onClick={() => execCmd('insertUnorderedList')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Bullet List">• List</button>
              <button type="button" onClick={() => execCmd('insertOrderedList')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Numbered List">1. List</button>
              <button type="button" onClick={() => execCmd('insertHorizontalRule')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Horizontal Line">—</button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              {/* Color Picker */}
              <div className="relative">
                <button type="button" onClick={() => { setShowColorPicker(prev => !prev); setShowEmojiPicker(false); }} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Text Color">🎨</button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex gap-1 z-50">
                    {COLORS.map((color) => (
                      <button key={color} type="button" onClick={() => { execCmd('foreColor', color); setShowColorPicker(false); }} className="w-6 h-6 rounded-full border border-gray-300 hover:scale-125 transition" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                )}
              </div>
              {/* Emoji Picker */}
              <div className="relative">
                <button type="button" onClick={() => { setShowEmojiPicker(prev => !prev); setShowColorPicker(false); }} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm" title="Emoji">😊</button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-50 w-48">
                    {EMOJI_LIST.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => { insertEmojiIntoEditor(emoji); setShowEmojiPicker(false); }} className="text-xl hover:bg-gray-100 rounded p-1 cursor-pointer">{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button type="button" onClick={() => execCmd('removeFormat')} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm text-red-500" title="Clear Formatting">✕</button>
              <button type="button" onClick={() => {
                setShowSource(prev => {
                  if (prev && descEditorRef.current) {
                    // Switching from source to WYSIWYG — sync HTML into editor
                    setTimeout(() => {
                      if (descEditorRef.current) descEditorRef.current.innerHTML = profile.description;
                    }, 0);
                  }
                  return !prev;
                });
              }} className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-200 text-sm font-mono" title="View/Edit HTML Source">&lt;/&gt;</button>
            </div>
            {/* WYSIWYG Editor */}
            {showSource ? (
              <textarea
                value={profile.description}
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, description: e.target.value }));
                }}
                rows={8}
                className="block w-full border border-gray-300 border-t-0 rounded-b-md shadow-sm p-3 font-mono text-sm bg-gray-50"
                placeholder="Edit HTML source directly..."
              />
            ) : (
              <div
                ref={descEditorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncDescription}
                onBlur={syncDescription}
                className="block w-full border border-gray-300 border-t-0 rounded-b-md shadow-sm p-3 min-h-[160px] bg-white prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-pink-500/30"
              />
            )}
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
            <div className="flex flex-col gap-2 mt-1 mb-2">
              <select
                id="s3BucketSelect"
                className="border border-gray-300 rounded-md p-2 text-sm bg-white"
                defaultValue="https://gif-gif.s3.amazonaws.com/"
              >
                <option value="https://gif-gif.s3.amazonaws.com/">gif-gif (Images Bucket)</option>
                <option value="https://www.aliyaescort.com/">www.aliyaescort.com (Site Bucket)</option>
                <option value="https://gif.aliyaescort.com/img/">gif.aliyaescort.com/img</option>
                <option value="">Custom URL (no prefix)</option>
              </select>
              <div className="flex gap-2">
                <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2" placeholder="path/to/image.jpg  or full https://..." />
                <button onClick={() => {
                  if (!newImageUrl.trim()) return;
                  const select = document.getElementById('s3BucketSelect') as HTMLSelectElement;
                  const prefix = select?.value || '';
                  const url = newImageUrl.startsWith('http') ? newImageUrl : prefix + newImageUrl;
                  setProfile(prev => ({ ...prev, images: [...prev.images, url] }));
                  setNewImageUrl('');
                }} className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
              </div>
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

          {/* ── Physical Details ── */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-pink-500">◆</span> Physical Details
              <span className="text-xs text-gray-400 font-normal">(displayed on profile page)</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'height',      label: 'Height',      placeholder: "e.g. 5'4\" (163 cm)" },
                { key: 'weight',      label: 'Weight',      placeholder: 'e.g. 52 kg' },
                { key: 'hair',        label: 'Hair Colour', placeholder: 'e.g. Black' },
                { key: 'eyes',        label: 'Eye Colour',  placeholder: 'e.g. Brown' },
                { key: 'body_type',   label: 'Body Type',   placeholder: 'e.g. Slim / Curvy' },
                { key: 'nationality', label: 'Nationality', placeholder: 'e.g. Indian' },
                { key: 'ethnicity',   label: 'Ethnicity',   placeholder: 'e.g. South Asian' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={profile.extraProperties?.[key] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProfile(prev => {
                        const next = { ...prev.extraProperties };
                        if (val) next[key] = val; else delete next[key];
                        return { ...prev, extraProperties: next };
                      });
                    }}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Rates ── */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-yellow-500">◆</span> Rates
              <span className="text-xs text-gray-400 font-normal">(shown in yellow rates box)</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'rate_30min',   label: '30 Min',        placeholder: 'e.g. ₹1,500' },
                { key: 'rate_1hr',     label: '1 Hour',         placeholder: 'e.g. ₹3,000' },
                { key: 'rate_2hr',     label: '2 Hours',        placeholder: 'e.g. ₹5,000' },
                { key: 'rate_night',   label: 'Full Night',     placeholder: 'e.g. ₹15,000' },
                { key: 'rate_overnight', label: 'Overnight',   placeholder: 'e.g. ₹18,000' },
                { key: 'incall',       label: 'Incall',         placeholder: 'e.g. Available' },
                { key: 'outcall',      label: 'Outcall',        placeholder: 'e.g. Available' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type="text"
                    value={profile.extraProperties?.[key] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProfile(prev => {
                        const next = { ...prev.extraProperties };
                        if (val) next[key] = val; else delete next[key];
                        return { ...prev, extraProperties: next };
                      });
                    }}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Languages ── */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-blue-500">◆</span> Languages Spoken
            </h3>
            <input
              type="text"
              value={profile.extraProperties?.['languages'] ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setProfile(prev => {
                  const next = { ...prev.extraProperties };
                  if (val) next['languages'] = val; else delete next['languages'];
                  return { ...prev, extraProperties: next };
                });
              }}
              placeholder="e.g. Hindi, English, Gujarati"
              className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
            />
          </div>

          {/* ── Other Extra Properties (freeform) ── */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-purple-500">◆</span> Other Properties
              <span className="text-xs text-gray-400 font-normal">(custom key-value pairs)</span>
            </h3>
            <div className="flex gap-2 mb-3">
              <input type="text" value={newPropKey} onChange={(e) => setNewPropKey(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white" placeholder="Key (e.g. Tattoo)" />
              <input type="text" value={newPropValue} onChange={(e) => setNewPropValue(e.target.value)} className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white" placeholder="Value (e.g. None)" />
              <button onClick={addExtraProperty} className="bg-purple-500 text-white px-4 py-2 rounded text-sm">Add</button>
            </div>
            {/* Show only freeform keys (not the structured ones above) */}
            {(() => {
              const structured = new Set(['height','weight','hair','eyes','body_type','nationality','ethnicity','rate_30min','rate_1hr','rate_2hr','rate_night','rate_overnight','incall','outcall','languages']);
              const freeform = Object.entries(profile.extraProperties ?? {}).filter(([k]) => !structured.has(k));
              return freeform.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {freeform.map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded text-sm">
                      <span className="font-semibold text-gray-700">{key}:</span>
                      <span className="text-gray-600 mx-2 flex-1">{value}</span>
                      <button onClick={() => removeExtraProperty(key)} className="text-red-500 font-bold">&times;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No custom properties yet.</p>
              );
            })()}
          </div>

          {/* Advanced / Styling */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Advanced: Styling & SEO</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Custom CSS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS (Injected into page)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setProfile(prev => ({
                          ...prev,
                          customCss: prev.customCss ? prev.customCss + '\n' + e.target.value : e.target.value
                        }));
                        e.target.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 text-gray-700"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add CSS Preset...</option>
                    {CSS_PRESETS.map((preset) => (
                      <option key={preset.label} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                  {profile.customCss && (
                    <button type="button" onClick={() => setProfile(prev => ({ ...prev, customCss: '' }))} className="px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 hover:bg-red-100">Clear All CSS</button>
                  )}
                </div>
                <textarea name="customCss" value={profile.customCss} onChange={handleChange} rows={4} className="block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm bg-gray-50" placeholder="Select a preset above or write custom CSS..." />
                {profile.customCss && (
                  <div className="mt-1 text-xs text-gray-500">Active rules: {profile.customCss.split('}').filter(r => r.trim()).length}</div>
                )}
              </div>

              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                <div className="flex gap-1 items-center">
                  <input
                    ref={seoTitleRef}
                    type="text"
                    name="seoTitle"
                    value={profile.seoTitle}
                    onChange={handleChange}
                    onFocus={() => { if (!profile.seoTitle) setShowSeoSuggest(true); }}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. Pooja - Premium Escort in Ahmedabad"
                  />
                  <div className="relative">
                    <button type="button" onClick={() => { setShowSeoTitleEmoji(prev => !prev); setShowSeoDescEmoji(false); }} className="px-2 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 text-sm">😊</button>
                    {showSeoTitleEmoji && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-50 w-48">
                        {EMOJI_LIST.map((emoji) => (
                          <button key={emoji} type="button" onClick={() => { insertEmojiIntoField(emoji, 'seoTitle'); setShowSeoTitleEmoji(false); }} className="text-xl hover:bg-gray-100 rounded p-1 cursor-pointer">{emoji}</button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowSeoSuggest(prev => !prev); setSeoSuggestQuery(''); }}
                    className="px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-md hover:bg-yellow-100 text-sm text-yellow-700 whitespace-nowrap"
                    title="Suggest from SEO library"
                  >💡 Suggest</button>
                </div>
                {profile.seoTitle && <div className="mt-1 text-xs text-gray-500">{profile.seoTitle.length}/200 characters {profile.seoTitle.length > 200 ? '⚠️ Too long' : '✅'}</div>}
              </div>

              {/* SEO Suggestion Panel */}
              {showSeoSuggest && (
                <div className="border border-yellow-300 rounded-lg bg-yellow-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-yellow-800">💡 SEO Suggestions ({seoSuggestions.length} available)</span>
                    <button type="button" onClick={() => setShowSeoSuggest(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">&times;</button>
                  </div>
                  <input
                    type="text"
                    value={seoSuggestQuery}
                    onChange={(e) => setSeoSuggestQuery(e.target.value)}
                    placeholder="Search suggestions..."
                    className="w-full border border-yellow-300 rounded-md p-2 text-sm mb-2 bg-white"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {seoSuggestions
                      .filter(s =>
                        !seoSuggestQuery ||
                        s.title.toLowerCase().includes(seoSuggestQuery.toLowerCase()) ||
                        s.description.toLowerCase().includes(seoSuggestQuery.toLowerCase())
                      )
                      .map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setProfile(prev => ({ ...prev, seoTitle: s.title, seoDescription: s.description }));
                            setShowSeoSuggest(false);
                            setSeoSuggestQuery('');
                          }}
                          className="w-full text-left p-2 rounded-md bg-white border border-yellow-200 hover:bg-yellow-100 hover:border-yellow-400 transition"
                        >
                          <div className="text-xs font-bold text-yellow-700 mb-0.5">#{s.id}</div>
                          <div className="text-sm font-semibold text-gray-800 leading-snug">{s.title}</div>
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description.substring(0, 120)}…</div>
                        </button>
                      ))
                    }
                    {seoSuggestions.filter(s =>
                      !seoSuggestQuery ||
                      s.title.toLowerCase().includes(seoSuggestQuery.toLowerCase()) ||
                      s.description.toLowerCase().includes(seoSuggestQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="text-sm text-gray-400 text-center py-4">No suggestions match your search.</div>
                    )}
                  </div>
                </div>
              )}

              {/* SEO Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                <div className="flex gap-1 items-start">
                  <textarea
                    ref={seoDescRef}
                    name="seoDescription"
                    value={profile.seoDescription}
                    onChange={handleChange}
                    onFocus={() => { if (!profile.seoDescription) setShowSeoSuggest(true); }}
                    rows={2}
                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="e.g. Book Pooja for premium escort services in Ahmedabad. Verified, independent call girl..."
                  />
                  <div className="relative">
                    <button type="button" onClick={() => { setShowSeoDescEmoji(prev => !prev); setShowSeoTitleEmoji(false); }} className="px-2 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 text-sm">😊</button>
                    {showSeoDescEmoji && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-50 w-48">
                        {EMOJI_LIST.map((emoji) => (
                          <button key={emoji} type="button" onClick={() => { insertEmojiIntoField(emoji, 'seoDescription'); setShowSeoDescEmoji(false); }} className="text-xl hover:bg-gray-100 rounded p-1 cursor-pointer">{emoji}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {profile.seoDescription && <div className="mt-1 text-xs text-gray-500">{profile.seoDescription.length}/1000 characters {profile.seoDescription.length > 1000 ? '⚠️ Too long' : '✅'}</div>}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button 
              onClick={() => handleSubmit('save')} 
              disabled={loading}
              className="flex-1 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={() => handleSubmit('publish')} 
              disabled={loading}
              className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition font-bold disabled:opacity-50"
            >
             {loading ? 'Publishing...' : 'Publish'}
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
