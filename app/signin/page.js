
"use client"
import React from "react";

const Signin = () => {
  // Get project ID from env
  const projectId = process.env.NEXT_PUBLIC_IITSSO_ID;
  const ssoUrl = `https://sso.tech-iitb.org/project/${projectId}/ssocall/`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to Instiforum</h1>
        <p className="mb-6 text-gray-700">Use your ITC SSO account to log in and access all features.</p>
        <a href={ssoUrl}>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
            Login with ITC SSO
          </button>
        </a>
      </div>
    </div>
  );
};

export default Signin;
