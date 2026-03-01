// lib/translations.ts
export const translations = {
  de: {
    // Navigation
    home: 'Startseite',
    recipes: 'Rezepte',
    addRecipe: 'Rezept hinzufügen',
    search: 'Suchen...',
    
    // Categories
    all: 'Alle',
    breakfast: 'Frühstück',
    main: 'Hauptgericht',
    side: 'Beilage',
    dessert: 'Dessert',
    other: 'Sonstiges',
    
    // Difficulty
    easy: 'Einfach',
    medium: 'Mittel',
    hard: 'Schwer',
    
    // Recipe fields
    title: 'Titel',
    description: 'Beschreibung',
    category: 'Kategorie',
    tags: 'Tags',
    prepTime: 'Vorbereitungszeit',
    cookTime: 'Kochzeit',
    bakeTime: 'Backzeit',
    portions: 'Portionen',
    difficulty: 'Schwierigkeit',
    ingredients: 'Zutaten',
    steps: 'Schritte',
    tip: 'Tipp',
    imageUrl: 'Bild-URL',
    
    // Actions
    save: 'Speichern',
    cancel: 'Abbrechen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    confirmDelete: 'Möchten Sie dieses Rezept wirklich löschen?',
    
    // Messages
    noRecipes: 'Keine Rezepte gefunden',
    recipeNotFound: 'Rezept nicht gefunden',
    recipeCreated: 'Rezept erstellt',
    recipeUpdated: 'Rezept aktualisiert',
    recipeDeleted: 'Rezept gelöscht',
    loadMore: 'Mehr laden',
    
    // Time
    minutes: 'Min.',
    totalTime: 'Gesamtzeit',
    
    // Featured
    featuredRecipes: 'Empfohlene Rezepte',
    viewAll: 'Alle anzeigen',
    
    // Filter
    filterBy: 'Filtern nach',
    clearFilters: 'Filter zurücksetzen',
    
    // Language & Theme
    language: 'Sprache',
    theme: 'Design',
    light: 'Hell',
    dark: 'Dunkel',
    
    // Amount
    amount: 'Menge',
    name: 'Name',
    addIngredient: 'Zutat hinzufügen',
    addStep: 'Schritt hinzufügen',
    addTag: 'Tag hinzufügen',
  },
  en: {
    // Navigation
    home: 'Home',
    recipes: 'Recipes',
    addRecipe: 'Add Recipe',
    search: 'Search...',
    
    // Categories
    all: 'All',
    breakfast: 'Breakfast',
    main: 'Main',
    side: 'Side',
    dessert: 'Dessert',
    other: 'Other',
    
    // Difficulty
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    
    // Recipe fields
    title: 'Title',
    description: 'Description',
    category: 'Category',
    tags: 'Tags',
    prepTime: 'Prep Time',
    cookTime: 'Cook Time',
    bakeTime: 'Bake Time',
    portions: 'Portions',
    difficulty: 'Difficulty',
    ingredients: 'Ingredients',
    steps: 'Steps',
    tip: 'Tip',
    imageUrl: 'Image URL',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this recipe?',
    
    // Messages
    noRecipes: 'No recipes found',
    recipeNotFound: 'Recipe not found',
    recipeCreated: 'Recipe created',
    recipeUpdated: 'Recipe updated',
    recipeDeleted: 'Recipe deleted',
    loadMore: 'Load more',
    
    // Time
    minutes: 'min',
    totalTime: 'Total time',
    
    // Featured
    featuredRecipes: 'Featured Recipes',
    viewAll: 'View All',
    
    // Filter
    filterBy: 'Filter by',
    clearFilters: 'Clear filters',
    
    // Language & Theme
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    
    // Amount
    amount: 'Amount',
    name: 'Name',
    addIngredient: 'Add ingredient',
    addStep: 'Add step',
    addTag: 'Add tag',
  },
};

export type Language = 'de' | 'en';
export type TranslationKey = keyof typeof translations.de;
