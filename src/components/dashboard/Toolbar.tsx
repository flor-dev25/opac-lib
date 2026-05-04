import React from 'react';
import { FilePlus, Trash2, Download, BookOpen, Info, LogOut, Users, LayoutDashboard, Edit, ArrowUpRight, ArrowDownLeft, Activity, Wallet, ScanBarcode, TrendingUp, BookPlus, BookmarkPlus } from 'lucide-react';
import { ToolbarItem } from './ToolbarItem';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

interface ToolbarProps {
  onAuthority?: () => void;
  onAbout?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onEdit?: () => void;
  onCheckout?: () => void;
  onReturn?: () => void;
  onDashboard?: () => void;
  onPayment?: () => void;
  onAudit?: () => void;
  onFinancialReports?: () => void;
  onAcquisitions?: () => void;
  onReservation?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAuthority, onAbout, onDelete, onExport, onEdit, onCheckout, onReturn, onDashboard, onPayment, onAudit, onFinancialReports, onAcquisitions, onReservation }) => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const location = useLocation();
  const isPatrons = location.pathname.startsWith('/patrons');

  const handleNew = () => {
    if (isPatrons) navigate('/patrons/new');
    else navigate('/catalog/new');
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-classic-grey border-b border-white shadow-[0_1px_0_#808080]">
      <ToolbarItem 
        icon={LayoutDashboard} 
        label="Catalog" 
        onClick={() => navigate('/dashboard')} 
      />
      <ToolbarItem 
        icon={Users} 
        label="Patrons" 
        onClick={() => navigate('/patrons')} 
      />
      <ToolbarItem 
        icon={ArrowUpRight} 
        label="Borrow" 
        onClick={onCheckout} 
      />
      <ToolbarItem 
        icon={ArrowDownLeft} 
        label="Return" 
        onClick={onReturn} 
      />
      <ToolbarItem 
        icon={Activity} 
        label="Overview" 
        onClick={onDashboard} 
      />
      <ToolbarItem 
        icon={Wallet} 
        label="Pay Fine" 
        onClick={onPayment} 
      />
      <ToolbarItem 
        icon={ScanBarcode} 
        label="Audit" 
        onClick={onAudit} 
      />
      <ToolbarItem 
        icon={TrendingUp} 
        label="Reports" 
        onClick={onFinancialReports} 
      />
      <ToolbarItem 
        icon={BookPlus} 
        label="New Items" 
        onClick={onAcquisitions} 
      />
      <ToolbarItem 
        icon={BookmarkPlus} 
        label="Reserve" 
        onClick={onReservation} 
      />
      <div className="w-[1px] h-16 bg-gray-400 mx-1 shadow-[1px_0_0_white]" />
      <ToolbarItem 
        icon={FilePlus} 
        label="New" 
        onClick={handleNew} 
      />
      <ToolbarItem 
        icon={Edit} 
        label="Edit" 
        onClick={onEdit} 
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
