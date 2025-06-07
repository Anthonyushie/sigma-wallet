
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider, useWallet } from "./context/WalletContext";
import { useState } from "react";
import PreloadScreen from "./components/PreloadScreen";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";
import Receive from "./pages/Receive";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { wallet } = useWallet();

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          wallet.isOnboarded ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/onboarding" replace />
        } 
      />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route 
        path="/dashboard" 
        element={
          wallet.isOnboarded ? 
            <Dashboard /> : 
            <Navigate to="/onboarding" replace />
        } 
      />
      <Route 
        path="/send" 
        element={
          wallet.isOnboarded ? 
            <Send /> : 
            <Navigate to="/onboarding" replace />
        } 
      />
      <Route 
        path="/receive" 
        element={
          wallet.isOnboarded ? 
            <Receive /> : 
            <Navigate to="/onboarding" replace />
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handlePreloadComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <PreloadScreen onComplete={handlePreloadComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WalletProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
