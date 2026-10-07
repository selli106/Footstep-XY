<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wTEw-p4y1kl-jzjvH426cn5R-int-WcP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

Deployment is handled by `.github/workflows/deploy.yml` on every push to `main`.
In the repo settings, set **Pages > Source** to **GitHub Actions**.
The Vite `base` is `/Footstep-XY/`, so the site is served at https://selli106.github.io/Footstep-XY/.
Reverb presets use generated impulse responses and do not require external audio files.
