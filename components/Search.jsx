"use client";
import React, { useState } from "react";

const Search = () => {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    if (search.trim()) {
      searchParams.set('search', search.trim());
    }
    window.location.href = `/home?${searchParams.toString()}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
  };
  return (
    <div className="flex justify-center items-center gap-3">
      <input
        type="text"
        value={search}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Search posts by title..."
        className="px-4 py-2 rounded-full w-80 bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        className="rounded-full bg-blue-400 hover:bg-blue-500 transition-colors px-4 py-2 text-white"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
};

export default Search;
