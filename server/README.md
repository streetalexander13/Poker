# Poker Chips Backend Server

Node.js/Express backend for the Poker Chips game.

## Local Development

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

## Deploy to Railway

### Method 1: Via Railway Dashboard (Easiest)

1. Go to [Railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. **IMPORTANT**: Set the Root Directory:
   - Go to Settings
   - Find "Root Directory"
   - Set to: `poker-chips/server`
6. Railway will auto-detect Node.js and deploy!

### Method 2: Via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Navigate to server directory
cd poker-chips/server

# Initialize and deploy
railway init
railway up
```

### Environment Variables (Optional)

Railway will automatically set `PORT`. No other env vars needed!

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/games` - Create game
- `GET /api/games/:code` - Get game state
- `POST /api/games/:code/join` - Join game
- `POST /api/games/:code/start` - Start game
- `POST /api/games/:code/place-bet` - Place bet
- `POST /api/games/:code/fold` - Fold
- And more...

## Troubleshooting

### Build fails with "patch-package not found"
- Railway is detecting the wrong directory
- Make sure Root Directory is set to `poker-chips/server` in Railway settings

### Port issues
- Railway automatically provides PORT environment variable
- Code already handles this: `const PORT = process.env.PORT || 3000;`

### CORS errors
- Backend already configured to accept requests from Vercel domains
- Check that frontend is using correct backend URL

