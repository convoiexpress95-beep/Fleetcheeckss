import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Obsolète: l'inspection est désormais uniquement sur l'app mobile.
export default function InspectionWizard() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/missions', { replace: true });
  }, [navigate]);
  return null;
}