import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const router = express.Router();
const port = process.env.PORT || 3000;

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
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Customers',
                description: 'All APIs related to customers',
            },
            {
                name: 'Products',
                description: 'All APIs related to products',
            },
        ]
    },
    apis: ['./src/swagger/*.yaml'],
};

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
