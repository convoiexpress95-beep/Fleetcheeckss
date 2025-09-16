import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    { name: 'Marie Dubois', role: 'Convoyeuse indépendante', company: 'Transport Express', content: "J'ai réduit mes coûts de convoyage de 25% grâce à FleetChecks. Le réseau collaboratif est génial pour optimiser mes trajets de retour !", rating: 5, avatar: '' },
    { name: 'Pierre Martin', role: 'Gestionnaire de flotte', company: 'AutoConcession Lyon', content: 'FleetChecks nous a permis de centraliser toutes nos opérations de convoyage. La marketplace nous fait économiser du temps et de l\'argent.', rating: 5, avatar: '' },
    { name: 'Sophie Bernard', role: 'Responsable logistique', company: 'FleetCorp', content: 'Le suivi en temps réel et la génération automatique des factures ont révolutionné notre workflow. Interface intuitive et efficace !', rating: 5, avatar: '' },
  ];

  const partners = [
    { name: 'AutoPlus', logo: '🚗' },
    { name: 'FleetCorp', logo: '🚚' },
    { name: 'TransportPro', logo: '🚛' },
    { name: 'ConvoyExpress', logo: '🏎️' },
    { name: 'AutoLease', logo: '🚙' },
  ];

  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ils nous font <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">confiance</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Plus de 500 professionnels utilisent déjà FleetChecks pour optimiser leurs opérations de convoyage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((t, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
                <Quote className="h-8 w-8 text-cyan-400 mb-4" />
                <div className="flex items-center mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold mr-4">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{t.name}</h4>
                    <p className="text-sm text-gray-400">{t.role}</p>
                    <p className="text-sm text-cyan-400 font-medium">{t.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Nos partenaires de confiance</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {partners.map((p, i) => (
              <div key={i} className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{p.logo}</span>
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 inline-flex items-center space-x-2 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">+15 nouveaux partenaires ce mois</span>
          </div>
        </div>
      </div>
    </section>
  );
}
