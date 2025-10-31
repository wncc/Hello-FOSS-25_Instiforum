"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient";
import SearchFilter from "../../components/SearchFilter";
import PostCard from "../../components/PostCard";
export default function Home() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);


  const buildQuery = (filters) => {
    let query = supabase
      .from("posts")
      .select("*");

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters.flair) {
      query = query.eq("flair", filters.flair);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
    }

    switch (filters.sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "popular":
        query = query.order("upvotes", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    return query;
  };

  const fetchPosts = async (filters = {}) => {
    setLoading(true);
    try {
      const { data, error } = await buildQuery(filters);
      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleFiltersChange = (filters) => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.set(key, value);
    });
    
    const newUrl = `/home${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    window.history.pushState({}, '', newUrl);
    
    fetchPosts(filters);
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
    const sessionKeyStored = localStorage.getItem("sessionKey");
    
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

          // Rebuild the object with your own fields
          const newData = {
            id: crypto.randomUUID(),
            name: data.name,
            roll: data.roll,
            department: data.department,
            degree: data.degree,
            role: "student",
            // image: null,
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
            setUser(existingUser);
            localStorage.setItem("user", JSON.stringify(existingUser));
            localStorage.setItem("sessionKey", sessionKey);
            localStorage.setItem("isLoggedIn", "true");
            window.dispatchEvent(new Event('authStateChanged'));
          } else {
            // ELSE: Insert the new user
            const { data: inserted, error: insertError } = await supabase
              .from("users")
              .insert([newData])
              .select()
              .single();

            if (insertError) {
              console.error("Supabase Insert Error:", insertError.message);
            } else {
              setUser(inserted);
              localStorage.setItem("user", JSON.stringify(inserted));
              localStorage.setItem("sessionKey", sessionKey);
              localStorage.setItem("isLoggedIn", "true");
              window.dispatchEvent(new Event('authStateChanged'));
            }
          }
          
          // Clean URL by removing accessid parameter
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        })
        .catch((err) => console.error("Fetch error:", err));
    }
  }, []);

  const handlePostUpdate = (postId, updatedPost) => {
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#e8e8e8] py-6">
      <SearchFilter onFiltersChange={handleFiltersChange} />
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No posts found matching your criteria.</p>
        </div>
      )}

      {posts.map(post => (
        <PostCard 
          key={post.id} 
          post={post} 
          onPostUpdate={handlePostUpdate}
        />
      ))}
    </div>
  );
}
