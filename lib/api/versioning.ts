/**
 * API versioning system
 */

export interface ApiVersion {
  version: string;
  basePath: string;
  deprecated?: boolean;
  sunsetDate?: string;
  changelog?: string[];
}

export interface VersionConfig {
  current: string;
  supported: string[];
  deprecated: string[];
  default: string;
}

export class ApiVersioning {
  private static readonly VERSIONS: Record<string, ApiVersion> = {
    'v1': {
      version: 'v1',
      basePath: '/api/v1',
      changelog: [
        'Initial API version',
        'Basic CRUD operations for pets, sitters, bookings',
        'Authentication and authorization',
        'Payment processing integration',
      ],
    },
    'v2': {
      version: 'v2',
      basePath: '/api/v2',
      changelog: [
        'Enhanced error handling',
        'Improved validation schemas',
        'Additional filtering options',
        'Performance optimizations',
        'Extended metadata support',
      ],
    },
  };
  
  private static readonly CONFIG: VersionConfig = {
    current: 'v2',
    supported: ['v1', 'v2'],
    deprecated: [],
    default: 'v2',
  };
  
  /**
   * Get version configuration
   */
  static getConfig(): VersionConfig {
    return { ...this.CONFIG };
  }
  
  /**
   * Get specific version details
   */
  static getVersion(version: string): ApiVersion | null {
    return this.VERSIONS[version] || null;
  }
  
  /**
   * Get all versions
   */
  static getAllVersions(): ApiVersion[] {
    return Object.values(this.VERSIONS);
  }
  
  /**
   * Validate API version
   */
  static isValidVersion(version: string): boolean {
    return this.CONFIG.supported.includes(version);
  }
  
  /**
   * Check if version is deprecated
   */
  static isDeprecated(version: string): boolean {
    return this.CONFIG.deprecated.includes(version);
  }
  
  /**
   * Get base path for version
   */
  static getBasePath(version: string): string {
    const versionInfo = this.getVersion(version);
    return versionInfo?.basePath || `/api/${version}`;
  }
  
