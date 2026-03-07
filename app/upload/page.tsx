"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadImagePage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [filenames, setFilenames] = useState<string[]>([]);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setFilenames(files.map(f => f.name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setResult("Please select at least one image.");
      return;
    }
    if (!id || !name || !age || !gender || !description) {
      setResult("Please fill all fields.");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      // Convert images to base64
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
      const imagesBase64 = await Promise.all(images.map(toBase64));
      const payload = images.map((img, idx) => ({
        image: imagesBase64[idx],
        filename: img.name,
        metadata: {
          id,
          name,
          age,
          gender,
          description,
        },
      }));
      const res = await fetch("/bff/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success || Array.isArray(data) && data.every((d: any) => d.success)) {
        setResult("Upload successful!");
      } else {
        setResult(data.error || "Upload failed.");
      }
    } catch (err: any) {
      setResult(err.message || "Error uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow" style={{ color: 'black' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'black' }}>Upload Image & Meta Data</h2>
        <button onClick={handleLogout} className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50">
          Logout
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} required />
        </div>
        {filenames.length > 0 && (
          <div className="flex flex-col mb-2">
            <span className="font-medium" style={{ color: 'black' }}>Selected files:</span>
            <ul className="list-disc ml-6">
              {filenames.map((fn, idx) => (
                <li key={idx} style={{ color: 'black' }}>{fn}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>ID</label>
          <input type="text" value={id} onChange={e => setId(e.target.value)} className="border rounded px-2 py-1 flex-1" required placeholder="Unique ID" />
        </div>
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded px-2 py-1 flex-1" required />
        </div>
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Age</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} className="border rounded px-2 py-1 flex-1" required min="0" />
        </div>
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className="border rounded px-2 py-1 flex-1" required>
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-2 py-1 flex-1" required placeholder="Description" />
        </div>
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {result && <div className="mt-4 text-center" style={{ color: 'black' }}>{result}</div>}
    </div>
  );
}
