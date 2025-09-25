"use client"
import React, { use } from 'react'
import { supabase } from "../lib/supabaseclient"
import { useEffect, useState } from 'react';
import Comments from "../../components/comments";
export default function Home() {
  const [user, setUser] = useState(null);
  const [Posts, setPosts] = useState([]);//state to hold posts from database
  const [votesByPost, setVotesByPost] = useState({}); // { [postId]: 'up' | 'down' }
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

  // Load vote state for the current session/user from localStorage
  useEffect(() => {
    const currentSessionKey = localStorage.getItem("sessionKey") || "anon";
    const stored = localStorage.getItem(`votes:${currentSessionKey}`);
    try {
      const parsed = stored ? JSON.parse(stored) : {};
      setVotesByPost(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setVotesByPost({});
    }
  }, [user]);

  const getVote = (postId) => votesByPost[postId] || null; // 'up' | 'down' | null
  const setVote = (postId, value) => {
    setVotesByPost(prev => {
      const next = { ...prev };
      if (value === null) delete next[postId]; else next[postId] = value;
      const currentSessionKey = localStorage.getItem("sessionKey") || "anon";
      localStorage.setItem(`votes:${currentSessionKey}`, JSON.stringify(next));
      return next;
    })
  }



  const handleUpvote = async (post) => { // toggleable upvote with switch from downvote
    const current = getVote(post.id);
    let deltaUp = 0;
    let deltaDown = 0;
    let nextVote = null;
    if (current === 'up') {
      // remove upvote
      deltaUp = -1;
      nextVote = null;
    } else if (current === 'down') {
      // switch down -> up
      deltaUp = 1;
      deltaDown = -1;
      nextVote = 'up';
    } else {
      // add upvote
      deltaUp = 1;
      nextVote = 'up';
    }

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: post.upvotes + deltaUp, downvotes: post.downvotes + deltaDown })
      .eq("id", post.id)

    if (error) console.error(error)
    else {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, upvotes: p.upvotes + deltaUp, downvotes: p.downvotes + deltaDown } : p))
      setVote(post.id, nextVote);
    }
  }


  const handleDownvote = async (post) => { // toggleable downvote with switch from upvote
    const current = getVote(post.id);
    let deltaUp = 0;
    let deltaDown = 0;
    let nextVote = null;
    if (current === 'down') {
      // remove downvote
      deltaDown = -1;
      nextVote = null;
    } else if (current === 'up') {
      // switch up -> down
      deltaUp = -1;
      deltaDown = 1;
      nextVote = 'down';
    } else {
      // add downvote
      deltaDown = 1;
      nextVote = 'down';
    }

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: post.upvotes + deltaUp, downvotes: post.downvotes + deltaDown })
      .eq("id", post.id)

    if (error) console.error(error)
    else {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, upvotes: p.upvotes + deltaUp, downvotes: p.downvotes + deltaDown } : p))
      setVote(post.id, nextVote);
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
              <img src='upvote.svg' onClick={() => { handleUpvote(post) }} className={`rounded-full h-5 w-5 ${getVote(post.id) === 'up' ? 'ring-2 ring-orange-500' : ''}`}></img>
              {post.upvotes - post.downvotes}
              <img src='downvote.svg' onClick={() => { handleDownvote(post) }} className={`rounded-full h-5 w-5 ${getVote(post.id) === 'down' ? 'ring-2 ring-blue-500' : ''}`}></img>
            </div>
            <Comments postId={post.id} />
            <div className="text-sm text-gray-500">Posted on: {new Date(post.created_at).toLocaleDateString()}</div>
          </div>))}
      </div>

    </>
  )
}