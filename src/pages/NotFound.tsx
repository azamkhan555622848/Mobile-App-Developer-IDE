
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
            <div className="absolute inset-2 bg-primary/20 rounded-full"></div>
            <div className="absolute inset-4 bg-primary/30 rounded-full"></div>
            <div className="absolute inset-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
              404
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild className="group" variant="default">
          <a href="/">
            <ArrowLeftIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
