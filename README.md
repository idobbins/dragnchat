# DragnChat

<div align="center">
  <img src="public/dragnchat.svg" alt="DragnChat Logo" width="120" height="120">
</div>

**Open source drag-and-drop chat interface with graph-based context management.**

DragnChat is a visual chat application that allows you to create conversational workflows using a node-based editor. Connect text inputs, AI models, and outputs in a flexible graph structure to build complex chat interactions.

## Features

- 🎯 **Visual Node Editor** - Drag and drop interface powered by React Flow
- 🤖 **AI Model Integration** - Connect to various AI models via OpenRouter
- 🔗 **Graph-based Context** - Link conversations and maintain context across nodes
- 🔐 **Authentication** - Secure user management with Clerk
- 💾 **Project Persistence** - Save and manage multiple chat workflows

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dragnchat.git
   cd dragnchat
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure:
   - `POSTGRES_URL` - Your PostgreSQL connection string

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Build for production
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript checks

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS, Radix UI
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **State Management**: Zustand, TanStack Query
- **Graph Editor**: React Flow (@xyflow/react)
- **AI Integration**: OpenRouter API

## License

MIT License - see [LICENSE](LICENSE) file for details.
