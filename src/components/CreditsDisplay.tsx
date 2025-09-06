import React, { useEffect, useState } from 'react';
import { useCredits } from '@/hooks/useCredits';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Coins, Plus, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreditsDisplayProps {
  variant?: 'full' | 'compact';
  showAddButton?: boolean;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ 
  variant = 'compact',
  showAddButton = true 
}) => {
  const { balance, loading } = useCredits();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-16 h-6 bg-muted rounded"></div>
      </div>
    );
  }

  const credits = balance?.credits_remaining || 0;
  const planType = balance?.plan_type || 'decouverte';
  const isUnlimited = planType === 'illimite';

  const getCreditsColor = () => {
    if (isUnlimited) return 'bg-gradient-to-r from-cyan-500 to-blue-500';
    if (credits >= 10) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (credits >= 5) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const pill = (
    <Badge
      className={`${getCreditsColor()} text-white border-0 px-3 py-1 hover:opacity-90 cursor-pointer transition-all`}
      onClick={() => navigate('/shop')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/shop');
        }
      }}
      aria-label={isUnlimited ? 'Crédits illimités – ouvrir la boutique' : `${credits} crédits – ouvrir la boutique`}
    >
      {isUnlimited ? (
        <Zap className="h-3 w-3 mr-1" />
      ) : (
        <Coins className="h-3 w-3 mr-1" />
      )}
      {isUnlimited ? '∞' : credits}
    </Badge>
  );

  const content = (
    <div className="flex items-center gap-2">
      {variant === 'full' && (
        <span className="text-xs text-muted-foreground">Crédits</span>
      )}
      {pill}
      {showAddButton && !isUnlimited && (variant === 'full' || credits < 5) && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/shop')}
          className="h-6 px-2"
        >
          {variant === 'full' ? (
            <span className="text-xs font-medium">Recharger</span>
          ) : (
            <Plus className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );

  if (!mounted) {
    // Évite les portails (Tooltip) avant le montage client
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-medium">
            {isUnlimited ? 'Crédits illimités' : `${credits} crédits disponibles`}
          </p>
          <p className="text-xs text-muted-foreground">
            Plan {planType}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};