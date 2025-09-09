import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    if (import.meta.env.DEV) {
      // Log des codes caractères pour détecter espaces ou caractères invisibles
      console.debug('[NotFound] path debug', location.pathname, location.pathname.split('').map(c => c.charCodeAt(0)));
    }
  }, [location.pathname]);

  // Si l'URL contient "fleetmarket" mais n'a pas matché, on force une redirection propre.
  const normalized = location.pathname.toLowerCase().replace(/\/+$/,'');
  if (normalized.includes('fleetmarket') && normalized !== '/fleetmarket') {
    return <Navigate to="/fleetmarket" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
