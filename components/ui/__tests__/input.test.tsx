import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input Component', () => {
  test('renders basic input', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex h-9 w-full');
  });

  test('renders input with label', () => {
    render(
      <div>
        <label htmlFor="test-input">Test Label</label>
        <Input id="test-input" placeholder="Enter text" />
      </div>
    );
    
    const label = screen.getByText('Test Label');
    const input = screen.getByPlaceholderText('Enter text');
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-input');
  });

  test('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('Hello World');
  });

  test('displays initial value', () => {
    render(<Input defaultValue="Initial value" />);
    const input = screen.getByDisplayValue('Initial value');
    expect(input).toBeInTheDocument();
  });

  test('supports controlled component', () => {
    const { rerender } = render(<Input value="Controlled" onChange={() => {}} />);
    let input = screen.getByDisplayValue('Controlled');
    expect(input).toHaveValue('Controlled');
    
    rerender(<Input value="Updated" onChange={() => {}} />);
    input = screen.getByDisplayValue('Updated');
    expect(input).toHaveValue('Updated');
  });

  test('renders disabled input', () => {
    render(<Input disabled placeholder="Disabled" />);
    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  test('renders read-only input', () => {
    render(<Input readOnly placeholder="Read only" />);
    const input = screen.getByPlaceholderText('Read only');
    expect(input).toHaveAttribute('readonly');
  });

  test('renders input with different types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />);
    let input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
    
    rerender(<Input type="password" placeholder="Password" />);
    input = screen.getByPlaceholderText('Password');
    expect(input).toHaveAttribute('type', 'password');
    
    rerender(<Input type="number" placeholder="Number" />);
    input = screen.getByPlaceholderText('Number');
    expect(input).toHaveAttribute('type', 'number');
    
    rerender(<Input type="tel" placeholder="Phone" />);
    input = screen.getByPlaceholderText('Phone');
    expect(input).toHaveAttribute('type', 'tel');
  });

  test('renders input with error state', () => {
    render(<Input error placeholder="Error input" />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input).toHaveClass('border-destructive');
  });

  test('renders input with success state', () => {
    render(<Input success placeholder="Success input" />);
    const input = screen.getByPlaceholderText('Success input');
    expect(input).toHaveClass('border-green-500');
  });

  test('renders input with warning state', () => {
    render(<Input warning placeholder="Warning input" />);
    const input = screen.getByPlaceholderText('Warning input');
    expect(input).toHaveClass('border-yellow-500');
  });

  test('renders input with different sizes', () => {
    const { rerender } = render(<Input size="sm" placeholder="Small" />);
    let input = screen.getByPlaceholderText('Small');
    expect(input).toHaveClass('h-8');
    
    rerender(<Input size="lg" placeholder="Large" />);
    input = screen.getByPlaceholderText('Large');
    expect(input).toHaveClass('h-10');
  });

  test('renders input with icon', () => {
    const Icon = () => <span data-testid="input-icon">🔍</span>;
    render(<Input icon={<Icon />} placeholder="Search" />);
    
    const icon = screen.getByTestId('input-icon');
    const input = screen.getByPlaceholderText('Search');
    
    expect(icon).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  test('renders input with prefix', () => {
    render(<Input prefix="$" placeholder="Amount" />);
    const prefix = screen.getByText('$');
    const input = screen.getByPlaceholderText('Amount');
    
    expect(prefix).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  test('renders input with suffix', () => {
    render(<Input suffix="kg" placeholder="Weight" />);
    const suffix = screen.getByText('kg');
    const input = screen.getByPlaceholderText('Weight');
    
    expect(suffix).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />);
    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-input');
  });

  test('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref test" />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.placeholder).toBe('Ref test');
  });

  test('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur} 
        placeholder="Focus test" 
      />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  test('handles key events', () => {
    const handleKeyDown = jest.fn();
    const handleKeyUp = jest.fn();
    
    render(
      <Input 
        onKeyDown={handleKeyDown} 
        onKeyUp={handleKeyUp} 
        placeholder="Key test" 
      />
    );
    
    const input = screen.getByPlaceholderText('Key test');
    
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    
    fireEvent.keyUp(input, { key: 'Enter', code: 'Enter' });
    expect(handleKeyUp).toHaveBeenCalledTimes(1);
  });

  test('renders input with autoComplete attribute', () => {
    render(<Input autoComplete="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  test('renders input with autoFocus', () => {
    render(<Input autoFocus placeholder="Autofocus" />);
    const input = screen.getByPlaceholderText('Autofocus');
    expect(input).toHaveFocus();
  });

  test('renders input with maxLength', () => {
    render(<Input maxLength={10} placeholder="Max length" />);
    const input = screen.getByPlaceholderText('Max length');
    expect(input).toHaveAttribute('maxlength', '10');
  });

  test('renders input with min and max for number type', () => {
    render(
      <Input 
        type="number" 
        min={0} 
        max={100} 
        placeholder="Number" 
      />
    );
    
    const input = screen.getByPlaceholderText('Number');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
  });

  test('renders input with step for number type', () => {
    render(<Input type="number" step={0.5} placeholder="Step" />);
    const input = screen.getByPlaceholderText('Step');
    expect(input).toHaveAttribute('step', '0.5');
  });

  test('accessibility: input has proper aria-label', () => {
    render(<Input aria-label="Search input" placeholder="Search" />);
    const input = screen.getByLabelText('Search input');
    expect(input).toBeInTheDocument();
  });

  test('accessibility: input has proper aria-describedby', () => {
    render(
      <div>
        <Input 
          aria-describedby="help-text" 
          placeholder="Input with help" 
        />
        <p id="help-text">This is help text</p>
      </div>
    );
    
    const input = screen.getByPlaceholderText('Input with help');
    expect(input).toHaveAttribute('aria-describedby', 'help-text');
  });

  test('accessibility: input with error has aria-invalid', () => {
    render(<Input error aria-invalid="true" placeholder="Error" />);
    const input = screen.getByPlaceholderText('Error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('renders input with loading state', () => {
    render(<Input loading placeholder="Loading" />);
    const input = screen.getByPlaceholderText('Loading');
    expect(input).toHaveClass('opacity-50');
  });

  test('renders input with clear button', () => {
    const handleClear = jest.fn();
    render(
      <Input 
        value="Clear me" 
        onChange={() => {}} 
        onClear={handleClear} 
        placeholder="Clearable" 
      />
    );
    
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  test('renders input in different variants', () => {
    const { rerender } = render(<Input variant="default" placeholder="Default" />);
    let input = screen.getByPlaceholderText('Default');
    expect(input).toHaveClass('border');
    
    rerender(<Input variant="filled" placeholder="Filled" />);
    input = screen.getByPlaceholderText('Filled');
    expect(input).toHaveClass('bg-muted');
    
    rerender(<Input variant="unstyled" placeholder="Unstyled" />);
    input = screen.getByPlaceholderText('Unstyled');
    expect(input).toHaveClass('border-0');
  });

  test('renders input with full width', () => {
    render(<Input fullWidth placeholder="Full width" />);
    const input = screen.getByPlaceholderText('Full width');
    expect(input).toHaveClass('w-full');
  });
});