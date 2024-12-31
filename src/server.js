const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { swaggerUi, swaggerDocs } = require('./swagger');
const app = express();
const httpsPort = 97; // Puerto HTTPS estándar
const httpPort = 96;  // Puerto HTTP estándar
require('dotenv').config();


// Configuración SSL
const sslOptions = {
  key: fs.readFileSync('C:/Users/Administrador/Documents/ssl/wildcard_laboratoriosifa.com.key'),
  cert: fs.readFileSync('C:/Users/Administrador/Documents/ssl/wildcard_laboratoriosifa.com.cert'),
};

// Middleware
app.use(cors({
  // origin: ['https://sapbo.laboratoriosifa.com:98', 'https://sapbo.laboratoriosifa.com'], // Agrega todos los orígenes permitidos
  origin:'*'
}));
app.use(morgan('dev'));
app.use(express.json());

// Rutas
//TODO VERSION WEB --------------------------------------------------------------------------------------
app.use('/v1', require('./routes/v1Routes'));
app.use('/v1/web/auth', require('./web/auth_module/routers/auth.router'));
app.use('/v1/web/venta', require('./web/ventas_module/routes/venta.router'));
app.use('/v1/web/cobranza', require('./web/cobranzas_module/routes/cobranza.router'));
app.use('/v1/web/finanza', require('./web/finanzas/routes/finanzas.router'));
app.use('/v1/web/visitas-medicas', require('./web/visitas-medicas/routes/visitasMedicas.routes'));
app.use('/v1/web/inventario', require('./web/inventarios/routers/inventarios.routes'));
app.use('/v1/web/contabilidad', require('./web/contabilidad_module/routers/contabilidad.routes'));
app.use('/v1/web/centro-costo', require('./web/centro_costos_module/routes/cc.routes'));
app.use('/v1/web/rendiciones', require('./web/rendiciones_module/routes/rendiciones.routes'));
app.use('/v1/web/facturacion', require('./web/facturacion_module/router/facturacion.routes'));
app.use('/v1/web/pedido', require('./web/pedido_module/routes/pedido.routes'));
app.use('/v1/web/shared', require('./web/shared/routes/shared.routes'));

//TODO VERSION MOVIL --------------------------------------------------------------------------------------
app.use('/v1/movil/ventas',require('./movil/ventas_module/routes/ventas.routes'))

//TODO --------------------------------------------------------------------------------------
// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
//TODO VERSION MOVIL V2 -----------------------------------------------------------------------------------
app.use('/v1/movil-v2/sync', require('./movil-v2/sincronizacion/routes/sync.routes'));
app.use('/v1/movil-v2/pedidos', require('./movil-v2/pedidos/routes/pedidos.routes'));
//!------------------------------------------------------------------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Crear servidor HTTPS
https.createServer(sslOptions, app).listen(httpsPort, () => {
  console.log(`Servidor HTTPS corriendo en https://sapbo.laboratoriosifa.com:${httpsPort}`);
});

// Crear servidor HTTP que redirige a HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://sapbo.laboratoriosifa.com${req.url}` });
  res.end();
}).listen(httpPort, () => {
  console.log(`Servidor HTTP escuchando en http://localhost:${httpPort}`);
});
