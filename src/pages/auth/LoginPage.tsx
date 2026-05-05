import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoke, convertFileSrc } from '@tauri-apps/api/core';
import { BeveledBox } from '../../components/common/BeveledBox';
import { ErrorDialog } from '../../components/auth/ErrorDialog';
import { useAuthStore } from '../../stores/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [logoPath, setLogoPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadLogo = async () => {
      try {
        const path = await invoke<string | null>('get_logo_path');
        setLogoPath(path);
      } catch (e) {
        console.error(e);
      }
    };
    loadLogo();
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLoading) return;
    
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleCancel = () => {
    // In a real app, this might close the window or reset the form
    setUsername('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#404040]">
      <BeveledBox className="w-[520px] h-[380px] flex flex-col overflow-hidden animate-fade-in" padding="p-0">
        {/* Title Bar */}
        <div className="title-bar-gjc">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/20 border border-white/40 flex items-center justify-center text-[10px] text-gjc-gold font-bold">L</div>
            <span>System Login</span>
          </div>
          <div className="flex gap-1">
             <button className="w-5 h-5 bg-[#c0c0c0] border border-gray-800 flex items-center justify-center text-black text-xs hover:bg-gray-100">_</button>
             <button className="w-5 h-5 bg-[#c0c0c0] border border-gray-800 flex items-center justify-center text-black text-xs hover:bg-red-500 hover:text-white">✕</button>
          </div>
        </div>

        {/* Top Branding Section */}
        <div className="h-[180px] flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-gjc-green to-[#006030]">
          {/* Subtle GJC Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-gjc-gold/30 overflow-hidden">
                {logoPath ? (
                  <img 
                    src={convertFileSrc(logoPath)} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-gjc-gold/50 text-2xl font-bold italic">GJC</span>
                )}
             </div>
          </div>

          <div className="absolute right-10 bottom-8 text-right">
            <h1 className="text-5xl font-sans font-bold text-gjc-gold tracking-tighter leading-none drop-shadow-lg">infoLib.</h1>
            <div className="h-[3px] bg-gjc-gold w-full mt-2 mb-1 shadow-md"></div>
            <p className="text-xs font-sans text-gjc-gold font-bold uppercase tracking-widest opacity-80">Library Information System</p>
          </div>
        </div>

        {/* Bottom Login Form Section */}
        <div className="flex-grow bg-classic-grey flex items-center justify-center">
          <form onSubmit={handleLogin}>
            <BeveledBox variant="sunken" className="bg-[#E0E0E0] w-[380px] p-8 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-sans text-black">User Name</label>
                <input 
                  type="text" 
                  className="input-classic flex-grow" 
                  autoFocus 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-sans text-black">Password</label>
                <input 
                  type="password" 
                  className="input-classic flex-grow" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="submit"
                  className={`btn-classic min-w-[80px] ${isLoading ? 'opacity-50' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : 'OK'}
                </button>
                <button 
                  type="button"
                  className="btn-classic min-w-[80px]"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </BeveledBox>
          </form>
        </div>
      </BeveledBox>

      {error && (
        <ErrorDialog 
          message={error} 
          onClose={clearError} 
        />
      )}
    </div>
  );
};
