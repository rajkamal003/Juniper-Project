// frontend/src/components/layout/AuthLayout.jsx
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import NetworkNodesCanvas from './NetworkNodesCanvas';
import PageTransition from '../ui/PageTransition';

export const AuthLayout = ({ children }) => {
  return (
    <div 
      className="relative min-h-screen flex flex-col justify-between overflow-x-hidden transition-colors duration-500 font-sans"
      style={{
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)'
      }}
    >
      <NetworkNodesCanvas />
      
      {/* Top Navbar */}
      <Navbar />
      
      {/* Centered Auth Card Area wrapped with PageTransition */}
      <main className="flex-grow flex justify-center items-center px-4 pt-28 pb-12 z-10 w-full">
        <PageTransition className="flex justify-center items-center">
          {children}
        </PageTransition>
      </main>
      
      {/* Unified Enterprise Footer */}
      <Footer />
    </div>
  );
};

export default AuthLayout;
