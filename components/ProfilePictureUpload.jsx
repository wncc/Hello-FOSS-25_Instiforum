"use client";
import React, { useState } from "react";
import { supabase } from "../app/lib/supabaseclient";

const ProfilePictureUpload = ({ user, onImageUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP)');
      return false;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      
      const file = event.target.files[0];
      if (!file || !validateFile(file)) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ image: data.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update localStorage and parent component
      const updatedUser = { ...user, image: data.publicUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onImageUpdate(data.publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <img
          src={user.image || "https://avatar.iran.liara.run/public/36"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
        />
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
        {uploading ? 'Uploading...' : 'Change Picture'}
        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default ProfilePictureUpload;