import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, FileText, Search } from 'lucide-react';
import { useBilling, type Client, type InvoiceItem } from '@/hooks/useBilling';
import { toast } from '@/hooks/use-toast';

interface CreateInvoiceDialogProps {
  trigger?: React.ReactNode;
  onInvoiceCreated?: () => void;
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({
  trigger,
  onInvoiceCreated
}) => {
  const { clients, createInvoice, addInvoiceItems, validateSiret, saveClient, loading } = useBilling();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'client' | 'details' | 'items'>('client');
  
  // État du client
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

  // État de la facture
  const [invoiceDetails, setInvoiceDetails] = useState({
    due_date: '',
    payment_terms: 'Paiement à 30 jours',
    payment_method: 'Virement bancaire',
    notes: '',
    vat_rate: 20
  });

  // État des lignes
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      total_ht: 0,
      vat_rate: 20
    }
  ]);

  const resetForm = () => {
    setStep('client');
    setSelectedClientId('');
    setNewClient({
      is_company: true,
      address: '',
      postal_code: '',
      city: '',
      country: 'France'
    });
    setClientSearchSiret('');
    setIsNewClient(false);
    setInvoiceDetails({
      due_date: '',
      payment_terms: 'Paiement à 30 jours',
      payment_method: 'Virement bancaire',
      notes: '',
      vat_rate: 20
    });
    setItems([{
      description: '',
      quantity: 1,
      unit_price: 0,
      total_ht: 0,
      vat_rate: 20
    }]);
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
      toast({
        title: "Informations récupérées",
        description: "Les informations de l'entreprise ont été récupérées automatiquement.",
      });
    }
  };

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unit_price: 0,
      total_ht: 0,
      vat_rate: 20
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    // Recalculer le total HT
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total_ht = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotalHt = items.reduce((sum, item) => sum + item.total_ht, 0);
    const vatAmount = subtotalHt * (invoiceDetails.vat_rate / 100);
    const totalTtc = subtotalHt + vatAmount;
    
    return { subtotalHt, vatAmount, totalTtc };
  };

  const handleCreateInvoice = async () => {
    let clientId = selectedClientId;
    
    // Créer le client si nécessaire
    if (isNewClient) {
      const saved = await saveClient(newClient as Client);
      if (!saved) return;
      
      // Récupérer l'ID du client créé
      const savedClient = clients.find(c => 
        c.company_name === newClient.company_name || 
        (c.first_name === newClient.first_name && c.last_name === newClient.last_name)
      );
      if (savedClient) {
        clientId = savedClient.id!;
      }
    }

    if (!clientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou créer un client.",
        variant: "destructive"
      });
      return;
    }

    // Calculer les totaux
    const { subtotalHt, vatAmount, totalTtc } = calculateTotals();

    // Créer la facture
    const invoice = await createInvoice({
      client_id: clientId,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: invoiceDetails.due_date,
      subtotal_ht: subtotalHt,
      vat_rate: invoiceDetails.vat_rate,
      vat_amount: vatAmount,
      total_ttc: totalTtc,
      payment_terms: invoiceDetails.payment_terms,
      payment_method: invoiceDetails.payment_method,
      notes: invoiceDetails.notes,
      legal_mentions: 'En cas de retard de paiement, des pénalités seront appliquées au taux de 3 fois le taux légal. Une indemnité forfaitaire de 40€ sera due pour frais de recouvrement.'
    });

    if (invoice) {
      // Ajouter les lignes
      await addInvoiceItems(invoice.id, items);
      
      setOpen(false);
      resetForm();
      onInvoiceCreated?.();
    }
  };

  const defaultTrigger = (
    <Button className="bg-gradient-cosmic hover:scale-105 transition-all duration-300 glow-hover">
      <Plus className="w-4 h-4 mr-2" />
      Nouvelle facture légale
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Créer une facture légale
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
                <Button
                  variant="outline"
                  onClick={() => setIsNewClient(!isNewClient)}
                  className="glass-card text-foreground border-border"
                >
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
                        <input
                          type="radio"
                          checked={newClient.is_company}
                          onChange={() => setNewClient({...newClient, is_company: true})}
                        />
                        Entreprise
                      </label>
                      <label className="flex items-center gap-2 text-foreground">
                        <input
                          type="radio"
                          checked={!newClient.is_company}
                          onChange={() => setNewClient({...newClient, is_company: false})}
                        />
                        Particulier
                      </label>
                    </div>
                  </div>

                  {newClient.is_company && (
                    <div className="grid gap-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="SIRET"
                          value={clientSearchSiret}
                          onChange={(e) => setClientSearchSiret(e.target.value)}
                          className="glass-card border-white/20 bg-white/5 text-white"
                        />
                        <Button
                          onClick={handleSiretValidation}
                          disabled={loading}
                          className="bg-gradient-ocean"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Valider
                        </Button>
                      </div>
                      <Input
                        placeholder="Nom de l'entreprise"
                        value={newClient.company_name || ''}
                        onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                        className="glass-card border-white/20 bg-white/5 text-white"
                      />
                    </div>
                  )}

                  {!newClient.is_company && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Prénom"
                        value={newClient.first_name || ''}
                        onChange={(e) => setNewClient({...newClient, first_name: e.target.value})}
                        className="glass-card border-white/20 bg-white/5 text-white"
                      />
                      <Input
                        placeholder="Nom"
                        value={newClient.last_name || ''}
                        onChange={(e) => setNewClient({...newClient, last_name: e.target.value})}
                        className="glass-card border-white/20 bg-white/5 text-white"
                      />
                    </div>
                  )}

                  <Textarea
                    placeholder="Adresse complète"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="glass-card border-white/20 bg-white/5 text-white"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Code postal"
                      value={newClient.postal_code}
                      onChange={(e) => setNewClient({...newClient, postal_code: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                    />
                    <Input
                      placeholder="Ville"
                      value={newClient.city}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Téléphone"
                      value={newClient.phone || ''}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newClient.email || ''}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setStep('details')}
                disabled={!selectedClientId && !isNewClient}
                className="bg-gradient-cosmic"
              >
                Suivant : Détails de la facture
              </Button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-foreground">Date d'échéance</Label>
                <Input
                  type="date"
                  value={invoiceDetails.due_date}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, due_date: e.target.value})}
                  className="glass-card border-white/20 bg-white/5 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-foreground">Taux de TVA (%)</Label>
                <Input
                  type="number"
                  value={invoiceDetails.vat_rate}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, vat_rate: parseFloat(e.target.value)})}
                  className="glass-card border-white/20 bg-white/5 text-white"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-foreground">Conditions de paiement</Label>
              <Select 
                value={invoiceDetails.payment_terms} 
                onValueChange={(value) => setInvoiceDetails({...invoiceDetails, payment_terms: value})}
              >
                <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="Paiement à réception">Paiement à réception</SelectItem>
                  <SelectItem value="Paiement à 15 jours">Paiement à 15 jours</SelectItem>
                  <SelectItem value="Paiement à 30 jours">Paiement à 30 jours</SelectItem>
                  <SelectItem value="Paiement à 45 jours">Paiement à 45 jours</SelectItem>
                  <SelectItem value="Paiement à 60 jours">Paiement à 60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-foreground">Mode de règlement</Label>
              <Select 
                value={invoiceDetails.payment_method} 
                onValueChange={(value) => setInvoiceDetails({...invoiceDetails, payment_method: value})}
              >
                <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                  <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                  <SelectItem value="Prélèvement">Prélèvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-foreground">Notes</Label>
              <Textarea
                placeholder="Notes ou commentaires sur la facture"
                value={invoiceDetails.notes}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, notes: e.target.value})}
                className="glass-card border-white/20 bg-white/5 text-white"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('client')} className="glass-card text-foreground border-border">
                Retour
              </Button>
              <Button onClick={() => setStep('items')} className="bg-gradient-cosmic">
                Suivant : Lignes de facturation
              </Button>
            </div>
          </div>
        )}

        {step === 'items' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-foreground text-lg">Lignes de facturation</Label>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <Textarea
                        placeholder="Description de la prestation"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="glass-card border-white/20 bg-white/5 text-white"
                      />

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label className="text-foreground text-sm">Quantité</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="glass-card border-white/20 bg-white/5 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground text-sm">Prix unitaire HT</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="glass-card border-white/20 bg-white/5 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground text-sm">TVA (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.vat_rate}
                            onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                            className="glass-card border-white/20 bg-white/5 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-foreground text-sm">Total HT</Label>
                          <Input
                            type="number"
                            value={item.total_ht.toFixed(2)}
                            readOnly
                            className="glass-card border-white/20 bg-white/10 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Récapitulatif des totaux */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-foreground">
                    <span>Total HT:</span>
                    <span>{calculateTotals().subtotalHt.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>TVA ({invoiceDetails.vat_rate}%):</span>
                    <span>{calculateTotals().vatAmount.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-2">
                    <span>Total TTC:</span>
                    <span>{calculateTotals().totalTtc.toFixed(2)} €</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('details')} className="glass-card text-foreground border-border">
                Retour
              </Button>
              <Button 
                onClick={handleCreateInvoice} 
                disabled={loading || items.some(item => !item.description || item.unit_price <= 0)}
                className="bg-gradient-cosmic"
              >
                {loading ? 'Création...' : 'Créer la facture'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};