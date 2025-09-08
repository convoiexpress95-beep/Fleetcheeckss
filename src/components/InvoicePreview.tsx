import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, EyeOff, X } from 'lucide-react';
import { Invoice, CompanyInfo } from '@/hooks/useBilling';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoicePreviewProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  isPreview?: boolean;
  onClose?: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  companyInfo,
  isPreview = false,
  onClose
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const generateLegalMentions = () => {
    const mentions = [];
    
    if (companyInfo.siret) {
      mentions.push(`SIRET : ${companyInfo.siret}`);
    }
    if (companyInfo.vat_number) {
      mentions.push(`N° TVA : ${companyInfo.vat_number}`);
    }
    if (companyInfo.legal_form) {
      mentions.push(`Forme juridique : ${companyInfo.legal_form}`);
    }
    if (companyInfo.capital_amount) {
      mentions.push(`Capital social : ${formatCurrency(companyInfo.capital_amount)}`);
    }
    
    // Mentions légales obligatoires
    mentions.push("En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal.");
    mentions.push("Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.");
    
    return mentions;
  };

  const downloadPDF = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`facture-${invoice.invoice_number}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  return (
    <div className="space-y-6">
      {isPreview && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Aperçu de la facture
          </h2>
          <div className="flex gap-2">
            <Button onClick={downloadPDF} className="bg-gradient-cosmic">
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full hover:bg-white/10"
                title="Fermer"
                aria-label="Fermer l'aperçu"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <Card className="glass-card border-white/10 max-w-4xl mx-auto">
        <CardContent className="p-0">
          <div id="invoice-content" className="bg-white text-gray-900 p-8 space-y-8">
            {/* En-tête */}
            <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">{companyInfo.company_name}</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{companyInfo.address}</p>
                  <p>{companyInfo.postal_code} {companyInfo.city}</p>
                  <p>{companyInfo.country}</p>
                  {companyInfo.phone && <p>Tél : {companyInfo.phone}</p>}
                  {companyInfo.email && <p>Email : {companyInfo.email}</p>}
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <h2 className="text-2xl font-bold text-blue-600">FACTURE</h2>
                <p className="text-lg font-semibold">{invoice.invoice_number}</p>
                <div className="text-sm text-gray-600">
                  <p>Date : {formatDate(invoice.invoice_date)}</p>
                  <p>Échéance : {formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>

            {/* Informations client */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Facturé à :</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                  {invoice.client?.is_company ? (
                    <>
                      <p className="font-semibold">{invoice.client.company_name}</p>
                      {invoice.client.siret && <p>SIRET : {invoice.client.siret}</p>}
                    </>
                  ) : (
                    <p className="font-semibold">
                      {invoice.client?.first_name} {invoice.client?.last_name}
                    </p>
                  )}
                  <p>{invoice.client?.address}</p>
                  <p>{invoice.client?.postal_code} {invoice.client?.city}</p>
                  <p>{invoice.client?.country}</p>
                  {invoice.client?.email && <p>{invoice.client.email}</p>}
                  {invoice.client?.phone && <p>{invoice.client.phone}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Conditions :</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                  <p><span className="font-medium">Paiement :</span> {invoice.payment_terms}</p>
                  {invoice.payment_method && (
                    <p><span className="font-medium">Mode :</span> {invoice.payment_method}</p>
                  )}
                  <p><span className="font-medium">Statut :</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status === 'draft' ? 'Brouillon' :
                       invoice.status === 'sent' ? 'Envoyée' :
                       invoice.status === 'paid' ? 'Payée' :
                       invoice.status === 'overdue' ? 'En retard' :
                       invoice.status === 'cancelled' ? 'Annulée' : invoice.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Lignes de facturation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Prestations :</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Qté</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Prix HT</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">TVA</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{item.vat_rate}%</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(item.total_ht)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totaux */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Sous-total HT :</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(invoice.subtotal_ht)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">TVA ({invoice.vat_rate}%) :</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(invoice.vat_amount)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-800">Total TTC :</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(invoice.total_ttc)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Notes :</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{invoice.notes}</p>
                </div>
              </div>
            )}

            {/* Mentions légales */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Mentions légales :</h3>
              <div className="space-y-1">
                {generateLegalMentions().map((mention, index) => (
                  <p key={index} className="text-xs text-gray-600">{mention}</p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};