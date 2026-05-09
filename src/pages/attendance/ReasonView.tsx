import React from 'react';
import { GroupBox } from '../../components/common/GroupBox';
import { 
  Book, 
  Search, 
  Monitor, 
  Users, 
  GraduationCap, 
  FileText, 
  Newspaper, 
  HelpCircle, 
  Pencil 
} from 'lucide-react';

interface ReasonViewProps {
  studentId: string;
  onComplete: (reason: string) => void;
  onBack: () => void;
}

const REASONS = [
  { id: 'study', label: 'Study', icon: GraduationCap, color: 'text-blue-600' },
  { id: 'research', label: 'Research', icon: Search, color: 'text-purple-600' },
  { id: 'internet', label: 'Internet', icon: Monitor, color: 'text-cyan-600' },
  { id: 'reading', label: 'Reading', icon: Book, color: 'text-green-600' },
  { id: 'meeting', label: 'Meeting', icon: Users, color: 'text-orange-600' },
  { id: 'assignment', label: 'Assignment', icon: Pencil, color: 'text-red-600' },
  { id: 'thesis', label: 'Thesis', icon: FileText, color: 'text-indigo-600' },
  { id: 'news', label: 'News', icon: Newspaper, color: 'text-emerald-600' },
  { id: 'others', label: 'Others', icon: HelpCircle, color: 'text-gray-600' },
];

export const ReasonView: React.FC<ReasonViewProps> = ({ studentId, onComplete, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-12 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-blue-900 dark:text-blue-100 tracking-tighter uppercase italic">
          Purpose of Visit
        </h1>
        <p className="text-blue-700 dark:text-blue-300 font-bold italic">
          Welcome, <span className="underline decoration-2 underline-offset-4">{studentId}</span>. Please select one:
        </p>
      </div>

      <GroupBox label="Activity Selection" className="w-[800px] bg-classic-grey dark:bg-dark-surface shadow-2xl">
        <div className="grid grid-cols-3 gap-6 p-2">
          {REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => onComplete(reason.label)}
              className="h-44 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex flex-col items-center justify-center space-y-4 group active:scale-95"
            >
              <reason.icon className={`w-16 h-16 ${reason.color} group-hover:scale-110 transition-transform`} />
              <span className="font-black text-2xl uppercase tracking-tighter text-gray-800 dark:text-gray-200">
                {reason.label}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-8">
          <button
            onClick={onBack}
            className="w-full py-4 bg-gray-300 dark:bg-gray-800 font-bold text-xl border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken text-gray-700 dark:text-gray-300 active:scale-[0.99]"
          >
            ← GO BACK
          </button>
        </div>
      </GroupBox>
      
      <div className="flex items-center space-x-4 opacity-30">
        <div className="w-12 h-[1px] bg-blue-900 dark:bg-blue-100" />
        <span className="font-mono text-[10px] tracking-widest">TRANSACTION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <div className="w-12 h-[1px] bg-blue-900 dark:bg-blue-100" />
      </div>
    </div>
  );
};
