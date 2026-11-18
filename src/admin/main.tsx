import React from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from './App';
import './styles/admin.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AdminApp />
    </React.StrictMode>
  );
}
