# 🔧 Troubleshooting Guide

## ✅ "Oops! Something went wrong" - FIXED!

### What I Fixed:
1. **Better error handling** - You'll now see the actual error message
2. **Console logging** - Open browser console (F12) to see detailed logs
3. **Server logging** - Server now logs every pot request
4. **Backwards compatibility** - Old games without pot field are auto-fixed

### How to Test the Fix:

1. **Refresh your browser** (Ctrl+R or Cmd+R)
2. **Open the browser console** (F12 or right-click → Inspect → Console tab)
3. Try placing a bet - you'll see:
   ```
   Placing bet of 25 chips
   Step 1: Removing chips from player...
   ✓ Chips removed from player
   Step 2: Adding chips to pot...
   Adding 25 to pot in game ABC123
   Pot updated successfully: 25
   ✓ Chips added to pot!
   ✓ Bet placed successfully!
   ```

4. **Check server terminal** - you should see:
   ```
   Received add-to-pot request: code=ABC123, amount=25
   ✅ Added 25 to pot (now 25) in game: ABC123
   ```

### If It Still Doesn't Work:

#### 1. Clear Old Game Data
Old games might not have the pot field. **Start a fresh game:**

1. Click "Leave Game"
2. Clear browser cache (Ctrl+Shift+Delete)
3. Or open in Incognito/Private window
4. Create a NEW game
5. Try betting again

#### 2. Restart Servers
Sometimes the server needs a fresh start:

```bash
# Kill both servers
Ctrl+C in both terminal windows

# Restart backend
cd server
npm start

# Restart frontend (in new terminal)
npm start
```

#### 3. Check Browser Console
Open console (F12) and look for:
- Red error messages
- Network errors
- CORS errors

Common fixes:
- **"Game not found"** → Start a new game
- **"Network error"** → Check backend is running on port 3000
- **CORS error** → Backend may not be running

#### 4. Verify Both Servers Running

```bash
# Check backend
curl http://localhost:3000/api/health

# Should show:
{"status":"ok","activeGames":X,"timestamp":"..."}

# Check frontend
curl http://localhost:4200

# Should show HTML
```

### Still Having Issues?

1. **Open browser console (F12)**
2. **Try to place a bet**
3. **Copy ALL the red error messages**
4. **Check server terminal for errors**
5. Share the errors for more specific help!

## 🎯 Testing Checklist

- [ ] Both servers running (frontend + backend)
- [ ] Browser console open (F12)
- [ ] Started a FRESH game (not old one)
- [ ] Can see your chips decrease when betting
- [ ] Pot number increases in the center
- [ ] Server logs show "Added X to pot"
- [ ] Other players see pot update

## 💡 Pro Tips

### Fastest Way to Debug:
1. Open browser console (F12) - see what's happening
2. Look at Network tab - see if requests succeed
3. Check server terminal - see backend logs

### Quick Reset:
If things get weird:
1. Click "Leave Game"
2. Open new Incognito window
3. Create brand new game
4. Everything fresh!

### What's Normal:
- Small delay (1-2 seconds) before pot updates
- Your chips decrease immediately
- Pot updates after a moment
- Everyone sees same pot after refresh

### What's NOT Normal:
- "Oops! Something went wrong" alert
- Pot stays at 0 forever
- Chips disappear but pot doesn't increase
- Console shows red errors

## 🚀 Working Example

When everything works, you should see:

**Your Screen:**
- Your chips: 975 (was 1000)
- Pot: 25 (was 0)
- Console: "✓ Bet placed successfully!"

**Server Terminal:**
```
Alex S chips updated to 975 in game: ABC123
Received add-to-pot request: code=ABC123, amount=25
✅ Added 25 to pot (now 25) in game: ABC123
```

**Other Players:**
- See pot change from 0 → 25 within 2 seconds

That's it! If you see all that, it's working! 🎉

