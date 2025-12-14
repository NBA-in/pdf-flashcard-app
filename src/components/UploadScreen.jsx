// src/components/UploadScreen.jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadScreen = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Header Section */}
      <div className="text-left w-full mb-10 pl-2">
        <h1 className="text-6xl font-bold text-[#E3E3E3] mb-4 tracking-tight">
          Hello, <span className="text-[#A8C7FA]">Student</span>
        </h1>
        <p className="text-[#C4C7C5] text-2xl font-light">
          Upload a PDF to generate your daily flashcards.
        </p>
      </div>

      {/* The Upload Card (Dark Version) */}
      <div className="w-full bg-[#1E1F20] border-2 border-[#444746] rounded-[32px] p-12 mb-12 relative overflow-hidden group hover:border-[#A8C7FA] transition-all duration-300">
        
        {/* Dashed Drop Zone */}
        <div 
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-[24px] h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'bg-[#28292A] border-[#A8C7FA] scale-[0.99]' 
              : 'bg-[#131314] border-[#444746] hover:bg-[#28292A]'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {/* Cloud Icon */}
          <div className={`text-7xl mb-6 transition-transform duration-300 ${isDragActive ? 'scale-110 -translate-y-2' : ''}`}>
            ☁️
          </div>
          
          <h3 className="text-2xl font-bold text-[#E3E3E3] mb-2">
            {isDragActive ? "Drop it like it's hot!" : "Drag & drop PDF here"}
          </h3>
          <p className="text-[#C4C7C5] text-lg">or click to browse files</p>
        </div>
      </div>

      {/* Bottom Stats Cards (Dark Version) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-[#1E1F20] border border-[#444746] p-6 rounded-[24px] hover:shadow-lg transition-shadow duration-300">
          <div className="text-[#C4C7C5] text-sm font-medium uppercase tracking-wider mb-2">Flashcards Created</div>
          <div className="text-4xl font-bold text-[#E3E3E3]">1,240</div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1E1F20] border border-[#444746] p-6 rounded-[24px] hover:shadow-lg transition-shadow duration-300">
          <div className="text-[#C4C7C5] text-sm font-medium uppercase tracking-wider mb-2">Study Streak</div>
          <div className="text-4xl font-bold text-[#E3E3E3] flex items-center">
            12 Days <span className="text-2xl ml-2">🔥</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UploadScreen;