"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      setUser(JSON.parse(localUser));
    } 
    else {
      setUser(null);
    }
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
                  <img src={user ? user.image: "https://avatar.iran.liara.run/public/36"} className='h-9 w-9 rounded-full border-1 border-gray-300' alt='user image' />
                </Link>
                <Button variant="default">Logout</Button>
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
