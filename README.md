# Lovable UI with Claude 3.5 Integration

This application integrates the Lovable UI frontend with Anthropic's Claude 3.5 Sonnet model through the Anthropic API.

## Features

- Interactive chat interface powered by Claude 3.5 Sonnet
- Code editor for viewing and editing application code
- Live preview of your application
- Responsive design for mobile and desktop
- Intelligent code file organization with automatic project structure
- API resilience with exponential backoff retry mechanism
- Optimized code generation with structured prompting

## Setup

1. Ensure you have Node.js (v16+) and npm installed on your system.

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Anthropic API key:
   ```
   SONNAT_API_KEY="your-anthropic-api-key-here"
   ```

4. Replace `your-anthropic-api-key-here` with your actual Anthropic API key.

## Running the Application

The application consists of two parts:
- A Next.js server that handles API calls to the Claude 3.5 model
- A Vite-based React frontend that provides the UI

You can run both simultaneously using:

```
npm run dev:all
```

This will start:
- The Next.js API server on http://localhost:3000
- The Vite development server on http://localhost:5173 (or another port if 5173 is in use)

Open your browser and navigate to the Vite server URL to use the application.

## How It Works

1. The frontend sends user messages to the Next.js API endpoint (`/api/chat`)
2. The Next.js server forwards these messages to the Anthropic API using the Claude 3.5 Sonnet model
3. The response from Claude is sent back to the frontend and displayed in the chat
4. Code blocks in the response are extracted and organized into a proper project structure
5. Generated code files are displayed in the Code Explorer with appropriate organization

## API Integration

The application uses the Anthropic Messages API following their recommended patterns:

```javascript
const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.SONNAT_API_KEY || '',
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    messages: [{ role: "user", content: message }],
  }),
});
```

## Key Components

### API Resilience

The application implements a robust retry mechanism with exponential backoff to handle API overload situations:

```javascript
// Retry with exponential backoff
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // Retry on overloaded error
      const errorData = await response.json();
      if (errorData?.error?.type === 'overloaded_error') {
        const backoffTime = baseDelay * Math.pow(2, retry) + jitter;
        await sleep(backoffTime);
        continue;
      }
      throw new Error(errorData?.error?.message);
    } catch (error) {
      // Handle retry logic...
    }
  }
};
```

### Intelligent Code Organization

The application includes a sophisticated file analyzer that examines generated code and organizes it into a proper project structure:

- React components go to `/src/components/`
- Flutter widgets go to `/lib/widgets/`
- API services and models are organized appropriately
- Files are automatically named based on their content

### Structured Prompting

The application uses structured prompting to guide the Claude model in generating well-organized, maintainable code following best practices:

- Framework-specific architectural patterns
- Proper state management approaches
- UI/UX design optimization
- Code quality standards

## Security Notes

This application keeps your API key on the server side in the Next.js API routes and never exposes it to the client. All communication with the Anthropic API is proxied through the Next.js backend for security.

## Project info

**URL**: https://lovable.dev/projects/fed1c125-3583-420c-9dca-858dbc58affd

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/fed1c125-3583-420c-9dca-858dbc58affd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Next.js API routes
- Anthropic Claude 3.5 API

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/fed1c125-3583-420c-9dca-858dbc58affd) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
