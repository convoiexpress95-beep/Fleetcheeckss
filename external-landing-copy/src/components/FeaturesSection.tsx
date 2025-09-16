// React import not needed with modern JSX transform
import { FileText, Users, ShoppingCart, MapPin, Clock, Shield } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Création de missions & inspections",
      description: "Photos, signatures, PDF légal en 3 étapes. Générez des rapports professionnels instantanément.",
      color: "cyan"
    },
    {
      icon: Users,
      title: "Gestion d'équipe & facturation",
      description: "Suivi convoyeurs, devis, factures générées automatiquement. Optimisez votre workflow.",
      color: "blue"
    },
    {
      icon: ShoppingCart,
      title: "Marketplace de missions",
      description: "Publiez, comparez et choisissez le meilleur devis. Trouvez les meilleures opportunités.",
      color: "teal"
    }
  ];

  const additionalFeatures = [
    { icon: MapPin, title: "Suivi temps réel", description: "Localisation GPS précise" },
    { icon: Clock, title: "Planification", description: "Optimisation des trajets" },
    { icon: Shield, title: "Sécurisé", description: "Données protégées" }
  ];

  return (
  <section className="py-24 bg-gradient-to-br from-teal-100 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Tout ce dont vous avez besoin en 
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"> une seule plateforme</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            FleetCheecks centralise toutes vos opérations de convoyage dans une interface moderne et intuitive
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 bg-teal-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100">
                <div className={`w-14 h-14 bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-4 p-6 bg-teal-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-cyan-100">
              <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{feature.title}</h4>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}