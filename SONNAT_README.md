# Lovable UI with Sonnat 3.5 Integration

This application integrates the Lovable UI frontend with the Sonnat 3.5 AI model API.

## Setup

1. Ensure you have Node.js (v16+) and npm installed on your system.

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following content:
   ```
   SONNAT_API_KEY="your-sonnat-api-key-here"
   SONNAT_API_ENDPOINT="https://api.sonant.ai/v1/chat"
   ```

4. Replace `your-sonnat-api-key-here` with your actual Sonnat 3.5 API key.

## Running the Application

The application consists of two parts:
- A Next.js server that handles API calls to the Sonnat 3.5 API
- A Vite-based React frontend that provides the UI

You can run both simultaneously using:

```
npm run dev:all
```

This will start:
- The Next.js API server on http://localhost:3000
- The Vite development server on http://localhost:5173 (or another port if 5173 is in use)

Open your browser and navigate to the Vite server URL to use the application.

## Features

- Chat interface that connects to Sonnat 3.5 AI
- Code editor for viewing and editing application code
- Preview section for visualizing the application

## Environment Variables

- `SONNAT_API_KEY`: Your Sonnat 3.5 API key
- `SONNAT_API_ENDPOINT`: The endpoint URL for the Sonnat 3.5 API

## Architecture

- Frontend: React, TypeScript, Tailwind CSS, shadcn/ui
- API: Next.js API routes
- AI: Sonnat 3.5 API integration

## Security Notes

This application keeps your API key on the server side in the Next.js API routes and never exposes it to the client. All communication with the Sonnat 3.5 API is proxied through the Next.js backend for security. 