import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import { XIcon, AlertTriangleIcon, CodeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { analyzeFileContent } from "@/lib/file-analyzer";

// Define file management event
export const CODE_FILE_CREATED_EVENT = 'code-file-created';

// Interface for code file data
export interface CodeFileData {
  filename: string;
  content: string;
  language: string;
}

// Helper function to extract code blocks from markdown
function extractCodeBlocks(markdown: string): CodeFileData[] {
  const codeBlockRegex = /```([\w-]+)?\n([\s\S]*?)```/g;
  const files: CodeFileData[] = [];
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1]?.trim() || 'text';
    const content = match[2]?.trim();
    
    if (content) {
      // Generate filename based on language
      let filename = '';
      let extension = '';
      
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          extension = 'js';
          filename = 'script';
          break;
        case 'typescript':
        case 'ts':
          extension = 'ts';
          filename = 'script';
          break;
        case 'jsx':
          extension = 'jsx';
          filename = 'component';
          break;
        case 'tsx':
          extension = 'tsx';
          filename = 'component';
          break;
        case 'react':
          extension = 'jsx';
          filename = 'component';
          break;
        case 'flutter':
        case 'dart':
          extension = 'dart';
          filename = 'main';
          break;
        case 'html':
          extension = 'html';
          filename = 'index';
          break;
        case 'css':
          extension = 'css';
          filename = 'styles';
          break;
        default:
          extension = language.toLowerCase();
          filename = 'file';
      }

      // Use timestamp to make filename unique
      const timestamp = Date.now();
      const fullFilename = `${filename}_${timestamp}.${extension}`;
      
      files.push({
        filename: fullFilename,
        content,
        language
      });
    }
  }
  
  return files;
}

// Helper function to remove code blocks from markdown and replace with placeholders
function cleanCodeBlocksFromMarkdown(markdown: string): string {
  const codeBlockRegex = /```([\w-]+)?\n([\s\S]*?)```/g;
  return markdown.replace(codeBlockRegex, (match, language) => {
    const lang = language?.trim() || 'text';
    return `<code-generation language="${lang}"></code-generation>`;
  });
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  streaming?: boolean;
  hasCodeBlocks?: boolean;
  attachment?: {
    name: string;
    type: string;
  };
}

interface ChatSectionProps {
  isMobile?: boolean;
  onToggleChat?: () => void;
  isExpanded?: boolean;
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

// Add utility functions for API retry logic
/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exponential backoff calculation
 * @param retry Current retry attempt number
 * @param baseDelay Base delay in milliseconds
 * @param maxDelay Maximum delay in milliseconds
 */
const calculateBackoff = (retry: number, baseDelay = 1000, maxDelay = 10000) => {
  // Calculate exponential backoff with jitter
  const expBackoff = Math.min(
    maxDelay,
    baseDelay * Math.pow(2, retry) + Math.random() * 1000
  );
  return expBackoff;
};

/**
 * Make an API request with exponential backoff retry
 * @param url API endpoint
 * @param options Fetch options
 * @param maxRetries Maximum number of retries
 */
const fetchWithRetry = async (
  url: string, 
  options: RequestInit, 
  maxRetries = 3
): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const response = await fetch(url, options);
      
      // If response is OK, return it
      if (response.ok) {
        return response;
      }
      
      // Otherwise parse the error
      const errorData = await response.json();
      
      // Check specifically for overloaded error
      if (errorData?.error?.type === 'overloaded_error') {
        // This is a retriable error - calculate backoff and retry
        if (retry < maxRetries) {
          const backoffTime = calculateBackoff(retry);
          console.log(`API overloaded, retrying in ${backoffTime}ms (attempt ${retry + 1}/${maxRetries})`);
          
          // Wait before retrying
          await sleep(backoffTime);
          continue;
        }
      }
      
      // For other API errors or if we exhausted retries for overloaded error
      throw new Error(errorData?.error?.message || 'API request failed');
    } catch (error) {
      lastError = error as Error;
      
      // For network errors, retry with backoff
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (retry < maxRetries) {
          const backoffTime = calculateBackoff(retry);
          console.log(`Network error, retrying in ${backoffTime}ms (attempt ${retry + 1}/${maxRetries})`);
          
          // Wait before retrying
          await sleep(backoffTime);
          continue;
        }
      }
      
      // If we've reached max retries or it's not a retriable error, throw
      if (retry === maxRetries) {
        throw lastError;
      }
    }
  }
  
  // This should never happen, but TypeScript needs a return value
  throw lastError || new Error('Unknown error in fetch retry logic');
};

