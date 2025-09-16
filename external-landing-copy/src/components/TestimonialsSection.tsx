// React import not needed with modern JSX transform
import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Convoyeuse indépendante",
      company: "Transport Express",
  content: "J'ai réduit mes coûts de convoyage de 25% grâce à FleetCheecks. Le réseau collaboratif est génial pour optimiser mes trajets de retour !",
      rating: 5,
      avatar: "https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Pierre Martin",
      role: "Gestionnaire de flotte",
      company: "AutoConcession Lyon",
  content: "FleetCheecks nous a permis de centraliser toutes nos opérations de convoyage. La marketplace nous fait économiser du temps et de l'argent.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    },
    {
      name: "Sophie Bernard",
      role: "Responsable logistique",
      company: "FleetCorp",
      content: "Le suivi en temps réel et la génération automatique des factures ont révolutionné notre workflow. Interface intuitive et efficace !",
      rating: 5,
      avatar: "https://images.pexels.com/photos/3777952/pexels-photo-3777952.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
    }
  ];

  const partners = [
    { name: "AutoPlus", logo: "🚗" },
    { name: "FleetCorp", logo: "🚚" },
    { name: "TransportPro", logo: "🚛" },
    { name: "ConvoyExpress", logo: "🏎️" },
    { name: "AutoLease", logo: "🚙" }
  ];

  return (
  <section className="py-24 bg-gradient-to-br from-teal-100 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Testimonials */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Ils nous font 
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"> confiance</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Plus de 500 professionnels utilisent déjà FleetCheecks pour optimiser leurs opérations de convoyage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative bg-teal-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100">
                <Quote className="h-8 w-8 text-cyan-500 mb-4" />
                
                <div className="flex items-center mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-slate-700 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600">{testimonial.role}</p>
                    <p className="text-sm text-cyan-700 font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Nos partenaires de confiance</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {partners.map((partner, index) => (
              <div key={index} className="flex items-center space-x-3 bg-teal-50 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-cyan-100">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{partner.logo}</span>
                <span className="font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">{partner.name}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 inline-flex items-center space-x-2 bg-teal-50 px-4 py-2 rounded-full border border-cyan-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-teal-700 text-sm font-medium">+15 nouveaux partenaires ce mois</span>
          </div>
        </div>
      </div>
    </section>
  );
}