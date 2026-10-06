# EnjoyTV Web v1

OTT-style responsive web app for iPhone/Safari.

## Run
Open `index.html` in a browser, or deploy the folder to GitHub Pages.

## GitHub Pages
1. Upload all files to your `EnjoyTV` GitHub repository.
2. Settings → Pages.
3. Source: Deploy from a branch.
4. Select `main` and `/ (root)`.
5. Save.
6. Open the generated Pages URL on iPhone.

## Features
- Premium dark OTT-style UI
- Responsive iPhone layout
- Live channel cards
- M3U/M3U8 URL loader
- Search
- Favorites
- Recently watched
- HTML5 video player
- LocalStorage persistence
- PWA-style manifest

## Notes
Browser playback depends on the stream format and CORS policy. HLS `.m3u8` is natively supported by Safari/iOS. Some M3U playlist URLs cannot be fetched by a browser because the server blocks CORS.
