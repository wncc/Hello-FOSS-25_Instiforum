"use client";
import React, { useState } from "react";
import { supabase } from "../lib/supabaseclient";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isSignup) {
        // ---- SIGN UP ----
        if (!email || !password || !name || !roll || !department || !degree) {
          setError("Please fill in all fields.");
          setLoading(false);
          return;
        }

        //  Create Supabase Auth user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        //  Create matching user profile in your 'users' table
        if (data.user) {
          const { id } = data.user;
          const { error: insertError } = await supabase.from("users").insert([
            {
              id, // match Auth user id
              name,
              roll,
              department,
              degree,
              role: "STUDENT",
            },
          ]);

          if (insertError) throw insertError;
        }

        setMessage(
          "Signup successful! Please verify your email before logging in."
        );
      } else {
        // ---- LOGIN ----
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const user = data.user;

        // Fetch the user's profile from 'users' table
        const { data: userProfile, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        localStorage.setItem("user", JSON.stringify(userProfile));
        localStorage.setItem("sessionKey", data.session.access_token);

        window.location.href = "/profile";
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full bg-gray-900 text-white px-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isSignup ? "Create Your Account" : "Welcome Back"}
        </h1>

        {/* Common Fields */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none"
        />

        {/* Signup-only Fields */}
        {isSignup && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Roll Number"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none"
            />
            <input
              type="text"
              placeholder="Degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full mb-4 p-3 rounded bg-gray-700 text-white focus:outline-none"
            />
          </>
        )}

        {error && <p className="text-red-400 mb-3">{error}</p>}
        {message && <p className="text-green-400 mb-3">{message}</p>}

        <Button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
        >
          {loading
            ? "Processing..."
            : isSignup
            ? "Sign Up"
            : "Log In"}
        </Button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setMessage("");
            }}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
