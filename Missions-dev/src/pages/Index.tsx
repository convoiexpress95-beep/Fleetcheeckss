import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Truck, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnimatedBackground from "@/components/AnimatedBackground";

const Index = () => {
  const features = [
    {
      title: "Gestion des missions",
      description: "Créez, planifiez et suivez vos missions de convoyage en temps réel",
      icon: ClipboardList,
      color: "text-primary"
    },
    {
      title: "Suivi des véhicules",
      description: "Tracking GPS et inspection complète des véhicules",
      icon: Truck,
      color: "text-green-400"
    },
    {
      title: "Gestion d'équipe",
      description: "Assignation intelligente et suivi des convoyeurs",
      icon: Users,
      color: "text-blue-400"
    },
    {
      title: "Analytics & Reporting",
      description: "Tableaux de bord et rapports détaillés sur vos performances",
      icon: BarChart3,
      color: "text-purple-400"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                Plateforme B2B de convoyage
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                FleetReport
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                La solution complète pour gérer vos missions de convoyage, 
                suivre vos véhicules et optimiser vos opérations en temps réel.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/missions">
                <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3">
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Accéder aux missions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Découvrir la démo
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass border-glass-border hover:bg-secondary/30 transition-all">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Prêt à optimiser vos missions ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez les entreprises qui font confiance à FleetReport pour gérer 
              efficacement leurs opérations de convoyage.
            </p>
            <Link to="/missions">
              <Button size="lg" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                <ClipboardList className="h-5 w-5 mr-2" />
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
