import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="empty">
      <h1>Page not found</h1>
      <p>We couldn't find that page.</p>
      <Link to="/" className="button">
        Back to Expenses
      </Link>
    </section>
  );
}
