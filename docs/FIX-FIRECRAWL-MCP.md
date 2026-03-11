# 🔧 Fix Firecrawl MCP Configuration

## The Issue
The package name in your MCP settings is incorrect. The correct npm package is `firecrawl-mcp`, not `@firecrawl/mcp-server-firecrawl`.

## ✅ Correct Configuration

### Step 1: Open Cursor MCP Settings

1. Open **Cursor Settings** (Cmd+, on Mac)
2. Search for **"MCP"**
3. Click **"Edit in settings.json"** or find your MCP configuration

### Step 2: Update Configuration

Replace your current `user-firecrawl` or `user-user-firecrawl` configuration with:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your_firecrawl_api_key_here"
      }
    }
  }
}
```

**Important:** Replace `your_firecrawl_api_key_here` with your actual Firecrawl API key.

### Step 3: Save and Restart

1. **Save** the settings file
2. **Completely quit Cursor** (Cmd+Q on Mac)
3. **Reopen Cursor**

### Step 4: Verify

After reopening:
1. Go to **Settings → MCP**
2. You should see **"firecrawl"** showing as **"Running"** with a green status

---

## 📋 Full MCP Settings Example

If you have multiple MCP servers, your full configuration might look like this:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": {
        "FIRECRAWL_API_KEY": "your_firecrawl_api_key_here"
      }
    },
    "other-server": {
      "command": "...",
      "args": ["..."]
    }
  }
}
```

---

## 🧪 Test After Configuration

Once configured and Cursor is restarted, tell me:

> "MCP configured and working"

Then I'll:
1. Run the database trigger script
2. Test real scraping with Firecrawl
3. Show you how to scrape your first batch of businesses!

---

## 🐛 Troubleshooting

### If Firecrawl MCP still shows "Errored":

1. **Check API Key**: Make sure your Firecrawl API key is correct
2. **Check Credits**: Log into Firecrawl dashboard and verify you have credits
3. **Manual Test**: Run this in terminal:
   ```bash
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here npx firecrawl-mcp
   ```
4. **Check Logs**: Look for errors in Cursor's output panel

### Common Errors:

- **"Invalid API key"** → Double-check your Firecrawl API key
- **"Rate limit exceeded"** → You've used all your credits, upgrade plan
- **"Connection timeout"** → Check your internet connection

---

## 📖 Reference

- **Firecrawl MCP Docs**: https://docs.firecrawl.dev/mcp-server
- **NPM Package**: https://www.npmjs.com/package/firecrawl-mcp
- **GitHub Repo**: https://github.com/mendableai/firecrawl-mcp-server

---

**Next: Update your MCP settings with the correct package name and restart Cursor!**
