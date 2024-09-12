const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
const port = 97;

require('dotenv').config();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/v1', require('./routes/v1Routes'));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
