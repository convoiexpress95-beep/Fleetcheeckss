// React import not needed with modern JSX transform
import { FileText, Download, Archive, CheckCircle } from 'lucide-react';

export default function InvoicingSection() {
  return (
  <section className="py-24 bg-gradient-to-br from-teal-100 to-cyan-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content - Invoice Mockup */}
          <div className="relative">
            <div className="bg-teal-50 rounded-2xl shadow-2xl p-8 transform rotate-2 border border-cyan-100">
              <div className="border-b border-slate-200 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">FleetCheecks</h3>
                    <p className="text-slate-600">Plateforme de convoyage</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">FACTURE</div>
                    <div className="text-lg font-bold text-slate-900">#FR-2024-001</div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Émetteur</h4>
                    <p className="text-sm text-slate-600">
                      Transport Express<br/>
                      123 Rue de la Paix<br/>
                      75001 Paris
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Destinataire</h4>
                    <p className="text-sm text-slate-600">
                      Auto Concession Lyon<br/>
                      456 Avenue de la République<br/>
                      69000 Lyon
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left text-sm font-semibold text-slate-900 py-2">Description</th>
                      <th className="text-right text-sm font-semibold text-slate-900 py-2">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 text-sm text-slate-600">Convoyage BMW Série 3 - Paris → Lyon</td>
                      <td className="text-right py-2 text-sm text-slate-900 font-medium">€350.00</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-sm text-slate-600">Inspection véhicule + rapport</td>
                      <td className="text-right py-2 text-sm text-slate-900 font-medium">€50.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-900">Total TTC</span>
                  <span className="text-xl font-bold text-cyan-600">€400.00</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Payée le 15/01/2024</span>
              </div>
            </div>
            
            {/* Floating devis */}
            <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-6 rounded-xl shadow-xl transform -rotate-3">
              <div className="text-sm opacity-90">Devis automatique</div>
              <div className="text-lg font-bold">€350 - €450</div>
              <div className="text-xs opacity-75">Généré en 2 sec</div>
            </div>
          </div>
          
          {/* Right Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-teal-100 border border-cyan-200">
                <FileText className="h-4 w-4 text-cyan-700 mr-2" />
                <span className="text-cyan-800 text-sm font-medium">Facturation automatisée</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Factures & Devis 
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> professionnels</span>
              </h2>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Générateur automatique de factures et devis conformes aux normes légales. Archivage sécurisé et téléchargement PDF instantané.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Génération automatique</h3>
                  <p className="text-slate-600">Factures et devis créés automatiquement à partir des données de mission.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Export PDF instantané</h3>
                  <p className="text-slate-600">Téléchargez vos documents au format PDF professionnel en un clic.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Archive className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Archivage sécurisé</h3>
                  <p className="text-slate-600">Tous vos documents conservés de manière sécurisée et accessible 24/7.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-cyan-100">
              <h4 className="font-semibold text-slate-900 mb-2">✨ Conforme aux normes légales</h4>
              <p className="text-slate-600 text-sm">Toutes nos factures respectent la législation française en vigueur avec numérotation automatique et mentions obligatoires.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}