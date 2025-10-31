"use client";
import React from "react";

const FormCard = ({ 
  title, 
  subtitle, 
  children, 
  className = "",
  loading = false 
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:shadow-3xl border border-gray-100 ${className}`}>
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 text-sm leading-relaxed">{subtitle}</p>
          )}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default FormCard;