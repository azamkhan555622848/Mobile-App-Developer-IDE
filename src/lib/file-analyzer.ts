/**
 * File analyzer utility for determining proper file organization
 * based on code content analysis
 */

export interface FileInfo {
  path: string[];
  category: 'component' | 'screen' | 'model' | 'service' | 'util' | 'config' | 'state' | 'widget' | 'other';
  suggestedFilename?: string;
}

export interface CodeFileMetadata {
  content: string;
  language: string;
  filename: string;
}

/**
 * Analyzes file content to determine appropriate placement in project structure
 */
export function analyzeFileContent(
  content: string, 
  language: string,
  filename?: string
): FileInfo {
  // Default path and category
  let path: string[] = ['src'];
  let category: FileInfo['category'] = 'other';
  let suggestedFilename: string | undefined = undefined;

  // Flutter/Dart analysis
  if (isFlutterOrDart(language)) {
    return analyzeFlutterFile(content, filename);
  }
  
  // React/React Native analysis
  if (isReactOrReactNative(language)) {
    return analyzeReactFile(content, filename);
  }

  // Handle other file types
  if (language === 'css' || language === 'scss') {
    path = ['src', 'styles'];
    category = 'other';
  } else if (language === 'json') {
    if (filename === 'package.json') {
      path = []; // Root level
    } else {
      path = ['src', 'assets'];
    }
    category = 'config';
  }

  return { path, category, suggestedFilename };
}

/**
 * Determines if the language is Flutter/Dart
 */
function isFlutterOrDart(language: string): boolean {
  return language === 'dart' || language === 'flutter';
}

/**
 * Analyzes Flutter/Dart file content
 */
