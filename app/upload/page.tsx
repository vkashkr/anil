"use client";
import React, { useState } from "react";

export default function UploadImagePage() {
  const [image, setImage] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setFilename(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setResult("Please select an image.");
      return;
    }
    if (!filename || !id || !name || !age || !gender || !description) {
      setResult("Please fill all fields.");
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      // Convert image to base64 (remove data: prefix)
      const toBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/...;base64, prefix
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = error => reject(error);
        });
      const imageBase64 = await toBase64(image);
      const payload = {
        image: imageBase64,
        filename,
        metadata: {
          id,
          name,
          age,
          gender,
          description,
        },
      };
      const res = await fetch("/bff/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
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
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'black' }}>Upload Image & Meta Data</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} required />
        </div>
        <div className="flex items-center mb-2">
          <label className="font-medium mr-2" style={{ color: 'black', minWidth: 100 }}>Filename</label>
          <input type="text" value={filename} onChange={e => setFilename(e.target.value)} className="border rounded px-2 py-1 flex-1" required placeholder="e.g. photo.jpg" />
        </div>
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
