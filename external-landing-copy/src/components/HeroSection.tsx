import { ChevronRight, Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.3),transparent_70%)]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-sm">
                <span className="text-cyan-400 text-sm font-medium">🚀 Révolutionnez votre convoyage</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                La plateforme 
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> tout-en-un</span> pour gérer, convoyer et optimiser vos véhicules
              </h1>
              
              <p className="text-xl text-slate-300 leading-relaxed">
                Missions, inspections, factures, marketplace et suivi en temps réel réunis dans une seule application professionnelle.
              </p>
            </div>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-cyan-500/25">
                Créer un compte
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="group flex items-center justify-center px-8 py-4 bg-blue-100/10 text-white rounded-xl font-semibold text-lg hover:bg-blue-100/20 transition-all duration-300 backdrop-blur-sm border border-blue-200/40">
                <Play className="mr-2 h-5 w-5" />
                Découvrir la marketplace
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-blue-200/30">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">500+</div>
                <div className="text-slate-400 text-sm">Missions complétées</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">50+</div>
                <div className="text-slate-400 text-sm">Partenaires actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">20%</div>
                <div className="text-slate-400 text-sm">Économies moyennes</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Mobile Mockup */}
          <div className="relative">
            <div className="relative mx-auto w-80 h-[600px] bg-slate-800 rounded-[3rem] p-2 shadow-2xl">
              <div className="w-full h-full bg-slate-900 rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="flex justify-between items-center p-4 text-white text-sm">
                  <span>9:41</span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-50 rounded-full"></div>
                    <div className="w-1 h-1 bg-blue-50 rounded-full"></div>
                    <div className="w-1 h-1 bg-blue-50 rounded-full"></div>
                  </div>
                  <span>100%</span>
                </div>
                
                {/* App Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-4">Mission en cours</h3>
                  
                  {/* France Map */}
                  <div className="relative h-80 bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl overflow-hidden mb-4">
                    {/* Simplified France outline */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                      <path 
                        d="M50 200 L80 150 L120 140 L150 120 L180 130 L220 140 L250 160 L240 200 L220 240 L180 250 L140 240 L100 230 Z"
                        fill="rgba(14, 165, 233, 0.2)"
                        stroke="rgba(14, 165, 233, 0.5)"
                        strokeWidth="2"
                      />
                    </svg>
                    
                    {/* Route Line */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                      <path 
                        d="M100 180 Q150 160 200 170"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                    </svg>
                    
                    {/* Start Point */}
                    <div className="absolute top-32 left-16 w-4 h-4 bg-green-500 rounded-full border-2 border-blue-100 shadow-lg animate-pulse"></div>
                    
                    {/* End Point */}
                    <div className="absolute top-28 right-20 w-4 h-4 bg-red-500 rounded-full border-2 border-blue-100 shadow-lg"></div>
                    
                    {/* Moving Vehicle */}
                    <div className="absolute top-24 left-32 w-6 h-6 bg-cyan-500 rounded-full border-2 border-blue-100 shadow-lg flex items-center justify-center animate-bounce">
                      <div className="w-2 h-2 bg-blue-50 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Mission Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Distance</span>
                      <span className="text-white font-semibold">245 km</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Temps estimé</span>
                      <span className="text-white font-semibold">2h 45min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Véhicule</span>
                      <span className="text-white font-semibold">BMW Série 3</span>
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="mt-4 p-3 bg-cyan-500/20 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-cyan-400 text-sm font-medium">En cours de livraison</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-blue-100/15 rounded-full backdrop-blur-sm animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-12 h-12 bg-blue-200/15 rounded-full backdrop-blur-sm animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}