const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');

const routesDir = path.join(__dirname, '..', 'routes');

const routeFiles = fs
  .readdirSync(routesDir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => path.join(routesDir, f));

console.log('📄 Route files loaded:', routeFiles);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce Backend API (Raw MySQL)',
      version: '1.0.0',
      description: 'Intermediate-level backend',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://shadowfox-leveltwo.onrender.com'
            : `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: routeFiles,
};

const spec = swaggerJsdoc(options);
console.log('📖 paths found:', Object.keys(spec.paths || {}));

module.exports = spec;