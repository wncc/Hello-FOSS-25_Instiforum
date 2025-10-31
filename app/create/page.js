"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseclient';
import { useRouter } from 'next/navigation';

const Create = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    flair: ''
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Extract query parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionKey = urlParams.get("accessid");

    // Case 1: Use localStorage if user is already saved and no new sessionKey
    const savedUser = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const sessionKeyStored = localStorage.getItem("sessionKey");
    
    if (savedUser && (isLoggedIn === "true" || sessionKeyStored) && !sessionKey) {
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
            image: null,
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
            }
          }
          
          // Clean URL by removing accessid parameter
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        })
        .catch((err) => console.error("Fetch error:", err));
    } else {
      // Case 3: No sessionKey and no saved user - redirect to signin
      console.log("No authentication found, redirecting to signin");
      router.push('/signin');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.flair) newErrors.flair = 'Please select a flair';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('posts').insert([{
        title: formData.title,
        content: formData.content,
        flair: formData.flair,
        user_id: user?.id,
        community_id: 0,
        image_url: null,
        upvotes: 0,
        downvotes: 0
      }]);

      if (error) throw error;
      router.push('/home');
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: 'Failed to create post. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4'>
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Create New Post</h1>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder='Enter post title'
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder='Write your post content here...'
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-vertical ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flair</label>
            <select
              name="flair"
              value={formData.flair}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.flair ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a flair</option>
              <option value="General">General</option>
              <option value="Academic">Academic</option>
              <option value="Events">Events</option>
              <option value="Jobs">Jobs</option>
              <option value="Housing">Housing</option>
              <option value="Food">Food</option>
              <option value="Sports">Sports</option>
            </select>
            {errors.flair && <p className="text-red-500 text-sm mt-1">{errors.flair}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create