function analyzeFlutterFile(content: string, filename?: string): FileInfo {
  let path: string[] = ['lib'];
  let category: FileInfo['category'] = 'other';
  let suggestedFilename: string | undefined = undefined;

  // Detect file type by content patterns
  if (content.includes('class') && content.includes('extends StatelessWidget')) {
    path = ['lib', 'widgets'];
    category = 'widget';
    
    // Try to extract widget name for better filename
    const widgetMatch = content.match(/class\s+(\w+)\s+extends\s+StatelessWidget/);
    if (widgetMatch && widgetMatch[1]) {
      suggestedFilename = toSnakeCase(widgetMatch[1]) + '.dart';
    }
  } 
  else if (content.includes('class') && content.includes('extends StatefulWidget')) {
    // Check if it's likely a screen by content or name
    if (content.includes('Scaffold(') && (content.includes('appBar:') || content.includes('body:'))) {
      path = ['lib', 'screens'];
      category = 'screen';
      
      // Try to extract screen name
      const screenMatch = content.match(/class\s+(\w+)\s+extends\s+StatefulWidget/);
      if (screenMatch && screenMatch[1]) {
        const name = screenMatch[1].replace('Screen', '').replace('Page', '');
        suggestedFilename = toSnakeCase(name) + '_screen.dart';
      }
    } else {
      path = ['lib', 'widgets'];
      category = 'widget';
      
      // Try to extract widget name
      const widgetMatch = content.match(/class\s+(\w+)\s+extends\s+StatefulWidget/);
      if (widgetMatch && widgetMatch[1]) {
        suggestedFilename = toSnakeCase(widgetMatch[1]) + '.dart';
      }
    }
  }
  else if (content.includes('class') && !content.includes('extends') && content.includes('{')) {
    // Likely a model class
    path = ['lib', 'models'];
    category = 'model';
    
    // Try to extract model name
    const modelMatch = content.match(/class\s+(\w+)(\s+{|\s+implements|\s+extends)/);
    if (modelMatch && modelMatch[1]) {
      suggestedFilename = toSnakeCase(modelMatch[1]) + '.dart';
    }
  }
  else if ((content.includes('Future<') || content.includes('Stream<')) && 
           (content.includes('http.') || content.includes('dio.') || content.includes('fetch'))) {
    // API service or repository
    path = ['lib', 'services'];
    category = 'service';
    
    if (content.includes('Repository')) {
      suggestedFilename = extractNameFromContent(content, 'Repository') || 'repository.dart';
    } else {
      suggestedFilename = extractNameFromContent(content, 'Service') || 'api_service.dart';
    }
  }
  else if (content.includes('void main()')) {
    // Main app file
    path = ['lib'];
    category = 'other';
    suggestedFilename = 'main.dart';
  }
  else if (content.includes('ChangeNotifier') || content.includes('StateNotifier') || 
          content.includes('Cubit') || content.includes('Bloc')) {
    // State management
    path = ['lib', 'providers'];
    category = 'state';
    
    if (content.includes('Bloc')) {
      path = ['lib', 'blocs'];
      
      // Extract bloc name
      const blocMatch = content.match(/class\s+(\w+)Bloc/);
      if (blocMatch && blocMatch[1]) {
        suggestedFilename = toSnakeCase(blocMatch[1]) + '_bloc.dart';
      }
    } else {
      // Extract provider name
      const providerMatch = content.match(/class\s+(\w+)(Provider|Notifier)/);
      if (providerMatch && providerMatch[1]) {
        suggestedFilename = toSnakeCase(providerMatch[1]) + '_provider.dart';
      }
    }
  }

  return { path, category, suggestedFilename };
}

/**
 * Determines if the language is React or React Native
 */
function isReactOrReactNative(language: string): boolean {
  return language === 'jsx' || language === 'tsx' || language === 'react' || 
         language === 'javascript' || language === 'typescript';
}

/**
 * Analyzes React/React Native file content
 */
function analyzeReactFile(content: string, filename?: string): FileInfo {
  let path: string[] = ['src'];
  let category: FileInfo['category'] = 'other';
  let suggestedFilename: string | undefined = undefined;

  // Check for React Native specific imports
  const isReactNative = content.includes('react-native') || 
                       content.includes('from \'react-native\'') || 
                       content.includes('from "react-native"');

  // Check if it's a component
  const isComponent = content.includes('import React') || 
                     content.includes('from \'react\'') || 
                     content.includes('from "react"');
                     
  if (isComponent) {
    // Check if it's a screen/page component
    const isScreen = content.includes('Screen') || 
                    content.includes('Page') || 
                    content.includes('navigation') || 
                    content.includes('route') || 
                    content.includes('useNavigation') ||
                    content.includes('useRoute');

    if (isScreen) {
      path = ['src', 'screens'];
      category = 'screen';
      
      // Try to extract screen name
      const componentName = extractComponentName(content);
      if (componentName) {
        const baseName = componentName
          .replace('Screen', '')
          .replace('Page', '');
        
        const ext = language === 'typescript' || language === 'tsx' ? 'tsx' : 'jsx';
        suggestedFilename = `${baseName}Screen.${ext}`;
      }
    } else {
      path = ['src', 'components'];
      category = 'component';
      
      // Try to extract component name
      const componentName = extractComponentName(content);
      if (componentName) {
        const ext = language === 'typescript' || language === 'tsx' ? 'tsx' : 'jsx';
        suggestedFilename = `${componentName}.${ext}`;
      }
    }
  }
  // Check if it's a model/type definition
  else if ((language === 'typescript' || language === 'tsx') && 
          (content.includes('interface ') || content.includes('type ') || content.includes('enum '))) {
    path = ['src', 'models'];
    category = 'model';
    
    // Try to extract type name
    const typeMatch = content.match(/(interface|type)\s+(\w+)/);
    if (typeMatch && typeMatch[2]) {
      suggestedFilename = `${typeMatch[2]}.ts`;
    }
  }
  // Check if it's a service/API
  else if (content.includes('fetch(') || content.includes('axios') || 
          content.includes('api') || content.includes('service')) {
    path = ['src', 'services'];
    category = 'service';
    
    // Try to determine appropriate name
    if (content.includes('api')) {
      suggestedFilename = 'api.ts';
    } else {
      suggestedFilename = 'service.ts';
    }
  }
  // Check if it's Redux/state management
  else if (content.includes('createSlice') || content.includes('reducer') || 
          content.includes('action') || content.includes('store') ||
          content.includes('createContext')) {
    path = ['src', 'store'];
    category = 'state';
    
    if (content.includes('createContext')) {
      path = ['src', 'context'];
      // Extract context name
      const contextMatch = content.match(/const\s+(\w+)Context/);
      if (contextMatch && contextMatch[1]) {
        suggestedFilename = `${contextMatch[1]}Context.tsx`;
      } else {
        suggestedFilename = 'context.tsx';
      }
    }
  }
  // Navigation configuration
  else if (content.includes('createStackNavigator') || content.includes('NavigationContainer')) {
    path = ['src', 'navigation'];
    category = 'other';
    suggestedFilename = 'navigation.tsx';
  }

  return { path, category, suggestedFilename };
}

/**
 * Extracts component name from React component definition
 */
function extractComponentName(content: string): string | null {
  // Check for function components
  const functionMatch = content.match(/function\s+(\w+)\s*\(/);
  if (functionMatch && functionMatch[1]) {
    return functionMatch[1];
  }
  
  // Check for arrow function components
  const arrowMatch = content.match(/const\s+(\w+)\s*=\s*\(.*\)\s*=>/);
  if (arrowMatch && arrowMatch[1]) {
    return arrowMatch[1];
  }
  
  // Check for class components
  const classMatch = content.match(/class\s+(\w+)\s+extends\s+(React\.)?Component/);
  if (classMatch && classMatch[1]) {
    return classMatch[1];
  }
  
  return null;
}

/**
 * Extracts name from content based on a suffix pattern
 */
function extractNameFromContent(content: string, suffix: string): string | null {
  const match = content.match(new RegExp(`class\\s+(\\w+)${suffix}`));
  if (match && match[1]) {
    return toSnakeCase(match[1]) + '_' + suffix.toLowerCase() + '.dart';
  }
  return null;
}

/**
 * Converts a string from camelCase or PascalCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
} 