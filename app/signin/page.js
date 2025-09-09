"use client"
import React from 'react'

// Function to redirect the user to IITB SSO login page
function redirectToSSO(projectId) {
  // Replace NEXT_PUBLIC_IITSSO_ID with your actual Project ID (from env variables)
  window.location.href = `https://sso.tech-iitb.org/project/${process.env.NEXT_PUBLIC_IITSSO_ID}/ssocall/`;
}

const Signin = () => {
  return (
    <div>
      {/* Button that triggers redirect to IITB SSO login */}
      <button onClick={() => redirectToSSO(process.env.IITSSO_ID)}>
        Login with SSO
      </button>
    </div>
  )
}

export default Signin
