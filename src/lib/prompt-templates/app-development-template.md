# App Development Prompt Template

## Development Approach

When generating code for mobile applications, follow this structured approach:

### 1. Iterative Development Process
- First, create a high-level project architecture outlining:
  - Screens/pages
  - Reusable components
  - Data models
  - State management strategy
  - Navigation structure
- Only after establishing this architecture, proceed with generating specific implementation code
- Create code in logical, focused chunks rather than large monolithic files

### 2. Code Structure & Organization

#### For Flutter:
- Follow the standard Flutter project structure:
  - `/lib/screens/` - Full page UI components
  - `/lib/widgets/` - Reusable UI components
  - `/lib/models/` - Data models and DTOs
  - `/lib/services/` - API calls, device features, etc.
  - `/lib/providers/` or `/lib/blocs/` - State management
  - `/lib/utils/` - Helper functions and utilities

#### For React Native:
- Structure the project following best practices:
  - `/src/screens/` - Full page components
  - `/src/components/` - Reusable UI components
  - `/src/models/` - Data models and types
  - `/src/services/` - API integration
  - `/src/store/` - State management
  - `/src/utils/` - Helper functions and utilities
  - `/src/navigation/` - Navigation configuration

### 3. State Management

#### For Flutter:
- Use well-established state management solutions:
  - Provider or Riverpod for simpler apps
  - BLoC pattern for more complex state needs
  - GetX for rapid development
- Avoid global variables or singleton patterns
- Separate business logic from UI code
- Create proper model classes with immutability where appropriate

#### For React Native:
- Use modern state management approaches:
  - React Hooks (useState, useReducer) for component state
  - Context API for shared state
  - Redux or MobX for complex applications
- Follow unidirectional data flow principles
- Create properly typed interfaces/models for all data structures
- Implement selector patterns to prevent unnecessary re-renders

### 4. UI/UX Design Implementation

#### For Flutter:
- Use Material Design (Material 3) for Android or Cupertino for iOS
- Implement responsive layouts with:
  - Flexible and Expanded widgets
  - LayoutBuilder and MediaQuery for screen adaptations
  - Proper use of Constraints
- Create reusable widget components with customizable parameters
- Implement proper theming using ThemeData
- Use named constructors for widget variants

#### For React Native:
- Use platform-specific components when appropriate (Platform.OS checks)
- Implement responsive UI with:
  - Flexbox layouts
  - Dimensions API for screen size adaptation
  - Percentage-based sizing
- Create reusable functional components with proper prop types
- Implement a consistent theming system with styled-components or a custom theme provider
- Use React.memo for performance optimization on list items

### 5. Code Quality Standards

- Write clean, self-documenting code with meaningful variable and function names
- Include comments for complex logic
- Implement proper error handling with try/catch blocks
- Add appropriate null/undefined checks
- Create modular, reusable components rather than duplicating code
- Avoid deeply nested conditions and callbacks
- Implement proper loading and error states for async operations
- Include accessibility features:
  - Semantic labels for Flutter
  - accessibilityLabel props for React Native

## Implementation Example Format

When generating code, provide files in this structure:

```
[filename.extension]
// Code for this file

[anotherfile.extension]
// Code for another file
```

## Refinement Process

After initial code generation, focus on these improvements:
1. Identify potential performance issues
2. Refactor any repeated code into reusable components
3. Improve error handling and edge cases
4. Enhance the UI with animations and transitions
5. Add proper documentation and comments 