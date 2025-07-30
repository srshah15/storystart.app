# StoryStart

StoryStart is a React + TypeScript web application that helps high school students discover meaningful and personalized college essay ideas using AI.

**Live Site:** [storystart.app](www.storystart.app)

## Features

- Profile creation with academic background, activities, awards, and personal insights
- AI-generated reflection questions tailored to each user
- Structured essay idea suggestions based on user responses
- Drag-and-drop activity reordering
- Auto-save for all responses
- Copy and download options for essay ideas

## Tech Stack

- Frontend: React 18+ with TypeScript
- UI: shadcn/ui and Tailwind CSS
- State Management: React Context API
- Routing: React Router v6
- AI Integration: OpenAI GPT-4 API
- Icons: Lucide React

## Setup

```bash
git clone https://github.com/srshah15/storystart.app.git
cd storystart.app
npm install
cp .env.example .env.local
# Add your OpenAI API key to .env.local
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Environment Variables

Required in `.env.local`:

```
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_APP_NAME=StoryStart
VITE_APP_VERSION=1.0.0
```

## Deployment

This app is currently deployed at:

[storystart.app](www.storystart.app)

It can also be deployed to platforms like Netlify, GitHub Pages, or AWS.
