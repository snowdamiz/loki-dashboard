# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Loki Trading Dashboard is a React-based real-time monitoring and control interface for the Loki trading bot. It provides live updates of bot status, trades, positions, and performance metrics.

## Common Development Commands

### Installation and Setup
```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Environment Configuration
```bash
# Create .env file for API configuration (optional)
echo "VITE_API_URL=https://your-loki-api.fly.dev" > .env
```

Default API URL: `https://loki-late-paper-3992.fly.dev`

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios with configured base URL

### Project Structure
```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with all widgets
│   └── ui/             # Reusable UI components (shadcn/ui)
├── lib/                # Core utilities
│   ├── api.ts          # API client with typed endpoints
│   └── utils.ts        # Formatting utilities
├── App.tsx             # Query client provider setup
└── main.tsx            # Application entry point
```

### Key API Integration Points

The dashboard connects to the Loki trading bot API with the following core endpoints:

**Status & Control**
- `GET /status` - Bot running state, statistics, wallet info
- `POST /control/pause` - Pause trading
- `POST /control/resume` - Resume trading
- `POST /control/emergency-stop` - Emergency stop all operations

**Trading Data**
- `GET /trades` - Recent trades with pagination
- `GET /positions` - Open positions with P&L
- `GET /metrics` - Performance metrics and analysis
- `GET /metrics/chart` - Time-series chart data

### Data Fetching Strategy

The application uses React Query with:
- **Auto-refresh intervals**: 5s (status), 10s (trades/positions), 30s (metrics), 60s (charts)
- **Stale time configuration**: Prevents unnecessary refetches
- **Optimistic updates**: Immediate UI feedback for control actions
- **Query invalidation**: Refreshes status after control mutations

### Component Architecture

**Dashboard Component** (`src/components/Dashboard.tsx`)
- Manages all data fetching via React Query hooks
- Handles bot control mutations (pause/resume/stop)
- Implements auto-refresh toggle
- Renders status bar, metric cards, performance chart, positions, and trades

**API Client** (`src/lib/api.ts`)
- Typed interfaces for all API responses (BotStatus, Trade, Position, Metrics)
- Axios instance with base URL configuration
- Organized endpoint functions by category

### Development Proxy Configuration

Vite proxy configured in `vite.config.ts`:
- `/api` paths proxy to production API
- Handles CORS in development
- Rewrites paths to remove `/api` prefix

## Deployment Notes

The dashboard deploys to Fly.io as a standalone application:

```bash
# Deploy to Fly.io (uses fly.toml configuration)
flyctl deploy

# Or deploy with specific app name
flyctl deploy -a loki-dashboard
```

The app is configured to:
- Build using the local Dockerfile
- Deploy to the LAX (Los Angeles) region
- Run with 256MB memory on shared CPU
- Serve static files via nginx

## API Response Types

Key TypeScript interfaces to be aware of:

- `BotStatus`: Bot state, statistics, wallet info
- `Trade`: Individual trade records with P&L
- `Position`: Open positions with current values
- `Metrics`: Performance analysis and history
