import React, { useState, useEffect } from 'react';

const LOADING_MESSAGES = [
  "Uploading PDF...",
  "Reading Document...",
  "Analyzing Content...",
  "Generating Flashcards...",
  "Polishing Review Deck..."
];

const MaterialSpinner = ({ theme }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  // --- THEME COLORS ---
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#131314]' : 'bg-white';
  const textColor = isDark ? 'text-[#E3E3E3]' : 'text-[#1F1F1F]';
  const spinnerColor = isDark ? '#A8C7FA' : '#0B57D0'; 
  const subTextColor = isDark ? 'text-[#C4C7C5]' : 'text-[#444746]';

  // --- MESSAGE CYCLING LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${bgColor} transition-colors duration-300 font-sans`}>
      
      {/* 1. SPINNER SVG */}
      <div className="relative w-16 h-16 mb-10">
        <svg className="animate-spin" viewBox="0 0 50 50">
          <circle
            className="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            stroke={spinnerColor}
            strokeLinecap="round"
          ></circle>
        </svg>
      </div>

      {/* 2. FLOATING TEXT TRANSITION */}
      <div className="h-12 flex items-center justify-center overflow-hidden relative w-full">
        {/* We use the 'key' prop to force React to re-trigger the animation when text changes */}
        <h2 
          key={msgIndex}
          className={`text-2xl font-medium tracking-wide ${textColor} animate-float-up absolute`}
        >
          {LOADING_MESSAGES[msgIndex]}
        </h2>
      </div>

      <p className={`mt-4 text-sm ${subTextColor} opacity-80`}>
        Please wait a moment
      </p>

      {/* 3. STYLES & KEYFRAMES */}
      <style>{`
        /* Spinner Animation */
        .animate-spin { animation: rotate 2s linear infinite; }
        .path {
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          animation: dash 1.5s ease-in-out infinite;
        }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        @keyframes dash {
          0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
          100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
        }

        /* Floating Text Animation */
        .animate-float-up {
          animation: floatUp 2s ease-in-out forwards;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default MaterialSpinner;