import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "READING PDF BYTES",
  "SUMMONING GEMINI AI",
  "TRANSMUTING CONCEPTS",
  "POLISHING FLASHCARDS"
];

const AlchemyLoader = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [dots, setDots] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [phase, setPhase] = useState("typing");

  useEffect(() => {
    let timeout;
    const currentMessage = MESSAGES[msgIndex];

    if (phase === "typing") {
      if (displayedText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 50);
      } else {
        setPhase("waiting");
      }
    } else if (phase === "waiting") {
      if (dots.length < 3) {
        timeout = setTimeout(() => {
          setDots((prev) => prev + ".");
        }, 500);
      } else {
        timeout = setTimeout(() => {
          setDots("");
          setDisplayedText("");
          setPhase("typing");
          setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 1000);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayedText, dots, phase, msgIndex]);

  return (
    // Added 'min-h-screen' and 'w-full' to ensure it fills the viewport perfectly
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#131314] text-[#E3E3E3] relative overflow-hidden">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
        .font-retro { font-family: 'VT323', monospace; }
        
        @keyframes floatRight {
          0% { transform: translateX(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(60px); opacity: 0; }
        }
        
        .particle-pdf { animation: floatRight 1.5s infinite linear; }
        .particle-bin { animation: floatRight 1s infinite linear; }
      `}</style>

      {/* --- ICONS ROW --- */}
      {/* Reduced bottom margin (mb-12) to keep icons and text visually connected */}
      <div className="flex items-center justify-center space-x-4 mb-12">
        <div className="text-6xl z-10">📄</div>
        
        {/* Stream: PDF -> Gear */}
        <div className="relative w-20 h-10 flex items-center justify-center overflow-hidden">
          <div className="absolute left-0 text-xl particle-pdf" style={{ animationDelay: '0s' }}>📄</div>
          <div className="absolute left-0 text-xl particle-pdf" style={{ animationDelay: '0.7s' }}>📄</div>
        </div>

        <div className="text-6xl animate-spin z-10" style={{ animationDuration: '3s' }}>⚙️</div>

        {/* Stream: Gear -> Folder */}
        <div className="relative w-20 h-10 flex items-center justify-center overflow-hidden font-retro text-green-400 text-xl font-bold">
          <div className="absolute left-0 particle-bin" style={{ animationDelay: '0s' }}>101</div>
          <div className="absolute left-0 particle-bin" style={{ animationDelay: '0.3s' }}>010</div>
          <div className="absolute left-0 particle-bin" style={{ animationDelay: '0.6s' }}>110</div>
        </div>

        <div className="text-6xl z-10">💾</div>
      </div>

      {/* --- STATUS TEXT ROW --- */}
      {/* 1. Used 'mx-auto' to force centering.
         2. reduced 'max-w' to keep content tight. 
         3. reduced 'gap' to 3 so the label and text are closer.
      */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-[600px] mx-auto font-retro text-3xl tracking-widest items-center">
        
        {/* Left Column (Label) */}
        <div className="text-right text-[#A8C7FA]">
          STATUS:
        </div>

        {/* Right Column (Text) */}
        <div className="text-left text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)] whitespace-nowrap">
          {displayedText}{dots}
          <span className="animate-pulse inline-block w-3 h-6 bg-green-400 ml-1 align-middle"></span>
        </div>

      </div>

    </div>
  );
};

export default AlchemyLoader;