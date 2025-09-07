# Loki Trading Dashboard

A modern, real-time dashboard for monitoring and controlling the Loki trading bot.

## Features

- **Real-time Monitoring**: Live updates of bot status, trades, and positions
- **Performance Metrics**: Visual charts showing profit/loss over time
- **Bot Control**: Pause, resume, and emergency stop controls
- **Trade History**: View recent trades with profit/loss information
- **Position Tracking**: Monitor open positions and their current performance
- **Wallet Information**: Display wallet balance and address
- **Dark Mode**: Elegant dark theme by default

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **React Query** for data fetching and caching
- **Axios** for API calls

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
VITE_API_URL=https://your-loki-api.fly.dev
```

3. Start the development server:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Building

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

The dashboard deploys to Fly.io as a standalone application.

### Quick deployment:

```bash
# Deploy using npm script
npm run deploy

# Or use Fly CLI directly
flyctl deploy
```

### Monitoring:

```bash
# Check deployment status
npm run status

# View logs
npm run logs
```

## Configuration

The dashboard connects to the Loki API. By default, it uses the production API URL.

To change the API URL:
1. Set the `VITE_API_URL` environment variable
2. Or modify the default in `src/lib/api.ts`

## Features Overview

### Status Bar
- Shows bot running status with visual indicator
- Quick controls for pause/resume and emergency stop
- Auto-refresh toggle (5-60 second intervals)

### Metrics Cards
- **Wallet Balance**: Current SOL balance and wallet address
- **Total Trades**: Count of all trades with success rate
- **Net Profit**: Total profit/loss with win rate percentage
- **Open Positions**: Number of active positions and total value

### Performance Chart
- Area chart showing daily profit and loss
- 7-day default view
- Interactive tooltips with exact values
- Stacked visualization for profit vs loss

### Open Positions
- List of currently held tokens
- Real-time profit/loss percentage
- Current value in USD
- Entry price vs current price comparison

### Recent Trades
- Latest 20 trading activities
- Color-coded buy/sell indicators
- Profit/loss for closed trades
- Time since trade execution
- Token symbols and amounts

## API Endpoints Used

The dashboard connects to these Loki API endpoints:

- `GET /health` - Health check
- `GET /status` - Bot status and statistics
- `GET /trades` - Recent trades list
- `GET /positions` - Open positions
- `GET /metrics` - Performance metrics
- `GET /metrics/chart` - Chart data
- `POST /control/pause` - Pause trading
- `POST /control/resume` - Resume trading
- `POST /control/emergency-stop` - Emergency stop
- `POST /control/clear-queue` - Clear trade queue

## Project Structure

```
dashboard/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   └── Dashboard.tsx # Main dashboard component
│   ├── lib/             # Utilities and API client
│   │   ├── api.ts       # API client and types
│   │   └── utils.ts     # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## License

MIT
