"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const updateUserState = () => {
      const localUser = localStorage.getItem("user");
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (localUser && isLoggedIn === "true") {
        setUser(JSON.parse(localUser));
      } else {
        setUser(null);
      }
    };

    updateUserState();

    const handleAuthChange = () => updateUserState();
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  return (
    <div className='w-full bg-white/80 backdrop-blur-2xl flex items-center justify-center text-black'>
      <div className='flex justify-between items-center px-6 py-3 w-full max-w-[1800px]'>
        <Link href="/home">
          <h1 className='text-3xl font-semibold'>Instiforum</h1>
        </Link>
        <div>
          {
            user ?
            (
              <div className='flex gap-4 items-center'>
                <Link href="/profile">
                  {/* replace this with actual image of user */}
                  <img 
                    src={user?.image || "https://avatar.iran.liara.run/public/36"} 
                    className='h-9 w-9 rounded-full border border-gray-300 object-cover' 
                    alt='user image' 
                  />
                </Link>
                <Link href="/signout">
                  <Button variant="default">Logout</Button>
                </Link>
              </div>
             
            ) : (
              <Link href="/signin">
                <Button variant="default">Login</Button>
              </Link>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default Navbar;
