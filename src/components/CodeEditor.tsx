import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileIcon, FolderIcon, ChevronRightIcon, ChevronDownIcon, CodeIcon, CopyIcon, CheckIcon } from "lucide-react";
import { CODE_FILE_CREATED_EVENT, CodeFileData } from "./ChatSection";
import { FileInfo } from "@/lib/file-analyzer";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getFileStructure, createNestedFolders, findNestedFolder } from "@/lib/file-structure";

// File content mapping
interface FileContent {
  [filename: string]: string;
}

interface FileStructure {
  name: string;
  type: "file" | "folder";
  extension?: string;
  children?: FileStructure[];
  open?: boolean;
  active?: boolean;
  path?: string; // Store full path for file access
}

interface CodeEditorProps {
  className?: string;
}

// Helper to map file extensions to language for syntax highlighting
const mapExtensionToLanguage = (extension: string | undefined): string => {
  if (!extension) return 'text';
  
  const mappings: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'dart': 'dart',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml',
    'graphql': 'graphql',
    'swift': 'swift',
    'kt': 'kotlin',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'sh': 'bash'
  };
  
  return mappings[extension.toLowerCase()] || 'text';
};

// Create folder structure recursively
const createFolderStructure = (structure: FileStructure[], path: string[]): void => {
  if (path.length === 0) return;
  
  const folderName = path[0];
  const folderIndex = structure.findIndex(item => item.type === 'folder' && item.name === folderName);
  
  if (folderIndex === -1) {
    // Folder doesn't exist, create it
    const newFolder: FileStructure = {
      name: folderName,
      type: 'folder',
      open: true,
      children: []
    };
    structure.push(newFolder);
    
    // Process remaining path recursively
    if (path.length > 1) {
      createFolderStructure(newFolder.children!, path.slice(1));
    }
  } else {
    // Folder exists, process remaining path recursively
    if (path.length > 1) {
      createFolderStructure(structure[folderIndex].children!, path.slice(1));
    }
  }
};

