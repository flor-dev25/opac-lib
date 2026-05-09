import React, { useState, useEffect } from 'react';
import { GroupBox } from '../../components/common/GroupBox';
import { BeveledBox } from '../../components/common/BeveledBox';

interface CheckInViewProps {
  onNext: (id: string) => void;
}

export const CheckInView: React.FC<CheckInViewProps> = ({ onNext }) => {
  const [studentId, setStudentId] = useState('');

  const handleKeyClick = (key: string) => {
    if (studentId.length < 9) setStudentId(prev => prev + key);
  };

  const handleClear = () => setStudentId('');

  const handleBackspace = () => setStudentId(prev => prev.slice(0, -1));

  const handleSubmit = () => {
    if (studentId.length >= 5) { // Minimum ID length for flexibility
      onNext(studentId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers
      if (/^[0-9]$/.test(e.key)) {
        handleKeyClick(e.key);
      } 
      // Backspace
      else if (e.key === 'Backspace') {
        handleBackspace();
      } 
      // Delete/Clear
      else if (e.key === 'Delete' || e.key === 'Escape') {
        handleClear();
      } 
      // Enter
      else if (e.key === 'Enter') {
        // We use the same length validation as the submit button
        if (studentId.length >= 5) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [studentId, handleSubmit]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[550px] space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-1">
        <h1 className="text-5xl font-black text-blue-900 dark:text-blue-100 tracking-tight uppercase italic drop-shadow-sm">
          Library Attendance
        </h1>
        <p className="text-blue-700 dark:text-blue-300 font-bold uppercase tracking-widest text-sm">Please enter your ID Number to continue</p>
      </div>

      <GroupBox label="Student ID Terminal" className="w-[450px] bg-classic-grey dark:bg-dark-surface shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BeveledBox variant="sunken" className="bg-white dark:bg-black p-4 text-center h-20 flex-1 flex items-center justify-center">
              <span className="text-5xl font-mono tracking-[0.2em] font-bold text-gray-900 dark:text-green-500 drop-shadow-sm">
                {studentId.padEnd(9, '_')}
              </span>
            </BeveledBox>
            <button
              onClick={handleBackspace}
              className="w-16 h-20 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken font-bold text-3xl text-gray-800 dark:text-gray-200 active:scale-95 flex items-center justify-center shrink-0"
              title="Backspace"
            >
              ⌫
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyClick(num.toString())}
                className="h-20 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken font-black text-3xl text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-20 bg-red-100 dark:bg-red-900/30 border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken font-bold text-xl text-red-700 dark:text-red-400 active:scale-95"
            >
              CLR
            </button>
            <button
              onClick={() => handleKeyClick('0')}
              className="h-20 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken font-black text-3xl text-gray-800 dark:text-gray-200 active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleSubmit}
              disabled={studentId.length < 5}
              className={`h-20 border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken font-black text-xl transition-all active:scale-95 ${
                studentId.length >= 5 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              ENT ⏎
            </button>
          </div>
        </div>
        <div className="mt-4 text-center opacity-30">
          <span className="font-bold uppercase tracking-widest text-[10px]">infoLib Client v2.0 • Secure Terminal</span>
        </div>
      </GroupBox>
    </div>
  );
};
