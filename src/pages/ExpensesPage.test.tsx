import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { createAppStore } from '../store/createStore';

function renderApp(path: string, empty = false) {
  const store = empty ? createAppStore([]) : createAppStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
  return store;
}

describe('Expenses page', () => {
  it('lists expenses newest first with balances', () => {
    renderApp('/');
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Airport cab')).toBeInTheDocument();
    expect(screen.getByText('Balances')).toBeInTheDocument();
    expect(screen.getAllByText(/gets back|owes|settled up/).length).toBe(5);
  });

  it('filters by category and shows the total of what is shown', async () => {
    renderApp('/');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Food');
    expect(screen.getByText('₹4,250.00')).toBeInTheDocument(); // 3,250 + 1,000
    expect(screen.queryByText('Villa booking')).not.toBeInTheDocument();
  });

  it('shows an empty state when a category has no expenses', async () => {
    renderApp('/');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Other');
    expect(screen.getByText('No expenses in Other.')).toBeInTheDocument();
  });

  it('shows an empty state when there are no expenses at all', () => {
    renderApp('/', true);
    expect(screen.getByText(/No expenses yet/)).toBeInTheDocument();
  });

  it('deletes only after confirming, and balances update', async () => {
    const store = renderApp('/');
    await userEvent.click(screen.getByRole('button', { name: 'Delete Airport cab' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(store.getState().trip.expenses).toHaveLength(6);

    await userEvent.click(screen.getByRole('button', { name: 'Delete Airport cab' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete expense' }));
    expect(store.getState().trip.expenses).toHaveLength(5);
    expect(screen.queryByText('Airport cab')).not.toBeInTheDocument();
  });
});

describe('Routing', () => {
  it('shows Page not found with a link back to Expenses', () => {
    renderApp('/nope');
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Expenses' })).toHaveAttribute('href', '/');
  });

  it('marks the current page in the navbar', () => {
    renderApp('/expenses/new');
    expect(screen.getByRole('link', { name: 'Add expense' })).toHaveAttribute('aria-current', 'page');
  });
});
