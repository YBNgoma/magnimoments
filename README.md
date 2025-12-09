# Magnimoments

A private and secure family memorial platform designed to preserve cherished memories with dignity and grace. Magnimoments provides families with a collaborative space to honor loved ones, share stories, and celebrate lives well-lived.

## Overview

Magnimoments offers a thoughtful digital environment where families can create personalized memorial pages, upload photos and videos, share memories, and maintain a lasting tribute to those who have passed. The platform emphasizes privacy, security, and ease of use during difficult times.

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- A Gemini API key

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   - Open the `.env.local` file
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local development URL (typically `http://localhost:5173`)

## Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Technology Stack

- **Frontend:** React 19 with TypeScript
- **Build Tool:** Vite
- **UI Icons:** Lucide React
- **AI Integration:** Google Gemini API

## Support

For questions or assistance, please contact the development team.
