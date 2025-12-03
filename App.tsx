import React, { useState } from 'react';
import { UserRole } from './types';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { TechnicianView } from './pages/TechnicianView';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.ADMIN);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentRole) {
      case UserRole.ADMIN:
        return <AdminDashboard />;
      case UserRole.DOCTOR:
        return <DoctorDashboard />;
      case UserRole.TECHNICIAN:
        return <TechnicianView />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar 
        currentRole={currentRole} 
        onRoleChange={setCurrentRole} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="relative pt-4">
        {renderView()}
      </main>

      {/* Role Selection Floating Hint (For Demo Purposes) */}
      <div className="fixed bottom-4 right-4 bg-white border border-slate-200 p-4 rounded-xl shadow-lg max-w-xs text-xs text-slate-500 hidden lg:block">
        <p className="font-bold text-slate-800 mb-1">Theme & Role Switcher</p>
        <p>Use the toggle in the top navbar to switch views. The UI now adapts to a professional medical environment.</p>
      </div>
    </div>
  );
}