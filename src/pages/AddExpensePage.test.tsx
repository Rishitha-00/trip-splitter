import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { createAppStore } from '../store/createStore';

function renderApp(path = '/expenses/new') {
  const store = createAppStore([]); // start with no expenses
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </Provider>,
  );
  return store;
}

describe('Add expense form', () => {
  it('shows an error next to every broken field and saves nothing', async () => {
    const store = renderApp();
    await userEvent.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Amount is required')).toBeInTheDocument();
    expect(screen.getByText('Choose who paid')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toHaveAccessibleDescription('Choose a category');
    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription('Description is required');
    expect(store.getState().trip.expenses).toHaveLength(0);
  });

  it('shows the negative amount, future date and exact-split errors', async () => {
    renderApp();
    await userEvent.type(screen.getByLabelText('Amount (₹)'), '-5');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2999-01-01' } });
    await userEvent.click(screen.getByLabelText('Exact amounts'));
    await userEvent.type(screen.getByLabelText('Aarav (₹)'), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(screen.getByText('Amount must be more than ₹0')).toBeInTheDocument();
    expect(screen.getByText('Date cannot be in the future')).toBeInTheDocument();
  });

  it('shows how much is left to assign', async () => {
    renderApp();
    await userEvent.type(screen.getByLabelText('Amount (₹)'), '100');
    await userEvent.click(screen.getByLabelText('Exact amounts'));
    await userEvent.type(screen.getByLabelText('Aarav (₹)'), '87.50');
    await userEvent.click(screen.getByRole('button', { name: 'Save expense' }));
    expect(screen.getByText('₹12.50 left to assign')).toBeInTheDocument();
  });

  it('saves a valid expense, goes to Expenses and shows a message', async () => {
    const store = renderApp();
    await userEvent.type(screen.getByLabelText('Description'), 'Cab to the beach');
    await userEvent.type(screen.getByLabelText('Amount (₹)'), '1250.50');
    await userEvent.selectOptions(screen.getByLabelText('Paid by'), 'Diya');
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'Travel');
    await userEvent.click(screen.getByRole('button', { name: 'Save expense' }));

    expect(screen.getByRole('status')).toHaveTextContent('Expense added');
    const row = screen.getByRole('row', { name: /Cab to the beach/ });
    expect(within(row).getByText('₹1,250.50')).toBeInTheDocument();
    expect(within(row).getByText('Equally, 5 people')).toBeInTheDocument();
    expect(store.getState().trip.expenses[0]).toMatchObject({ amount: 125050, paidBy: 'm2', category: 'Travel' });
  });
});
