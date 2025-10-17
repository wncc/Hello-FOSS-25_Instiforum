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

  const buttonText = user ? user.name : "SIGN IN";
  const buttonHref = user ? "/profile" : "/signin";

  return (
    <div className='sticky top-0 flex justify-between items-center p-4 bg-gradient-to-br from-[#87CEEB] to-[#6495ED] text-white bg-gray-900'>
      <h1 className='text-4xl font-bold bg-gradient-to-r from-sky-500 to-blue-800 text-transparent bg-clip-text'>IITB Instiforum</h1>
      <Search />
      <div>
        <Link href={buttonHref}>
          <button className='bg-blue-500 flex w-40 justify-around items-center text-white px-4 py-2 rounded-full mr-2' style={{borderBottom:'3px solid blue'}}>
            {/* <img src='placeholder.png' className='rounded-full h-10 w-10' alt='Profile'/> */}
            <span style={{ fontWeight: 'bold'}}>{buttonText}</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
