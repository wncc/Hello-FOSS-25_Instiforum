"use client"
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient";
import { Button } from "@/components/ui/button";

const page = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to get user from localStorage first
    const localUser = localStorage.getItem("user");

    if (localUser) {
      setUser(JSON.parse(localUser));
      setLoading(false);
      return;
    }
    // If not found, you could fetch from Supabase (optional)
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen w-full flex justify-center items-center text-black">Loading...</div>;
  if (!user) return <div className="min-h-screen w-full flex justify-center items-center text-black">No user data found. Please log in.</div>;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("sessionKey");
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center text-black">
      <div className="min-w-xl mt-10 p-6 bg-white rounded shadow-xl">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <div className="space-y-2 mb-6">
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Roll:</strong> {user.roll}</div>
          <div><strong>Degree:</strong> {user.degree}</div>
          <div><strong>Department:</strong> {user.department}</div>
          <div><strong>Role:</strong> {user.role}</div>
          <div><strong>Joined:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}</div>
        </div>
          <Button onClick={handleLogout} variant="default">Logout</Button>
        </div>
    </div>
  );

};

export default page;
