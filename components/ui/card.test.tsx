import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Component', () => {
  test('renders basic card with content', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card.parentElement).toHaveClass('rounded-lg border');
  });

  test('renders card with header', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders card with footer', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  test('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>This is a complete card example</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main card content goes here.</p>
          <p>Additional information can be included.</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
    expect(screen.getByText('Main card content goes here.')).toBeInTheDocument();
    expect(screen.getByText('Additional information can be included.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  test('applies custom className to Card', () => {
    render(
      <Card className="custom-card">
        <CardContent>Content</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Content').parentElement?.parentElement;
    expect(card).toHaveClass('custom-card');
  });

  test('applies custom className to CardHeader', () => {
    render(
      <Card>
        <CardHeader className="custom-header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    const header = screen.getByText('Title').parentElement;
    expect(header).toHaveClass('custom-header');
  });

  test('applies custom className to CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title">Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    const title = screen.getByText('Title');
    expect(title).toHaveClass('custom-title');
  });

  test('applies custom className to CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription className="custom-description">Description</CardDescription>
        </CardHeader>
      </Card>
    );
    
    const description = screen.getByText('Description');
    expect(description).toHaveClass('custom-description');
  });

  test('applies custom className to CardContent', () => {
    render(
      <Card>
        <CardContent className="custom-content">Content</CardContent>
      </Card>
    );
    
    const content = screen.getByText('Content');
    expect(content).toHaveClass('custom-content');
  });

  test('applies custom className to CardFooter', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>
    );
    
    const footer = screen.getByText('Footer');
    expect(footer).toHaveClass('custom-footer');
  });

  test('renders CardTitle as different heading level', () => {
    const { rerender } = render(
      <Card>
        <CardHeader>
          <CardTitle as="h1">H1 Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    let title = screen.getByRole('heading', { level: 1 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('H1 Title');

    rerender(
      <Card>
        <CardHeader>
          <CardTitle as="h3">H3 Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('H3 Title');
  });

  test('CardTitle defaults to h2', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Default Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Default Title');
  });

  test('renders interactive card', () => {
    const handleClick = jest.fn();
    
    render(
      <Card onClick={handleClick} className="cursor-pointer hover:shadow-lg">
        <CardContent>Clickable card</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Clickable card').parentElement?.parentElement;
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:shadow-lg');
  });

  test('renders card with different variants', () => {
    const { rerender } = render(
      <Card variant="default">
        <CardContent>Default variant</CardContent>
      </Card>
    );
    
    let card = screen.getByText('Default variant').parentElement?.parentElement;
    expect(card).toHaveClass('border');

    rerender(
      <Card variant="outline">
        <CardContent>Outline variant</CardContent>
      </Card>
    );
    
    card = screen.getByText('Outline variant').parentElement?.parentElement;
    expect(card).toHaveClass('border-2');
  });

  test('renders card with shadow', () => {
    render(
      <Card shadow="lg">
        <CardContent>Card with shadow</CardContent>
      </Card>
    );
    
    const card = screen.getByText('Card with shadow').parentElement?.parentElement;
    expect(card).toHaveClass('shadow-lg');
  });

  test('renders card without padding', () => {
    render(
      <Card padding="none">
        <CardContent>No padding</CardContent>
      </Card>
    );
    
    const content = screen.getByText('No padding');
    expect(content.parentElement).toHaveClass('p-0');
  });

  test('accessibility: card has proper role', () => {
    render(
      <Card role="article">
        <CardContent>Article card</CardContent>
      </Card>
    );
    
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('Article card');
  });

  test('accessibility: card with aria-label', () => {
    render(
      <Card aria-label="User profile card">
        <CardContent>Profile content</CardContent>
      </Card>
    );
    
    const card = screen.getByLabelText('User profile card');
    expect(card).toBeInTheDocument();
  });

  test('renders multiple cards in a grid', () => {
    render(
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent>Card 1</CardContent>
        </Card>
        <Card>
          <CardContent>Card 2</CardContent>
        </Card>
        <Card>
          <CardContent>Card 3</CardContent>
        </Card>
      </div>
    );
    
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  test('forwards ref to Card component', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Card ref={ref}>
        <CardContent>Ref card</CardContent>
      </Card>
    );
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveTextContent('Ref card');
  });
});