"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfileAvatar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      // ignore
    }
  }, []);

  const src = user?.avatar_url || user?.image || "/default-avatar.png";

  return (
    <div className="fixed top-4 right-4 z-50">
      <Link href="/profile">
        <img
          src={src}
          alt={user?.name ? `${user.name} profile` : "Profile"}
          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
        />
      </Link>
    </div>
  );
}
