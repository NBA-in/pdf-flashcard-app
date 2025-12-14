import React, { useState } from 'react';

const FlashcardViewer = ({ data, onReset, theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- THEME COLORS ---
  const isDark = theme === 'dark';
  
  // Card Styles
  const cardBg = isDark ? 'bg-[#1E1F20]' : 'bg-white';
  const cardBorder = isDark ? 'border border-[#444746]' : 'border-2 border-[#E0E2E5]';
  const cardShadow = isDark ? '' : 'shadow-xl shadow-blue-100';
  
  // Text Styles
  const textColor = isDark ? 'text-[#E3E3E3]' : 'text-[#1F1F1F]';
  const labelColor = isDark ? 'text-[#A8C7FA]' : 'text-[#0B57D0]';
  const subTextColor = isDark ? 'text-[#C4C7C5]' : 'text-[#444746]';

  // Button Styles
  const btnBg = isDark ? 'bg-[#A8C7FA] text-[#004A77]' : 'bg-[#0B57D0] text-white';
  const btnHover = isDark ? 'hover:bg-[#D3E3FD]' : 'hover:bg-[#0842A0]';
  const navBtnHover = isDark ? 'hover:bg-[#28292A]' : 'hover:bg-[#F0F4F9]';

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % data.length), 300);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + data.length) % data.length), 300);
  };

  const currentCard = data[currentIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      
      {/* 1. FORCE CSS 3D STYLES (To fix the mirroring bug) */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Top Header */}
      <div className="flex justify-between w-full mb-6 px-4">
        <span className={`font-mono text-sm ${subTextColor}`}>
          Card {currentIndex + 1} of {data.length}
        </span>
        <button onClick={onReset} className={`text-sm font-medium hover:underline ${labelColor}`}>
          Upload New PDF
        </button>
      </div>

      {/* --- 3D CARD CONTAINER --- */}
      <div 
        className="relative w-full aspect-[16/9] cursor-pointer group perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          
          {/* FRONT FACE (Question) */}
          <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 text-center rounded-3xl ${cardBg} ${cardBorder} ${cardShadow}`}>
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${labelColor}`}>
              Question
            </h3>
            <p className={`text-3xl font-medium leading-relaxed ${textColor}`}>
              {currentCard.question}
            </p>
            <p className={`mt-12 text-xs opacity-50 ${subTextColor} animate-pulse`}>
              (Click to flip)
            </p>
          </div>

          {/* BACK FACE (Answer) */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-12 text-center rounded-3xl ${cardBg} ${cardBorder} ${cardShadow}`}>
            <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 ${labelColor}`}>
              Answer
            </h3>
            <p className={`text-2xl leading-relaxed ${textColor}`}>
              {currentCard.answer}
            </p>
          </div>

        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className="flex items-center space-x-8 mt-10">
        <button onClick={handlePrev} className={`p-4 rounded-full transition-colors ${textColor} ${navBtnHover}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className={`px-8 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 ${btnBg} ${btnHover}`}
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>

        <button onClick={handleNext} className={`p-4 rounded-full transition-colors ${textColor} ${navBtnHover}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </div>
  );
};

export default FlashcardViewer;