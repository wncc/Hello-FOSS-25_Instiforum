"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Search from './Search';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      setUser(JSON.parse(localUser));
    } else {
      setUser(null);
    }
  }, []);

  const buttonText = user ? user.name : "Signin";
  const buttonHref = user ? "/profile" : "/signin";

  return (
    <div className='sticky top-0 flex justify-between items-center p-4 bg-amber-100 text-white bg-gray-900'>
      <h1 className='text-3xl font-bold text-white'>Instiforum</h1>
      <Search />
      <div>
        <Link href={buttonHref}>
          <button className='bg-blue-500 flex w-40 justify-around items-center text-white px-4 py-2 rounded-full mr-2'>
            <img src='placeholder.png' className='rounded-full h-10 w-10' alt='Profile'/>
            {buttonText}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
