/**
 * OpenAPI/Swagger documentation generator for PetPark API
 */

import { ApiVersionManager } from './versioning';

export interface OpenApiPath {
  [method: string]: OpenApiOperation;
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: OpenApiResponses;
  deprecated?: boolean;
  security?: OpenApiSecurityRequirement[];
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: OpenApiSchema;
}

export interface OpenApiRequestBody {
  description?: string;
  required?: boolean;
  content: {
    [mimeType: string]: {
      schema: OpenApiSchema;
    };
  };
}

export interface OpenApiResponses {
  [statusCode: string]: OpenApiResponse;
}

export interface OpenApiResponse {
  description: string;
  content?: {
    [mimeType: string]: {
      schema: OpenApiSchema;
    };
  };
  headers?: {
    [headerName: string]: OpenApiHeader;
  };
}

export interface OpenApiHeader {
  description?: string;
  schema: OpenApiSchema;
}

export interface OpenApiSchema {
  type?: string;
  format?: string;
  properties?: {
    [propertyName: string]: OpenApiSchema;
  };
  items?: OpenApiSchema;
  required?: string[];
  example?: any;
  enum?: string[];
  $ref?: string;
  nullable?: boolean;
}

export interface OpenApiSecurityRequirement {
  [securityScheme: string]: string[];
}

export interface OpenApiSecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
  description?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: any;
  openIdConnectUrl?: string;
}

export interface OpenApiInfo {
  title: string;
  description: string;
  version: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface OpenApiDocument {
  openapi: string;
  info: OpenApiInfo;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: OpenApiPath;
  };
  components?: {
    schemas?: {
      [schemaName: string]: OpenApiSchema;
    };
    securitySchemes?: {
      [securityScheme: string]: OpenApiSecurityScheme;
    };
    responses?: {
      [responseName: string]: OpenApiResponse;
    };
    parameters?: {
      [parameterName: string]: OpenApiParameter;
    };
  };
  security?: OpenApiSecurityRequirement[];
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

export class OpenApiGenerator {
  private static readonly OPENAPI_VERSION = '3.0.0';
  
  /**
   * Generate OpenAPI document for PetPark API
   */
  static generateDocument(version?: string): OpenApiDocument {
    const apiVersion = version 
      ? ApiVersionManager.parseVersion(version) 
      : ApiVersionManager.getCurrentVersion();
    
    const basePath = ApiVersionManager.getApiBasePath(apiVersion!);
    
    const document: OpenApiDocument = {
      openapi: this.OPENAPI_VERSION,
      info: this.generateInfo(apiVersion!),
      servers: this.generateServers(basePath),
      paths: this.generatePaths(apiVersion!),
      components: this.generateComponents(),
      security: this.generateSecurity(),
      tags: this.generateTags(),
    };
    
    return document;
  }
  
  private static generateInfo(version: any): OpenApiInfo {
    return {
      title: 'PetPark API',
      description: `PetPark Platform API ${ApiVersionManager.formatVersion(version)}\n\n` +
                  'A comprehensive platform for pet owners, sitters, groomers, trainers, and veterinarians.\n\n' +
                  '## Authentication\n' +
                  'Most endpoints require authentication via JWT tokens.\n\n' +
                  '## Rate Limiting\n' +
                  'API is rate limited. Check response headers for rate limit information.\n\n' +
                  '## Versioning\n' +
                  'API uses semantic versioning. Current version: ' + ApiVersionManager.formatVersion(version),
      version: ApiVersionManager.formatVersion(version, true),
      termsOfService: 'https://petpark.example.com/terms',
      contact: {
        name: 'PetPark Support',
        url: 'https://petpark.example.com/contact',
        email: 'api@petpark.example.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://petpark.example.com/license',
      },
    };
  }
  
  private static generateServers(basePath: string) {
    return [
      {
        url: `https://api.petpark.example.com${basePath}`,
        description: 'Production API',
      },
      {
        url: `https://staging-api.petpark.example.com${basePath}`,
        description: 'Staging API',
      },
      {
        url: `http://localhost:3000${basePath}`,
        description: 'Local development',
      },
    ];
  }
  
