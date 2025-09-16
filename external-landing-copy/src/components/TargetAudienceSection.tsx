import { Truck, Building2, Car } from 'lucide-react';

export default function TargetAudienceSection() {
  const audiences = [
    {
      icon: Truck,
      title: "Convoyeurs & Transporteurs",
      subtitle: "Développez votre activité",
      benefits: [
        "Trouvez des missions près de chez vous",
        "Générez vos rapports et factures automatiquement",
        "Collaborez efficacement avec vos équipes",
        "Optimisez vos trajets de retour"
      ],
      cta: "Rejoindre le réseau",
      color: "cyan"
    },
    {
      icon: Building2,
      title: "Concessionnaires & Flottes",
      subtitle: "Simplifiez vos opérations",
      benefits: [
        "Publiez vos besoins de convoyage en masse",
        "Comparez les devis et choisissez le meilleur",
        "Suivez vos véhicules en temps réel",
        "Réduisez vos coûts logistiques"
      ],
      cta: "Créer mon espace professionnel",
      color: "blue"
    },
    {
      icon: Car,
      title: "Clients Particuliers & Pros",
      subtitle: "Confiez-nous vos véhicules",
      benefits: [
        "Service de convoyage professionnel",
        "Suivi transparent de A à Z",
        "Tarifs compétitifs garantis",
        "Assurance tous risques incluse"
      ],
      cta: "Demander un devis",
      color: "teal"
    }
  ];

  return (
  <section className="py-24 bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Une solution pour 
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> chaque profil</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Que vous soyez convoyeur indépendant, gestionnaire de flotte ou particulier, FleetCheecks s'adapte à vos besoins
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-300/10 to-teal-300/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r from-${audience.color}-500 to-${audience.color}-600 rounded-xl flex items-center justify-center mb-6`}>
                  <audience.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{audience.title}</h3>
                <p className="text-cyan-300 mb-6 font-medium">{audience.subtitle}</p>
                
                <ul className="space-y-3 mb-8">
                  {audience.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 bg-gradient-to-r from-${audience.color}-500 to-${audience.color}-600 text-white rounded-xl font-semibold hover:from-${audience.color}-600 hover:to-${audience.color}-700 transition-all duration-300`}>
                  {audience.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}