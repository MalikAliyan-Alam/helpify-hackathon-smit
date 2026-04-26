import React, { useState, useRef } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Badge } from './ui/Badge';

export function FileUploader({ onUploadComplete, initialFile = null }) {
  const [file, setFile] = useState(initialFile);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile) => {
    // Check file type
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please upload an image (PNG, JPG) or a video (MP4, WebM).');
      return;
    }

    // Check video duration (approximate by size or metadata if possible, but 30s is tricky without loading)
    if (isVideo && selectedFile.size > 50 * 1024 * 1024) { // 50MB limit as a proxy
      alert('Video file is too large. Please keep it under 30 seconds.');
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    // Auto upload
    uploadFile(selectedFile);
  };

  const uploadFile = (fileToUpload) => {
    const storageRef = ref(storage, `uploads/${Date.now()}_${fileToUpload.name}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    setUploading(true);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploading(false);
        onUploadComplete({
          url: downloadURL,
          type: fileToUpload.type.startsWith('image/') ? 'image' : 'video',
          name: fileToUpload.name
        });
      }
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all ${
          file ? 'border-[#129780] bg-[#f0f9f8]' : 'border-gray-200 hover:border-[#129780] hover:bg-[#f8fafc]'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, video/mp4, video/webm"
          className="hidden"
        />
        
        {!file ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">Click or drag & drop to upload</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or MP4 (max 30s)</p>
          </div>
        ) : (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {preview && file.type.startsWith('image/') ? (
              <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl shadow-sm mb-4" />
            ) : (
              <div className="w-32 h-32 bg-gray-900 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
            )}
            <p className="text-xs font-bold text-[#129780] uppercase tracking-wider">{file.name}</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-[#129780] h-full transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
