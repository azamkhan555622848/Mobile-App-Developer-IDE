
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onAttachFile?: (file: File) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  onAttachFile,
}) => {
  const [message, setMessage] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAttachFile) {
      onAttachFile(files[0]);
      // Reset the input value so the same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full mt-auto relative rounded-lg border border-border/40 bg-secondary/30 backdrop-blur-md p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring/50"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleFileClick}
        className="h-9 w-9 rounded-full mr-1 flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
        disabled={isLoading}
      >
        <Paperclip className="h-4 w-4" />
        <span className="sr-only">Attach file</span>
      </Button>
      <textarea
        ref={textAreaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Message Lovable..."
        className="flex-1 resize-none bg-transparent outline-none min-h-[40px] max-h-[200px] py-2 px-3 text-sm"
        disabled={isLoading}
        rows={1}
      />
      <Button
        type="submit"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full ml-2 flex-shrink-0",
          "bg-primary/90 text-primary-foreground hover:bg-primary",
          "backdrop-blur-sm shadow-sm"
        )}
        disabled={!message.trim() || isLoading}
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
};
