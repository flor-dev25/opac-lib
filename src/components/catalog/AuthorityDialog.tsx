import React, { useState, useEffect, useMemo } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { DataGrid } from '../common/DataGrid';
import { TitleBar } from '../layout/TitleBar';
import { invoke } from '@tauri-apps/api/core';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface AuthorityDialogProps {
  onClose: () => void;
}

interface Author {
  author: string;
  author_code: number;
}

interface Subject {
  subject: string;
  subject_code: number;
}

const ITEMS_PER_PAGE = 20;

export const AuthorityDialog: React.FC<AuthorityDialogProps> = ({ onClose }) => {
  const [type, setType] = useState<'author' | 'subject'>('author');
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [editValue, setEditValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [authors, setAuthors] = useState<Author[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      if (type === 'author') {
        const data = await invoke<Author[]>('get_authors');
        setAuthors(data);
      } else {
        const data = await invoke<Subject[]>('get_subjects');
        setSubjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSelectedId(undefined);
    setEditValue('');
    setSearchTerm('');
    setCurrentPage(1);
  }, [type]);

  const allData = useMemo(() => {
    const raw = type === 'author' 
      ? authors.map(a => ({ id: a.author_code, name: a.author }))
      : subjects.map(s => ({ id: s.subject_code, name: s.subject }));
    
    if (!searchTerm.trim()) return raw;
    
    const term = searchTerm.toLowerCase().trim();
    return raw.filter(item => item.name.toLowerCase().includes(term));
  }, [type, authors, subjects, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(allData.length / ITEMS_PER_PAGE));
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return allData.slice(start, start + ITEMS_PER_PAGE);
  }, [allData, currentPage]);

  const columns = [{ key: 'name', header: type === 'author' ? 'Author Name' : 'Subject Heading', width: '100%' }];

  useEffect(() => {
    const selected = allData.find(item => item.id === selectedId);
    if (selected) setEditValue(selected.name);
    else setEditValue('');
  }, [selectedId, allData]);

  const handleUpdate = async () => {
    if (!selectedId || !editValue.trim()) return;
    try {
      if (type === 'author') {
        await invoke('update_author', { code: selectedId, name: editValue.trim() });
      } else {
        await invoke('update_subject', { code: selectedId, name: editValue.trim() });
      }
      await loadData();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Update failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm('Are you sure you want to delete this authority record?')) return;
    
    try {
      if (type === 'author') {
        await invoke('delete_author', { code: selectedId });
      } else {
        await invoke('delete_subject', { code: selectedId });
      }
      setSelectedId(undefined);
      setEditValue('');
      await loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000] p-4">
      <BeveledBox variant="raised" className="w-full max-w-lg bg-classic-grey dark:bg-dark-surface shadow-2xl flex flex-col h-[600px]">
        <TitleBar title="Authority Control" onClose={onClose} />

        <div className="p-4 space-y-3 flex-1 flex flex-col overflow-hidden">
          {/* Category Toggle and Search */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex gap-1">
              <button 
                onClick={() => setType('author')}
                className={`btn-classic px-4 h-7 ${type === 'author' ? 'bg-gray-200 dark:bg-dark-surface-alt font-bold' : ''}`}
              >
                Author Authority
              </button>
              <button 
                onClick={() => setType('subject')}
                className={`btn-classic px-4 h-7 ${type === 'subject' ? 'bg-gray-200 dark:bg-dark-surface-alt font-bold' : ''}`}
              >
                Subject Authority
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-classic w-full h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>

          {/* System Warning */}
          <div className="text-red-600 dark:text-red-400 font-bold text-center text-[10px] uppercase leading-tight bg-white/50 dark:bg-dark-input/50 p-1.5 border border-red-200 dark:border-red-900/50 italic shrink-0">
            NOTE : CLOSE ALL THE WORKSTATIONS BEFORE UPDATING THE AUTHORITY
          </div>

          {/* List Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-dark-input border-2 border-inset border-gray-400 dark:border-dark-border-dark min-h-0">
            {loading ? (
              <div className="flex-1 flex items-center justify-center italic text-xs text-gray-500">
                Loading...
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <DataGrid 
                  columns={columns} 
                  data={paginatedData} 
                  selectedId={selectedId}
                  onRowClick={(row) => setSelectedId(row.id)}
                />
              </div>
            )}

            {/* Pagination Navigator */}
            <div className="flex items-center justify-between gap-1 bg-[#D4D0C8] dark:bg-dark-surface px-2 py-1 border-t border-white dark:border-dark-highlight shrink-0">
              <div className="flex gap-0.5">
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  className="btn-classic px-1 h-6 flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                  disabled={currentPage === 1}
                  className="btn-classic px-1 h-6 flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>

              <div className="text-[10px] font-bold dark:text-dark-text">
                Page {currentPage} of {totalPages} ({allData.length} total)
              </div>

              <div className="flex gap-0.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                  disabled={currentPage === totalPages}
                  className="btn-classic px-1 h-6 flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="btn-classic px-1 h-6 flex items-center justify-center disabled:opacity-50"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Edit Field */}
          <div className="space-y-1 shrink-0">
            <label className="text-xs font-bold text-gray-700 dark:text-dark-text">Edit Selected Entry:</label>
            <input 
              type="text" 
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="input-classic w-full h-8" 
              disabled={!selectedId}
              placeholder={selectedId ? "Edit name..." : "Select an entry to edit"}
            />
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-2 shrink-0 pt-1">
            <button onClick={handleUpdate} disabled={!selectedId} className="btn-classic px-6 h-8 font-bold text-sm disabled:opacity-50">Update</button>
            <button onClick={handleDelete} disabled={!selectedId} className="btn-classic px-6 h-8 text-red-700 text-sm disabled:opacity-50">Delete</button>
            <button onClick={onClose} className="btn-classic px-8 h-8 text-sm">Exit</button>
          </div>
        </div>
      </BeveledBox>
    </div>
  );
};

