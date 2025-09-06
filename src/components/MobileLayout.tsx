import { useEffect, useState } from 'react';
import { useNativeStatusBar } from '@/hooks/useNativeStatusBar';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const { user } = useAuth();
  const { setStatusBarStyle, setStatusBarColor } = useNativeStatusBar();
  const { initializePushNotifications } = useNativePushNotifications();
  const [isNative] = useState(false);

  useEffect(() => {
    // En web, pas de fonctionnalités natives
    void setStatusBarStyle;
    void setStatusBarColor;
    void initializePushNotifications;
  }, [user, setStatusBarStyle, setStatusBarColor, initializePushNotifications]);

  return (
    <div className={`min-h-screen ${isNative ? 'native-app' : ''}`}>
      {children}
    </div>
  );
};