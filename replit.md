# Overview

This is a full-stack quiz maker web application built with React frontend and Express backend. The application allows quiz creators (hosts) to create real-time multiplayer quizzes with AI-generated questions, while participants can join using shareable room codes. The app features live multiplayer functionality with Socket.IO, integrates with Groq AI for question generation, and uses Supabase for authentication and data storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Comprehensive UI component system built on Radix UI primitives with TailwindCSS for styling
- **State Management**: Zustand stores for game state, socket connections, and audio management
- **3D Graphics**: Three.js integration via @react-three/fiber and @react-three/drei for interactive puzzle components
- **Data Fetching**: TanStack Query for server state management and caching
- **Real-time Communication**: Socket.IO client for multiplayer quiz functionality

## Backend Architecture
- **Server Framework**: Express.js with TypeScript running on Node.js
- **Real-time Features**: Socket.IO server for managing quiz rooms, player connections, and live game events
- **Development Setup**: Vite middleware integration for hot module replacement in development
- **Game Logic**: Custom puzzle generation system with pattern, logic, and spatial puzzle types
- **Room Management**: In-memory storage for active quiz rooms and player connections

## Data Storage Solutions
- **Database**: PostgreSQL via Supabase for persistent data storage
- **ORM**: Drizzle ORM with TypeScript schema definitions for type-safe database operations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts` for both client and server
- **Database Provider**: Neon Database serverless PostgreSQL
- **Migration Management**: Drizzle Kit for database migrations and schema changes

## Authentication and Authorization
- **Authentication Provider**: Supabase Auth for quiz creators/hosts only
- **Authentication Method**: Email and password authentication for admin users
- **Participant Access**: No authentication required for quiz participants - they only provide name and profile photo
- **Authorization Model**: Simple role-based system where authenticated users can create and manage quizzes

## External Dependencies

### AI Integration
- **AI Service**: Groq Cloud API for automated quiz question generation
- **Available Models**: Multiple LLaMA and GPT models including meta-llama/llama-4-scout-17b, openai/gpt-oss-120b, and qwen/qwen3-32b
- **Model Selection**: Quiz creators can choose which AI model to use for question generation

### Database and Backend Services
- **Database**: Supabase PostgreSQL with predefined schema for quizzes, questions, participants, attempts, and answers
- **Database Connection**: Neon Database serverless PostgreSQL via connection string
- **Real-time Backend**: Custom Express server with Socket.IO for multiplayer functionality

### Development and Build Tools
- **Build System**: Vite with React plugin and custom configuration for client-side builds
- **TypeScript**: Full TypeScript support across frontend, backend, and shared code
- **Shader Support**: GLSL shader support via vite-plugin-glsl for advanced 3D graphics
- **Development Tools**: Runtime error overlay and hot module replacement for development experience

### UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: TailwindCSS with custom theme configuration and CSS variables
- **Typography**: Inter font family via @fontsource/inter
- **3D Graphics**: Three.js ecosystem including fiber, drei, and postprocessing libraries