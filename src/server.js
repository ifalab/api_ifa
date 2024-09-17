const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const port = 97;



require('dotenv').config();

//cors
app.use(cors())
// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/v1', require('./routes/v1Routes'));
app.use('/v1/web/auth', require('./web/auth_module/routers/auth.router'));
app.use('/v1/web/venta', require('./web/ventas_module/routes/venta.router'));
app.use('/v1/web/cobranza', require('./web/cobranzas_module/routes/cobranza.router'));

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
