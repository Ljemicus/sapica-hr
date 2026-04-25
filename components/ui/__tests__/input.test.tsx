import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders basic input', () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByLabelText('Name');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input aria-label="Email" onChange={handleChange} />);
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled value', () => {
    render(<Input aria-label="Controlled" value="initial" readOnly />);
    expect(screen.getByLabelText('Controlled')).toHaveValue('initial');
  });

  it('renders disabled and readOnly states', () => {
    const { rerender } = render(<Input aria-label="Disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();

    rerender(<Input aria-label="Readonly" readOnly />);
    expect(screen.getByLabelText('Readonly')).toHaveAttribute('readonly');
  });

  it('applies custom className and type', () => {
    render(<Input aria-label="Password" type="password" className="custom-input" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveClass('custom-input');
  });
});
