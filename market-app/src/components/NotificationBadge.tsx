import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

const NotificationBadge = ({ count, className }: NotificationBadgeProps) => {
  if (count === 0) return null;

  return (
    <div className={cn(
      "absolute -top-2 -right-2 min-w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-notification",
      count > 99 && "min-w-6",
      className
    )}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;