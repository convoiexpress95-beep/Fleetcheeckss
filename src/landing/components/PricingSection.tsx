import React from 'react';
import { Check, Star, Zap } from 'lucide-react';

export default function PricingSection() {
  const plans = [
    { name: 'Convoyeur', subtitle: 'Pour les indépendants', price: '29', period: '/mois', description: 'Parfait pour débuter dans le convoyage professionnel', features: [ '50 crédits missions/mois', 'Facturation automatique', 'Suivi GPS temps réel', 'Support client 7/7', 'Accès réseau collaboratif' ], cta: 'Commencer gratuitement', popular: false, colorFrom: 'from-cyan-500', colorTo: 'to-cyan-600' },
    { name: 'Transporteur', subtitle: 'Pour les équipes', price: '89', period: '/mois', description: "Idéal pour les entreprises de transport avec équipes", features: [ 'Missions illimitées', "Gestion d'équipe avancée", 'Tableaux de bord détaillés', 'API et intégrations', 'Support prioritaire 24/7', 'Formation personnalisée' ], cta: 'Essai gratuit 14 jours', popular: true, colorFrom: 'from-blue-500', colorTo: 'to-blue-600' },
    { name: 'Flotte/Concession', subtitle: 'Pour les grandes structures', price: '199', period: '/mois', description: 'Solution complète pour gestionnaires de flotte', features: [ 'Missions illimitées', 'Marketplace premium', 'Comparateur de devis', 'Intégrations ERP/CRM', 'Support dédié 24/7', 'SLA garantie 99.9%', 'Rapports analytiques' ], cta: 'Démo personnalisée', popular: false, colorFrom: 'from-teal-500', colorTo: 'to-teal-600' },
  ];

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Choisissez votre <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">formule</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Des prix transparents pour chaque profil. Commencez gratuitement, évoluez selon vos besoins.
          </p>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm p-1 rounded-xl border border-white/20">
            <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-medium">Mensuel</button>
            <button className="px-6 py-2 text-white/70 hover:text-white transition-colors">Annuel (-20%)</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative group ${plan.popular ? 'scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4 mr-1" /> Plus populaire
                  </div>
                </div>
              )}
              <div className={`relative rounded-2xl p-8 border ${plan.popular ? 'border-cyan-400/40 shadow-xl shadow-cyan-500/10' : 'border-white/10'} hover:bg-white/05 transition-all duration-300 bg-white/5 backdrop-blur-sm`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-cyan-300 font-medium mb-4">{plan.subtitle}</p>
                  <p className="text-gray-300 text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-6">
                    <span className="text-5xl font-bold text-white">€{plan.price}</span>
                    <span className="text-xl text-gray-400 ml-2">{plan.period}</span>
                  </div>
                  <button className={`w-full py-4 bg-gradient-to-r ${plan.colorFrom} ${plan.colorTo} text-white rounded-xl font-semibold hover:brightness-110 transition-all duration-300 ${plan.popular ? 'shadow-lg shadow-cyan-500/25' : ''}`}>
                    {plan.popular && <Zap className="inline h-5 w-5 mr-2" />} {plan.cta}
                  </button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-white mb-4">Inclus :</h4>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">🔒 Aucun engagement • 🎯 Support français • ⚡ Déploiement immédiat</p>
          <div className="inline-flex items-center space-x-6 text-sm text-gray-300">
            <span>✅ Essai gratuit 14 jours</span>
            <span>✅ Sans carte de crédit</span>
            <span>✅ Annulation à tout moment</span>
          </div>
        </div>
      </div>
    </section>
  );
}
