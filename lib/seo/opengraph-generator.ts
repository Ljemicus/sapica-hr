/**
 * OpenGraph image generator for PetPark
 * Creates dynamic social media images
 */

export interface OpenGraphImageOptions {
  title: string;
  description?: string;
  siteName?: string;
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
  logo?: boolean;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  imageUrl?: string; // Optional background image
}

export class OpenGraphImageGenerator {
  private static readonly DEFAULT_OPTIONS: Required<OpenGraphImageOptions> = {
    title: 'PetPark',
    description: 'A platform for finding and comparing pet care services',
    siteName: 'PetPark',
    theme: 'light',
    width: 1200,
    height: 630,
    logo: true,
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    accentColor: '#3b82f6',
    imageUrl: '',
  };
  
  /**
   * Generate OpenGraph image URL
   */
  static generateUrl(options: OpenGraphImageOptions): string {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    // In production, this would use a service like Vercel OG Image Generation
    // For now, we'll create a parameterized URL for a hypothetical service
    
    const params = new URLSearchParams({
      title: encodeURIComponent(config.title),
      description: encodeURIComponent(config.description),
      siteName: encodeURIComponent(config.siteName),
      theme: config.theme,
      width: config.width.toString(),
      height: config.height.toString(),
      logo: config.logo.toString(),
      backgroundColor: config.backgroundColor.replace('#', ''),
      textColor: config.textColor.replace('#', ''),
      accentColor: config.accentColor.replace('#', ''),
    });
    
    if (config.imageUrl) {
      params.set('image', encodeURIComponent(config.imageUrl));
    }
    
    return `/api/og?${params.toString()}`;
  }
  
  /**
   * Generate OpenGraph image HTML for meta tags
   */
  static generateMetaTags(options: OpenGraphImageOptions): Array<{ property: string; content: string }> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    const imageUrl = this.generateUrl(config);
    
    return [
      // OpenGraph tags
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:width', content: config.width.toString() },
      { property: 'og:image:height', content: config.height.toString() },
      { property: 'og:image:alt', content: config.title },
      { property: 'og:title', content: config.title },
      { property: 'og:description', content: config.description },
      { property: 'og:site_name', content: config.siteName },
      
      // Twitter Card tags (compatible with OpenGraph)
      { property: 'twitter:image', content: imageUrl },
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:title', content: config.title },
      { property: 'twitter:description', content: config.description },
    ];
  }
  
  /**
   * Generate HTML for OpenGraph image (for API route)
   */
  static generateHtml(options: OpenGraphImageOptions): string {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: ${config.width}px;
            height: ${config.height}px;
            background: ${config.backgroundColor};
            color: ${config.textColor};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 80px;
            position: relative;
            overflow: hidden;
          }
          
          .background-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${config.imageUrl}');
            background-size: cover;
            background-position: center;
            opacity: 0.1;
            z-index: 0;
          }
          
          .content {
            position: relative;
            z-index: 1;
            text-align: center;
            max-width: 800px;
          }
          
          .logo {
            margin-bottom: 40px;
            color: ${config.accentColor};
            font-size: 24px;
            font-weight: bold;
            display: ${config.logo ? 'block' : 'none'};
          }
          
          .title {
            font-size: 64px;
            font-weight: 800;
            line-height: 1.1;
            margin-bottom: 20px;
            background: linear-gradient(135deg, ${config.accentColor}, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .description {
            font-size: 32px;
            line-height: 1.4;
            opacity: 0.8;
            margin-bottom: 40px;
          }
          
          .site-name {
            position: absolute;
            bottom: 40px;
            left: 40px;
            font-size: 24px;
            font-weight: 600;
            color: ${config.accentColor};
          }
          
          .theme-dark {
            background: #1a1a1a;
            color: #ffffff;
          }
          
          .theme-dark .title {
            background: linear-gradient(135deg, ${config.accentColor}, #60a5fa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        </style>
      </head>
      <body class="theme-${config.theme}">
        ${config.imageUrl ? '<div class="background-image"></div>' : ''}
        <div class="content">
          <div class="logo">🐾 PetPark</div>
          <h1 class="title">${config.title}</h1>
          ${config.description ? `<p class="description">${config.description}</p>` : ''}
        </div>
        <div class="site-name">${config.siteName}</div>
      </body>
      </html>
    `;
  }
  
  /**
   * Preset configurations for different page types
   */
  static readonly PRESETS = {
    HOME: (): OpenGraphImageOptions => ({
      title: 'PetPark - Trusted Pet Care Platform',
      description: 'Find reliable sitters, groomers, trainers, and veterinarians for your pets',
      theme: 'light',
      accentColor: '#3b82f6',
    }),
    
    SITTER_PROFILE: (name: string, rating: number): OpenGraphImageOptions => ({
      title: `${name} - Pet Sitter on PetPark`,
      description: `⭐ ${rating}/5 rating | Trusted pet sitter available for boarding, walking, and more`,
      theme: 'light',
      accentColor: '#10b981',
    }),
    
    PET_PROFILE: (name: string, type: string): OpenGraphImageOptions => ({
      title: `${name} the ${type}`,
      description: 'Loving pet looking for care and attention',
      theme: 'light',
      accentColor: '#f59e0b',
    }),
    
    BLOG_POST: (title: string, author: string): OpenGraphImageOptions => ({
      title,
      description: `By ${author} | Pet care tips and advice`,
      theme: 'dark',
      accentColor: '#8b5cf6',
    }),
    
    SERVICE: (service: string, location: string): OpenGraphImageOptions => ({
      title: `${service} in ${location}`,
      description: 'Professional pet services near you',
      theme: 'light',
      accentColor: '#ef4444',
    }),
  };
}

/**
 * Helper function to generate OpenGraph image for a page
 */
export function generateOpenGraphImage(
  pageType: keyof typeof OpenGraphImageGenerator.PRESETS,
  ...args: unknown[]
): string {
  const preset = OpenGraphImageGenerator.PRESETS[pageType];
  const options = typeof preset === 'function' ? (preset as (...args: unknown[]) => OpenGraphImageOptions)(...args) : preset;
  return OpenGraphImageGenerator.generateUrl(options);
}

/**
 * Helper function to generate all OpenGraph meta tags for a page
 */
export function generateOpenGraphMetaTags(
  pageType: keyof typeof OpenGraphImageGenerator.PRESETS,
  ...args: unknown[]
): Array<{ property: string; content: string }> {
  const preset = OpenGraphImageGenerator.PRESETS[pageType];
  const options = typeof preset === 'function' ? (preset as (...args: unknown[]) => OpenGraphImageOptions)(...args) : preset;
  return OpenGraphImageGenerator.generateMetaTags(options);
}