"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormCard from "../../components/FormCard";

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectId, setProjectId] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("user");
    if (userData) {
      router.push("/home");
      return;
    }

    // Get project ID from env
    const id = process.env.NEXT_PUBLIC_IITSSO_ID;
    if (!id) {
      setError("SSO configuration not found. Please contact administrator.");
    } else {
      setProjectId(id);
    }
  }, [router]);

  const handleSSOLogin = () => {
    if (!projectId) {
      setError("SSO not configured properly");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const ssoUrl = `https://sso.tech-iitb.org/project/${projectId}/ssocall/`;
      window.location.href = ssoUrl;
    } catch (err) {
      setError("Failed to redirect to SSO. Please try again.");
      setLoading(false);
    }
  };

  return (
    <FormCard
      title="Welcome to InstiForum"
      subtitle="Connect with your institute community. Share ideas, ask questions, and stay updated with campus discussions."
      loading={loading}
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🔐</span>
            </div>
          </div>
          <p className="text-blue-800 text-sm text-center">
            Secure login using your ITC SSO credentials
          </p>
        </div>

        <button
          onClick={handleSSOLogin}
          disabled={loading || !projectId}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 transform ${
            loading || !projectId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95"
          } shadow-lg hover:shadow-xl`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Redirecting...
            </div>
          ) : (
            "Login with ITC SSO"
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </FormCard>
  );
};

export default SignIn;
