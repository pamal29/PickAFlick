# PickAFlick 🎬

PickAFlick is a movie and TV show watchlist app. Browse trending titles and save the ones you want to watch later — no streaming, just discovery and tracking.

> 🚧 **Status:** Under active development

## Features

- 🔥 Browse trending movies and TV shows
- ➕ Add titles to your personal watchlist
- 🔐 User authentication (sign up / log in)
- 📱 Responsive UI

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS

**Backend**
- Node.js
- Supabase (Auth + Database)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A Supabase project (URL + anon key)

### Installation

```bash
# Clone the repo
git clone https://github.com/pamal29/pickaflick.git
cd pickaflick

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Roadmap

- [ ] Watchlist sorting/filtering
- [ ] Search functionality
- [ ] User profile enhancements
- [ ] Deployment

## License

This project is for portfolio/learning purposes.
