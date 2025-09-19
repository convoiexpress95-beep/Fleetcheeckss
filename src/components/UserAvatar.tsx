import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

/**
 * UserAvatar centralise la logique d'affichage d'un avatar utilisateur.
 * - Affiche l'image si disponible
 * - Sinon affiche les initiales (2 premières lettres)
 * - Si pas de nom, affiche un cercle générique avec fallbackIcon éventuel
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, className, fallbackIcon }) => {
  const initials = (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || null;
  const cleanSrc = src && src.trim().length > 0 ? src : undefined;
  return (
    <Avatar className={className}>
      {cleanSrc && <AvatarImage src={cleanSrc} />}
      <AvatarFallback className="bg-gradient-to-br from-muted to-muted/70 text-foreground/80 font-semibold">
        {initials || fallbackIcon || '⭘'}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
