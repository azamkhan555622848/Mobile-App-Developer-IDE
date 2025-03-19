/**
 * Utilities for handling file structure and organization
 */
import { FileInfo } from "./file-analyzer";

export interface CodeFileData {
  filename: string;
  content: string;
  language: string;
  path?: string;  // String path like "lib/widgets"
  category?: string;
}

/**
 * Determines the appropriate project structure for a file
 */
export function getFileStructure(fileData: CodeFileData): {
  path: string[];  // Array path like ["lib", "widgets"]
  filename: string;
} {
  let path: string[] = [];
  let filename = fileData.filename;
  
  // If file already has a path, parse it to array
  if (fileData.path) {
    path = fileData.path.split('/');
  } else {
    // Default paths based on language
    if (fileData.language === 'dart' || fileData.language === 'flutter') {
      path = ['lib'];
    } else {
      path = ['src'];
    }
    
    // Use content analysis for more specific paths
    if (fileData.content) {
      if (fileData.language === 'dart' || fileData.language === 'flutter') {
        // Flutter specific organization
        if (fileData.content.includes('StatelessWidget') || 
            fileData.content.includes('StatefulWidget')) {
          path = ['lib', 'widgets'];
        } else if (fileData.content.includes('void main()')) {
          path = ['lib'];
          // Suggested filename for main entry point
          if (!filename.includes('main')) {
            filename = 'main.dart';
          }
        }
      } else if (fileData.language === 'jsx' || fileData.language === 'tsx' || 
                fileData.language === 'react') {
        // React specific organization
        if (fileData.content.includes('import React') || 
            fileData.content.includes('from "react"') || 
            fileData.content.includes("from 'react'")) {
          path = ['src', 'components'];
        }
      }
    }
  }
  
  return { path, filename };
}

/**
 * Creates nested folder structure
 */
export function createNestedFolders(structure: any[], path: string[]): void {
  if (path.length === 0) return;
  
  const folderName = path[0];
  const folderIndex = structure.findIndex(item => 
    item.type === 'folder' && item.name === folderName
  );
  
  if (folderIndex === -1) {
    // Create new folder
    const newFolder = {
      name: folderName,
      type: 'folder',
      open: true,
      children: []
    };
    structure.push(newFolder);
    
    // Process remaining path
    if (path.length > 1) {
      createNestedFolders(newFolder.children, path.slice(1));
    }
  } else {
    // Folder exists, continue with children
    if (path.length > 1) {
      createNestedFolders(structure[folderIndex].children || [], path.slice(1));
    }
  }
}

/**
 * Finds a folder in the nested structure
 */
export function findNestedFolder(structure: any[], path: string[]): any[] | null {
  if (path.length === 0) return structure;
  
  const folderName = path[0];
  const folder = structure.find(item => 
    item.type === 'folder' && item.name === folderName
  );
  
  if (!folder) return null;
  
  if (path.length === 1) {
    return folder.children || [];
  }
  
  return findNestedFolder(folder.children || [], path.slice(1));
} 