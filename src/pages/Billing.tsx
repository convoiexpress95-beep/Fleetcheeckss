import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Euro, TrendingUp, PieChart, Calendar, Download, Plus, CreditCard, Receipt, Building, Users, FileText, Settings, Search, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useBilling, type CompanyInfo, type Invoice } from '@/hooks/useBilling';
import { CreateInvoiceDialog } from '@/components/CreateInvoiceDialog';
import { InvoicePreview } from '@/components/InvoicePreview';
import { toast } from '@/hooks/use-toast';

const Billing = () => {
  const { 
    loading, 
    companyInfo, 
    clients, 
    invoices, 
    saveCompanyInfo, 
    validateSiret, 
    updateInvoiceStatus,
    loadInvoices
  } = useBilling();
  
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyInfo>({
    company_name: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'France'
  });
  const [siretSearch, setSiretSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Charger les informations de l'entreprise au démarrage
  useEffect(() => {
    if (companyInfo) {
      setCompanyData(companyInfo);
    }
  }, [companyInfo]);

  // Calculer les statistiques à partir des vraies données
  const calculateStats = () => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_ttc, 0);
    
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    
    return {
      totalRevenue: totalRevenue.toFixed(2),
      pendingInvoices,
      paidInvoices,
      totalInvoices: invoices.length
    };
  };

  const stats = calculateStats();

  const handleSiretValidation = async () => {
    if (!siretSearch) return;
    
    const companyData = await validateSiret(siretSearch);
    if (companyData) {
      setCompanyData(prev => ({
        ...prev,
        company_name: companyData.company_name,
        siret: companyData.siret,
        address: companyData.address,
        postal_code: companyData.postal_code,
        city: companyData.city,
        country: companyData.country,
        legal_form: companyData.legal_form,
        // Autres champs disponibles que l'utilisateur peut remplir manuellement
      }));
      toast({
        title: "Informations récupérées",
        description: `Les informations de ${companyData.company_name} ont été récupérées automatiquement.`,
      });
    }
  };

  const handleSaveCompany = async () => {
    const success = await saveCompanyInfo(companyData);
    if (success) {
      setCompanyDialogOpen(false);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      draft: { label: 'Brouillon', color: 'bg-gray-500' },
      sent: { label: 'Envoyée', color: 'bg-gradient-cosmic' },
      paid: { label: 'Payée', color: 'bg-gradient-ocean' },
      overdue: { label: 'En retard', color: 'bg-gradient-sunset' },
      cancelled: { label: 'Annulée', color: 'bg-red-500' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={`${config.color} text-white border-0`}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const downloadInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice && companyInfo) {
      setSelectedInvoice(invoice);
      // Le téléchargement se fera via le composant InvoicePreview
    }
  };

  const previewInvoice = (invoice: Invoice) => {
    if (companyInfo) {
      setSelectedInvoice(invoice);
      setPreviewMode(true);
    } else {
      toast({
        title: "Configuration requise",
        description: "Veuillez d'abord configurer les informations de votre entreprise.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    await updateInvoiceStatus(invoiceId, newStatus);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-blue-900/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-aurora opacity-5"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-cosmic rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-sunset rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-cosmic rounded-2xl glow animate-pulse-glow">
              <Euro className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Facturation Légale Avancée
              </h1>
              <p className="text-foreground/80 text-lg">
                Système complet avec validation INSEE et conformité légale française
              </p>
            </div>
          </div>
          
          {/* Company Setup Button */}
          <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-royal hover:scale-105 transition-all duration-300 glow-hover">
                <Building className="w-4 h-4 mr-2" />
                {companyInfo ? 'Modifier entreprise' : 'Configurer entreprise'}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informations légales de l'entreprise
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Ces informations apparaîtront sur toutes vos factures. La validation SIRET via l'API INSEE est automatique.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Validation SIRET */}
                <div className="grid gap-4">
                  <Label className="text-foreground">Validation automatique via API INSEE</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Numéro SIRET (14 chiffres)"
                      value={siretSearch}
                      onChange={(e) => setSiretSearch(e.target.value)}
                      className="glass-card border-white/20 bg-white/5 text-white"
                    />
                    <Button
                      onClick={handleSiretValidation}
                      disabled={loading || !siretSearch}
                      className="bg-gradient-ocean"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Valider INSEE
                    </Button>
                  </div>
                </div>

                {/* Informations de l'entreprise */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-foreground">Raison sociale *</Label>
                    <Input
                      value={companyData.company_name}
                      onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-foreground">SIRET</Label>
                    <Input
                      value={companyData.siret || ''}
                      onChange={(e) => setCompanyData({...companyData, siret: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="12345678901234"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-foreground">N° TVA Intracommunautaire</Label>
                    <Input
                      value={companyData.vat_number || ''}
                      onChange={(e) => setCompanyData({...companyData, vat_number: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <Label className="text-foreground">Adresse complète *</Label>
                  <Textarea
                    value={companyData.address}
                    onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                    className="glass-card border-white/20 bg-white/5 text-white"
                    placeholder="Numéro, rue, bâtiment..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Code postal *</Label>
                    <Input
                      value={companyData.postal_code}
                      onChange={(e) => setCompanyData({...companyData, postal_code: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="75001"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-foreground">Ville *</Label>
                    <Input
                      value={companyData.city}
                      onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="Paris"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Téléphone</Label>
                    <Input
                      value={companyData.phone || ''}
                      onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-foreground">Email</Label>
                    <Input
                      value={companyData.email || ''}
                      onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="contact@entreprise.fr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Forme juridique</Label>
                    <Select 
                      value={companyData.legal_form || ''} 
                      onValueChange={(value) => setCompanyData({...companyData, legal_form: value})}
                    >
                      <SelectTrigger className="glass-card border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="SARL">SARL</SelectItem>
                        <SelectItem value="SAS">SAS</SelectItem>
                        <SelectItem value="SASU">SASU</SelectItem>
                        <SelectItem value="EURL">EURL</SelectItem>
                        <SelectItem value="SA">SA</SelectItem>
                        <SelectItem value="SNC">SNC</SelectItem>
                        <SelectItem value="Auto-entrepreneur">Auto-entrepreneur</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-foreground">Capital social (€)</Label>
                    <Input
                      type="number"
                      value={companyData.capital_amount || ''}
                      onChange={(e) => setCompanyData({...companyData, capital_amount: parseFloat(e.target.value) || undefined})}
                      className="glass-card border-white/20 bg-white/5 text-white"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleSaveCompany}
                  disabled={loading || !companyData.company_name || !companyData.address}
                  className="bg-gradient-cosmic"
                >
                  {loading ? 'Sauvegarde...' : 'Sauvegarder les informations'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Company Status Alert */}
        {!companyInfo && (
          <Card className="glass-card border-amber-500/30 bg-amber-500/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <div>
                  <h3 className="text-amber-200 font-semibold text-lg">Configuration entreprise requise</h3>
                  <p className="text-amber-100/80">
                    Veuillez configurer les informations légales de votre entreprise avant de créer des factures conformes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {formatCurrency(parseFloat(stats.totalRevenue))}
                  </p>
                  <p className="text-xs text-muted-foreground">Factures payées</p>
                </div>
                <div className="p-3 bg-gradient-ocean rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Factures payées</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                    {stats.paidInvoices}
                  </p>
                  <p className="text-xs text-muted-foreground">Encaissées</p>
                </div>
                <div className="p-3 bg-gradient-cosmic rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">En attente</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                    {stats.pendingInvoices}
                  </p>
                  <p className="text-xs text-muted-foreground">À encaisser</p>
                </div>
                <div className="p-3 bg-gradient-sunset rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:scale-105 transition-all duration-500 animate-fade-in animation-delay-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total factures</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    {stats.totalInvoices}
                  </p>
                  <p className="text-xs text-muted-foreground">Émises</p>
                </div>
                <div className="p-3 bg-gradient-royal rounded-xl">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="invoices" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 glass-card border-white/10 mb-8">
            <TabsTrigger value="invoices" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
              <Receipt className="w-4 h-4 mr-2" />
              Factures légales ({stats.totalInvoices})
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-gradient-ocean data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Clients ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-royal data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            {/* Invoice Actions */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Gestion des Factures Légales
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Numérotation séquentielle automatique • Conformité légale française • Validation INSEE
                    </CardDescription>
                  </div>
                  <CreateInvoiceDialog 
                    onInvoiceCreated={() => loadInvoices()}
                  />
                </div>
              </CardHeader>
            </Card>

            {/* Invoices List */}
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <Card className="glass-card border-white/10">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl text-muted-foreground mb-2">Aucune facture créée</h3>
                    <p className="text-muted-foreground/50 mb-6">
                      Créez votre première facture légale avec numérotation automatique
                    </p>
                    <CreateInvoiceDialog 
                      onInvoiceCreated={() => loadInvoices()}
                    />
                  </CardContent>
                </Card>
              ) : (
                invoices.map((invoice, index) => (
                  <Card key={invoice.id} className="glass-card border-white/10 hover:scale-[1.02] transition-all duration-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-cosmic rounded-lg">
                            <Receipt className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{invoice.invoice_number}</h3>
                            <p className="text-muted-foreground">
                              {invoice.client?.is_company 
                                ? invoice.client.company_name 
                                : `${invoice.client?.first_name} ${invoice.client?.last_name}`
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Émise le {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')} • 
                              Échéance: {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                              {formatCurrency(invoice.total_ttc)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              HT: {formatCurrency(invoice.subtotal_ht)} • TVA: {formatCurrency(invoice.vat_amount)}
                            </p>
                          </div>
                          {getStatusBadge(invoice.status)}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card text-foreground border-border hover:bg-accent/10"
                              onClick={() => previewInvoice(invoice)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select
                              value={invoice.status}
                              onValueChange={(value: Invoice['status']) => handleStatusChange(invoice.id!, value)}
                            >
                              <SelectTrigger className="w-32 glass-card border-white/20 bg-white/5 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-card border-white/20">
                                <SelectItem value="draft">Brouillon</SelectItem>
                                <SelectItem value="sent">Envoyée</SelectItem>
                                <SelectItem value="paid">Payée</SelectItem>
                                <SelectItem value="overdue">En retard</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="glass-card text-foreground border-border hover:bg-accent/10"
                              onClick={() => downloadInvoice(invoice.id!)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Gestion des Clients
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Base de données clients avec validation SIRET automatique
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl text-muted-foreground mb-2">Aucun client enregistré</h3>
                    <p className="text-muted-foreground/50">
                      Les clients seront ajoutés automatiquement lors de la création de factures
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">
                            {client.is_company 
                              ? client.company_name 
                              : `${client.first_name} ${client.last_name}`
                            }
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {client.address}, {client.postal_code} {client.city}
                          </p>
                          {client.siret && (
                            <p className="text-muted-foreground text-xs">SIRET: {client.siret}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="border-border text-foreground">
                          {client.is_company ? 'Entreprise' : 'Particulier'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Configuration du Système
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Paramètres de facturation et conformité légale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Validation API INSEE</h4>
                      <p className="text-muted-foreground text-sm">
                        Validation automatique des numéros SIRET via l'API officielle INSEE
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Numérotation séquentielle</h4>
                      <p className="text-muted-foreground text-sm">
                        Numérotation automatique des factures respectant la législation
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Conformité légale française</h4>
                       <p className="text-muted-foreground text-sm">
                        Toutes les mentions légales obligatoires incluses automatiquement
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass-card border-white/10 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Calculs automatiques</h4>
                      <p className="text-muted-foreground text-sm">
                        TVA, totaux HT/TTC calculés automatiquement avec précision
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invoice Preview Modal */}
      {previewMode && selectedInvoice && companyInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <InvoicePreview
              invoice={selectedInvoice}
              companyInfo={companyInfo}
              isPreview={true}
              onClose={() => {
                setPreviewMode(false);
                setSelectedInvoice(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;