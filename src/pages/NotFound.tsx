import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { trackError } from "@/utils/gtm";

const NotFound = () => {
  const location = useLocation();

  useSEO({
    title: "Page Not Found (404) | PeerShare",
    description: "Sorry, the page you're looking for doesn't exist. Return to PeerShare to start sharing files securely.",
    canonicalUrl: "https://peershare.tech/404",
    noindex: true
  });

  useEffect(() => {
    // Track 404 error
    trackError('404_not_found', `Page not found: ${location.pathname}`, 'NotFound');
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <main className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link to="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600">
              Return to Home
            </Button>
          </Link>
          <div className="text-sm text-gray-500">
            <Link to="/share" className="hover:text-blue-600 mx-2">Share Files</Link>
            <span>•</span>
            <Link to="/receive" className="hover:text-blue-600 mx-2">Receive Files</Link>
            <span>•</span>
            <Link to="/security" className="hover:text-blue-600 mx-2">Security</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
