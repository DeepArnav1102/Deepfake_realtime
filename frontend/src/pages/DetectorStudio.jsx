import React, { useState, useEffect, useRef } from 'react';
import { UserButton } from '@clerk/clerk-react';
import {
  Camera, CameraOff, UploadCloud, Video, Image as ImageIcon,
  Activity, CheckCircle2, AlertCircle, Zap, Shield, Eye,
  ChevronRight, Cpu, Layers, BarChart3
} from 'lucide-react';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(backendUrl);

const NAV_ITEMS = [
  { id: 'live',  label: 'Live Analysis', icon: Camera,    desc: 'Real-time webcam' },
  { id: 'video', label: 'Video Upload',  icon: Video,     desc: 'MP4, WebM files'  },
  { id: 'image', label: 'Image Upload',  icon: ImageIcon, desc: 'JPG, PNG files'   },
];

const STATS = [
  { label: 'Accuracy',   value: '99.2%',  icon: BarChart3 },
  { label: 'Model',      value: 'ResNet', icon: Cpu       },
  { label: 'Detections', value: 'Live',   icon: Eye       },
];

export default function DetectorStudio() {
  const [activeTab, setActiveTab] = useState('live');

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const [isCameraActive,  setIsCameraActive]  = useState(false);
  const [isLiveAnalyzing, setIsLiveAnalyzing] = useState(false);
  const [livePrediction,  setLivePrediction]  = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [isUploading,  setIsUploading]  = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging,   setIsDragging]   = useState(false);

  useEffect(() => {
    if (activeTab === 'live' && isCameraActive) startCamera();
    else { stopCamera(); setIsLiveAnalyzing(false); }
    return () => stopCamera();
  }, [activeTab, isCameraActive]);

  useEffect(() => {
    let id;
    if (isLiveAnalyzing) id = setInterval(captureAndSendFrame, 2000);
    return () => clearInterval(id);
  }, [isLiveAnalyzing]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Camera denied:', err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureAndSendFrame = async () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const fd = new FormData();
      fd.append('chunk', blob, 'frame.jpg');
      try {
        const res = await fetch(`${backendUrl}/api/detect`, { method: 'POST', body: fd });
        if (res.ok) setLivePrediction(await res.json());
      } catch (e) { console.error(e); }
    }, 'image/jpeg', 0.8);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadResult({ status: 'uploading' });
    const fd = new FormData();
    fd.append('media', selectedFile);
    try {
      const res = await fetch(`${backendUrl}/api/upload`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const { documentId } = await res.json();
      setUploadResult({ status: 'processing' });
      socket.once(`analysis_complete_${documentId}`, (doc) => {
        setUploadResult({
          status:     'completed',
          label:      doc.result?.label      || 'UNKNOWN',
          confidence: doc.result?.confidence || 0,
        });
        setIsUploading(false);
      });
    } catch (err) {
      console.error(err);
      setUploadResult({ status: 'failed' });
      setIsUploading(false);
    }
  };

  const isFake = livePrediction?.label === 'FAKE' || uploadResult?.label === 'FAKE';

  /* ─── accent colours (no purple — using cyan / sky) ─── */
  const accent      = 'cyan';
  const accentText  = 'text-cyan-400';
  const accentBg    = 'bg-cyan-500/20';
  const accentBorder= 'border-cyan-500/30';

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}
         className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">

      <style>{`
        @keyframes scan {
          0%   { top: 0;    opacity: 1; }
          49%  { top: 100%; opacity: 1; }
          50%  { top: 100%; opacity: 0; }
          51%  { top: 0;    opacity: 0; }
          100% { top: 100%; opacity: 1; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: .6; }
          100% { transform: scale(1.7); opacity: 0;  }
        }
        @keyframes float {
          0%,100% { transform: translateY(0);   }
          50%     { transform: translateY(-6px); }
        }
        @keyframes shimmer-cyan {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .scan-anim {
          position: absolute; left: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #22d3ee, transparent);
          box-shadow: 0 0 18px 5px rgba(34,211,238,.45);
          animation: scan 2s linear infinite;
        }
        .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .shimmer-cyan {
          background: linear-gradient(90deg,#0891b2 0%,#22d3ee 40%,#0891b2 100%);
          background-size: 200% 100%;
          animation: shimmer-cyan 2.5s linear infinite;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,211,238,.2); border-radius: 10px; }
      `}</style>

      {/* ════════ HEADER ════════ */}
      <header className="shrink-0 h-16 flex items-center justify-between px-6
                         bg-black/70 backdrop-blur-2xl border-b border-white/[0.06] z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600
                            flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Shield size={17} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400
                             rounded-full border-2 border-black"/>
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight leading-none">Deepfake Studio</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-none">AI Detection Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>
            AI Engine Ready
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8 border border-white/10' } }} />
        </div>
      </header>

      {/* ════════ BODY — sidebar + main ════════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════ SIDEBAR ════ */}
        <aside className="w-64 shrink-0 flex flex-col overflow-y-auto
                          bg-[#0d0d0d] border-r border-white/[0.05]">

          {/* Nav */}
          <div className="p-4 pt-5 border-b border-white/[0.05]">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3 px-1">
              Detection Mode
            </p>
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => {
                const active = activeTab === id;
                return (
                  <button key={id}
                          onClick={() => { setActiveTab(id); setUploadResult(null); setPreviewUrl(null); setSelectedFile(null); }}
                          className={`relative flex items-center gap-3 px-3 py-3 rounded-xl
                                      transition-all duration-200 text-left
                                      ${active
                                        ? 'bg-cyan-500/10 border border-cyan-500/25 text-white'
                                        : 'border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                      }`}>
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-full"/>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                     ${active ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/[0.04] text-slate-500'}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium leading-none mb-0.5">{label}</p>
                      <p className="text-[11px] text-slate-500 leading-none">{desc}</p>
                    </div>
                    {active && <ChevronRight size={13} className="ml-auto text-cyan-400 shrink-0"/>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-white/[0.05]">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3 px-1">
              System Info
            </p>
            <div className="flex flex-col gap-1.5">
              {STATS.map(({ label, value, icon: Icon }) => (
                <div key={label}
                     className="flex items-center justify-between px-3 py-2 rounded-lg
                                bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Icon size={12}/>
                    <span className="text-[11px]">{label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-cyan-400">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last result */}
          <div className="p-4 mt-auto">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-2 px-1">
              Last Result
            </p>
            <div className={`rounded-xl p-3.5 border transition-all duration-500
                            ${!(livePrediction || uploadResult?.label)
                              ? 'border-white/[0.06] bg-white/[0.02]'
                              : isFake
                                ? 'border-red-500/30 bg-red-500/[0.07]'
                                : 'border-emerald-500/30 bg-emerald-500/[0.07]'}`}>
              {(livePrediction || uploadResult?.label) ? (
                <div className="flex items-center gap-2.5">
                  {isFake
                    ? <AlertCircle size={20} className="text-red-400 shrink-0"/>
                    : <CheckCircle2 size={20} className="text-emerald-400 shrink-0"/>}
                  <div>
                    <p className={`text-sm font-bold leading-none mb-0.5 ${isFake ? 'text-red-400' : 'text-emerald-400'}`}>
                      {livePrediction?.label || uploadResult?.label}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {((livePrediction?.confidence || uploadResult?.confidence || 0) * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-slate-600 italic">No result yet</p>
              )}
            </div>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* Page title */}
          <div className="mb-7">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
              <Layers size={11}/> Studio
              <span className="text-slate-700">/</span>
              <span className="text-cyan-400 capitalize">
                {activeTab === 'live' ? 'Live Analysis' : activeTab === 'video' ? 'Video Upload' : 'Image Upload'}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {activeTab === 'live'  && 'Live Stream Analysis'}
              {activeTab === 'video' && 'Video Deepfake Analysis'}
              {activeTab === 'image' && 'Image Deepfake Analysis'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'live'  && 'Analyze your webcam feed in real-time using AI inference every 2 seconds.'}
              {activeTab === 'video' && 'Upload a video file and it will be sent to the AI engine for detection.'}
              {activeTab === 'image' && 'Upload an image to instantly check if it is AI-generated or real.'}
            </p>
          </div>

          {/* ─── LIVE TAB ─── */}
          {activeTab === 'live' && (
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 flex flex-col">
                {/* Camera frame */}
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.07]
                                bg-black shadow-2xl shadow-black/60 aspect-video">
                  {isCameraActive
                    ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"/>
                    : <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="float-anim">
                          <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/[0.07]
                                          flex items-center justify-center">
                            <CameraOff size={30} className="text-slate-600"/>
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium mt-4">Camera is off</p>
                        <p className="text-slate-700 text-xs mt-1">Enable camera to begin</p>
                      </div>
                  }

                  {isCameraActive && isLiveAnalyzing && <div className="scan-anim"/>}

                  {/* LIVE badge */}
                  {isLiveAnalyzing && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5
                                    bg-black/70 backdrop-blur-md rounded-full border border-red-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-red-400"/>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"/>
                      </span>
                      <span className="text-xs font-semibold text-red-400">LIVE</span>
                    </div>
                  )}

                  {/* Prediction overlay */}
                  {livePrediction && isCameraActive && (
                    <div className={`absolute bottom-4 left-4 right-4 p-3 rounded-xl backdrop-blur-md border
                                     ${livePrediction.label === 'FAKE'
                                       ? 'bg-red-900/60 border-red-500/40'
                                       : 'bg-emerald-900/60 border-emerald-500/40'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {livePrediction.label === 'FAKE'
                            ? <AlertCircle size={15} className="text-red-400"/>
                            : <CheckCircle2 size={15} className="text-emerald-400"/>}
                          <span className={`font-bold text-sm ${livePrediction.label === 'FAKE' ? 'text-red-300' : 'text-emerald-300'}`}>
                            {livePrediction.label}
                          </span>
                        </div>
                        <span className="text-xs text-white/60">
                          {(livePrediction.confidence * 100).toFixed(1)}% confident
                        </span>
                      </div>
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden"/>
                </div>

                {/* Controls */}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setIsCameraActive(!isCameraActive)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                                     border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]
                                     text-slate-300 hover:text-white transition-all">
                    {isCameraActive ? <><CameraOff size={14}/> Disable Camera</> : <><Camera size={14}/> Enable Camera</>}
                  </button>
                  <button onClick={() => setIsLiveAnalyzing(!isLiveAnalyzing)}
                          disabled={!isCameraActive}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
                                      transition-all disabled:opacity-40 disabled:cursor-not-allowed
                                      ${isLiveAnalyzing
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
                                        : 'shimmer-cyan text-white shadow-lg shadow-cyan-500/20'}`}>
                    <Zap size={14}/>
                    {isLiveAnalyzing ? 'Stop Analysis' : 'Start Analysis'}
                  </button>
                </div>
              </div>

              {/* Info panel */}
              <div className="xl:w-64 flex flex-col gap-4">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-4">How It Works</p>
                  {[
                    { step: '01', text: 'Enable your webcam' },
                    { step: '02', text: 'Click Start Analysis' },
                    { step: '03', text: 'Frames captured every 2s' },
                    { step: '04', text: 'AI returns REAL / FAKE verdict' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3 mb-3 last:mb-0">
                      <span className="w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-400 text-[10px]
                                       font-bold flex items-center justify-center shrink-0">{step}</span>
                      <p className="text-[12px] text-slate-400 leading-tight pt-1">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── UPLOAD TABS ─── */}
          {(activeTab === 'video' || activeTab === 'image') && (
            <div className="flex flex-col xl:flex-row gap-6">

              {/* Drop zone */}
              <div className="flex-1">
                {!previewUrl ? (
                  <label onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                         onDragLeave={() => setIsDragging(false)}
                         onDrop={handleDrop}
                         className={`relative flex flex-col items-center justify-center w-full min-h-[360px]
                                     rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300
                                     ${isDragging
                                       ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                                       : 'border-white/[0.08] hover:border-cyan-500/40 hover:bg-cyan-500/[0.03]'}`}>
                    <div className="float-anim flex flex-col items-center">
                      <div className={`w-18 h-18 w-20 h-20 rounded-2xl flex items-center justify-center mb-5
                                       ${isDragging ? 'bg-cyan-500/20' : 'bg-white/[0.04]'}`}>
                        <UploadCloud size={32} className={isDragging ? 'text-cyan-400' : 'text-slate-500'}/>
                      </div>
                      <p className="text-[15px] font-semibold text-slate-200 mb-2">
                        {isDragging ? 'Drop it here!' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        {activeTab === 'video' ? 'Supports MP4, WebM — up to 50MB' : 'Supports JPG, PNG, WEBP — up to 10MB'}
                      </p>
                    </div>
                    <input type="file"
                           accept={activeTab === 'video' ? 'video/*' : 'image/*'}
                           className="hidden"
                           onChange={(e) => handleFileSelect(e.target.files[0])}/>
                  </label>
                ) : (
                  <div className="relative w-full min-h-[360px] rounded-2xl overflow-hidden border border-white/[0.07] bg-black">
                    {activeTab === 'video'
                      ? <video src={previewUrl} controls className="w-full h-full object-contain"/>
                      : <img src={previewUrl} alt="Preview" className="w-full h-full object-contain"/>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"/>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10">
                        {activeTab === 'video'
                          ? <Video     size={11} className="text-cyan-400"/>
                          : <ImageIcon size={11} className="text-cyan-400"/>}
                        <span className="text-xs text-white/80 truncate max-w-[140px]">{selectedFile?.name}</span>
                      </div>
                      <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); setUploadResult(null); setIsUploading(false); }}
                              className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20
                                         backdrop-blur-md rounded-full border border-white/10 transition-colors">
                        Change file
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis panel */}
              <div className="xl:w-72 flex flex-col gap-4">
                <div className="rounded-2xl border border-white/[0.07] bg-[#0d0d0d] p-5 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
                      <Activity size={15} className="text-cyan-400"/>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold leading-none">Analysis Panel</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">AI-powered detection</p>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                      <p className="text-[10px] text-slate-500 mb-1">Selected file</p>
                      <p className="text-[12px] font-medium text-slate-200 truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}

                  <button onClick={handleUploadAndAnalyze}
                          disabled={!selectedFile || isUploading}
                          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
                                      flex items-center justify-center gap-2
                                      disabled:opacity-40 disabled:cursor-not-allowed
                                      ${!selectedFile || isUploading
                                        ? 'bg-white/[0.05] border border-white/[0.08] text-slate-400'
                                        : 'shimmer-cyan text-white shadow-lg shadow-cyan-500/20'}`}>
                    <Zap size={14}/>
                    {uploadResult?.status === 'uploading'  ? 'Uploading…'     :
                     uploadResult?.status === 'processing' ? 'Processing…'    :
                     'Run Deepfake Scan'}
                  </button>

                  {uploadResult && (
                    <div className="mt-5">
                      <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3">
                        Status & Result
                      </p>

                      {(uploadResult.status === 'uploading' || uploadResult.status === 'processing') && (
                        <div className="flex items-center gap-3 p-3.5 rounded-xl
                                        border border-cyan-500/20 bg-cyan-500/[0.07]">
                          <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin shrink-0"/>
                          <div>
                            <p className="text-sm font-medium text-cyan-300">
                              {uploadResult.status === 'uploading' ? 'Uploading to cloud…' : 'AI is running inference…'}
                            </p>
                            <p className="text-[11px] text-cyan-400/50 mt-0.5">Please wait</p>
                          </div>
                        </div>
                      )}

                      {uploadResult.status === 'completed' && (
                        <div className={`rounded-xl p-5 border text-center
                                         ${uploadResult.label === 'REAL'
                                           ? 'border-emerald-500/30 bg-emerald-500/[0.07]'
                                           : 'border-red-500/30 bg-red-500/[0.07]'}`}>
                          {uploadResult.label === 'REAL'
                            ? <CheckCircle2 size={34} className="text-emerald-400 mx-auto mb-2"/>
                            : <AlertCircle  size={34} className="text-red-400 mx-auto mb-2"/>}
                          <p className={`text-2xl font-black tracking-tight mb-1
                                         ${uploadResult.label === 'REAL' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {uploadResult.label}
                          </p>
                          <div className="w-full bg-white/[0.07] rounded-full h-1.5 mt-3 mb-1 overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000
                                             ${uploadResult.label === 'REAL' ? 'bg-emerald-400' : 'bg-red-400'}`}
                                 style={{ width: `${(uploadResult.confidence * 100).toFixed(0)}%` }}/>
                          </div>
                          <p className="text-[12px] text-slate-400">
                            <span className="font-semibold text-white">{(uploadResult.confidence * 100).toFixed(1)}%</span> confidence
                          </p>
                        </div>
                      )}

                      {uploadResult.status === 'failed' && (
                        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.07] text-center">
                          <AlertCircle size={20} className="text-red-400 mx-auto mb-2"/>
                          <p className="text-sm text-red-400 font-medium">Analysis failed</p>
                          <p className="text-[11px] text-red-400/50 mt-0.5">Check connection and try again</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold mb-3">Tips</p>
                  <ul className="space-y-2">
                    {(activeTab === 'video'
                      ? ['Clear face visibility improves accuracy', 'Shorter clips process faster', 'MP4 recommended']
                      : ['High resolution gives better results', 'Face should be clearly visible', 'Avoid heavy filters']
                    ).map(tip => (
                      <li key={tip} className="flex items-start gap-2 text-[12px] text-slate-500">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full mt-1.5 shrink-0"/>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
