import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import path from 'path';

const router = express.Router();
const port = process.env.PORT || 3000;

// Fix path resolution for nested projects
const projectRoot = process.env.VERCEL
  ? '/var/task/Node' // Use the correct path in Vercel
  : process.cwd();   // Use working directory in local dev

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
          ? 'https://elevate-fcai-cu.vercel.app/api/v1'
          : `http://localhost:${port}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    tags: [
      { name: 'Customers', description: 'All APIs related to customers' },
      { name: 'Products', description: 'All APIs related to products' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token',
        },
      },
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  // Use path.join for better cross-platform compatibility
  apis: [path.join(projectRoot, 'src', 'swagger', '*.yaml')],
};

const yamlPath = path.join(projectRoot, 'src', 'swagger', '*.yaml');
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
