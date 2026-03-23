/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, LogIn } from "lucide-react";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { motion, AnimatePresence } from "motion/react";

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1.5 rounded-lg">
              <LayoutDashboard className="text-indigo-600 w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Mood Tracker Pro</h1>
          </div>
          
          <nav className="flex items-center gap-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                location.pathname === '/' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">User Page</span>
            </Link>
            <Link 
              to="/admin" 
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                location.pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Page</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Mood Tracker Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
