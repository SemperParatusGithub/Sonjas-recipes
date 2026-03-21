# Recipe Website

A modern, responsive recipe management web application built with Next.js, React, and SQLite.

## Features

- 📖 **Browse Recipes** - View a grid of recipes with search and filter functionality
- 🔍 **Search & Filter** - Search by title/description, filter by category and difficulty
- ➕ **Add Recipes** - Create new recipes with ingredients, steps, and metadata
- ✏️ **Edit Recipes** - Update existing recipes
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🐳 **Docker Support** - Containerized deployment with Traefik

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** CSS Variables + Custom CSS
- **Database:** SQLite with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Proxy:** Traefik v3
- **Runtime:** Node.js 22

## Project Structure

```
recipe-website/            # Monorepo root
├── app/                   # Next.js App Router
│   ├── api/
│   │   └── recipes/      # Recipe CRUD API endpoints
│   ├── add/               # Add recipe page
│   ├── recipes/
│   │   ├── [slug]/       # Recipe detail page
│   │   └── [slug]/edit/  # Edit recipe page
│   ├── globals.css        # Global styles + theme variables
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Home page (recipe grid)
├── components/            # React components
│   ├── ClientComponents.tsx  # Search filters, theme toggle
│   └── Logo.tsx           # Logo component
├── lib/                   # Utilities
│   ├── context.tsx        # App context for theme
│   ├── db.ts             # Database connection & helpers
│   └── translations.ts   # German UI strings
├── data/                  # SQLite database files (gitignored)
├── public/                # Static assets
├── docker/                # Docker/Traefik production setup
│   ├── docker-compose.yml # Full stack: app + traefik + landing
│   ├── .env.template      # Environment template
│   ├── traefik/           # Traefik config (SSL, routing, etc.)
│   └── landing/           # Static landing page
├── Dockerfile             # App-only production build
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Quick Start

### Local Development

```bash
# Clone the repo
git clone git@github.com:nilsdev-agent/recipe-app.git
cd recipe-app

# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Docker (Full Stack)

```bash
# Configure environment
cd docker
cp .env.template .env
# Edit .env and set DOMAIN

# Start all services (Traefik + App + Landing)
docker-compose up -d

# Check status
docker-compose ps
```

## Docker Deployment

The project includes a production-ready Docker setup with Traefik reverse proxy.

### Single Container

```bash
docker build -t recipe-app .
docker run -p 3000:3000 -v ./data:/data recipe-app
```

### Full Stack (recommended for production)

See [`docker/README.md`](docker/README.md) for detailed deployment instructions.

### What's in the Full Stack

| Service | Description | Port |
|---------|-------------|------|
| Traefik | Reverse proxy, SSL, rate limiting | 80, 443 |
| recipe-app | Next.js application | 3000 (internal) |
| landing | Static landing page | 8080 (internal) |

## Database Schema

The app uses SQLite with the following Recipe model:

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| slug | TEXT | URL-friendly identifier |
| title | TEXT | Recipe name |
| description | TEXT | Short description |
| category | TEXT | Recipe category |
| difficulty | TEXT | easy/medium/hard |
| prepTimeMin | INTEGER | Preparation time in minutes |
| cookTimeMin | INTEGER | Cooking time in minutes |
| servings | INTEGER | Number of servings |
| ingredients | JSON | Array of {amount, unit, name} |
| steps | JSON | Array of instruction steps |
| tags | JSON | Array of tag strings |
| imageUrl | TEXT | Optional image URL |
| tips | TEXT | Cooking tips |
| createdAt | DATETIME | Creation timestamp |
| updatedAt | DATETIME | Last update timestamp |

## API Endpoints

- `GET /api/recipes` - List all recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/[slug]` - Get a specific recipe
- `PUT /api/recipes/[slug]` - Update a recipe
- `DELETE /api/recipes/[slug]` - Delete a recipe

## Development Notes

- The app uses German as the interface language
- Theme preference is persisted in localStorage
- Database is file-based (SQLite) — no external DB server needed
- Images are stored as URLs (external) — not uploaded to the server

## License

MIT
