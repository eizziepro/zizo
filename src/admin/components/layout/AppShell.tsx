import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandMenu } from '../untitledui/CommandMenu';
import { Modal } from '../untitledui/Modal';
import { Button } from '../untitledui/Button';
import { useAuth } from '../../context/AuthContext';
import { useIdleTimer } from '../../context/IdleTimerContext';

export const AppShell: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const { signOut } = useAuth();
  const { showIdleWarning, dismissIdleWarning, idleSecondsLeft } = useIdleTimer();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#17191A] flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-[#17191A]/60 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCommandMenu={() => setCommandMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 w-full">
          <Outlet />
        </main>

        {/* Global Staff Footer with explicit 2026 copyright */}
        <footer className="border-t border-[#E1E0DD] bg-white py-4 px-6 text-center text-xs text-[#5D5E5F]">
          © 2026 Zizo Donor and Surrogacy. All rights reserved. Staff Portal
        </footer>
      </div>

      {/* Command Palette (Cmd/Ctrl + K) */}
      <CommandMenu isOpen={commandMenuOpen} onClose={() => setCommandMenuOpen(false)} />

      {/* 2-Minute Inactivity Warning Modal */}
      <Modal
        isOpen={showIdleWarning}
        onClose={dismissIdleWarning}
        title="Session Expiring Soon"
        description="For security and NDPA compliance, your session will automatically lock due to inactivity."
        footer={
          <>
            <Button variant="secondary" onClick={signOut}>
              Sign out now
            </Button>
            <Button variant="primary" onClick={dismissIdleWarning}>
              Stay signed in
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-center py-2">
          <div className="text-3xl font-mono font-bold text-[#17645F]">
            {Math.max(0, idleSecondsLeft)}s
          </div>
          <p className="text-xs text-[#5D5E5F]">
            Your session will end in {idleSecondsLeft} seconds. Click &quot;Stay signed in&quot; to resume your work.
          </p>
        </div>
      </Modal>
    </div>
  );
};
