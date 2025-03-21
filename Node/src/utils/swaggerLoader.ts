import yaml from 'js-yaml';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import swaggerJsDoc from 'swagger-jsdoc';

export function loadSwaggerFiles() {
    // Base swagger document
    const baseSwagger: swaggerJsDoc.OAS3Options = {
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
                    : `http://localhost:${process.env.PORT || 3000}/api/v1`,
                description: 'Development server',
            },
        ],
        tags: [
            { name: 'Customers', description: 'All APIs related to customers' },
            { name: 'Products', description: 'All APIs related to products' },
        ],
        paths: {}
    };

    // Find all YAML files synchronously
    const yamlFiles = glob.sync(path.join(process.cwd(), 'src/swagger/**/*.yaml'));

    // Load and merge each YAML file
    yamlFiles.forEach(file => {
        try {
            const fileContent = fs.readFileSync(file, 'utf8');
            const swaggerPart: swaggerJsDoc.OAS3Options = yaml.load(fileContent);

            // Merge paths
            if (swaggerPart.paths) {
                baseSwagger.paths = {
                    ...baseSwagger.paths,
                    ...swaggerPart.paths
                };
            }

            // Merge components if they exist
            if (swaggerPart.components) {
                if (!baseSwagger.components) baseSwagger.components = {};

                // Merge schemas
                if (swaggerPart.components.schemas) {
                    if (!baseSwagger.components.schemas) baseSwagger.components.schemas = {};
                    baseSwagger.components.schemas = {
                        ...baseSwagger.components.schemas,
                        ...swaggerPart.components.schemas
                    };
                }

                // Add other components parts as needed (parameters, responses, etc.)
            }

        } catch (error) {
            console.error(`Error loading YAML file ${file}:`, error);
        }
    });

    return baseSwagger;
}