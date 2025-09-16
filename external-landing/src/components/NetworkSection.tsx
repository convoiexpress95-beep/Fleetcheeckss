import { Users, ArrowRightLeft, TrendingDown, Star } from 'lucide-react';

export default function NetworkSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-cyan-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(6,182,212,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.3),transparent_50%)]"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-sm mb-8">
            <Star className="h-5 w-5 text-cyan-400 mr-2" />
            <span className="text-cyan-300 font-medium">Exclusif FleetCheecks</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Réseau interne 
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> collaboratif</span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Le premier "BlaBlaCar" pour convoyeurs ! Optimisez vos trajets de retour, partagez vos frais et développez votre réseau professionnel.
          </p>
          
          <div className="inline-flex items-center space-x-2 bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-orange-300 text-sm font-medium">Fonctionnalité unique sur le marché</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-blue-100/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/40">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
              <ArrowRightLeft className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Trajets partagés</h3>
            <p className="text-slate-300 leading-relaxed">
              Trouvez des convoyeurs sur votre route de retour ou proposez vos services pour optimiser vos déplacements.
            </p>
          </div>

          <div className="bg-blue-100/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/40">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <TrendingDown className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Réduction des coûts</h3>
            <p className="text-slate-300 leading-relaxed">
              Divisez vos frais de carburant et péages en partageant vos trajets avec d'autres professionnels du convoyage.
            </p>
          </div>

          <div className="bg-blue-100/10 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/40">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Réseau professionnel</h3>
            <p className="text-slate-300 leading-relaxed">
              Développez votre réseau en rencontrant d'autres convoyeurs et créez des partenariats durables.
            </p>
          </div>
        </div>

        {/* Example Usage */}
  <div className="bg-gradient-to-r from-blue-100/10 to-blue-100/5 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/40">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Comment ça marche ?</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                1
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Publiez votre trajet</h4>
              <p className="text-slate-300 text-sm">Indiquez votre itinéraire de retour et vos disponibilités</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                2
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Trouvez des partenaires</h4>
              <p className="text-slate-300 text-sm">Connectez-vous avec des convoyeurs sur votre route</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                3
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Économisez ensemble</h4>
              <p className="text-slate-300 text-sm">Partagez les frais et développez votre activité</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-3 rounded-full border border-cyan-400/30">
              <TrendingDown className="h-5 w-5 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-medium">Économies moyennes : -30% sur les trajets de retour</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}