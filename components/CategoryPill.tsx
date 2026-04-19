'use client';

const CATEGORY_COLORS: Record<string, string> = {
  main:    'var(--terra)',
  soup:    'var(--sage)',
  dessert: '#b07a9e',
  salad:   '#7aaa6b',
};

const CATEGORY_LABELS: Record<string, string> = {
  main:    'Mains',
  soup:    'Soups',
  dessert: 'Desserts',
  salad:   'Salads',
};

interface CategoryPillProps {
  category: string;
  style?: React.CSSProperties;
}

export function CategoryPill({ category, style }: CategoryPillProps) {
  const color = CATEGORY_COLORS[category] || 'var(--terra)';
  const label = CATEGORY_LABELS[category] || category;
  return (
    <span style={{
      display: 'inline-block',
      background: color,
      color: 'white',
      fontSize: '0.72rem',
      fontWeight: 500,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: '99px',
      ...style,
    }}>
      {label}
    </span>
  );
}
