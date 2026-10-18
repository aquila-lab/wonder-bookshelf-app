import { useRef, type Ref } from 'react';
import { classNames } from '../../lib/classNames';
import { Icon } from './Icon';
import { IconButton } from './IconButton';

export interface SearchFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function SearchField({
  value,
  onValueChange,
  onSubmit,
  inputRef,
  label = 'Search books or authors',
  placeholder = label,
  className,
}: SearchFieldProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  return (
    <form
      className={classNames('search-field', className)}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Icon name="search" />
      <input
        ref={(node) => {
          internalRef.current = node;
          if (typeof inputRef === 'function') return inputRef(node);
          if (inputRef) inputRef.current = node;
        }}
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <IconButton
        className="search-field-clear"
        icon="close"
        variant="ghost"
        size="sm"
        disabled={!value}
        aria-hidden={!value}
        aria-label="Clear search"
        onClick={() => {
          onValueChange('');
          internalRef.current?.focus();
        }}
      />
    </form>
  );
}
