import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
  it('renders basic card with content', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toHaveAttribute('data-slot', 'card');
  });

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'card-title');
    expect(screen.getByText('Description')).toHaveAttribute('data-slot', 'card-description');
    expect(screen.getByText('Content')).toHaveAttribute('data-slot', 'card-content');
    expect(screen.getByText('Footer')).toHaveAttribute('data-slot', 'card-footer');
  });

  it('applies custom class names', () => {
    render(
      <Card className="custom-card">
        <CardHeader className="custom-header">Header</CardHeader>
      </Card>
    );

    expect(screen.getByText('Header').closest('[data-slot="card"]')).toHaveClass('custom-card');
    expect(screen.getByText('Header')).toHaveClass('custom-header');
  });

  it('supports small size', () => {
    render(<Card size="sm">Small card</Card>);
    expect(screen.getByText('Small card')).toHaveAttribute('data-size', 'sm');
  });
});
