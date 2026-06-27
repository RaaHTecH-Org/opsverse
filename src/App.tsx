import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "@/hooks/use-simulation";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Incidents from "@/pages/Incidents";
import ServiceRequests from "@/pages/ServiceRequests";
import Assets from "@/pages/Assets";
import AICopilot from "@/pages/AICopilot";
import DigitalTwin from "@/pages/DigitalTwin";
import Autopilot from "@/pages/Autopilot";
import Admin from "@/pages/Admin";
import RootCauses from "@/pages/RootCauses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SimulationProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/requests" element={<ServiceRequests />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/copilot" element={<AICopilot />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/autopilot" element={<Autopilot />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/root-causes" element={<RootCauses />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
      </SimulationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
