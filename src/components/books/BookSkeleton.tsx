export function BookSkeleton() {
  return (
    <div className="book-card book-skeleton" aria-hidden="true">
      <div className="cover-area skeleton-surface" />
      <div className="card-text skeleton-text">
        <div className="skeleton-author">
          <span className="skeleton-surface" />
        </div>
        <div className="skeleton-title">
          <span className="skeleton-surface" />
        </div>
        <div className="skeleton-genre">
          <span className="skeleton-surface" />
        </div>
      </div>
    </div>
  );
}
