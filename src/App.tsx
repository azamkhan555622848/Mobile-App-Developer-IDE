import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Configure base URL for API calls
const baseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';

// Add an Axios interceptor or fetch wrapper to prepend baseUrl
if (import.meta.env.DEV) {
  // This ensures API calls work when using Vite's dev server
  window.fetch = new Proxy(window.fetch, {
    apply: (target, thisArg, args) => {
      const [resource, config] = args;
      // Only prepend baseUrl for relative URLs that start with /api
      if (typeof resource === 'string' && resource.startsWith('/api')) {
        args[0] = `${baseUrl}${resource}`;
      }
      return Reflect.apply(target, thisArg, args);
    },
  });
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
