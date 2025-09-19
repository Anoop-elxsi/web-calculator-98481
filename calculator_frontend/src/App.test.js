import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders calculator display and can add numbers', () => {
  render(<App />);
  const display = screen.getByTestId('display');
  expect(display).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '1' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  fireEvent.click(screen.getByRole('button', { name: '2' }));
  fireEvent.click(screen.getByRole('button', { name: 'Equals' }));
  expect(display.textContent).toBe('3');
});
