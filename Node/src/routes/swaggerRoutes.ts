import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

const router = express.Router();
const port = process.env.PORT || 3000;
const url = `http://localhost:${port}/api/v1`;

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
                url: url,
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

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

export default router;
