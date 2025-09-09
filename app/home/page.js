"use client"
import React, { use } from 'react'
import { supabase } from "../lib/supabaseclient"
import { useEffect, useState } from 'react';
export default function Home() {
  const [user, setUser] = useState(null);
  const [Posts, setPosts] = useState([]);//state to hold posts from database
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      setPosts(data || []);//sets posts to data fetched from database
      if (error) {
        console.error('Error fetching posts:', error);
      }

    };
    fetchPosts();
  }, []);
  useEffect(() => {
    // Extract query parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);

    // Grab the accessid returned by IITB SSO redirect
    const sessionKey = urlParams.get("accessid");

    //  Case 1: If user already exists in localStorage AND no new sessionKey from SSO
    const savedUser = localStorage.getItem("user");
    if (savedUser && !sessionKey) {
      // Load user directly from localStorage (persistent login)
      setUser(JSON.parse(savedUser));
      return; // Exit early, no need to fetch again
    }

    //  Case 2: If sessionKey exists (fresh login from SSO)
    if (sessionKey) {
      fetch("https://sso.tech-iitb.org/project/getuserdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionKey }), // send sessionKey to SSO server
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("User Data:", data);

          // Save user data in state (for immediate use)
          setUser(data);

          // Persist session locally so user stays logged in on refresh
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.setItem("sessionKey", sessionKey);
        });
    }
  }, []);



  const handleUpvote = async (postId, currentUpvotes) => {// function to handle upvote
    const { error } = await supabase
      .from("posts")//table name
      .update({ upvotes: currentUpvotes + 1 })//updates upvotes column by 1
      .eq("id", postId)//where id is equal to postId

    if (error) console.error(error)
    else {
      // Optimistically update state
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p //updates state to reflect upvote, Without Waiting for server response,for smoother UI expirience
        )
      )
    }
  }


  const handleDownvote = async (postId, currentDownvotes) => {//function to handle downvote
    const { error } = await supabase
      .from("posts")//table name
      .update({ downvotes: currentDownvotes + 1 })//updates downvotes column by 1
      .eq("id", postId)//where id is equal to postId

    if (error) console.error(error)
    else {
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, downvotes: p.downvotes + 1 } : p//updates state to reflect downvote, Without Waiting for server response,for smoother UI expirience
        )
      )
    }
  }



  console.log(Posts);
  return (
    <>
      <div className='p-5 bg-amber-100 min-h-screen  flex flex-col'>
        {Posts.map((post) => (//maps through each post in the posts table in database
          <div key={post.id} className=" mx-auto  w-2/3  my-4 p-4 border rounded-lg flex flex-col gap-3  shadow-sm bg-white">
            <div className='flex items-center gap-4'><h2 className="text-2xl font-bold ">{post.title}</h2>
              <div className='text-m rounded-full flex justify-center items-center bg-blue-400 p-1 w-20 text-center text-white'> {post.flair}</div>
            </div>

            <p className="text-gray-700 mb-4">{post.content}</p>
            {post.image_url && (<img src={post.image_url} className='justify-center' alt='' />)}
            <div className='flex gap-3 items-center'>
              <img src='upvote.svg' onClick={() => { handleUpvote(post.id, post.upvotes) }} className='rounded-full h-5 w-5'></img>
              {post.upvotes - post.downvotes}
              <img src='downvote.svg' onClick={() => { handleDownvote(post.id, post.downvotes) }} className='rounded-full h-5 w-5'></img>
            </div>
            <div className="text-sm text-gray-500">Posted on: {new Date(post.created_at).toLocaleDateString()}</div>
          </div>))}
      </div>

    </>
  )
}