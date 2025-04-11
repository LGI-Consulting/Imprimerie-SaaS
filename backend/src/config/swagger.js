const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LOTUS Print Shop Backend',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: 'http://localhost:5000', // replace with your server URL
      },
    ],
  },
  apis: ['../routes/*.js'], // Path to your route files
};

const specs = swaggerJsdoc(options);

export default {
  swaggerUi,
  specs,
};
