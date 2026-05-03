import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BeveledBox } from '../../components/common/BeveledBox';
import { ErrorDialog } from '../../components/auth/ErrorDialog';
import { useAuthStore } from '../../stores/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    <div className="min-h-screen flex items-center justify-center bg-gray-600">
      <BeveledBox className="w-[520px] h-[380px] flex flex-col overflow-hidden" padding="p-0">
        {/* Title Bar */}
        <div className="title-bar">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 border border-black flex items-center justify-center text-[10px] text-white font-bold">L</div>
            <span>Login</span>
          </div>
          <div className="flex gap-1">
             <button className="w-5 h-5 bg-classic-grey shadow-bevel-raised flex items-center justify-center text-black text-xs">_</button>
             <button className="w-5 h-5 bg-red-600 shadow-bevel-raised flex items-center justify-center text-white text-xs">X</button>
          </div>
        </div>

        {/* Top Branding Section */}
        <div className="h-[200px] flex-shrink-0 relative overflow-hidden" style={{ background: 'linear-gradient(to right, #A6CAF0 0%, #FFFFFF 100%)' }}>
          {/* Faint pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '10px 10px' }}></div>
          
          <div className="absolute right-10 bottom-8 text-right">
            <h1 className="text-5xl font-sans font-bold text-black tracking-tighter leading-none">infolib.</h1>
            <div className="h-[2px] bg-black w-full mt-1 mb-1"></div>
            <p className="text-sm font-sans text-black italic">Library Information System</p>
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
