"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface GirlProfile {
  filename: string;
  full_path: string;
  metadata: {
    name?: string;
    age?: string;
    gender?: string;
    description?: string;
    [key: string]: any;
  };
}

function ViewProfilesPage() {
  const [profiles, setProfiles] = useState<GirlProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id") || "";

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      setError(null);
      try {
        let url = "/bff/api/get-profiles";
        if (queryId) {
          url += `?id=${encodeURIComponent(queryId)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.data && Array.isArray(data.data.images)) {
          setProfiles(data.data.images);
        } else if (data.data && data.data.images && typeof data.data.images === 'object') {
          setProfiles([data.data.images]);
        } else {
          setProfiles([]);
          setError("No profiles found.");
        }
      } catch (err: any) {
        setError("Failed to load profiles.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [queryId]);

  const [result, setResult] = useState<string | null>(null);

  const handleUpdate = async (file: File, profile: GirlProfile | null) => {
    if (!file) return;
    setResult(null);
    try {
      // Convert to base64
      const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });
      const imageBase64 = await toBase64(file);
      const chosenId = queryId || id;
      const payload = [{
        image: imageBase64,
        filename: profile ? `${profile.filename}` : `${chosenId}/${file.name}`,
        metadata: profile ? profile.metadata || {} : {},
      }];
      const res = await fetch('/bff/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success || (Array.isArray(data) && data.every((d: any) => d.success))) {
        setResult('Image updated!');
        window.location.reload();
      } else {
        setResult(data.error || 'Update failed');
      }
    } catch (err: any) {
      setResult(err.message || 'Update failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow" style={{ color: 'black' }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'black' }}>Girl Profiles</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          const params = new URLSearchParams(window.location.search);
          if (id) {
            params.set("id", id);
          } else {
            params.delete("id");
          }
          router.push(`?${params.toString()}`);
        }}
        className="mb-6 flex gap-2"
      >
        <input
          type="text"
          value={id}
          onChange={e => setId(e.target.value)}
          placeholder="Enter ID to filter"
          className="border rounded px-2 py-1 flex-1"
        />
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded">Search</button>
        <button
          type="button"
          className="bg-gray-300 text-black px-4 py-2 rounded"
          onClick={() => {
            setId("");
            const params = new URLSearchParams(window.location.search);
            params.delete("id");
            router.push(`?${params.toString()}`);
          }}
        >Clear</button>
      </form>
      <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
                Add
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const chosenId = queryId || id;
                      handleUpdate(file, null);
                    }
                  }}
                />
        </label>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile, idx) => (
          <div key={idx} className="border rounded p-4 flex flex-col items-center bg-gray-50">
            <img
              src={profile.full_path}
              alt={(profile.metadata && profile.metadata.name) || "Profile"}
              className="w-48 h-48 object-cover rounded mb-4 border"
            />
            <div className="flex gap-2 mt-2">
              <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer">
                Update
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpdate(file, profile);
                  }}
                />
              </label>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={async () => {
                  if (!window.confirm(`Are you sure you want to delete ${profile.filename}?`)) return;
                  try {
                    const res = await fetch(`/bff/api/delete?filename=${encodeURIComponent(profile.filename)}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                      setProfiles(prev => prev.filter(p => p.filename !== profile.filename));
                    } else {
                      alert(data.error || 'Delete failed');
                    }
                  } catch (err) {
                    alert('Delete failed');
                  }
                }}
              >Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export with hideFooter prop for layout
export default Object.assign(ViewProfilesPage, { hideFooter: true });
