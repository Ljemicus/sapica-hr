/**
 * OpenAPI/Swagger documentation generator for PetPark API
 */

import { ApiVersioning } from './versioning';

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
}

export interface OpenApiSchema {
  type?: string;
  format?: string;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  items?: OpenApiSchema;
  enum?: string[];
  example?: any;
  $ref?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: any;
  description?: string;
}

export interface OpenApiSecurityRequirement {
  [securityScheme: string]: string[];
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
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, OpenApiPath>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    securitySchemes?: Record<string, any>;
  };
  security?: OpenApiSecurityRequirement[];
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

export class OpenApiGenerator {
  private static readonly OPENAPI_VERSION = '3.0.3';
  
  /**
   * Generate OpenAPI document for PetPark API
   */
  static generateDocument(): OpenApiDocument {
    return {
      openapi: this.OPENAPI_VERSION,
      info: {
        title: 'PetPark API',
        description: 'API for PetPark - Trusted Pet Care Platform\n\n' +
          'Find reliable sitters, groomers, trainers, and veterinarians for your pets.',
        version: ApiVersioning.getConfig().current,
        termsOfService: 'https://petpark.example.com/terms',
        contact: {
          name: 'PetPark Support',
          url: 'https://petpark.example.com/support',
          email: 'support@petpark.example.com',
        },
        license: {
          name: 'Proprietary',
          url: 'https://petpark.example.com/license',
        },
      },
      servers: ApiVersioning.getAllVersions().map(v => ({
        url: v.basePath,
        description: `API Version ${v.version}`,
      })),
      paths: this.generatePaths(),
      components: {
        schemas: this.generateSchemas(),
        securitySchemes: this.generateSecuritySchemes(),
      },
      security: [{ bearerAuth: [] }],
      tags: [],
    };
  }
  
