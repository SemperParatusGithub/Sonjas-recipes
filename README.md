# Recipe Website

A modern, responsive recipe management web application built with Next.js, React, and SQLite.

## Features

- 📖 **Browse Recipes** - View a grid of recipes with search and filter functionality
- 🔍 **Search & Filter** - Search by title/description, filter by category and difficulty
- ➕ **Add Recipes** - Create new recipes with ingredients, steps, and metadata
- ✏️ **Edit Recipes** - Update existing recipes
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🐳 **Docker Support** - Containerized deployment ready

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** CSS Variables + Custom CSS
- **Database:** SQLite with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Runtime:** Node.js 22

## Project Structure

```
recipe-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── recipes/       # Recipe CRUD endpoints
│   ├── add/               # Add recipe page
│   ├── recipes/           # Recipe detail & edit pages
│   │   ├── [slug]/        # Dynamic route for recipe details
│   │   └── [slug]/edit/   # Edit recipe page
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
├── data/                  # SQLite database files
├── public/                # Static assets
├── Dockerfile            # Production Docker build
├── next.config.ts        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 22 or later
- npm

### Installation

1. Clone the repository:
```bash
git clone git@github.com:nilsdev-agent/recipe-website.git
cd recipe-website/recipe-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t recipe-app .

# Run the container
docker run -p 3000:3000 recipe-app
```

The app uses a multi-stage Docker build with:
- Stage 1: Install dependencies
- Stage 2: Build the application
- Stage 3: Production runner (non-root user)

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
- Database is file-based (SQLite) - no external DB server needed
- Images are stored as URLs (external) - not uploaded to the server

## License

MIT
