// React import not needed with modern JSX transform
import { MapPin, Zap, Bell } from 'lucide-react';

export default function RealTimeSection() {
  return (
  <section className="py-24 bg-gradient-to-br from-teal-100 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200">
                <MapPin className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-700 text-sm font-medium">Suivi en direct</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Localisez vos missions 
                <span className="bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent"> en temps réel</span>
              </h2>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Suivez vos missions en temps réel : localisation, vitesse et notifications instantanées. Gardez le contrôle total sur vos opérations.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Géolocalisation précise</h3>
                  <p className="text-slate-600">Position GPS actualisée toutes les 30 secondes avec historique complet du trajet.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Vitesse instantanée</h3>
                  <p className="text-slate-600">Contrôlez la vitesse en temps réel avec alertes automatiques en cas de dépassement.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Notifications intelligentes</h3>
                  <p className="text-slate-600">Recevez des alertes pour les étapes importantes : départ, arrivée, incidents.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Interactive Map */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl">
              <div className="bg-slate-700 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between text-white text-sm mb-2">
                  <span>Mission #2024-001</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>En cours</span>
                  </div>
                </div>
              </div>
              
              {/* Map Area */}
              <div className="relative h-80 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl overflow-hidden">
                {/* Background map image */}
                <img
                  src="/map-light.svg"
                  alt="Carte stylisée"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  aria-hidden="true"
                />
                {/* Subtle vignette to improve contrast */}
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay pointer-events-none" aria-hidden="true" />

                {/* Road Network */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 320">
                  <path d="M50 160 L350 160" stroke="#e2e8f0" strokeWidth="4" />
                  <path d="M200 50 L200 270" stroke="#e2e8f0" strokeWidth="4" />
                  <path d="M50 100 L350 100" stroke="#e2e8f0" strokeWidth="2" />
                  <path d="M50 220 L350 220" stroke="#e2e8f0" strokeWidth="2" />
                </svg>
                
                {/* Route */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 320">
                  <path 
                    d="M80 160 L150 160 L200 100 L280 100 L320 160"
                    fill="none"
                    stroke="#06B6D4"
                    strokeOpacity="0.9"
                    strokeWidth="5"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Start Point */}
                <div className="absolute top-36 left-16 transform -translate-x-1/2 -translate-y-1/2 z-[1]">
                  <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-cyan-100 shadow-lg"></div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-50 px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap border border-cyan-100">
                    Paris
                  </div>
                </div>
                
                {/* End Point */}
                <div className="absolute top-36 right-16 transform translate-x-1/2 -translate-y-1/2 z-[1]">
                  <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-cyan-100 shadow-lg"></div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-teal-50 px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap border border-cyan-100">
                    Lyon
                  </div>
                </div>
                
                {/* Moving Vehicle */}
                <div className="absolute top-20 left-44 transform -translate-x-1/2 -translate-y-1/2 animate-bounce z-[1]">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full border-4 border-cyan-100 shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-teal-50 rounded-full"></div>
                  </div>
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                    <div className="font-medium">BMW Serie 3</div>
                    <div className="text-cyan-300">85 km/h</div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-700 p-3 rounded-lg text-center">
                  <div className="text-cyan-400 font-bold text-lg">245 km</div>
                  <div className="text-slate-400 text-xs">Distance</div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg text-center">
                  <div className="text-green-400 font-bold text-lg">85 km/h</div>
                  <div className="text-slate-400 text-xs">Vitesse</div>
                </div>
                <div className="bg-slate-700 p-3 rounded-lg text-center">
                  <div className="text-blue-400 font-bold text-lg">1h 45m</div>
                  <div className="text-slate-400 text-xs">Restant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}