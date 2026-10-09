import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-darkNavy selection:bg-brand-teal selection:text-brand-darkNavy font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;
