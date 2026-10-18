import { Button, Icon } from '../ui';

export interface ReadingListButtonProps {
  saved: boolean;
  onToggleSaved: () => void;
}

export function ReadingListButton({
  saved,
  onToggleSaved,
}: ReadingListButtonProps) {
  return (
    <div className="save-control">
      {saved ? (
        <div className="native-save-select">
          <span
            className="button save-detail"
            data-variant="primary"
            data-size="lg"
            aria-hidden="true"
          >
            <Icon name="check" />
            On your reading list
            <Icon name="down" />
          </span>
          <select
            aria-label="Reading list status"
            value="saved"
            onChange={(event) => {
              if (event.target.value === 'remove') onToggleSaved();
            }}
          >
            <option value="saved">On your reading list</option>
            <option value="remove">Remove from reading list</option>
          </select>
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          className="save-detail"
          startIcon="plus"
          onClick={onToggleSaved}
        >
          Add to reading list
        </Button>
      )}
    </div>
  );
}
