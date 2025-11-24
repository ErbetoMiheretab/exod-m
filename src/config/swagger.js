// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Exod-M API Documentation',
      version: '1.0.0',
      description: 'Documentation for Exod-M API',
      contact: {
        name: 'API Support',
        url: 'https://your-support-url.com',
        email: 'support@example.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    servers: [
      {
        url: `http://localhost:${env.PORT || 3000}/api/v1`,
        description: 'Development server'
      },
      {
        url: 'https://api.yourdomain.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer &lt;token>'
        }
      },
      schemas: {
        // Common schemas can be defined here
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'integer' },
            errors: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/modules/**/routes/*.js',
    './src/modules/**/dto/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;