import { Button } from '../ui';

export interface GenreFilterProps {
  genres: string[];
  value: string;
  expanded: boolean;
  onValueChange: (genre: string) => void;
  onToggleExpanded: () => void;
}

export function GenreFilter({
  genres,
  value,
  expanded,
  onValueChange,
  onToggleExpanded,
}: GenreFilterProps) {
  return (
    <div className="filters">
      <div className="genre-buttons">
        {genres.map((genre) => (
          <Button
            key={genre}
            variant={genre === value ? 'primary' : 'secondary'}
            aria-pressed={genre === value}
            onClick={() => onValueChange(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>
      <Button
        variant="link"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        endIcon="arrow"
      >
        {expanded ? 'Show fewer genres' : 'View all genres'}
      </Button>
    </div>
  );
}
