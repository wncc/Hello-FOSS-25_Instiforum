"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const page = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("sessionKey");
    localStorage.removeItem("isLoggedIn");
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Redirect to signin
    router.push('/signin');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <p className="mt-2 text-gray-600">Signing out...</p>
      </div>
    </div>
  );
};

export default page;
