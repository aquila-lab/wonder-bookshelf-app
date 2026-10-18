import { useEffect, useRef } from 'react';

/** The measured runtime value stays separate from the header's design token. */
export function useHeaderHeight() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    const update = () =>
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${header.getBoundingClientRect().height}px`,
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--app-header-height');
    };
  }, []);
  return ref;
}
