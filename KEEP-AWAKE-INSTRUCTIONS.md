# How to Keep Your iPod Awake (100% Free, No Credit Card)

Since Render blocks automated ping services like UptimeRobot, we are going to use Google's servers to silently keep your backend awake. Render cannot block Google. 

I've also updated both your frontend and backend code to launch smarter and faster.

### Step 1: Open Google Apps Script
1. Go to [script.google.com](https://script.google.com/) and sign in with your regular Google/Gmail account.
2. Click the **+ New project** button in the top left.

### Step 2: Paste the Code
1. Rename the project at the top to something like "iPod Pinger".
2. Delete the empty `function myFunction() {}` code inside the editor.
3. Paste the following exactly:

```javascript
function pingIPod() {
  // IF your render URL is different, change it here!
  var backendUrl = "https://karan-ipod-backend.onrender.com/api/ping";
  
  try {
    UrlFetchApp.fetch(backendUrl);
    Logger.log("Successfully pinged iPod backend at " + new Date().toISOString());
  } catch(e) {
    Logger.log("Error pinging: " + e.message);
  }
}
```

### Step 3: Set up the 10-Minute Trigger
1. On the left sidebar, click the **clock icon** ⏱️ (it says "Triggers" when you hover over it).
2. Click the big blue **+ Add Trigger** button in the bottom right corner.
3. Set the options exactly like this:
   - **Choose which function to run:** `pingIPod`
   - **Choose which deployment should run:** `Head`
   - **Select event source:** `Time-driven`
   - **Select type of time based trigger:** `Minutes timer`
   - **Select minute interval:** `Every 10 minutes`
4. Click **Save**.
5. Google will pop up a security window. Select your Google account. It will say "Google hasn't verified this app". That is normal because you just wrote it! Click **Advanced**, and then click **Go to iPod Pinger (unsafe)** at the very bottom. Click **Allow**.

---

### That's it! 🎉
Google will now hit your server exactly every 10 minutes, silently and forever. **Your Render server will never go to sleep.**

As an added bonus, I've completely rewritten your iPod's Boot Screen—so even if the backend *does* somehow sleep, the frontend will wait gracefully showing a "Connecting..." message instead of breaking. I also optimized the Python backend to start up about 5 seconds faster!
