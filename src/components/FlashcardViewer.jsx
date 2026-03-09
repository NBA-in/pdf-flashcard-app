import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import MaterialSpinner from './MaterialSpinner';

const FlashcardViewer = ({ data, onReset, theme, defaultTitle = "Your PDF Deck", isGeneratingMore = false, currentDeckId, isLoadingInitial = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deckTitle, setDeckTitle] = useState(defaultTitle);
  const [initialTitle, setInitialTitle] = useState(defaultTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showUpdateMsg, setShowUpdateMsg] = useState(false);

  // Create an extended deck that includes the first and last cards
  const extendedData = [
    { isTitleCard: true },
    ...data
  ];

  if (isGeneratingMore) {
    extendedData.push({ 
      isLoadingCard: true, 
      question: "Loading more cards...", 
      answer: "Still interpreting the document..." 
    });
  }

  extendedData.push({ isEndCard: true, question: "End of Deck", answer: "You've finished all the flashcards in this deck!" });

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
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % extendedData.length), 300);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + extendedData.length) % extendedData.length), 300);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent page scrolling
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, extendedData.length]); // Re-bind when index changes to avoid stale closures

  const currentCard = extendedData[currentIndex];

  // Helper function to render text with custom formatting
  const renderText = (text, isDark) => {
    if (!text) return null;

    // Split the text by `**text**`, `*text*`, `\`text\``, or `"text"`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`[^`]*`|"[^"]*")/g);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className={`font-bold ${isDark ? 'text-[#8AB4F8]' : 'text-[#1A73E8]'}`}>
            {part.slice(2, -2)}
          </strong>
        );
      } 
      
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <strong key={index} className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            {part.slice(1, -1)}
          </strong>
        );
      }

      const isBacktick = part.startsWith('`') && part.endsWith('`');
      const isQuote = part.startsWith('"') && part.endsWith('"');
      
      if (isBacktick || isQuote) {
        const content = part.slice(1, -1);
        
        const hasNestedQuote = isBacktick && content.length >= 2 && content.startsWith('"') && content.endsWith('"');
        const hasNestedBacktick = isQuote && content.length >= 2 && content.startsWith('`') && content.endsWith('`');
        
        const shouldUnderline = isBacktick || hasNestedBacktick;
        const shouldBeGreen = isQuote || hasNestedQuote;
        
        let displayContent = part;
        if (isBacktick) {
            displayContent = content; // Strips outer backticks
        }
        if (hasNestedBacktick) {
            displayContent = `"${content.slice(1, -1)}"`; // Strips inner backticks, keeps outer quotes
        }

        let classNames = "font-bold ";
        if (shouldUnderline) classNames += (isDark ? 'underline decoration-white decoration-2 underline-offset-4 ' : 'underline decoration-black decoration-2 underline-offset-4 ');
        
        if (shouldBeGreen) {
           classNames += (isDark ? 'text-green-400' : 'text-green-600');
        } else if (shouldUnderline) {
           classNames += (isDark ? 'text-white' : 'text-black');
        }

        return (
          <span key={index} className={classNames.trim()}>
            {displayContent}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

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
          Card {currentIndex + 1} of {extendedData.length}
        </span>
      </div>

      {/* --- 3D CARD CONTAINER --- */}
      <div
        className="relative w-full h-[60vh] min-h-[400px] cursor-pointer group perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
        >

          {/* FRONT FACE (Question) */}
          <div className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl overflow-y-auto ${cardBg} ${cardBorder} ${cardShadow}`}>
            {isLoadingInitial ? (
               <div className="flex flex-col flex-1 w-full relative">
                 <MaterialSpinner theme={theme} />
               </div>
            ) : currentCard.isTitleCard ? (
              <div className="flex flex-col items-center w-full">
                <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 shrink-0 ${labelColor}`}>
                  Deck Title
                </h3>
                <div className="relative w-full max-w-lg flex flex-col items-center justify-center">
                  <div className="relative w-full flex items-center justify-center">
                    <input
                      type="text"
                      value={deckTitle}
                      onFocus={() => {
                        setIsEditingTitle(true);
                        setInitialTitle(deckTitle);
                        setShowUpdateMsg(false);
                      }}
                      onBlur={() => {
                        setTimeout(() => setIsEditingTitle(false), 200);
                      }}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      className={`text-2xl md:text-3xl font-bold text-center bg-transparent border-b-2 border-dashed focus:outline-none focus:border-solid pb-2 w-full px-12 ${textColor} ${isDark ? 'border-[#A8C7FA]' : 'border-[#0B57D0]'}`}
                      placeholder="Enter deck title..."
                      onClick={(e) => e.stopPropagation()} // Prevent card flip when clicking the input
                    />
                    {isEditingTitle && deckTitle.trim() !== initialTitle.trim() && (
                      <button
                        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click processing
                        onClick={async (e) => {
                          e.stopPropagation();
                          setInitialTitle(deckTitle);
                          setIsEditingTitle(false);
                          
                          if (currentDeckId && auth.currentUser) {
                            try {
                              const deckRef = doc(db, `users/${auth.currentUser.uid}/decks`, currentDeckId);
                              await updateDoc(deckRef, { fileName: deckTitle });
                            } catch (err) {
                              console.error("Failed to update title:", err);
                            }
                          }

                          setShowUpdateMsg(true);
                          if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                          }
                          setTimeout(() => setShowUpdateMsg(false), 3000);
                        }}
                        className={`absolute right-0 bottom-1 p-1.5 rounded-full transition-colors ${isDark ? 'text-green-400 hover:bg-[#28292A]' : 'text-green-600 hover:bg-green-50'}`}
                        title="Save Title"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="h-6 mt-2">
                    {showUpdateMsg && (
                      <span className="text-sm font-medium text-green-500">
                        Name updated
                      </span>
                    )}
                  </div>
                </div>
                <p className={`mt-3 text-xs opacity-50 shrink-0 ${subTextColor} animate-pulse`}>
                  (Click to flip or edit title)
                </p>
              </div>
            ) : currentCard.isLoadingCard ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <span className="text-5xl mb-6 animate-pulse">⏳</span>
                <p className={`text-2xl font-bold leading-relaxed ${textColor}`}>
                  crafting more cards.
                </p>
                <p className={`mt-4 text-sm opacity-75 ${subTextColor}`}>
                  Reading the rest of your document. New cards will appear shortly.
                </p>
              </div>
            ) : currentCard.isEndCard ? (
              <div className="flex flex-col items-center w-full">
                <span className="text-6xl mb-6">🎉</span>
                <p className={`text-3xl font-bold leading-relaxed my-auto ${textColor}`}>
                  End of Deck
                </p>
              </div>
            ) : (
              <>
                <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 shrink-0 ${labelColor}`}>
                  Question
                </h3>
                <p className={`text-2xl md:text-3xl font-medium leading-relaxed my-auto ${textColor}`}>
                  {renderText(currentCard.question, isDark)}
                </p>
                <p className={`mt-8 text-xs opacity-50 shrink-0 ${subTextColor} animate-pulse`}>
                  (Click to flip)
                </p>
              </>
            )}
          </div>

          {/* BACK FACE (Answer) */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-start p-8 md:p-12 text-center rounded-3xl overflow-y-auto ${cardBg} ${cardBorder} ${cardShadow}`}>
            {isLoadingInitial ? (
                <div className="flex flex-col flex-1 w-full relative">
                   <MaterialSpinner theme={theme} />
                </div>
            ) : currentCard.isTitleCard ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className={`text-xl font-medium leading-relaxed ${textColor}`}>
                  Press the Arrow Keys or Click "Show Question" to start studying!
                </p>
              </div>
            ) : currentCard.isLoadingCard ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className={`text-xl font-medium leading-relaxed ${textColor}`}>
                  Once generation is complete, this card will be replaced with your new study material. Hang tight!
                </p>
              </div>
            ) : currentCard.isEndCard ? (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <p className={`text-xl font-medium leading-relaxed ${textColor}`}>
                  You've successfully gone through all the flashcards in this deck. Great job!
                </p>
              </div>
            ) : (
              <>
                <h3 className={`text-sm font-bold tracking-widest uppercase mb-6 shrink-0 ${labelColor}`}>
                  Answer
                </h3>
                <div className={`text-lg md:text-xl leading-relaxed my-auto whitespace-pre-wrap text-left w-full ${textColor}`}>
                  {renderText(currentCard.answer, isDark)}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* NAVIGATION CONTROLS */}
      <div className={`flex items-center space-x-8 mt-10 transition-opacity duration-300 ${isLoadingInitial ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
        <button onClick={handlePrev} disabled={isLoadingInitial} className={`p-4 rounded-full transition-colors ${textColor} ${navBtnHover}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          disabled={isLoadingInitial}
          className={`px-8 py-3 rounded-full font-bold transition-all shadow-md ${!isLoadingInitial && 'active:scale-95'} ${btnBg} ${btnHover}`}
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>

        <button onClick={handleNext} disabled={isLoadingInitial} className={`p-4 rounded-full transition-colors ${textColor} ${navBtnHover}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </div>
  );
};

export default FlashcardViewer;