export const ChatSection: React.FC<ChatSectionProps> = ({
  isMobile = false,
  onToggleChat,
  isExpanded = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hi, I'm Lovable! I can help you create and edit web applications using Claude 3.5 Sonnet. What would you like to build today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Call the Next.js API endpoint with retry
      const response = await fetchWithRetry('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      }, 3); // 3 retries max

      const data = await response.json();
      
      if (!data || data.error) {
        throw new Error(data?.error || 'Failed to get response from AI');
      }

      // Check if response contains code blocks
      const codeFiles = extractCodeBlocks(data.answer);
      const hasCodeBlocks = codeFiles.length > 0;
      
      // Clean the message content by removing code blocks and replacing with placeholders
      const cleanedContent = hasCodeBlocks 
        ? cleanCodeBlocksFromMarkdown(data.answer)
        : data.answer;
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: cleanedContent,
        timestamp: new Date().toLocaleTimeString(),
        streaming: true, // Enable streaming for AI responses
        hasCodeBlocks
      };
      
      setIsTyping(false); // Stop the typing indicator first
      setMessages((prev) => [...prev, assistantMessage]);
      
      // If code blocks were found, create files and trigger event
      if (hasCodeBlocks) {
        // Add small delay to allow the UI to update with code generation indicators
        setTimeout(() => {
          // Process files to determine proper structure and naming
          codeFiles.forEach(fileData => {
            // Analyze file content to determine proper organization
            const fileInfo = analyzeFileContent(
              fileData.content, 
              fileData.language, 
              fileData.filename
            );
            
            // Use suggested filename if available
            const filename = fileInfo.suggestedFilename || fileData.filename;
            
            // Create enhanced file data with path information
            const enhancedFileData = {
              ...fileData,
              filename: filename,
              path: fileInfo.path.join('/'),
              category: fileInfo.category
            };
            
            // Dispatch custom event to notify about the new code file
            const event = new CustomEvent(CODE_FILE_CREATED_EVENT, { 
              detail: enhancedFileData 
            });
            window.dispatchEvent(event);
            
            // Show notification with category and path
            toast.success(`Created ${fileInfo.category}: ${filename}`, {
              description: `Added to ${fileInfo.path.join('/')}`,
            });
          });
        }, 800);
      }
    } catch (err) {
      console.error('Error calling AI API:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      
      // Specific messaging for overloaded API
      if (errorMessage.toLowerCase().includes('overload')) {
        setError('The AI service is currently experiencing high demand. Please try again in a moment.');
        toast.error("AI service overloaded", {
          description: "The service is experiencing high demand. Your request will be retried automatically.",
        });
      } else {
        setError(errorMessage);
        toast.error("Failed to get AI response", {
          description: errorMessage,
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleAttachFile = (file: File) => {
    // Create a message with the file attachment
    const fileMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: `Attached file: ${file.name}`,
      timestamp: new Date().toLocaleTimeString(),
      attachment: {
        name: file.name,
        type: file.type,
      },
    };

    setMessages((prev) => [...prev, fileMessage]);
    setIsTyping(true);

    // For now, we'll just acknowledge the file attachment
    // In a real implementation, you would upload the file to a server and process it
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `I've received your file "${file.name}". Note that file processing is not yet integrated with the Claude 3.5 API. What would you like me to do with it?`,
        timestamp: new Date().toLocaleTimeString(),
        streaming: true
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  return (
    <section
      className={cn(
        "h-full flex flex-col bg-background/90 backdrop-blur-md transition-all duration-300 ease-in-out glassmorphism",
        isExpanded ? "w-full" : "w-0",
        isMobile && !isExpanded ? "w-0" : isMobile && isExpanded ? "w-full absolute inset-0 z-50" : ""
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/30 bg-secondary/20 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xs backdrop-blur-sm">
            C
          </div>
          <h2 className="font-semibold text-sm">Claude 3.5</h2>
        </div>
        {onToggleChat && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleChat}
            className="h-7 w-7"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="bg-secondary/10 border-b border-border/30 px-4 py-3 space-y-3 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <AlertTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium mb-1">Using Claude 3.5 AI</p>
            <p className="text-muted-foreground">This chat is powered by Claude 3.5 AI. Your messages are sent to the API for processing.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs bg-secondary/40 border-border/60 hover:bg-secondary">
            Visit docs
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs bg-secondary/40 border-border/60 hover:bg-secondary">
            API Settings
          </Button>
        </div>

        {error && (
        <div className="flex items-start space-x-3 bg-destructive/10 p-3 rounded-md border border-destructive/20">
          <AlertTriangleIcon className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-medium mb-1">Error</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            type={message.type}
            content={message.content}
            timestamp={message.timestamp}
            streaming={message.streaming}
          />
        ))}
        {isTyping && (
          <ChatMessage
            type="assistant"
            content=""
            isTyping={true}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border/30 bg-secondary/10 backdrop-blur-sm">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          isLoading={isTyping} 
          onAttachFile={handleAttachFile}
        />
      </div>
    </section>
  );
};
