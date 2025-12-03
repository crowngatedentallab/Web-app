import React from 'react';
import { UserRole } from '../types';
import { Shield, User, Wrench, Menu, LogOut } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange, toggleSidebar }) => {
  return (
    <nav className="h-16 bg-white border-b border-slate-200 fixed top-0 w-full z-50 flex items-center justify-between px-4 lg:px-8 shadow-sm">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="lg:hidden text-slate-500">
          <Menu />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-brand-900 rounded flex items-center justify-center">
            {/* Crown Icon / Logo Placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 leading-tight">
              CROWNGATE
            </span>
            <span className="text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
              Dental Technologies
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Role Switcher - Professional Style */}
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => onRoleChange(UserRole.DOCTOR)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentRole === UserRole.DOCTOR ? 'bg-white text-brand-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <User size={14} />
            Clinic
          </button>
          <button 
            onClick={() => onRoleChange(UserRole.TECHNICIAN)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentRole === UserRole.TECHNICIAN ? 'bg-white text-brand-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Wrench size={14} />
            Lab
          </button>
          <button 
            onClick={() => onRoleChange(UserRole.ADMIN)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentRole === UserRole.ADMIN ? 'bg-white text-brand-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Shield size={14} />
            Admin
          </button>
        </div>

        <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-800 font-bold border border-brand-200">
          {currentRole === UserRole.DOCTOR ? 'DS' : currentRole === UserRole.TECHNICIAN ? 'TM' : 'AD'}
        </div>
      </div>
    </nav>
  );
};