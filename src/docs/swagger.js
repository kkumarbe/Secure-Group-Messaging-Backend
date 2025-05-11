const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Group Messaging API',
      version: '1.0.0',
      description: 'API documentation for Secure Group Messaging system',
    },
    components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
  },
//   apis: ['./src/routes/*.js'], // Route-level Swagger annotations
apis: ['./src/controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
