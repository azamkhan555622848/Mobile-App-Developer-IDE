# Code Generation Integration Guide

## How to Use the Prompt Template

The app-development-template provides a structured approach for generating high-quality, well-organized mobile application code. This guide explains how to integrate it with our application's code generation pipeline.

### Prompt Injection

1. When a user requests the generation of a Flutter or React Native application, prefill the prompt with guidance from the template:

```javascript
// Example implementation in the prompt construction
function buildAppGenerationPrompt(userRequest, appType) {
  // Load the template
  const template = loadPromptTemplate('app-development-template.md');
  
  // Construct the prompt with the template as guidance
  return `
Please follow these guidelines when creating the ${appType} application:

${template}

Now, based on these guidelines, please implement: ${userRequest}
  `;
}
```

### File Structure Handling

When the AI generates code blocks, they will be processed and organized into the appropriate file structure:

1. Use the `determineProjectStructure` function in `CodeEditor.tsx` to properly categorize files based on:
   - Framework (Flutter/React Native)
   - File type (component, screen, model, etc.)
   - Content analysis

2. The `CODE_FILE_CREATED_EVENT` dispatches the generated code with appropriate metadata to create a well-organized file structure in the explorer.

### Implementation Notes

- Ensure we analyze file content to determine appropriate placement (e.g., Widget files go to `/lib/widgets/` in Flutter)
- Generate project scaffolding files like `pubspec.yaml` (Flutter) or `package.json` (React Native) automatically
- When processing code blocks from the AI, parse filenames from markdown headers or comments if provided

### Example Response Processing

```javascript
// In ChatSection.tsx
function processCodeResponse(aiResponse) {
  // Extract code blocks as before
  const codeFiles = extractCodeBlocks(aiResponse);
  
  // Add intelligent file organization
  const organizedFiles = codeFiles.map(file => {
    // Analyze file content to determine proper path
    const fileInfo = analyzeFileContent(file.content, file.language);
    
    // Update file metadata
    return {
      ...file,
      path: fileInfo.path,
      category: fileInfo.category,
      // Keep the suggested filename or use a better one based on content
      filename: fileInfo.suggestedFilename || file.filename
    };
  });
  
  // Dispatch file creation events
  organizedFiles.forEach(file => {
    const event = new CustomEvent(CODE_FILE_CREATED_EVENT, { detail: file });
    window.dispatchEvent(event);
  });
}
```

## Sandbox Integration

When deploying the generated app to the Fly.io sandbox:

1. Ensure the correct project structure is maintained during packaging
2. Include necessary configuration files for each framework
3. Set up appropriate dependency handling for:
   - Flutter: Include pubspec.yaml with dependencies
   - React Native: Include package.json with required packages

The template ensures that generated code follows best practices and is structured appropriately for the preview system to deploy and run seamlessly. 