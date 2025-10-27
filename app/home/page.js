"use client";
import React, { use, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient";
import Comments from "../../components/comments";
import InteractiveBg from "@/components/bg/interactivebg";
import Search from "@/components/Search";

export default function Home() {
  const [user, setUser] = useState(null);
  const [Posts, setPosts] = useState([]); //state to hold posts from database
  const [votesByPost, setVotesByPost] = useState({}); // { [postId]: 'up' | 'down' }
  const [isLoaded, setIsLoaded] = useState(false); // State for the fade-in effect
  const [votingInProgress, setVotingInProgress] = useState({}); // { [postId]: boolean }

  // This effect triggers the fade-in animation after the component has mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100); // A small delay ensures the transition is applied correctly
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async (searchQuery = "") => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .ilike("title", `%${searchQuery}%`)
      .order("created_at", { ascending: false });
    setPosts(data || []); //sets posts to data fetched from database
    if (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Extract query parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionKey = urlParams.get("accessid");

    // Case 1: Use localStorage if user is already saved and no new sessionKey
    const savedUser = localStorage.getItem("user");
    if (savedUser && !sessionKey) {
      setUser(JSON.parse(savedUser));
      return; // Exit early
    }

    // Case 2: If sessionKey exists (fresh login from SSO)
    if (sessionKey) {
      fetch("https://sso.tech-iitb.org/project/getuserdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionKey }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          console.log("User Data:", data);

          // Rebuild the object with your own fields
          const newData = {
            id: crypto.randomUUID(),
            name: data.name,
            roll: data.roll,
            department: data.department,
            degree: data.degree,
            role: "student",
          };

          //  STEP 1: Check if user already exists in Supabase
          const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("*")
            .eq("roll", newData.roll)
            .maybeSingle(); // safer than .single() if no row exists

          if (checkError && checkError.code !== "PGRST116") {
            console.error("Error checking user:", checkError.message);
            return;
          }

          if (existingUser) {
            // IF user already exists
            console.log("User already exists:", existingUser);
            setUser(existingUser);
            localStorage.setItem("user", JSON.stringify(existingUser));
          } else {
            // ELSE: Insert the new user
            console.log("No existing user found. Inserting new one...");
            const { data: inserted, error: insertError } = await supabase
              .from("users")
              .insert([newData])
              .select()
              .single();

            if (insertError) {
              console.error("Supabase Insert Error:", insertError.message);
            } else {
              console.log("Inserted into Supabase:", inserted);
              setUser(inserted);
              localStorage.setItem("user", JSON.stringify(inserted));
            }
          }

          // Save sessionKey
          localStorage.setItem("sessionKey", sessionKey);
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  }, []);

  // Load vote state for the current session/user from localStorage
  useEffect(() => {
    const currentSessionKey = localStorage.getItem("sessionKey") || "anon";
    const stored = localStorage.getItem(`votes:${currentSessionKey}`);
    try {
      const parsed = stored ? JSON.parse(stored) : {};
      setVotesByPost(parsed && typeof parsed === "object" ? parsed : {});
    } catch {
      setVotesByPost({});
    }
  }, [user]);

  const getVote = (postId) => votesByPost[postId] || null; // 'up' | 'down' | null
  const setVote = (postId, value) => {
    setVotesByPost((prev) => {
      const next = { ...prev };
      if (value === null) delete next[postId];
      else next[postId] = value;
      const currentSessionKey = localStorage.getItem("sessionKey") || "anon";
      localStorage.setItem(`votes:${currentSessionKey}`, JSON.stringify(next));
      return next;
    });
  };

  const handleUpvote = async (post) => {
    // Prevent double-clicks during operation
    if (votingInProgress[post.id]) return;

    const current = getVote(post.id);
    let deltaUp = 0;
    let deltaDown = 0;
    let nextVote = null;
    if (current === "up") {
      // remove upvote
      deltaUp = -1;
      nextVote = null;
    } else if (current === "down") {
      // switch down -> up
      deltaUp = 1;
      deltaDown = -1;
      nextVote = "up";
    } else {
      // add upvote
      deltaUp = 1;
      nextVote = "up";
    }

    // Set loading state
    setVotingInProgress((prev) => ({ ...prev, [post.id]: true }));

    try {
      const { error, data } = await supabase
        .from("posts")
        .update({
          upvotes: post.upvotes >= 0 ? (post.upvotes || 0) + deltaUp : 0,
          downvotes:
            post.downvotes >= 0 ? (post.downvotes || 0) + deltaDown : 0,
        })
        .eq("id", post.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update vote:", error);
        alert("Failed to update vote. Please try again.");
      } else {
        // Only update UI after successful database operation
        setPosts((prev) => prev.map((p) => (p.id === post.id ? data : p)));
        setVote(post.id, nextVote);
      }
    } catch (err) {
      console.error("Error during vote:", err);
      alert("An error occurred. Please try again.");
    } finally {
      // Clear loading state
      setVotingInProgress((prev) => ({ ...prev, [post.id]: false }));
    }
  };

  const handleDownvote = async (post) => {
    // Prevent double-clicks during operation
    if (votingInProgress[post.id]) return;

    const current = getVote(post.id);
    const score = (post.upvotes || 0) - (post.downvotes || 0);

    let deltaUp = 0;
    let deltaDown = 0;
    let nextVote = null;

    if (current === "down") {
      // CASE 1: User is removing their existing downvote.
      // This is always allowed.
      deltaDown = -1;
      nextVote = null;
    } else if (current === "up") {
      // CASE 2: User has upvoted, and now clicks downvote.
      if (score === 1) {
        // If the score is exactly 1, just undo the upvote to make the score 0.
        deltaUp = -1;
        deltaDown = 0; // We do NOT add a downvote here.
        nextVote = null; // The user's vote becomes neutral.
      } else {
        // If the score is greater than 1, perform a full switch.
        deltaUp = -1;
        deltaDown = 1;
        nextVote = "down";
      }
    } else {
      // current is null
      // CASE 3: User is adding a new downvote to a neutral post.
      // Only allow this if the score is > 0.
      if (score > 0) {
        deltaUp = 0;
        deltaDown = 1;
        nextVote = "down";
      } else {
        // If score is 0, do nothing, just as you wanted.
        return;
      }
    }

    // Set loading state
    setVotingInProgress((prev) => ({ ...prev, [post.id]: true }));

    try {
      const { error, data } = await supabase
        .from("posts")
        .update({
          upvotes: (post.upvotes || 0) + deltaUp,
          downvotes: (post.downvotes || 0) + deltaDown,
        })
        .eq("id", post.id)
        .select()
        .single();

      if (error) {
        console.error("Failed to update vote:", error);
        alert("Failed to update vote. Please try again.");
      } else {
        // Only update UI after successful database operation
        setPosts((prev) => prev.map((p) => (p.id === post.id ? data : p)));
        setVote(post.id, nextVote);
      }
    } catch (err) {
      console.error("Error during vote:", err);
      alert("An error occurred. Please try again.");
    } finally {
      // Clear loading state
      setVotingInProgress((prev) => ({ ...prev, [post.id]: false }));
    }
  };

  console.log(Posts);

  const currentSearch =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("search") || ""
      : "";

  return (
    // Main container with a dark background to enhance the visual effect
    <div className="w-full bg-gray-900 text-white">
      {/* We use a style tag here to define the animations and stacking layout */}
      <style jsx global>{`
        body {
          background-color: #111827; // This matches bg-gray-900
        }
        .card-container {
          // Add padding to ensure scroll effects are visible at the start and end of the list
          padding-top: 15vh;
          padding-bottom: 50vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-right: 100px;
        }
        .card {
          // Initial state for the fade-in animation (invisible and slightly moved down)
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        }
        .card-loaded {
          // Final state for the fade-in animation (fully visible and in position)
          opacity: 1;
          transform: translateY(0px);
        }
      `}</style>

      <InteractiveBg />
      {/* This container holds the stacking cards */}
      <div className="card-container">
        {Posts.map((post, index) => {
          let score = (post.upvotes || 0) - (post.downvotes || 0);
          let currentUserVote = getVote(post.id);
          const isDownvoteDisabled = score <= 0 && currentUserVote !== "down";
          return (
            <div
              key={post.id}
              // We apply animation classes and then inline styles for dynamic stacking and delays
              className={`card ${
                isLoaded ? "card-loaded" : ""
              } mx-auto w-full max-w-4xl my-4 p-4 rounded-lg flex flex-col gap-3 shadow-lg`}
              style={{
                background: "linear-gradient(to right, #00bfff, #5187d9ff)",
                borderBottom: "4px solid #3288a5ff",
                position: "sticky",
                top: `${100 + index * 10}px`, // Makes cards stick to the top with an offset, creating the stack
                transform: `scale(${1 - (Posts.length - 1 - index) * 0.04})`, // Scales down cards that are further back in the stack
                zIndex: index, // Ensures the correct card is always on top
                transitionDelay: `${index * 100}ms`, // Creates a staggered fade-in effect for each card
              }}
            >
              {/* All of your original card content remains unchanged */}
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">{post.title}</h2>
                <div className="text-m rounded-full flex justify-center items-center bg-blue-400 p-1 w-20 text-center text-white">
                  {post.flair}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{post.content}</p>
              {post.image_url && (
                <img src={post.image_url} className="justify-center" alt="" />
              )}
              <div className="translate-y-10">
              <Comments postId={post.id} />
              </div>
              <div className="flex gap-3 items-center translate-y-8">
                <img
                  src="upvote.svg"
                  onClick={() => {
                    handleUpvote(post);
                  }}
                  className={`rounded-full h-5 w-5 cursor-pointer transition-opacity ${
                    votingInProgress[post.id]
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${
                    getVote(post.id) === "up" ? "ring-2 ring-orange-500" : ""
                  }`}
                  style={{
                    pointerEvents: votingInProgress[post.id] ? "none" : "auto",
                  }}
                />
                {post.upvotes - post.downvotes}
                <img
                  src="downvote.svg"
                  onClick={() => {
                    // The handler is already protected, but this is good practice
                    if (!isDownvoteDisabled) {
                      handleDownvote(post);
                    }
                  }}
                  className={`rounded-full h-5 w-5 transition-opacity ${
                    // Apply disabled styles
                    isDownvoteDisabled || votingInProgress[post.id]
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  } ${
                    currentUserVote === "down" ? "ring-2 ring-blue-500" : ""
                  }`}
                  style={{
                    // Also disable pointer events
                    pointerEvents:
                      isDownvoteDisabled || votingInProgress[post.id]
                        ? "none"
                        : "auto",
                  }}
                />
              </div>
              <div className="text-sm text-right text-gray-800">
                Posted on: {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
