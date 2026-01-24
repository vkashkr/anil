

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
};

export default function ProfilePage() {
    return (
    <div>
      <h1>Profile Page</h1>
      
       <Image
                        src="https://gif-gif.s3.amazonaws.com/1/aarushi.webp"
                        alt="Sample"
                        width={20}
                        height={20}
                        className="rounded-lg object-cover border mb-3 sm:mb-4 w-full h-auto"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
                      />
    </div>
  );
}