// src/components/UploadScreenLight.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';


const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const UploadScreenLight = ({ onUpload, currentUser, totalCardsCreated = 0 }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejectionStr = JSON.stringify(rejectedFiles[0]);
      if (rejectionStr.includes('file-invalid-type') || rejectionStr.includes('application/pdf')) {
        setError("Upload PDF files only.");
      } else {
        setError("Please upload a single PDF file.");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const acceptedFile = acceptedFiles[0];
      if (acceptedFile.size > MAX_FILE_SIZE) {
        setError("File is too large! Please upload a PDF smaller than 4MB.");
        return;
      }
      setFile(acceptedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  return (
    <div className="flex flex-col items-center w-full">

      {/* Header Section */}
      <div className="w-full max-w-2xl mb-12">
        <h1 className="text-5xl font-bold text-[#1F1F1F] mb-4 tracking-tight">
          Hello, <span className="text-[#0B57D0]">{currentUser?.displayName || currentUser?.email?.split('@')[0] || "Student"}</span>
        </h1>
        <p className="text-[#444746] text-xl font-light">
          Upload a PDF to generate your daily flashcards.
        </p>
      </div>

      {/* The Upload Card */}
      <div className="w-full bg-[#F8F9FA] border-2 border-[#E0E2E5] rounded-[32px] p-6 sm:p-12 mb-12 relative overflow-hidden group hover:border-[#D3E3FD] transition-all duration-300">

        {file ? (
          // --- STAGED FILE VIEW ---
          <div className="border-2 border-solid border-[#0B57D0] bg-white rounded-[24px] h-80 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-2 px-4 truncate max-w-full">
              {file.name}
            </h3>
            <p className="text-[#0B57D0] mb-8 font-mono">
              Ready to generate!
            </p>

            <div className="flex space-x-4">
              <button
                onClick={() => setFile(null)}
                className="px-6 py-3 rounded-full font-bold text-[#444746] border border-[#E0E2E5] hover:bg-[#F0F4F9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onUpload(file)}
                className="px-8 py-3 rounded-full font-bold bg-[#0B57D0] text-white hover:bg-[#0842A0] transition-colors shadow-lg active:scale-95 flex items-center"
              >
                <span>Generate Flashcards</span>
                <span className="ml-2 text-xl">✨</span>
              </button>
            </div>
          </div>
        ) : (
          // --- DROP ZONE VIEW ---
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
            <p className="text-[#444746] text-lg mb-4">or click to browse files</p>

            {/* Constraints display */}
            <div className="flex items-center space-x-4 mt-2">
              <span className="px-3 py-1 bg-white text-[#0B57D0] text-xs font-mono font-bold rounded-md uppercase tracking-wider border border-[#E0E2E5]">
                Max 1 File
              </span>
              <span className="px-3 py-1 bg-white text-[#0B57D0] text-xs font-mono font-bold rounded-md uppercase tracking-wider border border-[#E0E2E5]">
                &lt; 4 MB Size
              </span>
            </div>

            {error && (
              <p className="mt-6 text-red-600 font-medium bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Stats Cards */}
      <div className="w-full grid grid-cols-1 gap-6">
        {/* Card 1 */}
        <div className="bg-white border border-[#E0E2E5] p-6 rounded-[24px] hover:shadow-lg transition-shadow duration-300">
          <div className="text-[#444746] text-sm font-medium uppercase tracking-wider mb-2">Flashcards Created</div>
          <div className="text-4xl font-bold text-[#1F1F1F]">{totalCardsCreated.toLocaleString()}</div>
        </div>
      </div>

    </div>
  );
};

export default UploadScreenLight;