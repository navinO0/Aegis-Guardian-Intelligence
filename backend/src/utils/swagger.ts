import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aegis AI API Documentation',
      version: '1.0.0',
      description: 'Centralized high-precision document advisory and analysis platform API',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local Development Server',
      },
    ],
  },
  // Only look at the centralized documentation file
  apis: ['./src/docs/openapi.doc.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