  /**
   * Extract version from request
   */
  static extractVersionFromRequest(url: string): string | null {
    const match = url.match(/\/api\/(v\d+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Get appropriate version for request
   */
  static getVersionForRequest(url: string, acceptHeader?: string): string {
    // Try to extract from URL first
    const urlVersion = this.extractVersionFromRequest(url);
    if (urlVersion && this.isValidVersion(urlVersion)) {
      return urlVersion;
    }
    
    // Try to extract from Accept header
    if (acceptHeader) {
      const versionMatch = acceptHeader.match(/version=([^,;]+)/);
      if (versionMatch && this.isValidVersion(versionMatch[1])) {
        return versionMatch[1];
      }
    }
    
    // Return default version
    return this.CONFIG.default;
  }
  
  /**
   * Create versioned response
   */
  static createVersionedResponse<T>(
    data: T,
    version: string,
    options?: {
      deprecated?: boolean;
      sunsetDate?: string;
      links?: Record<string, string>;
    }
  ): {
    data: T;
    meta: {
      version: string;
      deprecated?: boolean;
      sunsetDate?: string;
      links?: Record<string, string>;
    };
  } {
    const versionInfo = this.getVersion(version);
    const isDeprecated = this.isDeprecated(version);
    
    return {
      data,
      meta: {
        version,
        deprecated: isDeprecated || options?.deprecated,
        sunsetDate: options?.sunsetDate || versionInfo?.sunsetDate,
        links: options?.links || {
          self: `${versionInfo?.basePath || `/api/${version}`}`,
          documentation: `/api/docs/${version}`,
          changelog: `/api/changelog/${version}`,
          ...(isDeprecated && {
            upgrade: `/api/upgrade/${version}`,
          }),
        },
      },
    };
  }
  
  /**
   * Generate version migration guide
   */
  static generateMigrationGuide(fromVersion: string, toVersion: string): {
    from: string;
    to: string;
    breakingChanges: string[];
    newFeatures: string[];
    deprecatedFeatures: string[];
    migrationSteps: string[];
  } {
    const fromInfo = this.getVersion(fromVersion);
    const toInfo = this.getVersion(toVersion);
    
    if (!fromInfo || !toInfo) {
      throw new Error(`Invalid version(s): ${fromVersion} -> ${toVersion}`);
    }
    
    // In a real implementation, this would compare API schemas
    // and generate detailed migration guide
    // For now, return a template
    
    return {
      from: fromVersion,
      to: toVersion,
      breakingChanges: [
        'Updated response format for error handling',
        'Changed parameter names for consistency',
        'Removed deprecated endpoints',
      ],
      newFeatures: [
        'Enhanced filtering capabilities',
        'Additional metadata fields',
        'Improved pagination',
        'Better error messages',
      ],
      deprecatedFeatures: [
        'Legacy authentication methods',
        'Old response formats',
        'Unused query parameters',
      ],
      migrationSteps: [
        'Update API client to use new base path',
        'Update request/response handling',
        'Test with new version in staging',
        'Update documentation references',
        'Monitor for any issues after migration',
      ],
    };
  }
  
  /**
   * Generate API documentation links
   */
  static generateDocumentationLinks(version: string): Record<string, string> {
    return {
      overview: `/api/docs/${version}`,
      reference: `/api/docs/${version}/reference`,
      examples: `/api/docs/${version}/examples`,
      migration: `/api/docs/${version}/migration`,
      changelog: `/api/docs/${version}/changelog`,
      support: `/api/docs/${version}/support`,
    };
  }
  
  /**
   * Middleware for API versioning
   */
  static middleware(req: Request): {
    version: string;
    basePath: string;
    isDeprecated: boolean;
    shouldUpgrade: boolean;
  } {
    const url = new URL(req.url);
    const version = this.getVersionForRequest(url.pathname, req.headers.get('accept') || undefined);
    const isDeprecated = this.isDeprecated(version);
    const basePath = this.getBasePath(version);
    
    return {
      version,
      basePath,
      isDeprecated,
      shouldUpgrade: isDeprecated || version !== this.CONFIG.current,
    };
  }
  
  /**
   * Semantic versioning utilities
   */
  static readonly semver = {
    parse(version: string): { major: number; minor: number; patch: number } | null {
      const match = version.match(/v?(\d+)\.(\d+)\.(\d+)/);
      if (!match) return null;
      
      return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
      };
    },
    
    compare(v1: string, v2: string): number {
      const parsed1 = this.parse(v1);
      const parsed2 = this.parse(v2);
      
      if (!parsed1 || !parsed2) return 0;
      
      if (parsed1.major !== parsed2.major) {
        return parsed1.major - parsed2.major;
      }
      
      if (parsed1.minor !== parsed2.minor) {
        return parsed1.minor - parsed2.minor;
      }
      
      return parsed1.patch - parsed2.patch;
    },
    
    isCompatible(base: string, target: string): boolean {
      const baseParsed = this.parse(base);
      const targetParsed = this.parse(target);
      
      if (!baseParsed || !targetParsed) return false;
      
      // Same major version means backward compatible
      return baseParsed.major === targetParsed.major;
    },
  };
}

// Default versioning instance
export const apiVersioning = ApiVersioning;

// Helper for API routes
export function withVersioning<T>(
  handler: (req: Request, version: string) => Promise<T>
): (req: Request) => Promise<T> {
  return async function versionedHandler(req: Request) {
    const { version } = ApiVersioning.middleware(req);
    return handler(req, version);
  };
}

// Version header constants
export const VERSION_HEADERS = {
  API_VERSION: 'X-API-Version',
  API_DEPRECATED: 'X-API-Deprecated',
  API_SUNSET: 'X-API-Sunset',
  API_LINKS: 'X-API-Links',
} as const;