import { useState } from "react";
import { X, ChevronRight, ChevronLeft, Save, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MissionForm } from "./MissionForm";


interface MissionCreateDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const MissionCreateDrawer = ({ open, onClose }: MissionCreateDrawerProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const steps = [
    { id: 1, title: "Client & Contact", description: "Informations client et personne de contact" },
    { id: 2, title: "Véhicule", description: "Détails du véhicule à convoyer" },
    { id: 3, title: "Itinéraire", description: "Départ, arrivée et détails du trajet" },
    { id: 4, title: "Planning", description: "Date, horaire et options de flexibilité" },
    { id: 5, title: "Affectation", description: "Attribution et options de suivi" },
    { id: 6, title: "Finalisation", description: "Tarifs, notes et validation" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (newData: any) => {
    setFormData({ ...formData, ...newData });
  };

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-[90vh] glass border-glass-border">
        <DrawerHeader className="border-b border-glass-border bg-background/50">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl text-foreground">Créer une nouvelle mission</DrawerTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Étape {currentStep} sur {steps.length}: {steps[currentStep - 1].title}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4 px-1">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-muted-foreground'
                    }
                  `}>
                    {step.id}
                  </div>
                  <div className="ml-2 hidden lg:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-border'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </DrawerHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Form Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <MissionForm 
              currentStep={currentStep}
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="border-t border-glass-border bg-background/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Départ → Arrivée
              </Badge>
              <Badge variant="outline">
                Date/Créneau
              </Badge>
              <Badge variant="outline">
                Assigné à
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrev}
                disabled={isFirstStep}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              {!isLastStep ? (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary-hover">
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer brouillon
                  </Button>
                  <Button className="bg-primary hover:bg-primary-hover">
                    <Send className="h-4 w-4 mr-2" />
                    Créer & assigner
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};