import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Truck, Users, MapPin, MessageSquare, Calendar, 
  TrendingUp, Zap, Store, CreditCard, Settings, Star,
  Plus, ArrowRight, Activity, Clock, Award, Target,
  Sparkles, Globe, BarChart3, DollarSign, Crown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  // Données mockées pour démonstration
  const [stats, setStats] = useState({
    totalMissions: 127,
    activeMissions: 23,
    completedThisMonth: 45,
    totalRevenue: 18450,
    marketplaceOffers: 8,
    covoiturageTrips: 15,
    averageRating: 4.8,
    creditsBalance: 2450
  });

  const recentActivity = [
    { id: 1, type: 'mission', title: 'Mission BMW Série 3 terminée', time: '2h ago', status: 'completed' },
    { id: 2, type: 'marketplace', title: 'Nouvelle offre reçue - Paris-Lyon', time: '4h ago', status: 'pending' },
    { id: 3, type: 'covoiturage', title: 'Trajet Marseille-Nice publié', time: '6h ago', status: 'active' },
    { id: 4, type: 'payment', title: 'Paiement reçu +850€', time: '1 jour', status: 'completed' }
  ];

  const performanceData = [
    { month: 'Jan', missions: 12, revenue: 3200, covoiturage: 8 },
    { month: 'Fév', missions: 19, revenue: 4800, covoiturage: 12 },
    { month: 'Mar', missions: 15, revenue: 3900, covoiturage: 10 },
    { month: 'Avr', missions: 25, revenue: 6200, covoiturage: 18 },
    { month: 'Mai', missions: 22, revenue: 5500, covoiturage: 15 },
    { month: 'Juin', missions: 28, revenue: 7100, covoiturage: 20 }
  ];

  const quickActions = [
    { 
      icon: Plus, 
      title: 'Nouvelle Mission', 
      description: 'Créer une mission d\'inspection', 
      url: '/missions',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      icon: Store, 
      title: 'Marketplace', 
      description: 'Parcourir les opportunités', 
      url: '/marketplace',
      color: 'from-teal-500 to-cyan-600'
    },
    { 
      icon: Users, 
      title: 'Covoiturage', 
      description: 'Publier un trajet', 
      url: '/covoiturage/publish',
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      icon: MessageSquare, 
      title: 'Messages', 
      description: '3 nouveaux messages', 
      url: '/marketplace/messages',
      color: 'from-violet-500 to-purple-600'
    }
  ];

  const ecosystemSections = [
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: Store,
      description: 'Missions de convoyage',
      stats: { active: stats.marketplaceOffers, total: 127 },
      actions: [
        { label: 'Voir les missions', url: '/marketplace' },
        // Correction des chemins pour correspondre aux routes définies dans App.tsx
        { label: 'Mes offres', url: '/marketplace/my-offers' },
        { label: 'Historique', url: '/marketplace/history' }
      ]
    },
    {
      id: 'covoiturage',
      title: 'Covoiturage',
      icon: Users,
      description: 'Partage de trajets',
      stats: { active: stats.covoiturageTrips, total: 89 },
      actions: [
        { label: 'Mes trajets', url: '/covoiturage/my-trips' },
        { label: 'Publier', url: '/covoiturage/publish' },
        { label: 'Messages', url: '/covoiturage/messages' }
      ]
    },
    {
      id: 'business',
      title: 'Business',
      icon: BarChart3,
      description: 'Facturation & Rapports',
      stats: { active: stats.totalRevenue, total: 25340 },
      actions: [
        { label: 'Facturation', url: '/billing' },
        { label: 'Rapports', url: '/reports' },
        { label: 'Catalogue', url: '/catalog' }
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header avec titre et actions rapides */}
  <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-cyan-600 to-teal-700 rounded-2xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                    Dashboard Premium
                  </h1>
                  <p className="text-gray-400">
                    Bienvenue, <span className="text-cyan-300 font-semibold">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions rapides en header */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-gray-800/50 text-gray-200 border border-gray-700/50">
                <Activity className="w-4 h-4 mr-1" />
                {stats.activeMissions} missions actives
              </Badge>
              <Button 
                asChild
                className="bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white shadow-lg"
              >
                <Link to="/missions">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Mission
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 hover:bg-gray-800/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Missions Totales</p>
                  <p className="text-3xl font-bold text-white">{stats.totalMissions}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">+12% ce mois</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 hover:bg-gray-800/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Revenus</p>
                  <p className="text-3xl font-bold text-white">{stats.totalRevenue.toLocaleString()}€</p>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">+8% ce mois</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 hover:bg-gray-800/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Note Moyenne</p>
                  <p className="text-3xl font-bold text-white">{stats.averageRating}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">Excellent</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50 hover:bg-gray-800/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Crédits</p>
                  <p className="text-3xl font-bold text-white">{stats.creditsBalance}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-400">Disponibles</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Graphique de performance */}
          <Card className="lg:col-span-2 bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Performance Mensuelle
              </CardTitle>
              <CardDescription className="text-gray-400">
                Évolution de vos missions et revenus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '12px',
                        color: '#F3F4F6'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#06B6D4" 
                      fill="url(#colorRevenue)" 
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Activité Récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-all duration-200">
                  <div className={`p-2 rounded-lg ${
                    activity.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {activity.type === 'mission' ? <Truck className="w-4 h-4" /> :
                     activity.type === 'marketplace' ? <Store className="w-4 h-4" /> :
                     activity.type === 'covoiturage' ? <Users className="w-4 h-4" /> :
                     <CreditCard className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Actions Rapides
            </CardTitle>
            <CardDescription className="text-gray-400">
              Accès direct à vos fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.url}>
                  <Card className="bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                      <p className="text-sm text-gray-400">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Écosystème intégré */}
        <Card className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" />
              Écosystème FleetChecks
            </CardTitle>
            <CardDescription className="text-gray-400">
              Vue d'ensemble de tous vos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {ecosystemSections.map((section) => (
                <Card key={section.id} className="bg-gray-700/30 border border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-cyan-600 to-teal-700 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{section.title}</h3>
                        <p className="text-sm text-gray-400">{section.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{section.stats.active}</p>
                        <p className="text-xs text-gray-400">Actifs</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-teal-400">{section.stats.total}</p>
                        <p className="text-xs text-gray-400">Total</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {section.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          asChild
                          variant="ghost"
                          className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-600/50"
                        >
                          <Link to={action.url}>
                            {action.label}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;