  /**
   * Generate API paths
   */
  private static generatePaths(): Record<string, OpenApiPath> {
    return {
      // Authentication
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user with email and password',
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
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
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
      
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'User registration',
          description: 'Register a new user account',
          operationId: 'registerUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Registration successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid registration data',
            },
            '409': {
              description: 'User already exists',
            },
          },
        },
      },
      
      // Pets
      '/pets': {
        get: {
          tags: ['Pets'],
          summary: 'Get user pets',
          description: 'Retrieve list of pets for the authenticated user',
          operationId: 'getUserPets',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of pets',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Pet',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
        post: {
          tags: ['Pets'],
          summary: 'Create pet',
          description: 'Add a new pet to user profile',
          operationId: 'createPet',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreatePetRequest',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Pet created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Pet',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid pet data',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
      
      '/pets/{id}': {
        get: {
          tags: ['Pets'],
          summary: 'Get pet by ID',
          description: 'Retrieve specific pet details',
          operationId: 'getPetById',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Pet ID',
            },
          ],
          responses: {
            '200': {
              description: 'Pet details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Pet',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
            '404': {
              description: 'Pet not found',
            },
          },
        },
        put: {
          tags: ['Pets'],
          summary: 'Update pet',
          description: 'Update pet information',
          operationId: 'updatePet',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Pet ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdatePetRequest',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Pet updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Pet',
                  },
                },
              },
            },
            '400': {
              description: 'Invalid update data',
            },
            '401': {
              description: 'Unauthorized',
            },
            '404': {
              description: 'Pet not found',
            },
          },
        },
        delete: {
          tags: ['Pets'],
          summary: 'Delete pet',
          description: 'Remove pet from user profile',
          operationId: 'deletePet',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Pet ID',
            },
          ],
          responses: {
            '204': {
              description: 'Pet deleted successfully',
            },
            '401': {
              description: 'Unauthorized',
            },
            '404': {
              description: 'Pet not found',
            },
          },
        },
      },
      
      // Sitters
      '/sitters': {
        get: {
          tags: ['Sitters'],
          summary: 'Search sitters',
          description: 'Search for pet sitters with filters',
          operationId: 'searchSitters',
          parameters: [
            {
              name: 'location',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Location for sitter search',
            },
            {
              name: 'service',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Service type (boarding, walking, etc.)',
            },
            {
              name: 'rating',
              in: 'query',
              required: false,
              schema: { type: 'number', minimum: 1, maximum: 5 },
              description: 'Minimum rating',
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
              description: 'Items per page',
            },
          ],
          responses: {
            '200': {
              description: 'List of sitters',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      items: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Sitter',
                        },
                      },
                      total: { type: 'integer' },
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      pages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      
      '/sitters/{id}': {
        get: {
          tags: ['Sitters'],
          summary: 'Get sitter by ID',
          description: 'Retrieve sitter profile details',
          operationId: 'getSitterById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Sitter ID',
            },
          ],
          responses: {
            '200': {
              description: 'Sitter details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Sitter',
                  },
                },
              },
            },
            '404': {
              description: 'Sitter not found',
            },
          },
        },
      },
      
      // Bookings
      '/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'Get user bookings',
          description: 'Retrieve bookings for authenticated user',
          operationId: 'getUserBookings',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'status',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
                enum: ['pending', 'confirmed', 'cancelled', 'completed'],
              },
              description: 'Filter by booking status',
            },
          ],
          responses: {
            '200': {
              description: 'List of bookings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Booking',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
        post: {
          tags: ['Bookings'],
          summary: 'Create booking',
          description: 'Create a new booking with a sitter',
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
            '409': {
              description: 'Booking conflict',
            },
          },
        },
      },
      
      // Add more paths as needed...
    };
  }
  
  /**
   * Generate security schemes
   */
  private static generateSecuritySchemes(): Record<string, unknown> {
    return {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication',
      },
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'x-csrf-token',
        description: 'CSRF token for state-changing operations',
      },
    };
  }

  /**
   * Generate API schemas
   */
  private static generateSchemas(): Record<string, OpenApiSchema> {
    return {
      // Authentication schemas
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            minLength: 8,
          },
        },
      },
      
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            minLength: 8,
          },
          name: {
            type: 'string',
            description: 'User full name',
            minLength: 2,
          },
          phone: {
            type: 'string',
            description: 'User phone number',
          },
        },
      },
      
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          token: {
            type: 'string',
            description: 'JWT access token',
          },
          refreshToken: {
            type: 'string',
            description: 'Refresh token',
          },
          expiresIn: {
            type: 'integer',
            description: 'Token expiration in seconds',
          },
        },
      },
      
      // User schema
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          role: {
            type: 'string',
            enum: ['user', 'sitter', 'admin'],
            description: 'User role',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
      
      // Pet schemas
      CreatePetRequest: {
        type: 'object',
        required: ['name', 'type', 'breed'],
        properties: {
          name: {
            type: 'string',
            description: 'Pet name',
            minLength: 2,
          },
          type: {
            type: 'string',
            enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
            description: 'Pet type',
          },
          breed: {
            type: 'string',
            description: 'Pet breed',
          },
          age: {
            type: 'integer',
            minimum: 0,
            description: 'Pet age in years',
          },
          weight: {
            type: 'number',
            minimum: 0,
            description: 'Pet weight in kg',
          },
          specialNeeds: {
            type: 'string',
            description: 'Special care instructions',
          },
        },
      },
      
      UpdatePetRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Pet name',
            minLength: 2,
          },
          breed: {
            type: 'string',
            description: 'Pet breed',
          },
          age: {
            type: 'integer',
            minimum: 0,
            description: 'Pet age in years',
          },
          weight: {
            type: 'number',
            minimum: 0,
            description: 'Pet weight in kg',
          },
          specialNeeds: {
            type: 'string',
            description: 'Special care instructions',
          },
        },
      },
      
      Pet: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Pet ID',
          },
          name: {
            type: 'string',
            description: 'Pet name',
          },
        },
      },
    };
  }
}
