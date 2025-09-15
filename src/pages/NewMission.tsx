import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Car, 
  FileText, 
  CreditCard, 
  CheckCircle,
  Clock,
  Euro,
  AlertCircle,
  Shield,
  Zap,
  Sparkles,
  User,
  Phone,
  Mail,
  Calendar,
  Route,
  Settings,
  Star,
  Upload,
  Save,
  Eye,
  Trash2,
  Plus,
  Camera,
  FileImage
} from 'lucide-react';

const NewMission = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [savedDraft, setSavedDraft] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal',
    category: 'transport',
    // Client info
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientNotes: '',
    // Location & timing
    departureAddress: '',
    arrivalAddress: '',
    departureDate: '',
    arrivalDate: '',
    flexibility: false,
    estimatedDistance: '',
    estimatedDuration: '',
    // Vehicle details
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleLicensePlate: '',
    vehicleColor: '',
    vehicleCondition: 'excellent',
    vehicleValue: '',
    vehiclePhotos: [],
    // Special conditions
    specialInstructions: '',
    insuranceRequired: true,
    securityLevel: 'standard',
    fragileItems: false,
    weatherRestrictions: false,
    timeRestrictions: [],
    // Budget & payment
    budget: '',
    paymentTerms: 'completion',
    paymentMethod: 'transfer',
    depositRequired: false,
    depositAmount: '',
    // Additional services
    loadingAssistance: false,
    trackingRequired: true,
    photoReports: true,
    expressDelivery: false,
    insuranceCoverage: 'basic'
  });

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (formData.title || formData.description) {
        localStorage.setItem('mission_draft', JSON.stringify(formData));
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
      }
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const savedDraftData = localStorage.getItem('mission_draft');
    if (savedDraftData) {
      try {
        const parsedData = JSON.parse(savedDraftData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('mission_draft');
    setFormData({
      title: '',
      description: '',
      priority: 'normal',
      category: 'transport',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientNotes: '',
      departureAddress: '',
      arrivalAddress: '',
      departureDate: '',
      arrivalDate: '',
      flexibility: false,
      estimatedDistance: '',
      estimatedDuration: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleLicensePlate: '',
      vehicleColor: '',
      vehicleCondition: 'excellent',
      vehicleValue: '',
      vehiclePhotos: [],
      specialInstructions: '',
      insuranceRequired: true,
      securityLevel: 'standard',
      fragileItems: false,
      weatherRestrictions: false,
      timeRestrictions: [],
      budget: '',
      paymentTerms: 'completion',
      paymentMethod: 'transfer',
      depositRequired: false,
      depositAmount: '',
      loadingAssistance: false,
      trackingRequired: true,
      photoReports: true,
      expressDelivery: false,
      insuranceCoverage: 'basic'
    });
  };

  const handleSubmit = () => {
    console.log('Mission data:', formData);
    localStorage.removeItem('mission_draft');
    navigate('/missions');
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.title && formData.description;
      case 2:
        return formData.clientName && formData.clientEmail;
      case 3:
        return formData.departureAddress && formData.arrivalAddress;
      case 4:
        return formData.vehicleMake && formData.vehicleModel;
      case 5:
        return true; // Optional step
      case 6:
        return formData.budget;
      default:
        return true;
    }
  };

  const steps = [
    { id: 1, title: 'Mission', icon: FileText, description: 'Détails de base' },
    { id: 2, title: 'Client', icon: User, description: 'Informations client' },
    { id: 3, title: 'Itinéraire', icon: MapPin, description: 'Départ et arrivée' },
    { id: 4, title: 'Véhicule', icon: Car, description: 'Détails du véhicule' },
    { id: 5, title: 'Options', icon: Settings, description: 'Services additionnels' },
    { id: 6, title: 'Budget', icon: CreditCard, description: 'Prix et paiement' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Détails de la Mission</h2>
              <p className="text-gray-400">Commençons par les informations essentielles</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-gray-200 font-medium mb-2 block">
                  Titre de la mission *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ex: Transport BMW Série 3 Paris - Lyon"
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-200 font-medium mb-2 block">
                  Description détaillée *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Décrivez votre mission en détail..."
                  rows={4}
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-200 font-medium mb-3 block">
                    Priorité de la mission
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: 'low', label: 'Standard', icon: Clock, color: 'from-blue-500 to-blue-600', desc: 'Délai flexible' },
                      { value: 'normal', label: 'Urgent', icon: Zap, color: 'from-orange-500 to-orange-600', desc: 'Livraison rapide' },
                      { value: 'high', label: 'Express', icon: AlertCircle, color: 'from-red-500 to-red-600', desc: 'Livraison immédiate' }
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => updateFormData('priority', priority.value)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-300 ${
                          formData.priority === priority.value
                            ? 'border-cyan-400 bg-cyan-500/20'
                            : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className={`w-10 h-10 bg-gradient-to-r ${priority.color} rounded-xl flex items-center justify-center`}>
                          <priority.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-white">{priority.label}</p>
                          <p className="text-sm text-gray-400">{priority.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-200 font-medium mb-3 block">
                    Catégorie
                  </Label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData('category', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-400 rounded-lg"
                  >
                    <option value="transport">Transport standard</option>
                    <option value="express">Livraison express</option>
                    <option value="luxury">Transport de luxe</option>
                    <option value="classic">Véhicule de collection</option>
                    <option value="commercial">Véhicule utilitaire</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Informations Client</h2>
              <p className="text-gray-400">Détails de contact et préférences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="clientName" className="text-gray-200 font-medium mb-2 block">
                  Nom du client *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => updateFormData('clientName', e.target.value)}
                    placeholder="Nom complet"
                    className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientEmail" className="text-gray-200 font-medium mb-2 block">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => updateFormData('clientEmail', e.target.value)}
                    placeholder="client@email.com"
                    className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientPhone" className="text-gray-200 font-medium mb-2 block">
                  Téléphone
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => updateFormData('clientPhone', e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientNotes" className="text-gray-200 font-medium mb-2 block">
                  Notes client
                </Label>
                <Textarea
                  id="clientNotes"
                  value={formData.clientNotes}
                  onChange={(e) => updateFormData('clientNotes', e.target.value)}
                  placeholder="Instructions spéciales du client..."
                  rows={3}
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Itinéraire & Planning</h2>
              <p className="text-gray-400">Définissez les points de collecte et livraison</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="departure" className="text-gray-200 font-medium mb-2 block">
                    Adresse de départ *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Textarea
                      id="departure"
                      value={formData.departureAddress}
                      onChange={(e) => updateFormData('departureAddress', e.target.value)}
                      placeholder="Adresse complète de collecte..."
                      rows={3}
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="arrival" className="text-gray-200 font-medium mb-2 block">
                    Adresse d'arrivée *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Textarea
                      id="arrival"
                      value={formData.arrivalAddress}
                      onChange={(e) => updateFormData('arrivalAddress', e.target.value)}
                      placeholder="Adresse complète de livraison..."
                      rows={3}
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="departureDate" className="text-gray-200 font-medium mb-2 block">
                    Date et heure de collecte
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="departureDate"
                      type="datetime-local"
                      value={formData.departureDate}
                      onChange={(e) => updateFormData('departureDate', e.target.value)}
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="arrivalDate" className="text-gray-200 font-medium mb-2 block">
                    Date de livraison souhaitée
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="arrivalDate"
                      type="datetime-local"
                      value={formData.arrivalDate}
                      onChange={(e) => updateFormData('arrivalDate', e.target.value)}
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="distance" className="text-gray-200 font-medium mb-2 block">
                    Distance estimée (km)
                  </Label>
                  <div className="relative">
                    <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="distance"
                      type="number"
                      value={formData.estimatedDistance}
                      onChange={(e) => updateFormData('estimatedDistance', e.target.value)}
                      placeholder="450"
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-gray-200 font-medium mb-2 block">
                    Durée estimée (heures)
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="duration"
                      type="number"
                      step="0.5"
                      value={formData.estimatedDuration}
                      onChange={(e) => updateFormData('estimatedDuration', e.target.value)}
                      placeholder="6.5"
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="flexibility"
                  checked={formData.flexibility}
                  onChange={(e) => updateFormData('flexibility', e.target.checked)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <Label htmlFor="flexibility" className="text-gray-200">
                  Dates flexibles (±2 jours)
                </Label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Car className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Détails du Véhicule</h2>
              <p className="text-gray-400">Informations complètes sur le véhicule à transporter</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="vehicleMake" className="text-gray-200 font-medium mb-2 block">
                  Marque *
                </Label>
                <Input
                  id="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={(e) => updateFormData('vehicleMake', e.target.value)}
                  placeholder="BMW, Audi, Mercedes..."
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label htmlFor="vehicleModel" className="text-gray-200 font-medium mb-2 block">
                  Modèle *
                </Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => updateFormData('vehicleModel', e.target.value)}
                  placeholder="Série 3, A4, Classe C..."
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label htmlFor="vehicleYear" className="text-gray-200 font-medium mb-2 block">
                  Année
                </Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  value={formData.vehicleYear}
                  onChange={(e) => updateFormData('vehicleYear', e.target.value)}
                  placeholder="2020"
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label htmlFor="licensePlate" className="text-gray-200 font-medium mb-2 block">
                  Plaque d'immatriculation
                </Label>
                <Input
                  id="licensePlate"
                  value={formData.vehicleLicensePlate}
                  onChange={(e) => updateFormData('vehicleLicensePlate', e.target.value)}
                  placeholder="AB-123-CD"
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label htmlFor="vehicleColor" className="text-gray-200 font-medium mb-2 block">
                  Couleur
                </Label>
                <Input
                  id="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={(e) => updateFormData('vehicleColor', e.target.value)}
                  placeholder="Noir métallisé"
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label htmlFor="vehicleValue" className="text-gray-200 font-medium mb-2 block">
                  Valeur estimée (€)
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="vehicleValue"
                    type="number"
                    value={formData.vehicleValue}
                    onChange={(e) => updateFormData('vehicleValue', e.target.value)}
                    placeholder="35000"
                    className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-200 font-medium mb-2 block">
                État du véhicule
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { value: 'excellent', label: 'Excellent', color: 'from-green-500 to-emerald-600' },
                  { value: 'good', label: 'Bon', color: 'from-blue-500 to-cyan-600' },
                  { value: 'fair', label: 'Correct', color: 'from-orange-500 to-yellow-600' },
                  { value: 'poor', label: 'Endommagé', color: 'from-red-500 to-pink-600' }
                ].map((condition) => (
                  <button
                    key={condition.value}
                    type="button"
                    onClick={() => updateFormData('vehicleCondition', condition.value)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                      formData.vehicleCondition === condition.value
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-gradient-to-r ${condition.color} rounded-full`}></div>
                    <span className="font-medium text-white">{condition.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-200 font-medium mb-2 block">
                Photos du véhicule
              </Label>
              <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center hover:border-gray-500 transition-colors">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Ajoutez des photos du véhicule</p>
                <Button variant="outline" className="bg-gray-700/30 border-gray-600/50 text-gray-200">
                  <Upload className="w-4 h-4 mr-2" />
                  Choisir des fichiers
                </Button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Settings className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Services Additionnels</h2>
              <p className="text-gray-400">Personnalisez votre mission avec des options premium</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="specialInstructions" className="text-gray-200 font-medium mb-2 block">
                  Instructions spéciales
                </Label>
                <Textarea
                  id="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                  placeholder="Précautions particulières, accès difficile, horaires spécifiques..."
                  rows={4}
                  className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                />
              </div>

              <div>
                <Label className="text-gray-200 font-medium mb-3 block">
                  Niveau de sécurité
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: 'basic', label: 'Basique', color: 'from-gray-500 to-gray-600', desc: 'Transport standard' },
                    { value: 'standard', label: 'Standard', color: 'from-blue-500 to-blue-600', desc: 'Suivi GPS inclus' },
                    { value: 'premium', label: 'Premium', color: 'from-purple-500 to-purple-600', desc: 'Sécurité renforcée' }
                  ].map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateFormData('securityLevel', level.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        formData.securityLevel === level.value
                          ? 'border-cyan-400 bg-cyan-500/20'
                          : 'border-gray-600/50 bg-gray-700/30 hover:border-gray-500'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${level.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-semibold text-white">{level.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{level.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Options de service</h3>
                  
                  {[
                    { key: 'loadingAssistance', label: 'Assistance au chargement', desc: 'Aide professionnelle pour embarquer le véhicule' },
                    { key: 'trackingRequired', label: 'Suivi GPS en temps réel', desc: 'Localisation continue durant le transport' },
                    { key: 'photoReports', label: 'Rapports photo', desc: 'Photos avant/après transport' },
                    { key: 'expressDelivery', label: 'Livraison express', desc: 'Priorité maximale sur le planning' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700/30">
                      <input
                        type="checkbox"
                        id={option.key}
                        checked={formData[option.key]}
                        onChange={(e) => updateFormData(option.key, e.target.checked)}
                        className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-0.5"
                      />
                      <div>
                        <Label htmlFor={option.key} className="text-gray-200 font-medium">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-400">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Protection</h3>
                  
                  <div>
                    <Label className="text-gray-200 font-medium mb-2 block">
                      Couverture d'assurance
                    </Label>
                    <select
                      value={formData.insuranceCoverage}
                      onChange={(e) => updateFormData('insuranceCoverage', e.target.value)}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-400 rounded-lg"
                    >
                      <option value="basic">Basique - Jusqu'à 10 000€</option>
                      <option value="standard">Standard - Jusqu'à 50 000€</option>
                      <option value="premium">Premium - Jusqu'à 150 000€</option>
                      <option value="luxury">Luxe - Valeur totale couverte</option>
                    </select>
                  </div>

                  {[
                    { key: 'fragileItems', label: 'Articles fragiles à bord', desc: 'Précautions spéciales requises' },
                    { key: 'weatherRestrictions', label: 'Restrictions météo', desc: 'Reporter si conditions défavorables' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-700/30">
                      <input
                        type="checkbox"
                        id={option.key}
                        checked={formData[option.key]}
                        onChange={(e) => updateFormData(option.key, e.target.checked)}
                        className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 mt-0.5"
                      />
                      <div>
                        <Label htmlFor={option.key} className="text-gray-200 font-medium">
                          {option.label}
                        </Label>
                        <p className="text-sm text-gray-400">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Budget & Finalisation</h2>
              <p className="text-gray-400">Définissez le prix et les modalités de paiement</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="budget" className="text-gray-200 font-medium mb-2 block">
                    Budget proposé (€) *
                  </Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="budget"
                      type="number"
                      value={formData.budget}
                      onChange={(e) => updateFormData('budget', e.target.value)}
                      placeholder="850"
                      className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-200 font-medium mb-2 block">
                    Modalité de paiement
                  </Label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-400 rounded-lg"
                  >
                    <option value="completion">Paiement à la livraison</option>
                    <option value="advance">50% avance, 50% livraison</option>
                    <option value="full-advance">100% à la confirmation</option>
                  </select>
                </div>

                <div>
                  <Label className="text-gray-200 font-medium mb-2 block">
                    Méthode de paiement
                  </Label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600/50 text-white focus:border-cyan-400 rounded-lg"
                  >
                    <option value="transfer">Virement bancaire</option>
                    <option value="card">Carte bancaire</option>
                    <option value="paypal">PayPal</option>
                    <option value="cash">Espèces</option>
                    <option value="check">Chèque</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id="depositRequired"
                      checked={formData.depositRequired}
                      onChange={(e) => updateFormData('depositRequired', e.target.checked)}
                      className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <Label htmlFor="depositRequired" className="text-gray-200 font-medium">
                      Acompte requis
                    </Label>
                  </div>
                  {formData.depositRequired && (
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="number"
                        value={formData.depositAmount}
                        onChange={(e) => updateFormData('depositAmount', e.target.value)}
                        placeholder="200"
                        className="pl-12 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-2xl p-6 border border-cyan-500/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                  Récapitulatif de votre mission
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Titre:</p>
                    <p className="text-white font-medium">{formData.title || 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Client:</p>
                    <p className="text-white font-medium">{formData.clientName || 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Budget:</p>
                    <p className="text-white font-medium">{formData.budget ? `${formData.budget}€` : 'Non défini'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Véhicule:</p>
                    <p className="text-white font-medium">
                      {formData.vehicleMake && formData.vehicleModel 
                        ? `${formData.vehicleMake} ${formData.vehicleModel}` 
                        : 'Non défini'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Distance:</p>
                    <p className="text-white font-medium">
                      {formData.estimatedDistance ? `${formData.estimatedDistance} km` : 'Non défini'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Priorité:</p>
                    <Badge className={`${
                      formData.priority === 'high' ? 'bg-red-500/20 text-red-200 border-red-500/30' :
                      formData.priority === 'normal' ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-200 border-blue-500/30'
                    }`}>
                      {formData.priority === 'high' ? 'Express' : formData.priority === 'normal' ? 'Urgent' : 'Standard'}
                    </Badge>
                  </div>
                </div>
                
                {(formData.loadingAssistance || formData.trackingRequired || formData.photoReports || formData.expressDelivery) && (
                  <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    <p className="text-gray-400 text-sm mb-2">Services additionnels:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.loadingAssistance && <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">Assistance chargement</Badge>}
                      {formData.trackingRequired && <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">Suivi GPS</Badge>}
                      {formData.photoReports && <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">Rapports photo</Badge>}
                      {formData.expressDelivery && <Badge className="bg-red-500/20 text-red-200 border-red-500/30">Express</Badge>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-teal-200 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-cyan-400" />
                Créer une Mission Premium
              </h1>
              <p className="text-gray-400">
                Étape {currentStep} sur {totalSteps} - {steps[currentStep - 1]?.description}
              </p>
              {savedDraft && (
                <div className="flex items-center gap-2 mt-2">
                  <Save className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Brouillon sauvegardé automatiquement</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={clearDraft}
                className="text-gray-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Effacer
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/missions')}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>

          <div className="w-full bg-gray-800/50 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-teal-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>

          <div className="flex justify-between">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isValid = validateStep(step.id);
              
              return (
                <div key={step.id} className="flex flex-col items-center cursor-pointer" onClick={() => setCurrentStep(step.id)}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                      : isActive 
                        ? isValid
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-600'
                          : 'bg-gradient-to-r from-red-500 to-pink-600'
                        : 'bg-gray-700/50 hover:bg-gray-600/50'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : !isValid && isActive ? (
                      <AlertCircle className="w-6 h-6 text-white" />
                    ) : (
                      <StepIcon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <p className={`text-xs text-center hidden md:block transition-colors ${
                    isActive ? 'text-cyan-400 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className={`text-xs text-center hidden lg:block transition-colors ${
                    isActive ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-gray-700/30 border-gray-600/50 text-gray-200 hover:bg-gray-600/50 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-3">
            {currentStep === totalSteps && (
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Preview:', formData);
                  // Ici on pourrait ouvrir une modal de prévisualisation
                }}
                className="bg-blue-700/30 border-blue-600/50 text-blue-200 hover:bg-blue-600/50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Prévisualiser
              </Button>
            )}
            
            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Publier la Mission
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white shadow-lg disabled:opacity-50"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMission;
