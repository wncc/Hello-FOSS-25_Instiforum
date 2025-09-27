"use client"
import React, { use } from 'react'
import { useEffect,useState } from 'react';
import userSSOdata from '@/components/userSSOdata';

const page = () => {
  const ssodata= userSSOdata();

  const userdata = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  return (
    <div>
      <h1>User Page</h1>
      <p>This is the user page.</p>
      <pre className='text-black'>{JSON.stringify(userdata, null, 2)}</pre>
      <pre className='text-black'>{JSON.stringify(ssodata, null, 2)}</pre>

    </div>
  )
}

export default page


