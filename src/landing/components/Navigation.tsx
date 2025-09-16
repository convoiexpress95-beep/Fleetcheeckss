import React, { useState } from 'react';
import { Menu, X, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              FleetChecks
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Tarifs</a>
            <a href="#about" className="text-gray-300 hover:text-white transition-colors">À propos</a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Connexion</Link>
            <Link to="/login" className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">Créer un compte</Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-black border-t border-white/10">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors">Fonctionnalités</a>
              <a href="#solutions" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors">Solutions</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors">Tarifs</a>
              <a href="#about" className="block px-3 py-2 text-gray-300 hover:text-white transition-colors">À propos</a>

              <div className="pt-4 pb-2 border-t border-white/10 space-y-2">
                <Link to="/login" className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors">Connexion</Link>
                <Link to="/login" className="block w-full px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold">Créer un compte</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
