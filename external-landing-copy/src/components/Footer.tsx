import React from 'react';
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                FleetCheecks
              </h3>
              <p className="text-slate-400 mt-2">
                La plateforme tout-en-un pour révolutionner le convoyage de véhicules.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300">contact@fleetreport.fr</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300">+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-cyan-400" />
                <span className="text-slate-300">Paris, France</span>
              </div>
            </div>
          </div>
          
          {/* Solutions */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Solutions</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Pour Convoyeurs</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Pour Transporteurs</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Pour Concessionnaires</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Gestion de Flotte</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Marketplace</a></li>
            </ul>
          </div>
          
          {/* Fonctionnalités */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Fonctionnalités</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Suivi GPS</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Facturation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Inspections</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Réseau Collaboratif</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">API</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Formation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Statut système</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Nous contacter</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="py-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <div className="text-slate-400 text-sm">
              © 2024 FleetCheecks. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Mentions légales</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Confidentialité</a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}