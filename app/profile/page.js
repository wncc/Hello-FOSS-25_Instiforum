"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE_MB = 100;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const Page = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const authUser = session?.user;
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (userError) console.error(userError);
      setUser(userProfile);
      try {
        // cache minimal user info so other UI (navbar/avatar) can read it
        if (userProfile)
          localStorage.setItem("user", JSON.stringify(userProfile));
      } catch (e) {
        // ignore storage errors
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    window.location.href = "/home";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG and PNG files are allowed.");
      return;
    }

    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      setError("File size must be under 2 MB.");
      return;
    }

    if (!user) {
      setError("No user profile found.");
      return;
    }

    setUploading(true);

    try {
      // Unique filename per user
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, {
          upsert: true, // overwrite if already exists
        });

      if (uploadError) throw uploadError;

      // Generate a signed URL (valid for 1 week)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("profile-pictures")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days

      if (urlError) throw urlError;

      // Save URL to user's profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: signedUrlData.signedUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      const updated = { ...(user || {}), avatar_url: signedUrlData.signedUrl };
      setUser(updated);
      try {
        localStorage.setItem("user", JSON.stringify(updated));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen w-full flex justify-center items-center text-black">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen w-full flex justify-center items-center text-black">
        No user data found. Please log in.
      </div>
    );

  return (
    <div className="min-h-screen w-full flex justify-center items-center text-black">
      <div className="min-w-xl mt-10 p-6 bg-gradient-to-r from-blue-400 to-blue-300 rounded-lg shadow-xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt="User Avatar"
            className="w-28 h-28 rounded-full object-cover border mb-3"
          />
          <label className="text-black cursor-pointer text-sm font-medium">
            {uploading ? "Uploading..." : "Change Picture"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* User Info */}
        <div className="space-y-2 mb-6 text-left w-full">
          <div>
            <strong>Name:</strong> {user.name || "-"}
          </div>
          <div>
            <strong>Roll:</strong> {user.roll || "-"}
          </div>
          <div>
            <strong>Degree:</strong> {user.degree || "-"}
          </div>
          <div>
            <strong>Department:</strong> {user.department || "-"}
          </div>
          <div>
            <strong>Role:</strong> {user.role || "-"}
          </div>
          <div>
            <strong>Joined:</strong>{" "}
            {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
          </div>
        </div>

        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
};

export default Page;
