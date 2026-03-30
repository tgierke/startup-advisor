# Startup Advisory Panel

A decision-support tool that simulates a panel of four expert advisors responding to questions about a startup opportunity.

## Local Setup

1. **Clone and install**
   ```bash
   git clone <your-repo-url>
   cd startup-advisor
   npm install
   ```

2. **Add your API key**

   Create a `.env` file in the project root:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
   Get your key at [console.anthropic.com](https://console.anthropic.com).

3. **Install Vercel CLI** (needed to run serverless functions locally)
   ```bash
   npm install -g vercel
   ```

4. **Run locally**
   ```bash
   vercel dev
   ```
   Open `http://localhost:3000`

## Deploy to Vercel

### Option 1: One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)

*(Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub repo path after pushing)*

### Option 2: Manual deploy

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (starts with `sk-ant-`)
4. Click Deploy

Vercel handles the build and serverless functions automatically.

## How it works

- Fill in **Research context** — paste founder memos, market research, anything relevant
- Fill in **Personal profile** — your financial situation, fears, career stage
- Ask a question — fires four AI calls simultaneously, one per advisor
- Use **Export report** to generate a PDF decision brief
- Your profile and session history persist between visits
- Use **New session** to start fresh for a different opportunity
