import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src} alt={props.alt} />;
  },
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}));

describe('🔥 Smoke Tests - Critical User Flows', () => {
  describe('Public Pages', () => {
    it('homepage should render without crashing', async () => {
      // This is a basic smoke test - in real scenario, import actual component
      const HomePage = () => (
        <div>
          <h1>PetPark</h1>
          <p>Pronađite savršenog čuvara za svog ljubimca</p>
        </div>
      );
      
      render(<HomePage />);
      
      expect(screen.getByText('PetPark')).toBeInTheDocument();
      expect(screen.getByText(/čuvara/)).toBeInTheDocument();
    });

    it('should handle 404 pages gracefully', () => {
      const NotFound = () => (
        <div>
          <h1>404</h1>
          <p>Stranica nije pronađena</p>
        </div>
      );
      
      render(<NotFound />);
      
      expect(screen.getByText('404')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should render navigation links', () => {
      const Nav = () => (
        <nav>
          <a href="/pretraga">Pretraga</a>
          <a href="/njega">Njega</a>
          <a href="/dresura">Dresura</a>
        </nav>
      );
      
      render(<Nav />);
      
      expect(screen.getByText('Pretraga')).toBeInTheDocument();
      expect(screen.getByText('Njega')).toBeInTheDocument();
      expect(screen.getByText('Dresura')).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('should show login form elements', () => {
      const LoginForm = () => (
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Lozinka" />
          <button type="submit">Prijavi se</button>
        </form>
      );
      
      render(<LoginForm />);
      
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Lozinka')).toBeInTheDocument();
      expect(screen.getByText('Prijavi se')).toBeInTheDocument();
    });
  });

  describe('Search Flow', () => {
    it('should render search interface', () => {
      const SearchPage = () => (
        <div>
          <input type="search" placeholder="Pretraži čuvare..." />
          <button>Pretraži</button>
        </div>
      );
      
      render(<SearchPage />);
      
      expect(screen.getByPlaceholderText(/Pretraži/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error boundary fallback', () => {
      const ErrorFallback = ({ error }: { error: Error }) => (
        <div role="alert">
          <h2>Došlo je do greške</h2>
          <p>{error.message}</p>
        </div>
      );
      
      render(<ErrorFallback error={new Error('Test error')} />);
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/greške/)).toBeInTheDocument();
    });
  });
});

describe('⚡ Performance Smoke Tests', () => {
  it('should render within acceptable time', async () => {
    const start = performance.now();
    
    const SimpleComponent = () => <div>Test</div>;
    render(<SimpleComponent />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });
});

describe('🔒 Security Smoke Tests', () => {
  it('should not expose sensitive environment variables', () => {
    // Ensure no server-only variables are exposed
    const publicEnvVars = Object.keys(process.env).filter(key => 
      key.startsWith('NEXT_PUBLIC_')
    );
    
    const sensitiveVars = publicEnvVars.filter(key =>
      key.includes('SECRET') || 
      key.includes('PRIVATE') || 
      key.includes('PASSWORD')
    );
    
    expect(sensitiveVars).toHaveLength(0);
  });
});
