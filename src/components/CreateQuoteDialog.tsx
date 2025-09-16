import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, FileText, Search } from 'lucide-react';
import { useBilling, type Client, type QuoteItem } from '@/hooks/useBilling';
import { useToast } from '@/hooks';

interface Props {
  trigger?: React.ReactNode;
  onQuoteCreated?: () => void;
}

export const CreateQuoteDialog: React.FC<Props> = ({ trigger, onQuoteCreated }) => {
  const { toast } = useToast();
  const { clients, validateSiret, saveClient, createQuote, addQuoteItems, loading } = useBilling();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'client' | 'details' | 'items'>('client');

  // Client
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClient, setNewClient] = useState<Partial<Client>>({
    is_company: true,
    address: '',
    postal_code: '',
    city: '',
    country: 'France'
  });
  const [clientSearchSiret, setClientSearchSiret] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);

  // Details du devis
  const [quoteDetails, setQuoteDetails] = useState({
    validity_date: '',
    vat_rate: 20,
    payment_terms: 'Paiement à réception',
    payment_method: 'Virement bancaire',
    notes: ''
  });

  // Lignes
  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unit_price: 0, total_ht: 0, vat_rate: 20 }
  ]);

  const resetForm = () => {
    setStep('client');
    setSelectedClientId('');
    setNewClient({ is_company: true, address: '', postal_code: '', city: '', country: 'France' });
    setClientSearchSiret('');
    setIsNewClient(false);
    setQuoteDetails({ validity_date: '', vat_rate: 20, payment_terms: 'Paiement à réception', payment_method: 'Virement bancaire', notes: '' });
    setItems([{ description: '', quantity: 1, unit_price: 0, total_ht: 0, vat_rate: 20 }]);
  };

  const handleSiretValidation = async () => {
    if (!clientSearchSiret) return;
    const companyData = await validateSiret(clientSearchSiret);
    if (companyData) {
      setNewClient({
        ...newClient,
        company_name: companyData.company_name,
        siret: companyData.siret,
        address: companyData.address,
        postal_code: companyData.postal_code,
        city: companyData.city,
        country: companyData.country,
        is_company: true
      });
      toast({ title: 'Informations récupérées', description: "Les informations de l'entreprise ont été importées." });
    }
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0, total_ht: 0, vat_rate: quoteDetails.vat_rate }]);
  const removeItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value } as QuoteItem;
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_ht = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
    }
    setItems(updated);
  };

  const calcTotals = () => {
    const subtotal_ht = items.reduce((s, i) => s + (i.total_ht || 0), 0);
    const vat_amount = subtotal_ht * (quoteDetails.vat_rate / 100);
    const total_ttc = subtotal_ht + vat_amount;
    return { subtotal_ht, vat_amount, total_ttc };
  };

  const handleCreateQuote = async () => {
    let clientId = selectedClientId;
    if (isNewClient) {
      const saved = await saveClient(newClient as Client);
      if (!saved) return;
      const savedClient = clients.find(c => c.siret === newClient.siret || c.company_name === newClient.company_name);
      if (savedClient?.id) clientId = savedClient.id;
    }
    if (!clientId) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner ou créer un client.', variant: 'destructive' });
      return;
    }

    const totals = calcTotals();
    const quote = await createQuote({
      client_id: clientId,
      quote_date: new Date().toISOString().split('T')[0],
      validity_date: quoteDetails.validity_date,
      subtotal_ht: totals.subtotal_ht,
      vat_rate: quoteDetails.vat_rate,
      vat_amount: totals.vat_amount,
      total_ttc: totals.total_ttc,
      payment_terms: quoteDetails.payment_terms,
      payment_method: quoteDetails.payment_method,
      notes: quoteDetails.notes
    });
    if (quote && (quote as any).id) {
      await addQuoteItems((quote as any).id, items);
      setOpen(false);
      resetForm();
      onQuoteCreated?.();
    }
  };

  const defaultTrigger = (
    <Button className="bg-gradient-ocean hover:scale-105 transition-all duration-300 glow-hover">
      <Plus className="w-4 h-4 mr-2" />
      Nouveau devis légal
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Créer un devis légal
          </DialogTitle>
        </DialogHeader>

        {step === 'client' && (
          <div className="space-y-6">
            <div className="grid gap-4">
              <Label className="text-foreground">Sélectionner un client</Label>
              <div className="flex gap-2">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Choisir un client existant" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id!}>
                        {client.is_company ? client.company_name : `${client.first_name} ${client.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setIsNewClient(!isNewClient)} className="glass-card text-foreground border-border">
                  {isNewClient ? 'Annuler' : 'Nouveau client'}
                </Button>
              </div>
            </div>

            {isNewClient && (
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Nouveau client</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-foreground">Type de client</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-foreground">
                        <input type="radio" checked={newClient.is_company} onChange={() => setNewClient({...newClient, is_company: true})} />
                        Entreprise
                      </label>
                      <label className="flex items-center gap-2 text-foreground">
                        <input type="radio" checked={!newClient.is_company} onChange={() => setNewClient({...newClient, is_company: false})} />
                        Particulier
                      </label>
                    </div>
                  </div>

                  {newClient.is_company && (
                    <div className="grid gap-4">
                      <div className="flex gap-2">
                        <Input placeholder="SIRET" value={clientSearchSiret} onChange={(e) => setClientSearchSiret(e.target.value)} className="glass-card border-white/20 bg-white/5 text-white" />
                        <Button onClick={handleSiretValidation} disabled={loading} className="bg-gradient-ocean">
                          <Search className="w-4 h-4 mr-2" />
                          Valider
                        </Button>
                      </div>
                      <Input placeholder="Nom de l'entreprise" value={newClient.company_name || ''} onChange={(e) => setNewClient({...newClient, company_name: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                    </div>
                  )}

                  {!newClient.is_company && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Prénom" value={newClient.first_name || ''} onChange={(e) => setNewClient({...newClient, first_name: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                      <Input placeholder="Nom" value={newClient.last_name || ''} onChange={(e) => setNewClient({...newClient, last_name: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                    </div>
                  )}

                  <Textarea placeholder="Adresse complète" value={newClient.address} onChange={(e) => setNewClient({...newClient, address: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Code postal" value={newClient.postal_code} onChange={(e) => setNewClient({...newClient, postal_code: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                    <Input placeholder="Ville" value={newClient.city} onChange={(e) => setNewClient({...newClient, city: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Téléphone" value={newClient.phone || ''} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                    <Input placeholder="Email" type="email" value={newClient.email || ''} onChange={(e) => setNewClient({...newClient, email: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep('details')} disabled={!selectedClientId && !isNewClient} className="bg-gradient-ocean">
                Suivant : Détails du devis
              </Button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-foreground">Validité du devis</Label>
                <Input type="date" value={quoteDetails.validity_date} onChange={(e) => setQuoteDetails({...quoteDetails, validity_date: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
              </div>
              <div className="grid gap-2">
                <Label className="text-foreground">Taux de TVA (%)</Label>
                <Input type="number" value={quoteDetails.vat_rate} onChange={(e) => setQuoteDetails({...quoteDetails, vat_rate: parseFloat(e.target.value)})} className="glass-card border-white/20 bg-white/5 text-white" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-foreground">Conditions de paiement</Label>
              <Select value={quoteDetails.payment_terms} onValueChange={(v) => setQuoteDetails({...quoteDetails, payment_terms: v})}>
                <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="Paiement à réception">Paiement à réception</SelectItem>
                  <SelectItem value="Paiement à 15 jours">Paiement à 15 jours</SelectItem>
                  <SelectItem value="Paiement à 30 jours">Paiement à 30 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-foreground">Mode de règlement</Label>
              <Select value={quoteDetails.payment_method} onValueChange={(v) => setQuoteDetails({...quoteDetails, payment_method: v})}>
                <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                  <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-foreground">Notes</Label>
              <Textarea placeholder="Notes ou commentaires" value={quoteDetails.notes} onChange={(e) => setQuoteDetails({...quoteDetails, notes: e.target.value})} className="glass-card border-white/20 bg-white/5 text-white" />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('client')} className="glass-card text-foreground border-border">Retour</Button>
              <Button onClick={() => setStep('items')} className="bg-gradient-ocean">Suivant : Lignes</Button>
            </div>
          </div>
        )}

        {step === 'items' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-foreground text-lg">Lignes du devis</Label>
                <Button onClick={addItem} className="bg-gradient-ocean">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>

              {items.map((item, index) => (
                <Card key={index} className="glass-card border-white/10">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-medium">Ligne {index + 1}</h4>
                      {items.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeItem(index)} className="text-red-400 border-red-400/20 hover:bg-red-400/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <Textarea placeholder="Description de la prestation" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} className="glass-card border-white/20 bg-white/5 text-white" />

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-foreground text-sm">Quantité</Label>
                          <Input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} className="glass-card border-white/20 bg-white/5 text-white" />
                        </div>
                        <div>
                          <Label className="text-foreground text-sm">Prix unitaire HT</Label>
                          <Input type="number" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="glass-card border-white/20 bg-white/5 text-white" />
                        </div>
                        <div>
                          <Label className="text-foreground text-sm">TVA (%)</Label>
                          <Input type="number" step="0.01" value={item.vat_rate} onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value) || 0)} className="glass-card border-white/20 bg-white/5 text-white" />
                        </div>
                        <div>
                          <Label className="text-foreground text-sm">Total HT</Label>
                          <Input type="number" value={item.total_ht.toFixed(2)} readOnly className="glass-card border-white/20 bg-white/10 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Récap */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-foreground">
                    <span>Total HT:</span>
                    <span>{calcTotals().subtotal_ht.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>TVA ({quoteDetails.vat_rate}%):</span>
                    <span>{calcTotals().vat_amount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-2">
                    <span>Total TTC:</span>
                    <span>{calcTotals().total_ttc.toFixed(2)} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('details')} className="glass-card text-foreground border-border">Retour</Button>
              <Button onClick={handleCreateQuote} disabled={loading || !quoteDetails.validity_date || items.some(i => !i.description || i.unit_price <= 0)} className="bg-gradient-ocean">
                {loading ? 'Création...' : 'Créer le devis'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
