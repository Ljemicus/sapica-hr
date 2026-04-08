/**
 * OpenAPI/Swagger documentation generator for PetPark API
 */

import type { OpenApiSecurityScheme } from './openapi-generator-security';
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
  responses?: OpenApiResponses;
  security?: Array<Record<string, string[]>>;
}

export interface OpenApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchema;
}

export interface OpenApiRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, OpenApiMediaType>;
}

export interface OpenApiMediaType {
  schema?: OpenApiSchema;
  example?: unknown;
}

export interface OpenApiSchema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, OpenApiSchemaProperty>;
  required?: string[];
  items?: OpenApiSchema;
  enum?: (string | number)[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: unknown;
  nullable?: boolean;
  oneOf?: OpenApiSchema[];
  anyOf?: OpenApiSchema[];
  allOf?: OpenApiSchema[];
  $ref?: string;
}

export interface OpenApiSchemaProperty {
  type?: string;
  format?: string;
  description?: string;
  example?: unknown;
  items?: OpenApiSchema;
  $ref?: string;
  enum?: (string | number)[];
}

export interface OpenApiResponse {
  description: string;
  content?: Record<string, OpenApiMediaType>;
}

export interface OpenApiResponses {
  [code: string]: OpenApiResponse;
}

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<string, OpenApiPath>;
  components?: {
    schemas?: Record<string, OpenApiSchema>;
    securitySchemes?: Record<string, OpenApiSecurityScheme>;
  };
  security?: Array<Record<string, string[]>>;
}

/**
 * Generate OpenAPI specification from API routes
 */
export class OpenApiGenerator {
  private spec: OpenApiSpec;

  constructor() {
    this.spec = {
      openapi: '3.0.3',
      info: {
        title: 'PetPark API',
        version: '1.0.0',
        description: 'API documentation for PetPark platform',
      },
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  /**
   * Add a path to the OpenAPI spec
   */
  addPath(path: string, methods: OpenApiPath): void {
    this.spec.paths[path] = methods;
  }

  /**
   * Add a component schema
   */
  addSchema(name: string, schema: OpenApiSchema): void {
    if (!this.spec.components) {
      this.spec.components = {};
    }
    if (!this.spec.components.schemas) {
      this.spec.components.schemas = {};
    }
    this.spec.components.schemas[name] = schema;
  }

  /**
   * Generate the complete OpenAPI specification
   */
  generate(): OpenApiSpec {
    return this.spec;
  }

  /**
   * Export as JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.spec, null, 2);
  }
}

export const openApiGenerator = new OpenApiGenerator();
