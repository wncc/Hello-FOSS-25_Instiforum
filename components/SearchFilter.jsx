"use client";
import React, { useState, useEffect } from "react";

const SearchFilter = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState({
    search: "",
    flair: "",
    dateFrom: "",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);

  const flairs = ["General", "Academic"
    , "Events", "Jobs", "Housing", "Food", "Sports"];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setFilters({
        search: urlParams.get("search") || "",
        flair: urlParams.get("flair") || "",
        dateFrom: urlParams.get("dateFrom") || "",
        sortBy: urlParams.get("sortBy") || "newest"
      });
    }
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: "", flair: "", dateFrom: "", sortBy: "newest" };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 bg-white rounded-lg shadow-sm border p-4">
      <div className="flex gap-3 items-center mb-4">
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          placeholder="Search posts by title or content..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Filters {showFilters ? "▲" : "▼"}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flair</label>
            <select
              value={filters.flair}
              onChange={(e) => handleFilterChange("flair", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">All Flairs</option>
              {flairs.map(flair => (
                <option key={flair} value={flair}>{flair}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;