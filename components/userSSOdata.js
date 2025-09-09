"use client"
import React, { use } from 'react'
import { useEffect,useState } from 'react';

const userSSOdata = () => {
  const [userdata, setUserdata] = useState(null);

  useEffect(() => {
    // Get any previously stored user + sessionKey from localStorage
    const Current_User = localStorage.getItem("user");
    const sessionKey = localStorage.getItem("sessionKey");

    console.log(sessionKey);
    console.log(Current_User);

    // Function to fetch user data from IITB SSO using sessionKey
    async function fetchUserData() {
      const response = await fetch('https://sso.tech-iitb.org/project/getuserdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: sessionKey })  // send sessionKey to validate user
      });

      const data = await response.json();
      console.log(data);

      // Save the fetched user data into state
      setUserdata(data);
    }

    // Always try to fetch fresh user data on mount
    fetchUserData();
  }, []);

  // Return the user data object so it can be used elsewhere
  return userdata;
}

export default userSSOdata
