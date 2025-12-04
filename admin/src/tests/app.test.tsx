import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

describe('App shell', () => {
  it('renders login or dashboard shell', () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // should at least render a login button or logout in navbar depending on token
    expect(getByText(/login/i) || getByText(/sair/i)).toBeTruthy();
  });
});
