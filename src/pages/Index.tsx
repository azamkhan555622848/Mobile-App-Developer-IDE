
import React, { useState, useEffect } from "react";
import { ChatSection } from "@/components/ChatSection";
import { CodeEditor } from "@/components/CodeEditor";
import { PreviewSection } from "@/components/PreviewSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  MessageSquareIcon, 
  CodeIcon, 
  PlayIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  RefreshCwIcon, 
  GithubIcon, 
  GlobeIcon, 
  ZapIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UserIcon,
  HelpCircleIcon,
  ChevronDownIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"chat" | "code" | "preview">("chat");
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"code" | "preview">("preview");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-loader-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                L
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Initializing Lovable UI...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center space-x-2">
            <ChevronLeftIcon className="h-5 w-5" />
            <ChevronRightIcon className="h-5 w-5" />
            <RefreshCwIcon className="h-5 w-5" />
            <div className="ml-2 bg-muted px-2 py-1 rounded text-xs">lovable.dev/projects/...</div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant={mobileView === "chat" ? "default" : "ghost"}
              size="icon"
              onClick={() => setMobileView("chat")}
            >
              <MessageSquareIcon className="h-5 w-5" />
            </Button>
            <Button
              variant={mobileView === "code" ? "default" : "ghost"}
              size="icon"
              onClick={() => setMobileView("code")}
            >
              <CodeIcon className="h-5 w-5" />
            </Button>
            <Button
              variant={mobileView === "preview" ? "default" : "ghost"}
              size="icon"
              onClick={() => setMobileView("preview")}
            >
              <PlayIcon className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden relative">
          <div className={cn("absolute inset-0 transition-opacity", mobileView === "chat" ? "opacity-100 z-20" : "opacity-0 z-0")}>
            <ChatSection />
          </div>
          <div className={cn("absolute inset-0 transition-opacity", mobileView === "code" ? "opacity-100 z-20" : "opacity-0 z-0")}>
            <CodeEditor />
          </div>
          <div className={cn("absolute inset-0 transition-opacity", mobileView === "preview" ? "opacity-100 z-20" : "opacity-0 z-0")}>
            <PreviewSection />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between py-2 px-4 border-b border-border bg-background text-sm">
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 flex items-center gap-2 px-3 hover:bg-secondary/30">
                <span>cozy-edit-space</span>
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover border-border w-56">
              <DropdownMenuItem className="cursor-pointer">
                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                <span>Go to Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer flex justify-between">
                <div className="flex items-center">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Project Settings</span>
                </div>
                <span className="text-xs text-muted-foreground">Ctrl.</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircleIcon className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="h-8 text-xs bg-secondary/40 border-border/60 hover:bg-secondary flex items-center gap-2">
            <ZapIcon className="h-4 w-4 text-green-400" />
            Supabase
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs bg-secondary/40 border-border/60 hover:bg-secondary flex items-center gap-2">
            <GithubIcon className="h-4 w-4" />
            GitHub
          </Button>
          <Button size="sm" className="h-8 text-xs flex items-center gap-2">
            <GlobeIcon className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="w-full">
          <ResizablePanel 
            defaultSize={25} 
            minSize={20} 
            maxSize={50}
          >
            <ChatSection isExpanded={true} />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="flex flex-col h-full">
              <div className="border-b border-border px-3 py-2 flex items-center justify-between bg-background">
                <div className="text-xs text-muted-foreground">
                  preview--cozy-edit-space.lovable.app / index
                </div>
                
                <div className="flex items-center space-x-2">
                  <ToggleGroup type="single" value={activeView} onValueChange={(value) => value && setActiveView(value as "code" | "preview")}>
                    <ToggleGroupItem value="code" aria-label="Toggle code view" className="px-4 py-1 text-xs gap-1.5 h-8">
                      <CodeIcon className="h-3.5 w-3.5" />
                      Code
                    </ToggleGroupItem>
                    <ToggleGroupItem value="preview" aria-label="Toggle preview" className="px-4 py-1 text-xs gap-1.5 h-8">
                      <PlayIcon className="h-3.5 w-3.5" />
                      Preview
                    </ToggleGroupItem>
                  </ToggleGroup>
                  
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 relative overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-0 transition-all duration-300 transform",
                    activeView === "code" ? "translate-x-0 opacity-100 z-10" : "translate-x-full opacity-0 z-0"
                  )}
                >
                  <CodeEditor />
                </div>
                <div 
                  className={cn(
                    "absolute inset-0 transition-all duration-300 transform",
                    activeView === "preview" ? "translate-x-0 opacity-100 z-10" : "-translate-x-full opacity-0 z-0"
                  )}
                >
                  <PreviewSection />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
};

export default Index;
