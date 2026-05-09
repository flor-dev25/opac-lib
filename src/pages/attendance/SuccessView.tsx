import React, { useEffect, useState } from 'react';
import { GroupBox } from '../../components/common/GroupBox';
import { CheckCircle2, Quote } from 'lucide-react';

interface SuccessViewProps {
  studentId: string;
  reason: string;
  onReset: () => void;
}

const QUOTES = [
  { text: "The only thing that you absolutely have to know, is the location of the library.", author: "Albert Einstein" },
  { text: "When in doubt, go to the library.", author: "J.K. Rowling" },
  { text: "A library is not a luxury but one of the necessities of life.", author: "Henry Ward Beecher" },
  { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
  { text: "The very existence of libraries affords the best evidence that we may yet have hope for the future of man.", author: "T.S. Eliot" },
  { text: "Bad libraries build collections, good libraries build services, great libraries build communities.", author: "R. David Lankes" },
];

export const SuccessView: React.FC<SuccessViewProps> = ({ studentId, reason, onReset }) => {
  const [countdown, setCountdown] = useState(5);
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-12 animate-in zoom-in duration-500">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="w-32 h-32 text-green-600 animate-bounce" />
        </div>
        <h1 className="text-6xl font-black text-green-700 dark:text-green-400 tracking-tighter uppercase italic">
          Check-in Successful!
        </h1>
        <p className="text-2xl text-blue-900 dark:text-blue-100 font-bold">
          Enjoy your <span className="bg-blue-100 dark:bg-blue-900 px-2 rounded">{reason}</span> session, {studentId}.
        </p>
      </div>

      <GroupBox label="Daily Inspiration" className="w-[700px] bg-white dark:bg-dark-surface shadow-2xl p-10 overflow-visible">
        <div className="relative flex flex-col items-center text-center space-y-6 pt-4">
          <Quote className="absolute -top-6 -left-6 w-14 h-14 text-gray-200 dark:text-gray-800 opacity-50" />
          <p className="text-3xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed z-10">
            "{quote.text}"
          </p>
          <div className="w-24 h-1 bg-blue-600" />
          <p className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">
            — {quote.author}
          </p>
        </div>
      </GroupBox>

      <div className="flex flex-col items-center space-y-4">
        <div className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">
          Resetting in {countdown}s...
        </div>
        <button
          onClick={onReset}
          className="px-12 py-3 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken font-black text-xl active:scale-95 transition-all"
        >
          DONE
        </button>
      </div>
    </div>
  );
};
