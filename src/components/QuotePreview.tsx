import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, EyeOff, X } from 'lucide-react';
import { Quote, CompanyInfo } from '@/hooks/useBilling';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Props {
  quote: Quote;
  companyInfo: CompanyInfo;
  isPreview?: boolean;
  onClose?: () => void;
}

export const QuotePreview: React.FC<Props> = ({ quote, companyInfo, isPreview = false, onClose }) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  const downloadPDF = async () => {
    const element = document.getElementById('quote-content');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
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
    pdf.save(`devis-${quote.quote_number}.pdf`);
  };

  return (
    <div className="space-y-6">
      {isPreview && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Aperçu du devis</h2>
          <div className="flex gap-2">
            <Button onClick={downloadPDF} className="bg-gradient-ocean">
              <Download className="w-4 h-4 mr-2" /> Télécharger PDF
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
          <div id="quote-content" className="bg-white text-gray-900 p-8 space-y-8">
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
                <h2 className="text-2xl font-bold text-blue-600">DEVIS</h2>
                <p className="text-lg font-semibold">{quote.quote_number}</p>
                <div className="text-sm text-gray-600">
                  <p>Date : {formatDate(quote.quote_date)}</p>
                  <p>Valable jusqu'au : {formatDate(quote.validity_date)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Client :</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                  {quote.client?.is_company ? (
                    <>
                      <p className="font-semibold">{quote.client.company_name}</p>
                      {quote.client.siret && <p>SIRET : {quote.client.siret}</p>}
                    </>
                  ) : (
                    <p className="font-semibold">{quote.client?.first_name} {quote.client?.last_name}</p>
                  )}
                  <p>{quote.client?.address}</p>
                  <p>{quote.client?.postal_code} {quote.client?.city}</p>
                  <p>{quote.client?.country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Mentions :</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
                  <p><span className="font-medium">Paiement :</span> {quote.payment_terms || 'À réception'}</p>
                  {quote.payment_method && <p><span className="font-medium">Mode :</span> {quote.payment_method}</p>}
                  <p className="text-xs text-gray-600 mt-2">Le devis doit être accepté avant la date de validité. Travaux/prestations après acceptation.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Détail des prestations :</h3>
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
                    {quote.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
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

            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Sous-total HT :</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(quote.subtotal_ht)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">TVA ({quote.vat_rate}%) :</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(quote.vat_amount)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-800">Total TTC :</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(quote.total_ttc)}</span>
                </div>
              </div>
            </div>

            {quote.notes && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Notes :</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{quote.notes}</p>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Mentions légales :</h3>
              <div className="space-y-1 text-xs text-gray-600">
                {companyInfo.siret && <p>SIRET : {companyInfo.siret}</p>}
                {companyInfo.vat_number && <p>N° TVA : {companyInfo.vat_number}</p>}
                <p>Devis valable jusqu'à la date indiquée. Prestations exécutées après acceptation du devis.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
