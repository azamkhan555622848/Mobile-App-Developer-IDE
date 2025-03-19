import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CodeIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export type MessageType = "user" | "assistant";

interface ChatMessageProps {
  type: MessageType;
  content: string;
  timestamp?: string;
  isTyping?: boolean;
  streaming?: boolean;
}

// Code Generator component
const CodeGenerationIndicator: React.FC<{language: string}> = ({ language }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Create pseudo-random progress updates to simulate code generation
    const interval = setInterval(() => {
      setProgress(prev => {
        // Make progress move forward with some randomness
        const increment = Math.random() * 15;
        const newProgress = prev + increment;
        
        // Limit to 95% to maintain the feeling that something is happening
        // The progress will be completed when file is actually created
        return Math.min(newProgress, 95);
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, []);
  
  // Complete progress when component is about to unmount
  useEffect(() => {
    return () => setProgress(100);
  }, []);
  
  return (
    <div className="code-generation-indicator bg-secondary/30 rounded-md p-3 my-3 border border-border/40">
      <div className="flex items-center gap-2 mb-2">
        <CodeIcon className="h-4 w-4 text-primary/70" />
        <div className="text-sm font-medium">Generating {language} Code...</div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  timestamp,
  isTyping = false,
  streaming = false,
}) => {
  // For streaming effect
  const [displayedContent, setDisplayedContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIndexRef = useRef(0);
  
  // Reference to processed content for code generation indicators
  const [processedContent, setProcessedContent] = useState<React.ReactNode | string>("");

  // Start streaming when the message appears with streaming=true
  useEffect(() => {
    if (type === "assistant" && streaming && content) {
      setIsStreaming(true);
      streamIndexRef.current = 0;
      setDisplayedContent("");
      
      const streamText = () => {
        const currentIndex = streamIndexRef.current;
        if (currentIndex < content.length) {
          // Update the displayed text by adding the next character
          setDisplayedContent(prev => prev + content[currentIndex]);
          streamIndexRef.current = currentIndex + 1;
          
          // Schedule the next character with a slight delay to create the typing effect
          // Randomize the delay slightly to make it more natural
          const delay = 10 + Math.random() * 30;
          setTimeout(streamText, delay);
        } else {
          // Finished streaming
          setIsStreaming(false);
        }
      };
      
      // Start the streaming process
      streamText();
    } else if (!streaming) {
      // If not streaming, show the full content immediately
      setDisplayedContent(content);
    }
  }, [content, streaming, type]);

  // Process content to replace code generation placeholders with indicators
  useEffect(() => {
    if (type === "assistant" && displayedContent) {
      // Check for code generation placeholders
      const regex = /<code-generation language="([\w-]+)"><\/code-generation>/g;
      
      if (regex.test(displayedContent)) {
        // Split text by code generation placeholders
        const parts = displayedContent.split(/<code-generation language="([\w-]+)"><\/code-generation>/);
        
        // Build the content with indicators
        const processedParts: React.ReactNode[] = [];
        
        for (let i = 0; i < parts.length; i++) {
          if (i % 2 === 0) {
            // Text content
            if (parts[i]) {
              processedParts.push(
                <span key={`text-${i}`} dangerouslySetInnerHTML={{ __html: parts[i].replace(/\n/g, '<br>') }} />
              );
            }
          } else {
            // Code generation indicator
            const language = parts[i];
            processedParts.push(
              <CodeGenerationIndicator key={`code-${i}`} language={language} />
            );
          }
        }
        
        setProcessedContent(processedParts);
      } else {
        // No code generation placeholders
        setProcessedContent(displayedContent.replace(/\n/g, '<br>'));
      }
    } else {
      setProcessedContent(displayedContent);
    }
  }, [displayedContent, type]);

  return (
    <div
      className={cn(
        "group flex gap-3 py-4 animate-fade-in",
        type === "user" ? "justify-end" : "justify-start"
      )}
    >
      {type === "assistant" && (
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8 border">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">AI</AvatarFallback>
          </Avatar>
        </div>
      )}

      <div className="flex flex-col">
        <div
          className={cn(
            type === "user" ? "user-message" : "assistant-message"
          )}
        >
          {isTyping ? (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <div className="prose-sm">
              {type === "assistant" ? (
                typeof processedContent === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                ) : (
                  processedContent
                )
              ) : (
                content
              )}
              {isStreaming && <span className="cursor-blink">|</span>}
            </div>
          )}
        </div>
        {timestamp && (
          <div className="text-xs text-muted-foreground pt-1 px-1">
            {timestamp}
          </div>
        )}
      </div>

      {type === "user" && (
        <div className="flex-shrink-0 mt-1">
          <Avatar className="h-8 w-8 bg-accent">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">You</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};
