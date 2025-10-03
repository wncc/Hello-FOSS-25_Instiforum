"use client"
import React from 'react'
import { supabase } from '../lib/supabaseclient';
import { useEffect, useState } from 'react';
import {redirect } from 'next/navigation';

const Create = () => {
  const submitFunc = async (e) => {
    e.preventDefault();
    const postjson = {
      title: e.target.title.value,
      user_id: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).id : null,
      community_id: 0,
      image_url: "NONE",
      content: e.target.content.value,
      flair: e.target.flair.value,
      upvotes: 0,
      downvotes: 0
    };


    console.log(postjson);

    const { data, error } = await supabase.from('posts').insert([postjson]);

    if (error) console.error("Insert error:", error);
    else {console.log("Insert success:", data);
        redirect('/home');
    }


  }

    
  return (
    <div>
      <h1>Create Post</h1>
      <form onSubmit={submitFunc} className='flex flex-col max-w-md mx-auto'>
        <input name="title" type="text" placeholder='Title'  className='border p-2 w-full mb-2'/>
        <textarea name="content" placeholder='Content' className='border p-2 w-full mb-2'></textarea>
        <select name="flair" className='border p-2 w-full mb-2'>
          <option value="">Select Flair</option>
          <option value="General">General</option>
          <option value="Question">Question</option>
          <option value="Meme">Meme</option>
          <option value="Discussion">Discussion</option>
          <option value="Help">Help</option>
          <option value="Feedback">Feedback</option>
          <option value="News">News</option>
        </select>
      
        
        <button type='submit' className='bg-blue-500 text-white p-2 rounded'>Create Post</button>
      </form>
    </div>
  )
}

export default Create
