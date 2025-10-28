"use client";
import React, { use } from "react";
import { supabase } from "../lib/supabaseclient";
import { useEffect, useState } from "react";
import Comments from "../../components/comments";
import { IconHome } from "@tabler/icons-react";
export default function Home() {
  const [user, setUser] = useState(null);
  const [Posts, setPosts] = useState([]); //state to hold posts from database
  const [votesByPost, setVotesByPost] = useState({}); // { [postId]: 'up' | 'down' }
  const [votingInProgress, setVotingInProgress] = useState({}); // { [postId]: boolean }

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
    const currentSessionKey = localStorage.getItem("sessionKey") || null;
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
      const currentSessionKey = localStorage.getItem("sessionKey") || null;
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
          upvotes: (post.upvotes >= 0 ? (post.upvotes || 0) + deltaUp : 0),
          downvotes: (post.downvotes >= 0 ? (post.downvotes || 0) + deltaDown : 0),
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
    } else { // current is null
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
        <div className="min-h-screen w-full flex flex-col justify-center items-center">
      {Posts.map((post) => {
        let score = (post.upvotes || 0) - (post.downvotes || 0);
        let currentUserVote = getVote(post.id);
        const isDownvoteDisabled = score <= 0 && currentUserVote !== 'down';
        return (
          <div
            key={post.id}
            className=" mx-auto  w-2/3  my-4 p-4 border rounded-lg flex flex-col gap-3  shadow-sm bg-white"
          >
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold ">{post.title}</h2>
              <div className="text-m rounded-full flex justify-center items-center bg-blue-400 p-1 w-20 text-center text-white">
                {" "}
                {post.flair}
              </div>
            </div>

            <p className="text-gray-700 mb-4">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} className="justify-center" alt="" />
            )}
            <div className="flex gap-3 items-center">
              <img
                src="upvote.svg"
                onClick={() => {
                  handleUpvote(post);
                }}
                className={`rounded-full h-5 w-5 cursor-pointer transition-opacity ${
                  votingInProgress[post.id]
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                } ${getVote(post.id) === "up" ? "ring-2 ring-orange-500" : ""}`}
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
            } ${currentUserVote === "down" ? "ring-2 ring-blue-500" : ""}`}
            style={{
              // Also disable pointer events
              pointerEvents: isDownvoteDisabled || votingInProgress[post.id] ? "none" : "auto",
            }}
          />
            </div>
            <Comments postId={post.id} />
            <div className="text-sm text-gray-500">
              Posted on: {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
