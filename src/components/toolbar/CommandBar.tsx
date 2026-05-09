import React from 'react';
import { 
  LayoutDashboard, FilePlus, Edit, Trash2, BookOpen, Download, DatabaseBackup,
  Users, UserPlus, UserCheck, ArrowUpRight, ArrowDownLeft, BookmarkPlus, Wallet, Activity,
  TrendingUp, ScanBarcode, BookPlus, Settings, LogOut, Info, RefreshCw, FileText
} from 'lucide-react';
import { CommandGroup } from './CommandGroup';
import { CommandItem } from './CommandItem';
import { CommandSeparator } from './CommandSeparator';

interface CommandBarProps {
  onAuthority: () => void;
  onAbout: () => void;
  onDelete: () => void;
  onExport: () => void;
  onEdit: () => void;
  onCheckout: () => void;
  onReturn: () => void;
  onDashboard: () => void;
  onPayment: () => void;
  onAudit: () => void;
  onFinancialReports: () => void;
  onAcquisitions: () => void;
  onReservation: () => void;
  onSettings: () => void;
  onShowLogs: () => void;
  onImportMdb: () => void;
  onImportAccounts: () => void;
  onAttendanceDashboard: () => void;
  onExit: () => void;
  onSync: () => void;
  navigate: (path: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = (props) => (
  <div className="flex items-center gap-1">
    <CommandGroup label="Catalog" icon={BookOpen}>
      <CommandItem icon={LayoutDashboard} label="Browse Catalog" onClick={() => props.navigate('/dashboard')} shortcut="Ctrl+1" />
      <CommandItem icon={FilePlus} label="New Record" onClick={() => props.navigate('/catalog/new')} shortcut="Ctrl+N" />
      <CommandSeparator />
      <CommandItem icon={Edit} label="Edit Record" onClick={props.onEdit} shortcut="Ctrl+E" />
      <CommandItem icon={Trash2} label="Delete Record" onClick={props.onDelete} shortcut="Del" />
      <CommandSeparator />
      <CommandItem icon={BookOpen} label="Authority Files" onClick={props.onAuthority} />
      <CommandItem icon={Download} label="Export Data" onClick={props.onExport} />
      <CommandItem icon={DatabaseBackup} label="Import Legacy (.mdb)" onClick={props.onImportMdb} />
    </CommandGroup>

    <CommandGroup label="Accounts" icon={Users}>
      <CommandItem icon={Users} label="Manage Accounts" onClick={() => props.navigate('/patrons')} shortcut="Ctrl+2" />
      <CommandItem icon={UserPlus} label="New Account" onClick={() => props.navigate('/patrons/new')} />
      <CommandSeparator />
      <CommandItem icon={UserPlus} label="Import CSV" onClick={props.onImportAccounts} />
      <CommandItem icon={UserCheck} label="Attendance Dashboard" onClick={props.onAttendanceDashboard} />
    </CommandGroup>

    <CommandGroup label="Circulation" icon={ArrowUpRight}>
      <CommandItem icon={ArrowUpRight} label="Borrow (Checkout)" onClick={props.onCheckout} shortcut="Ctrl+B" />
      <CommandItem icon={ArrowDownLeft} label="Return" onClick={props.onReturn} shortcut="Ctrl+R" />
      <CommandItem icon={BookmarkPlus} label="Reserve" onClick={props.onReservation} />
      <CommandSeparator />
      <CommandItem icon={Wallet} label="Pay Fine" onClick={props.onPayment} />
      <CommandItem icon={Activity} label="Circulation Overview" onClick={props.onDashboard} />
    </CommandGroup>

    <CommandGroup label="Reports" icon={TrendingUp}>
      <CommandItem icon={TrendingUp} label="Financial Reports" onClick={props.onFinancialReports} />
      <CommandItem icon={ScanBarcode} label="Inventory Audit" onClick={props.onAudit} />
      <CommandItem icon={BookPlus} label="New Acquisitions" onClick={props.onAcquisitions} />
    </CommandGroup>

    <CommandGroup label="System" icon={Settings}>
      <CommandItem icon={Settings} label="Settings" onClick={props.onSettings} shortcut="Ctrl+," />
      <CommandItem icon={RefreshCw} label="Sync Now" onClick={props.onSync} />
      <CommandItem icon={FileText} label="Sync Logs" onClick={props.onShowLogs} />
      <CommandSeparator />
      <CommandItem icon={Info} label="About infoLib" onClick={props.onAbout} />
      <CommandItem icon={LogOut} label="Exit" onClick={props.onExit} />
    </CommandGroup>
  </div>
);
