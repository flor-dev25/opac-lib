import React from 'react';
import { SearchBar } from '../../components/dashboard/SearchBar';
import { DataGrid } from '../../components/common/DataGrid';
import { usePatronStore } from '../../stores/patronStore';
import { useNavigate } from 'react-router-dom';
import { PatronNavigator } from '../../components/patrons/PatronNavigator';
import { TableSkeleton } from '../../components/common/Skeleton';

const COLUMNS = [
  { key: 'name', header: 'Name', width: '30%' },
  { key: 'idno', header: 'ID Number', width: '15%' },
  { key: 'group_name', header: 'Group', width: '15%' },
  { key: 'email', header: 'Email', width: '25%' },
  { key: 'unpaid_fine', header: 'Fines', width: '15%' },
];

export const PatronPage: React.FC = () => {
  const navigate = useNavigate();
  const { patrons, selectedIdno, totalPatrons, isLoading, setSelectedIdno, fetchPatrons, setSearchQuery } = usePatronStore();

  React.useEffect(() => {
    fetchPatrons();
  }, [fetchPatrons]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchPatrons(1);
  };

  return (
    <div className="flex flex-col h-full">
      <SearchBar onSearch={handleSearch} />
      
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="bg-white dark:bg-dark-input shadow-bevel-sunken flex-1 overflow-auto">
            <TableSkeleton rows={15} cols={5} />
          </div>
        ) : (
          <DataGrid 
            columns={COLUMNS} 
            data={patrons} 
            selectedId={selectedIdno ?? undefined}
            onRowClick={(row) => setSelectedIdno(row.idno)}
            onRowDoubleClick={(row) => navigate(`/patrons/edit/${row.idno}`)}
            idField="idno"
          />
        )}
      </div>
      <PatronNavigator />
      
      {/* Footer status bar for classic feel */}
      <div className="bg-classic-grey dark:bg-dark-surface border-t border-white dark:border-dark-highlight shadow-[0_-1px_0_#808080] dark:shadow-[0_-1px_0_#1A1A1A] px-2 py-0.5 text-[10px] text-gray-700 dark:text-dark-text-muted flex justify-between">
        <span>School Account Management</span>
        <span>Total Accounts: {totalPatrons}</span>
      </div>
    </div>
  );
};
