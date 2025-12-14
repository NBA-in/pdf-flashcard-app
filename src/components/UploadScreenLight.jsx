// src/components/UploadScreenLight.jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const UploadScreenLight = ({ onUpload }) => {
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
        <h1 className="text-6xl font-bold text-[#1F1F1F] mb-4 tracking-tight">
          Hello, <span className="text-[#0B57D0]">Student</span>
        </h1>
        <p className="text-[#444746] text-2xl font-light">
          Upload a PDF to generate your daily flashcards.
        </p>
      </div>

      {/* The Upload Card */}
      <div className="w-full bg-[#F8F9FA] border-2 border-[#E0E2E5] rounded-[32px] p-12 mb-12 relative overflow-hidden group hover:border-[#D3E3FD] transition-all duration-300">
        
        {/* Dashed Drop Zone */}
        <div 
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-[24px] h-80 flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'bg-[#E8F0FE] border-[#0B57D0] scale-[0.99]' 
              : 'bg-white border-[#A8C7FA] hover:bg-[#F0F4F9]'
            }
          `}
        >
          <input {...getInputProps()} />
          
          {/* Cloud Icon */}
          <div className={`text-7xl mb-6 transition-transform duration-300 ${isDragActive ? 'scale-110 -translate-y-2' : ''}`}>
            ☁️
          </div>
          
          <h3 className="text-2xl font-bold text-[#1F1F1F] mb-2">
            {isDragActive ? "Drop it like it's hot!" : "Drag & drop PDF here"}
          </h3>
          <p className="text-[#444746] text-lg">or click to browse files</p>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-[#E0E2E5] p-6 rounded-[24px] hover:shadow-lg transition-shadow duration-300">
          <div className="text-[#444746] text-sm font-medium uppercase tracking-wider mb-2">Flashcards Created</div>
          <div className="text-4xl font-bold text-[#1F1F1F]">1,240</div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-[#E0E2E5] p-6 rounded-[24px] hover:shadow-lg transition-shadow duration-300">
          <div className="text-[#444746] text-sm font-medium uppercase tracking-wider mb-2">Study Streak</div>
          <div className="text-4xl font-bold text-[#1F1F1F] flex items-center">
            12 Days <span className="text-2xl ml-2">🔥</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UploadScreenLight;