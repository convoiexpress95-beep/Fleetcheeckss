import { ArrowRight, Smartphone, Globe } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
      </div>
      
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100/15 border border-blue-200/40 backdrop-blur-sm">
              <ArrowRight className="h-5 w-5 text-white mr-2" />
              <span className="text-white font-medium">Rejoignez la révolution du convoyage</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Prêt à transformer
              <br />
              <span className="text-cyan-200">votre business ?</span>
            </h2>
            
            <p className="text-xl text-cyan-100 max-w-3xl mx-auto leading-relaxed">
              Rejoignez dès aujourd'hui la plateforme qui révolutionne le convoyage. Plus de 500 professionnels nous font déjà confiance.
            </p>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group flex items-center justify-center px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
              Créer mon compte gratuitement
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group flex items-center justify-center px-10 py-5 bg-transparent text-white rounded-2xl font-bold text-lg hover:bg-blue-100/10 transition-all duration-300 border-2 border-blue-200/40 backdrop-blur-sm">
              <Smartphone className="mr-3 h-6 w-6" />
              Demander une démo
            </button>
          </div>
          
          {/* Features Row */}
          <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-blue-200/30">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-blue-100/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Disponible partout</div>
                <div className="text-cyan-100 text-sm">Web & Mobile</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-blue-100/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Déploiement immédiat</div>
                <div className="text-cyan-100 text-sm">En moins de 5 min</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-blue-100/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-lg">🇫🇷</span>
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">Support français</div>
                <div className="text-cyan-100 text-sm">7j/7 - 24h/24</div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="pt-8">
            <div className="flex flex-wrap justify-center items-center gap-8 text-cyan-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">500+ missions complétées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">98% de satisfaction client</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Support 7j/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}