import React from 'react';
import { FilePlus, Trash2, Download, BookOpen, Info, LogOut } from 'lucide-react';
import { ToolbarItem } from './ToolbarItem';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface ToolbarProps {
  onAuthority?: () => void;
  onAbout?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAuthority, onAbout, onDelete, onExport }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-classic-grey border-b border-white shadow-[0_1px_0_#808080]">
      <ToolbarItem 
        icon={FilePlus} 
        label="New" 
        onClick={() => navigate('/catalog/new')} 
      />
      <ToolbarItem 
        icon={Trash2} 
        label="Delete" 
        onClick={onDelete} 
      />
      <ToolbarItem 
        icon={Download} 
        label="Export" 
        onClick={onExport} 
      />
      <div className="w-[1px] h-16 bg-gray-400 mx-1 shadow-[1px_0_0_white]" />
      <ToolbarItem 
        icon={BookOpen} 
        label="Authority" 
        onClick={onAuthority} 
      />
      <ToolbarItem 
        icon={Info} 
        label="About" 
        onClick={onAbout} 
      />
      <ToolbarItem 
        icon={LogOut} 
        label="Exit" 
        onClick={handleLogout} 
      />
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Branding Logo Placeholder */}
      <div className="pr-4 text-right">
        <h1 className="text-xl font-bold tracking-tighter text-classic-blue italic">
          infoLib.
        </h1>
        <p className="text-[9px] text-gray-600 font-bold uppercase">
          Library Information System
        </p>
      </div>
    </div>
  );
};
