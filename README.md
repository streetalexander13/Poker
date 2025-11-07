# 🎰 Poker Chips - Virtual Chip Tracker

A beautiful and intuitive Angular web app for tracking poker chips during in-person games. No physical chips needed!

## ✨ Features

- **Easy Game Creation**: Host creates a game with a unique 6-character code
- **Quick Join**: Players join using the code on their own devices
- **Beautiful UI**: Modern, poker-themed design with gradients and animations
- **Chip Management**: 
  - View your chip count with a stunning visual display
  - Quick bet buttons (10, 25, 50, 100, 250, 500)
  - Custom bet amounts
  - All-in button
  - Win/Lose chip tracking
- **Real-time Updates**: Chip counts persist using localStorage
- **Player Visibility**: See other players' chip counts
- **Mobile-Friendly**: Responsive design works on all devices
- **In-Person Play**: Designed for everyone to have their own device at the table

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.18.0 or higher recommended)
- npm

### Installation & Running

**IMPORTANT:** This app requires both a frontend and backend server!

#### 1. Install Dependencies

First, install frontend dependencies:
```bash
cd poker-chips
npm install
```

Then, install backend dependencies:
```bash
cd server
npm install
cd ..
```

#### 2. Start Both Servers

**Terminal 1 - Backend Server (Port 3000):**
```bash
cd server
npm start
```

**Terminal 2 - Frontend Server (Port 4200):**
```bash
npm start
```

#### 3. Access the App
Open your browser and navigate to `http://localhost:4200`

📖 **See [START-SERVERS.md](START-SERVERS.md) for detailed instructions on running with friends on different devices!**

## 🎮 How to Play

### For the Host:
1. Click "Create Game" on the home screen
2. Enter your name
3. Set the starting chip count for all players (default: 1000)
4. Click "Create Game"
5. Share the generated 6-character code with your friends
6. Wait for players to join in the lobby
7. Click "Start Game" when everyone has joined

### For Players Joining:
1. Click "Join Game" on the home screen
2. Enter your name
3. Enter the 6-character game code from the host
4. Click "Join Game"
5. Wait in the lobby for the host to start

### During the Game:
1. **View Your Chips**: Large poker chip display shows your current count
2. **Place Bets**:
   - Select a quick bet amount (10, 25, 50, 100, 250, 500)
   - Or enter a custom amount
   - Or go "All In" 
3. **Remove Chips**: Click "Bet / Lose" to subtract your bet amount
4. **Win Chips**: Click "Win" to add your bet amount back
5. **See Others**: View other players' chip counts in the "Other Players" section

## 🛠️ Technology Stack

### Frontend
- **Angular 17**: Modern web framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Beautiful, responsive styling
- **RxJS**: Reactive state management
- **HttpClient**: Real-time server communication

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web server framework
- **CORS**: Cross-origin resource sharing
- **In-memory storage**: Fast game state management

## 📁 Project Structure

```
poker-chips/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── home/          # Landing page (create/join game)
│   │   │   ├── lobby/         # Waiting room for players
│   │   │   └── game/          # Main game interface
│   │   ├── services/
│   │   │   └── game.service.ts # Game state management & API calls
│   │   └── app.routes.ts      # Application routing
│   └── styles.css             # Global Tailwind styles
├── server/
│   ├── index.js               # Express backend server
│   └── package.json           # Backend dependencies
└── README.md
```

## 🎨 Features in Detail

### Home Screen
- Toggle between "Create Game" and "Join Game"
- Input validation for names and chip amounts
- Beautiful poker-themed design with chip icon

### Lobby
- Real-time player list
- Copy/Share game code functionality
- Host badge and "You" indicator
- Start game button (host only, requires 2+ players)

### Game Screen
- Animated chip pile display
- Quick bet selection grid
- Custom amount input
- All-in button
- Bet/Lose and Win action buttons
- Other players' chip counts
- Leave game functionality

## 💾 Data Persistence & Synchronization

The app uses a **client-server architecture**:

### Server-Side (Backend)
- **In-memory storage**: All games are stored in the Node.js server's memory
- **Real-time sync**: Updates are shared across all connected devices
- **Auto-polling**: Clients check for updates every 2 seconds
- **Auto-cleanup**: Inactive games are removed after 1 hour

### Client-Side (Frontend)
- **localStorage**: Current game and player info cached locally
- **Automatic reconnection**: Rejoins game after page refresh
- **Fallback**: If server is down, shows appropriate error messages

## 🔒 Notes & Limitations

- **In-Memory Storage**: Games are stored in server RAM, so restarting the server clears all games
- **Local Network**: Best for same WiFi/network play. For internet play, deploy to cloud services
- **No Authentication**: Simple code-based access (perfect for casual games!)
- **Polling-Based**: Uses 2-second polling instead of WebSockets (simpler, but slightly delayed updates)

## 🎯 Use Cases

Perfect for:
- Home poker games without physical chips
- Teaching poker to beginners
- Travel poker games
- Casual poker nights
- Testing different chip distributions

## 🤝 Contributing

This is a standalone project, but feel free to fork and customize for your own needs!

## 📝 License

This project is open source and available for personal use.

## 🎉 Enjoy Your Game!

May the best hand win! 🃏♠️♥️♣️♦️
