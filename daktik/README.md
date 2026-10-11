<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Daktik

**Website:** the new Daktik design is the default UI and runs on the real Firebase data. Demo data: `?demo=1`. Previous UI: `?ui=legacy`.
Setup & deploy: [`design/08-website.md`](design/08-website.md). Design docs: [`design/`](design/README.md). Code: [`src/next/`](src/next).

## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e826d1b6-bebe-402a-b710-6c289abb3507

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
