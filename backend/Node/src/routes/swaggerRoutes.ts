import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import path from 'path';
import { PORT, PROJECT_ROOT } from '../config/common.js';

const router = express.Router();

const swaggerOptions: swaggerJsDoc.OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ELEVATE',
      version: '1.0.0',
      description: 'ELEVATE APIs for both clients and admins',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? `${process.env.API_BASE_URL}/api/v1`
          : `http://localhost:${PORT}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    tags: [
      { name: 'Authentication' },
      { name: 'Utilities', description: 'Utility APIs for common tasks' },
      { name: 'Try On', description: 'APIs for virtual try-on functionality' },
      { name: 'Customers', description: 'All APIs related to customers' },
      { name: 'Wishlist' },
      { name: 'Cart' },
      { name: 'Orders' },
      { name: 'Products', description: 'All APIs related to public product access' },
      { name: 'Reviews' },
      { name: 'Brands' },
      { name: 'Brand Owners' },
      { name: 'Brand Owners Products' },
      { name: 'Brand Owners Orders' },
      { name: 'Brand Owners Dashboard' },
      { name: "Brand Managers" },
      { name: 'CRON Jobs', description: 'Cron jobs for scheduled tasks' },
      { name: 'Admin', description: "APIs for admin access and management" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer (For real requests, use the token from the login response)',
        },
        userRole: {
          type: 'apiKey',
          in: 'query',
          name: 'userRole',
          description: `Custom user role to be used in the request (For endpoints that require a user role to be performed)
                        (Admin use only - Must provide the admin access token as well)`,
        },
        userId: {
          type: 'apiKey',
          in: 'query',
          name: 'userId',
          description: `The ID of the user to be used in the request (For endpoints that require a user ID to be performed)
                        (Admin use only - Must provide the admin access token as well)`,
        },
        adminAccessHeaderToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Test-Auth',
          description: 'The token to be used for admin access',
        }
      },
    },
    security: [
      { bearerAuth: [], userRole: [], userId: [], adminAccessHeaderToken: [] }
    ],
  },
  // Use path.join for better cross-platform compatibility
  apis: [path.join(PROJECT_ROOT, 'src', 'swagger', '*.yaml')],
};

const yamlPath = path.join(PROJECT_ROOT, 'src', 'swagger', '*.yaml');
console.log("Looking for YAML files at:", yamlPath);

const swaggerDocs = swaggerJsDoc(swaggerOptions);

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui.css',
  customJs: [
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui-bundle.js',
    'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js'
  ]
}));

export default router;