// Find folder recursively
const findFolder = (structure: FileStructure[], path: string[]): FileStructure['children'] | null => {
  if (path.length === 0) return structure;
  
  const folderName = path[0];
  const folder = structure.find(item => item.type === 'folder' && item.name === folderName);
  
  if (!folder) return null;
  
  if (path.length === 1) {
    return folder.children || [];
  }
  
  return findFolder(folder.children || [], path.slice(1));
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ className }) => {
  const [copied, setCopied] = useState(false);
  // Start with empty file structure
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([]);
  
  // Store file contents
  const [fileContents, setFileContents] = useState<FileContent>({});
  
  // Currently active/displayed file
  const [activeFile, setActiveFile] = useState<string | null>(null);
  // Full path to active file (for display purposes)
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  
  // Initial empty state message
  const [hasFiles, setHasFiles] = useState(false);
  
  // Application type detection
  const [detectedAppType, setDetectedAppType] = useState<'flutter' | 'react' | 'react-native' | 'unknown'>('unknown');
  
  // Theme for syntax highlighting
  const [syntaxTheme, setSyntaxTheme] = useState(vscDarkPlus);
  
  // Update the useEffect that handles the CODE_FILE_CREATED_EVENT
  useEffect(() => {
    const handleCodeFileCreated = (event: CustomEvent<CodeFileData>) => {
      const fileData = event.detail;
      
      // Get proper file structure using our utility
      const { path, filename: name } = getFileStructure(fileData);
      
      // Full path for file access
      const fullPath = [...path, name].join('/');
      
      // Store the file content with full path as key
      setFileContents(prev => ({
        ...prev,
        [fullPath]: fileData.content
      }));
      
      // Update the file structure
      setFileStructure(prev => {
        const newStructure = [...prev];
        
        // Create necessary folder structure
        createFolderStructure(newStructure, path);
        
        // Find the target folder to add the file
        const targetFolder = findFolder(newStructure, path);
        
        if (targetFolder) {
          // Deactivate all existing files
          const deactivateAllFiles = (items: FileStructure[]) => {
            items.forEach(item => {
              if (item.type === 'file') {
                item.active = false;
              }
              if (item.children) {
                deactivateAllFiles(item.children);
              }
            });
          };
          
          deactivateAllFiles(newStructure);
          
          // Add the file to the target folder
          targetFolder.push({
            name: name,
            type: 'file',
            extension: name.split('.').pop(),
            active: true,
            path: fullPath
          });
        }
        
        // Detect app type based on created files and content
        if (fileData.language === 'dart' || fileData.language === 'flutter') {
          setDetectedAppType('flutter');
        } else if (fileData.language === 'jsx' || fileData.language === 'tsx' || fileData.language === 'react') {
          if (fileData.content.includes('react-native')) {
            setDetectedAppType('react-native');
          } else {
            setDetectedAppType('react');
          }
        }
        
        // Set the new file as active
        setActiveFile(name);
        setActiveFilePath(fullPath);
        setHasFiles(true);
        
        return newStructure;
      });
    };
    
    // Add event listener
    window.addEventListener(
      CODE_FILE_CREATED_EVENT, 
      handleCodeFileCreated as EventListener
    );
    
    // Clean up
    return () => {
      window.removeEventListener(
        CODE_FILE_CREATED_EVENT, 
        handleCodeFileCreated as EventListener
      );
    };
  }, []);

  const handleCopy = () => {
    // Get the content of the active file
    if (!activeFilePath) return;
    
    const contentToCopy = fileContents[activeFilePath] || '';
    
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (path: string[]) => {
    const newFileStructure = [...fileStructure];
    let current = newFileStructure;
    let target = null;

    // Navigate to the target folder
    for (const segment of path) {
      const index = current.findIndex(item => item.name === segment);
      if (index === -1) return;
      
      if (path.indexOf(segment) === path.length - 1) {
        target = current[index];
      } else {
        current = current[index].children || [];
      }
    }

    if (target && target.type === 'folder') {
      target.open = !target.open;
      setFileStructure(newFileStructure);
    }
  };

  const selectFile = (path: string[]) => {
    const newFileStructure = [...fileStructure];
    
    // First, deactivate all files
    const deactivateAllFiles = (items: FileStructure[]) => {
      items.forEach(item => {
        if (item.type === 'file') {
          item.active = false;
        }
        if (item.children) {
          deactivateAllFiles(item.children);
        }
      });
    };
    
    deactivateAllFiles(newFileStructure);
    
    // Then activate the selected file
    let current = newFileStructure;
    let target = null;
    let fullPath: string[] = [];

    // Navigate to the target file
    for (const segment of path) {
      fullPath.push(segment);
      const index = current.findIndex(item => item.name === segment);
      if (index === -1) return;
      
      if (path.indexOf(segment) === path.length - 1) {
        target = current[index];
      } else {
        current = current[index].children || [];
      }
    }

    if (target && target.type === 'file') {
      target.active = true;
      setFileStructure(newFileStructure);
      setActiveFile(target.name);
      setActiveFilePath(target.path || fullPath.join('/'));
    }
  };

  // Get the content of the currently active file
  const getActiveFileContent = () => {
    if (activeFilePath && fileContents[activeFilePath]) {
      return fileContents[activeFilePath];
    }
    
    return "";
  };
  
  // Get the language for syntax highlighting based on file extension
  const getActiveFileLanguage = (): string => {
    if (!activeFile) return 'text';
    const extension = activeFile.split('.').pop();
    return mapExtensionToLanguage(extension);
  };

  const renderFileStructure = (items: FileStructure[], path: string[] = []) => {
    return items.map((item) => (
      <div key={item.name} className="select-none">
        <div 
          className={cn(
            "flex items-center py-1 px-2 text-sm rounded group hover:bg-accent/20 cursor-pointer",
            item.active && "bg-accent/30"
          )}
          onClick={() => {
            const newPath = [...path, item.name];
            if (item.type === 'folder') {
              toggleFolder(newPath);
            } else {
              selectFile(newPath);
            }
          }}
        >
          <div className="mr-1 w-4 flex-shrink-0">
            {item.type === "folder" ? (
              item.open ? (
                <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
              )
            ) : null}
          </div>
          
          <div className="mr-2 flex-shrink-0">
            {item.type === "folder" ? (
              <FolderIcon className="h-4 w-4 text-amber-400" />
            ) : (
              <FileIcon className="h-4 w-4 text-blue-400" />
            )}
          </div>
          
          <span className={cn(
            item.active && "font-medium"
          )}>
            {item.name}
          </span>
        </div>
        
        {item.children && item.open && (
          <div className="ml-4">
            {renderFileStructure(item.children, [...path, item.name])}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* File Explorer Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-secondary/30 border-r border-border/40">
          <div className="p-2">
            <div className="mb-2 px-2 py-1 text-xs font-medium uppercase text-muted-foreground flex justify-between items-center">
              <span>Explorer</span>
              {detectedAppType !== 'unknown' && (
                <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded text-primary">
                  {detectedAppType}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {renderFileStructure(fileStructure)}
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Code Content Area */}
        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col bg-background">
            {!hasFiles ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <CodeIcon className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No Files Yet</h3>
                <p className="text-sm text-center max-w-md px-4">
                  Ask Claude to write some code for you, and it will appear here automatically.
                  <br /><br />
                  Try asking for a Flutter app, React component, or any other code example.
                </p>
              </div>
            ) : (
              <>
                <div className="flex border-b border-border px-3 bg-secondary/30">
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList className="h-9 bg-transparent p-0">
                      <TabsTrigger 
                        value="code" 
                        className="rounded-none border-r border-border data-[state=active]:bg-background data-[state=active]:shadow-none"
                      >
                        <div className="flex items-center space-x-2">
                          <FileIcon className="h-4 w-4 text-blue-400" />
                          <span className="max-w-[200px] truncate" title={activeFilePath || ""}>
                            {activeFilePath || activeFile}
                          </span>
                        </div>
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">Copy code</span>
                      </Button>
                    </div>
                  </Tabs>
                </div>
                
                <div className="flex-1 overflow-auto">
                  <SyntaxHighlighter
                    language={getActiveFileLanguage()}
                    style={syntaxTheme}
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '0.875rem',
                      height: '100%',
                      overflow: 'auto'
                    }}
                    showLineNumbers={true}
                    wrapLongLines={false}
                  >
                    {getActiveFileContent()}
                  </SyntaxHighlighter>
                </div>
              </>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
