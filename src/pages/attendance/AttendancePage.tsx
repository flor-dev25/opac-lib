import React, { useState, useEffect } from 'react';
import { CheckInView } from './CheckInView';
import { ReasonView } from './ReasonView';
import { SuccessView } from './SuccessView';
import { invoke } from '@tauri-apps/api/core';

type Step = 'input' | 'reason' | 'success';

export const AttendancePage: React.FC = () => {
  const [step, setStep] = useState<Step>('input');
  const [studentId, setStudentId] = useState('');
  const [reason, setReason] = useState('');
  const [bgImage, setBgImage] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Load custom background if set
    const loadBg = async () => {
      try {
        const logoPath: string | null = await invoke('get_logo_path');
        if (logoPath) setBgImage(logoPath);
      } catch (e) {
        console.error('Failed to load background:', e);
      }
    };
    loadBg();
  }, []);

  const handleIdSubmit = (id: string) => {
    setStudentId(id);
    setErrorMsg(null);
    setStep('reason');
  };

  const handleReasonSubmit = async (selectedReason: string) => {
    setReason(selectedReason);
    setErrorMsg(null);
    
    console.log(`Recording attendance: ${studentId} - ${selectedReason}`);
    try {
        await invoke('record_attendance', { idno: studentId, reason: selectedReason });
        setStep('success');
    } catch (e) {
        console.error('Failed to record attendance:', e);
        setErrorMsg(e as string);
        setStep('input');
    }
  };

  const handleReset = () => {
    setStudentId('');
    setReason('');
    setErrorMsg(null);
    setStep('input');
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center bg-blue-100 dark:bg-blue-950 transition-colors duration-1000"
      style={bgImage ? { 
        backgroundImage: `linear-gradient(rgba(166, 202, 240, 0.8), rgba(166, 202, 240, 0.8)), url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      {/* Decorative Corner Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 border-t-8 border-l-8 border-blue-900/10 dark:border-blue-100/10 -translate-x-12 -translate-y-12" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-b-8 border-r-8 border-blue-900/10 dark:border-blue-100/10 translate-x-12 translate-y-12" />

      <div className="z-10 w-full max-w-4xl px-4">
        {errorMsg && step === 'input' && (
          <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-bold shadow-lg text-center animate-in slide-in-from-top">
            {errorMsg}
          </div>
        )}
        {step === 'input' && <CheckInView onNext={handleIdSubmit} />}
        {step === 'reason' && (
          <ReasonView 
            studentId={studentId} 
            onComplete={handleReasonSubmit} 
            onBack={() => setStep('input')} 
          />
        )}
        {step === 'success' && (
          <SuccessView 
            studentId={studentId} 
            reason={reason} 
            onReset={handleReset} 
          />
        )}
      </div>

      {/* Institutional Branding Bar */}
      <div className="absolute bottom-0 w-full py-4 bg-blue-900 dark:bg-black text-white dark:text-blue-200 text-center flex items-center justify-center space-x-8 shadow-2xl">
        <span className="font-black tracking-[0.3em] text-sm uppercase">Secure Terminal Node</span>
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="font-bold text-sm uppercase italic">GJC Library Management System v2.0</span>
        <div className="w-1 h-1 bg-white rounded-full" />
        <span className="font-mono text-sm">{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
