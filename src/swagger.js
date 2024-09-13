const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc  = require('swagger-jsdoc');
// Definir opciones para Swagger
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0', // Para utilizar OpenAPI 3.0
      info: {
        title: 'Documentación de API IFA',
        version: '1.0.0',
        description: 'Documentación de la API de IFA',
        contact: {
          name: 'Example: Gino Baptista ',
          email: 'Example: ginobaptista@gmail.com',
        },
        servers: [
          {
            url: 'Example: http://localhost:97', // Servidor local
          },
        ],
      },
    },
    // Aquí especificas el archivo de rutas donde estarán los comentarios Swagger
    apis: ['./src/routes/v1Routes.js'], // Asegúrate de que esta ruta coincida con tu estructura
  };

  // Inicializa swagger-jsdoc
const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };