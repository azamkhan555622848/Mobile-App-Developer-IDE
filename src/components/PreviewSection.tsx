
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCcwIcon, SmartphoneIcon, MonitorIcon, TabletIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewSectionProps {
  className?: string;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({ className }) => {
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const getPreviewWidth = () => {
    switch (deviceView) {
      case "mobile":
        return "w-[320px]";
      case "tablet":
        return "w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background/50", className)}>
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-2">
          <div className="border border-border rounded-md p-0.5 bg-secondary/30">
            <Button
              variant={deviceView === "desktop" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeviceView("desktop")}
            >
              <MonitorIcon className="h-4 w-4" />
              <span className="sr-only">Desktop</span>
            </Button>
            <Button
              variant={deviceView === "tablet" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeviceView("tablet")}
            >
              <TabletIcon className="h-4 w-4" />
              <span className="sr-only">Tablet</span>
            </Button>
            <Button
              variant={deviceView === "mobile" ? "default" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeviceView("mobile")}
            >
              <SmartphoneIcon className="h-4 w-4" />
              <span className="sr-only">Mobile</span>
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCcwIcon className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        <div className={cn("h-full bg-secondary/70 rounded-lg shadow-md border border-border/40 transition-all duration-300", getPreviewWidth())}>
          <div className="h-full w-full overflow-hidden animate-fade-in flex flex-col items-center justify-center p-6">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-6 relative">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      L
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-2xl font-semibold mb-3">Welcome to your Lovable UI clone</h1>
              <p className="text-muted-foreground mb-6">
                This is a preview of your application. Start chatting with the AI assistant to make changes to your application.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="glass-panel p-4">
                  <h3 className="font-medium mb-2">Chat Interface</h3>
                  <p className="text-sm text-muted-foreground">Chat with the AI assistant to create and modify your application.</p>
                </div>
                <div className="glass-panel p-4">
                  <h3 className="font-medium mb-2">Code View</h3>
                  <p className="text-sm text-muted-foreground">View and edit your application's code directly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
