import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface CommandGroupProps {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const CommandGroup: React.FC<CommandGroupProps> = ({ label, icon: Icon, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex flex-col items-center justify-center gap-1 w-20 h-20 text-[11px] font-bold btn-classic relative group
          ${isOpen ? '!shadow-bevel-sunken bg-white dark:bg-dark-input' : ''}`}
      >
        <div className="group-active:translate-y-0.5 transition-transform flex flex-col items-center gap-1">
          <Icon size={32} strokeWidth={1.5} className="text-[#404040] dark:text-dark-text" />
          <span>{label}</span>
        </div>
        <ChevronDown size={10} className={`absolute bottom-1 right-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-0.5 w-60 z-[110] bg-classic-grey dark:bg-dark-panel border border-white dark:border-dark-highlight shadow-bevel-raised py-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
