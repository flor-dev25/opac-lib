import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

import { SearchBar } from '../../components/dashboard/SearchBar';
import { DataGrid } from '../../components/common/DataGrid';

import { useCatalogStore } from '../../stores/catalogStore';

const COLUMNS = [
  { key: 'title', header: 'Title', width: '45%' },
  { key: 'author', header: 'Author', width: '30%' },
  { key: 'callno', header: 'Call Number', width: '15%' },
  { key: 'year', header: 'Year', width: '10%' },
];

export const DashboardPage: React.FC = () => {
  const { records, selectedId, setSelectedId } = useCatalogStore();

  const handleSearch = (query: string, scope: string) => {
    console.log(`Searching for "${query}" in ${scope}`);
  };

  return (
    <div className="flex flex-col h-full">
      <SearchBar onSearch={handleSearch} />
      
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <DataGrid 
          columns={COLUMNS} 
          data={records} 
          selectedId={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          idField="id"
        />
      </div>
      
      {/* Footer status bar for classic feel */}
      <div className="bg-classic-grey border-t border-white shadow-[0_-1px_0_#808080] px-2 py-0.5 text-[10px] text-gray-700 flex justify-between">
        <span>Ready</span>
        <span>Records: {records.length}</span>
      </div>
    </div>
  );
};
