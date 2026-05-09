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
    <div className="flex flex-col items-center justify-center min-h-[600px] space-y-8 animate-in slide-in-from-right duration-500">
      <div className="text-center space-y-1">
        <h1 className="text-5xl font-black text-blue-900 dark:text-blue-100 tracking-tight uppercase italic drop-shadow-sm">
          Purpose of Visit
        </h1>
        <p className="text-blue-700 dark:text-blue-300 font-bold uppercase tracking-widest text-sm">
          Welcome, <span className="underline underline-offset-4">{studentId}</span>. Please select one:
        </p>
      </div>

      <GroupBox label="Activity Selection" className="w-[850px] bg-classic-grey dark:bg-dark-surface shadow-2xl">
        <div className="grid grid-cols-3 gap-4 p-2">
          {REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => onComplete(reason.label)}
              className="h-40 bg-classic-grey dark:bg-dark-surface border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken hover:brightness-105 transition-all flex flex-col items-center justify-center space-y-3 group active:scale-95"
            >
              <div className="p-3 bg-white/5 dark:bg-black/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <reason.icon className={`w-14 h-14 ${reason.color} group-hover:scale-110 transition-transform`} />
              </div>
              <span className="font-black text-xl uppercase tracking-tight text-gray-800 dark:text-gray-200">
                {reason.label}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-6">
          <button
            onClick={onBack}
            className="w-full py-4 bg-gray-300 dark:bg-gray-800 font-black text-xl border-2 border-white dark:border-dark-highlight shadow-bevel-raised active:shadow-bevel-sunken text-gray-700 dark:text-gray-300 active:scale-[0.99] uppercase tracking-widest"
          >
            ← GO BACK
          </button>
        </div>
        <div className="mt-4 flex justify-between items-center opacity-30">
          <span className="font-mono text-[10px] tracking-widest uppercase">Node: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          <span className="font-mono text-[10px] tracking-widest uppercase">TX_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </div>
      </GroupBox>
    </div>
  );
};
