import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export function VoiceNoteRecorder({ onSend, storageFolder = 'voiceNotes' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const isStartingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    if (isStartingRef.current || isRecording) return;
    isStartingRef.current = true;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioURL(null);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Microphone error:', err);
      toast.error('Could not access microphone');
      setIsRecording(false);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary credentials missing in .env');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', storageFolder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200) {
          onSend(response.secure_url);
          setAudioURL(null);
          setAudioBlob(null);
          setUploading(false);
          setUploadProgress(0);
          toast.success('Voice note sent!');
        } else {
          console.error('Cloudinary Error:', response);
          setUploading(false);
          toast.error(`Upload failed: ${response.error?.message || 'Check Cloudinary settings'}`);
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        toast.error('Network error during upload');
      };

      xhr.send(formData);

    } catch (err) {
      console.error('Voice note error:', err);
      setUploading(false);
      toast.error('Failed to send voice note');
    }
  };

  const handleDiscard = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (uploading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-[var(--badge-green-bg)] rounded-full animate-in fade-in">
        <div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Uploading {Math.round(uploadProgress)}%</span>
      </div>
    );
  }

  if (audioURL) {
    return (
      <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] p-2 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2">
        <audio src={audioURL} controls className="h-8 max-w-[150px]" />
        <div className="flex gap-1">
          <button onClick={handleSend} className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:opacity-90 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <button onClick={handleDiscard} className="w-8 h-8 rounded-full bg-[var(--badge-red-bg)] text-red-500 flex items-center justify-center hover:opacity-90 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--badge-red-bg)] text-red-500 rounded-full animate-in fade-in slide-in-from-left-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs font-bold font-mono">{formatTime(recordingTime)}</span>
        </div>
      )}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          startRecording();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          e.currentTarget.releasePointerCapture(e.pointerId);
          stopRecording();
        }}
        className={`p-2.5 rounded-full transition-all active:scale-95 touch-none ${
          isRecording 
            ? 'bg-red-500 text-white shadow-lg scale-110' 
            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--badge-green-bg)]'
        }`}
        title="Hold to record voice note"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
      </button>
    </div>
  );
}
