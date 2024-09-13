const express = require('express');
const morgan = require('morgan');
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const port = 97;



require('dotenv').config();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/v1', require('./routes/v1Routes'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
