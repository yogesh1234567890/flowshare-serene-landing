import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import FileShare from "./pages/FileShare";
import FileReceive from "./pages/FileReceive";
import Security from "./pages/Security";
import NotFound from "./pages/NotFound";
import { initGTM, trackPageView } from "@/utils/gtm";

// Component to track page views on route changes
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null;
};

const App = () => {
  useEffect(() => {
    // Initialize GTM on app load
    initGTM();
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <PageViewTracker />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/share" element={<FileShare />} />
          <Route path="/receive" element={<FileReceive />} />
          <Route path="/security" element={<Security />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