  private static generatePaths(version: any): { [path: string]: OpenApiPath } {
    // This would be auto-generated from route metadata in a real implementation
    // For now, we'll define some example paths
    
    const paths: { [path: string]: OpenApiPath } = {
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user and return JWT token',
          operationId: 'loginUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successful login',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/LoginResponse',
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
            },
            '429': {
              description: 'Too many login attempts',
            },
          },
        },
      },
      
      '/users/{userId}': {
        get: {
          tags: ['Users'],
          summary: 'Get user profile',
          description: 'Retrieve user profile information',
          operationId: 'getUserProfile',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'User profile retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/UserProfile',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
            '404': {
              description: 'User not found',
            },
          },
        },
      },
      
      '/sitters': {
        get: {
          tags: ['Sitters'],
          summary: 'Search sitters',
          description: 'Search for pet sitters with filters',
          operationId: 'searchSitters',
          parameters: [
            {
              name: 'city',
              in: 'query',
              description: 'Filter by city',
              schema: { type: 'string' },
            },
            {
              name: 'service',
              in: 'query',
              description: 'Filter by service type',
              schema: {
                type: 'string',
                enum: ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'],
              },
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Items per page',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            },
          ],
          responses: {
            '200': {
              description: 'List of sitters',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SitterList',
                  },
                },
              },
            },
          },
        },
      },
      
      '/bookings': {
        post: {
          tags: ['Bookings'],
          summary: 'Create booking',
          description: 'Create a new pet sitting booking',
          operationId: 'createBooking',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateBookingRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Booking created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Booking',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid booking data',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
    };
    
    return paths;
  }
  
  private static generateComponents() {
    return {
      schemas: {
        // Common schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'object' },
          },
        },
        
        // Authentication schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            rememberMe: { type: 'boolean', default: false },
          },
        },
        
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: '#/components/schemas/UserProfile' },
            expiresIn: { type: 'integer' },
          },
        },
        
        // User schemas
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: {
              type: 'string',
              enum: ['owner', 'sitter', 'admin', 'groomer', 'trainer', 'veterinarian'],
            },
            avatarUrl: { type: 'string', format: 'uri' },
            phone: { type: 'string' },
            city: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Sitter schemas
        SitterProfile: {
          type: 'object',
          properties: {
            userId: { type: 'string', format: 'uuid' },
            bio: { type: 'string' },
            experienceYears: { type: 'integer' },
            services: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Service',
              },
            },
            prices: { type: 'object' },
            verified: { type: 'boolean' },
            superhost: { type: 'boolean' },
            ratingAvg: { type: 'number', format: 'float' },
            reviewCount: { type: 'integer' },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number', format: 'float' },
                lng: { type: 'number', format: 'float' },
              },
            },
          },
        },
        
        SitterList: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/SitterProfile' },
            },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            hasMore: { type: 'boolean' },
          },
        },
        
        // Service schemas
        Service: {
          type: 'object',
          required: ['id', 'type', 'name', 'enabled'],
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'],
            },
            name: { type: 'string' },
            description: { type: 'string' },
            enabled: { type: 'boolean' },
            durationMinutes: { type: 'integer' },
            maxPets: { type: 'integer' },
            requirements: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        
        // Booking schemas
        CreateBookingRequest: {
          type: 'object',
          required: ['sitterId', 'petId', 'serviceType', 'startDate', 'endDate'],
          properties: {
            sitterId: { type: 'string', format: 'uuid' },
            petId: { type: 'string', format: 'uuid' },
            serviceType: {
              type: 'string',
              enum: ['boarding', 'walking', 'house-sitting', 'drop-in', 'daycare'],
            },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            note: { type: 'string' },
          },
        },
        
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            ownerId: { type: 'string', format: 'uuid' },
            sitterId: { type: 'string', format: 'uuid' },
            petId: { type: 'string', format: 'uuid' },
            serviceType: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: {
              type: 'string',
              enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
            },
            totalPrice: { type: 'number', format: 'float' },
            note: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for server-to-server communication',
        },
      },
      
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    };
  }
  
  private static generateSecurity(): OpenApiSecurityRequirement[] {
    return [
      { bearerAuth: [] },
    ];
  }
  
  private static generateTags() {
    return [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Users', description: 'User profile management' },
      { name: 'Sitters', description: 'Pet sitter profiles and search' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Pets', description: 'Pet profile management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Reviews', description: 'Reviews and ratings' },
      { name: 'Messages', description: 'User messaging' },
      { name: 'Admin', description: 'Administrative operations' },
    ];
  }
  
  /**
   * Generate Swagger UI HTML
   */
  static generateSwaggerUi(version?: string): string {
    const apiVersion = version 
      ? ApiVersionManager.parseVersion(version) 
      : ApiVersionManager.getCurrentVersion();
    
    const specUrl = `/api/docs/${ApiVersionManager.formatVersion(apiVersion!)}/spec`;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PetPark API Documentation - ${ApiVersionManager.formatVersion(apiVersion!)}</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://petpark.example.com/favicon.png" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    
    body {
      margin: 0;
      background: #