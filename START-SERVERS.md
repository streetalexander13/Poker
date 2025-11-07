# 🚀 How to Start the Poker Chips App

You need to run **TWO servers** for the app to work:

## 1️⃣ Backend Server (Port 3000)

Open a terminal and run:

```bash
cd poker-chips/server
npm start
```

You should see:
```
🎰 Poker Chips Server running on http://localhost:3000
📊 Active games: 0
```

## 2️⃣ Frontend App (Port 4200)

Open a **SECOND terminal** and run:

```bash
cd poker-chips
npm start
```

You should see:
```
➜  Local:   http://localhost:4200/
```

## ✅ Ready to Play!

1. Open your browser to **http://localhost:4200**
2. Create a game and get your code
3. Share the code with friends
4. Friends can join from their own devices (they need to access your computer's IP address on the local network, e.g., http://192.168.1.X:4200)

## 🌐 Playing with Friends on Different Devices

### Option 1: Local Network (Same WiFi)
1. Find your computer's IP address:
   - **Mac**: Open Terminal, type `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: Open Command Prompt, type `ipconfig`
   
2. Share this URL with friends: `http://YOUR-IP:4200`
   - Example: `http://192.168.1.5:4200`

3. Make sure both servers are running!

### Option 2: Deploy to the Cloud
For internet play (not local network), you'll need to deploy both:
- Backend to services like Heroku, Railway, Render
- Frontend to services like Vercel, Netlify, GitHub Pages

## 🛑 Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the servers.

