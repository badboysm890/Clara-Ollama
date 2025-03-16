<div align="center">
  <img src="/public/logo.png" alt="Clara Logo" width="90" height="90" />
  <h1>Clara</h1>
  <p><strong>Privacy-First AI Assistant & Agent Builder</strong></p>
  <p>Chat with AI, create intelligent agents, and turn them into fully functional apps—powered entirely by open-source models running on your own device.</p>

  [![Clara](https://img.shields.io/badge/Clara-0.1.2-FFD700.svg)](https://clara-ollama.netlify.app/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  <a href="https://clara.badboysm890.in/" target="_blank">Try Clara Online</a> | <a href="https://github.com/badboysm890/ClaraVerse/releases/tag/v0.2.0">Download Desktop App</a>

  <a href="https://www.producthunt.com/posts/clara-433c5291-7639-4271-b246-8df30cbc449f?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-clara&#0045;433c5291&#0045;7639&#0045;4271&#0045;b246&#0045;8df30cbc449f" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=942765&theme=light&t=1742154003625" alt="Clara - Browser&#0045;Based&#0032;AI&#0032;for&#0032;Chat&#0044;&#0032;Agents&#0032;&#0038;&#0032;Image&#0032;Generation&#0032;Locally | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</div>



## 🔒 Privacy First

- **Local Execution**: Clara connects directly to Ollama and uses open-source language and image generation models—**all running on your device**.  
- **No Third-Party Clouds**: Your data never leaves your machine. Zero telemetry, zero tracking.  
- **Open-Source Technology**: Built to leverage community-driven innovations, giving you full control over your AI stack.

## ✨ Key Features

### AI Assistant
Chat with any Ollama-compatible model, including multimodal models that understand images:

<img src="/public/screenshots/assistant-screenshot.png" alt="Clara Assistant" width="800" />

### Image Generation
Create amazing images from text prompts using Stable Diffusion models with ComfyUI integration:

<img src="/public/screenshots/image-gen-screenshot.png" alt="Clara Image Generation" width="800" />

### Intelligent Agent Builder
Design custom AI agents with a node-based editor, then convert them into standalone apps without leaving Clara:

<img src="/public/screenshots/app-builder-screenshot.png" alt="Clara Agent Builder" width="800" />

### Image Gallery
Browse, search, and manage all generated images in one convenient gallery:

<img src="/public/screenshots/gallery-screenshot.png" alt="Clara Gallery" width="800" />

## 🚀 Getting Started

1. **Install Ollama**  
   Download and install [Ollama](https://ollama.ai/download) for local model execution.  
2. **Run Clara**  
   Launch the [web app](https://clara-ollama.netlify.app/) or the native desktop version.  
3. **Connect**  
   By default, Clara expects Ollama at `http://localhost:11434`.

## 📱 Download Desktop App

For faster performance and offline convenience, download the native desktop version:

- [Windows Installer (.exe)](https://github.com/badboysm890/ClaraVerse/releases/tag/v0.2.0)
- [macOS Installer (.dmg)](https://github.com/badboysm890/ClaraVerse/releases/tag/v0.2.0)
- [Linux AppImage (.AppImage)](https://github.com/badboysm890/ClaraVerse/releases/tag/v0.2.0)

## 👩‍💻 Dev Zone

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Clara-AI/clara-ollama.git
cd clara-ollama

# Install dependencies
npm install

# Start development server (web)
npm run dev

# Start development server (desktop)
npm run electron:dev
```

### Remote Ollama Connection

If Ollama runs on another machine:

1. Enable CORS in Ollama (`~/.ollama/config.json`):
   ```json
   {
     "origins": ["*"]
   }
   ```
2. In Clara settings, specify: `http://{IP_ADDRESS}:11434`

### Building for Production

```bash
# Build web version
npm run build

# Build desktop app
npm run electron:build
```

## 🤝 Support & Contact

Have questions or need help? Reach out via **praveensm890@gmail.com**.  