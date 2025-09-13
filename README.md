# AR25 Hack - Screen Recording Automation Platform

A Next.js application that analyzes screen recordings using AI to extract actionable steps and automate web browser interactions.

## 🚀 Overview

AR25 Hack is an innovative platform that transforms screen recordings into structured action steps using advanced AI models. The application leverages computer vision, natural language processing, and browser automation to understand and replicate user interactions from video content.

## ✨ Features

- **Video Upload & Processing**: Drag-and-drop interface for uploading screen recordings (`.mov`, `.mp4`, and other video formats)
- **AI-Powered Video Analysis**: Uses TwelveLabs' multimodal AI models to analyze video content and extract meaningful insights
- **Action Step Generation**: Converts video analysis into structured, actionable steps using OpenAI's GPT-4
- **Browser Automation**: Integrates with Browser-Use SDK for automated web interactions (coming soon)
- **Real-time Processing**: Streaming interface for real-time feedback during video analysis
- **Modern UI**: Clean, responsive interface built with Tailwind CSS and Lucide React icons

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling and responsive design
- **Lucide React** - Icon library
- **Motion** - Animation library

### AI & APIs
- **TwelveLabs JS SDK** - Video analysis and understanding
- **OpenAI API** - GPT-4 for structured data generation
- **Browser-Use SDK** - Browser automation capabilities

### Development Tools
- **Turbopack** - Fast bundler for development
- **Zod** - Schema validation
- **Class Variance Authority** - Utility for managing CSS class variants

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- API keys for:
  - TwelveLabs API
  - OpenAI API
  - Browser-Use API

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ar25-hack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   TWELVELABS_API_KEY=your_twelvelabs_api_key
   OPENAI_API_KEY=your_openai_api_key
   BROWSER_USE_API_KEY=your_browser_use_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

1. **Upload a Screen Recording**
   - Drag and drop a video file onto the upload area, or click to browse
   - Supported formats: `.mov`, `.mp4`, and other standard video formats

2. **Process the Video**
   - Click "Run Code" to start the analysis pipeline
   - The system will:
     - Create a TwelveLabs index for video analysis
     - Upload and process your video
     - Generate AI-powered insights about the screen recording
     - Convert insights into structured action steps

3. **View Results**
   - See the extracted action steps in a structured format
   - Use these steps for automation or documentation purposes

## 🏗️ Project Structure

```
ar25-hack/                            
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts          # (CORE FUNCTIONALITY) API endpoint for video processing
│   │   ├── layout.tsx                # (UI) Root layout component
│   │   ├── page.tsx                  # (UI) Main application page
│   │   └── globals.css               # (UI) Global styles
│   ├── components/
│   │   ├── FileUpload.tsx            # (UI) File upload component
│   │   └── VideoPlayer.tsx           # (UI) Video playback component
│   └── lib/
│       └── utils.ts                  # (CONFIG) Utility functions
├── public/                           # (CONFIG) Static assets
├── package.json                      # (CONFIG) Project dependencies
└── README.md                         # (CONFIG) Project documentation
```

## 🤖 AI Pipeline

The application follows a structured AI processing pipeline:

1. **Video Indexing**: Creates a TwelveLabs index with multimodal models (Marengo 2.7 and Pegasus 1.2)
2. **Video Upload**: Uploads the screen recording to TwelveLabs for analysis
3. **Video Analysis**: Analyzes the video content to understand user interactions and context
4. **Step Generation**: Uses OpenAI to convert analysis into structured action steps
5. **Browser Automation**: Execute generated steps using Browser-Use SDK

## Local Dev
```bash
npm install 
npm run dev
```

### Environment Variables for Production
Ensure all required API keys are set in your production environment:
- `TWELVELABS_API_KEY`
- `OPENAI_API_KEY` 
- `BROWSER_USE_API_KEY`
- `GOOGLE_API_KEY`


## 📝 License

This project is part of the AR25 Mini Hack event.
---

Built with ❤️ for the AR25 Mini Hack