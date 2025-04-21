# Video Meeting App

## Overview

**Name:** Video Meeting App (video-conference-app)

This application is a modern, full-featured video conferencing platform designed to facilitate seamless virtual meetings, collaboration, and content sharing. It aims to provide an experience that rivals and surpasses established solutions like Google Meet and Microsoft Teams by introducing unique features and an open, extensible architecture.

---

## Core Functionalities
- **High-Quality Video Conferencing:** Real-time video and audio meetings with multiple participants, powered by Agora's robust RTC SDK.
- **Screen Sharing:** Share your screen with all participants for presentations or collaboration.
- **Canvas-Based Recording:** Capture all participants' video streams in a grid layout using a canvas-based solution, including microphone audio. Recordings can be downloaded or uploaded directly to Cloudinary.
- **Waiting Room & Join Requests:** Manage participant entry with a waiting room and approval system.
- **Meeting Scheduler:** Schedule meetings, send invites, and manage upcoming sessions.
- **Live Transcription:** Real-time transcription of meeting audio (using external APIs, e.g., HuggingFace Inference for ASR).
- **Chat & Collaboration:** Integrated chat, collaborative notes, and file sharing.
- **Settings & Customization:** Adjust video quality (including 480p), theme toggling (dark/light), and more.
- **Authentication & Profile Management:** Secure user registration, login, and profile features powered by Supabase.

---

## Technologies Used
- **Frontend:** React (with TypeScript), Vite (for fast development and build), Tailwind CSS (for modern UI styling)
- **State Management:** Zustand
- **Video/RTC:** agora-rtc-react, agora-rtc-sdk-ng
- **Authentication & Database:** Supabase
- **APIs & Integrations:**
  - Cloudinary (cloud file upload)
  - HuggingFace Inference (Speech-to-Text)
  - EmailJS (for notifications/invites)
- **Utilities:** html2canvas, mp4box (recording/processing), puppeteer, timecut
- **Testing/Linting:** ESLint, TypeScript

---

## Project Structure
- `/src/pages` — Main app pages (Home, Room, Join, Profile, Settings, etc.)
- `/src/components` — Reusable UI and meeting components (VideoPlayer, WaitingRoom, TranscriptPanel, etc.)
- `/src/lib` — API integrations (e.g., supabase.ts)
- `/src/store` — State management logic
- `/src/types` — TypeScript type definitions
- `/src/utils` — Utility functions
- `/public` — Static assets

---

## APIs & AI Models Used

### Supabase
- **Purpose:** User authentication, database, and backend services.
- **Usage:** Handles user registration, login, profile management, and stores meeting/session data.
- **Env:** `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL`

### Hugging Face Inference API
- **Purpose:** Provides AI models for speech-to-text (automatic transcription) and other NLP tasks.
- **Usage:** Real-time transcription of meeting audio using state-of-the-art ASR (Automatic Speech Recognition) models.
- **Env:** `VITE_HUGGING_FACE_API_KEY`
- **Models:**
  - `facebook/wav2vec2-base-960h`: High-accuracy English speech recognition.
  - `openai/whisper`: Multilingual, robust speech recognition.
  - (Other models can be used for sentiment, summarization, etc.)

### Google APIs
- **Purpose:** General cloud integrations (calendar, contacts, etc.).
- **Usage:** For scheduling, calendar invites, or other Google integrations.
- **Env:** `VITE_GOOGLE_API_KEY`

### Agora
- **Purpose:** Real-time video and audio communication.
- **Usage:** Powers live video meeting rooms, screen sharing, and audio streams.
- **Env:** `VITE_AGORA_APP_ID`

### EmailJS
- **Purpose:** Email notifications and invitations.
- **Usage:** Sends meeting invites, notifications, and verification emails from the frontend.
- **Env:** `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`

### Cloudinary
- **Purpose:** Cloud storage and media management.
- **Usage:** Stores meeting recordings, screenshots, and other media files. Enables fast, reliable uploads and sharing of large video files.
- **Env:** (Typically `VITE_CLOUDINARY_URL` or similar)

---

## Deployment
- **Development:** Run locally using `npm run dev` (Vite dev server)
- **Production:** Built with `npm run build` and can be deployed to Netlify (see `netlify.toml`) or similar static hosting platforms. Also supports preview with `npm run preview`.
- **Environment Variables:** Managed via `.env` files for API keys (Agora, Supabase, Cloudinary, etc.)

---

## What’s New & Unique
- **Canvas-Based Multi-Participant Recording:** Unlike Google Meet or Teams, this app records all video feeds in a grid (even with dynamic participant counts), including audio, and allows direct upload to Cloudinary.
- **Open Source & Extensible:** Easily add new integrations, UI themes, or features.
- **Live Transcription with HuggingFace:** Real-time transcription using modern ML APIs.
- **Granular Quality Controls:** Users can select video quality, including bandwidth-saving 480p mode.
- **Modern UI/UX:** Fast, responsive, and accessible, with dark/light mode and mobile support.
- **Meeting Management:** Built-in scheduling, waiting room, and join request approval for professional meetings.

---

## Improvements Over Google Meet / Teams
- **Direct Cloud Upload:** No need for manual download/upload—recordings go straight to Cloudinary.
- **Advanced Recording:** Captures all streams in a single video, not just the speaker or screen.
- **Customizable & Open:** Unlike proprietary platforms, this app is fully customizable and can be self-hosted.
- **Integrated Transcription:** Out-of-the-box live transcription and transcripts.
- **Privacy & Control:** Your data stays with you; no vendor lock-in.

---

## Authors & Contributors
- Developed by Aziz and contributors.

For more details, see the README.md and explore the codebase!
