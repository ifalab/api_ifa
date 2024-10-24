const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const port = 97;



require('dotenv').config();

//cors
app.use(cors({
  origin:'*'
}))
// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/v1', require('./routes/v1Routes'));
app.use('/v1/web/auth', require('./web/auth_module/routers/auth.router'));
app.use('/v1/web/venta', require('./web/ventas_module/routes/venta.router'));
app.use('/v1/web/cobranza', require('./web/cobranzas_module/routes/cobranza.router'));
app.use('/v1/web/finanza', require('./web/finanzas/routes/finanzas.router'));
app.use('/v1/web/visitas-medicas', require('./web/visitas-medicas/routes/visitasMedicas.routes'));
app.use('/v1/web/inventario', require('./web/inventarios/routers/inventarios.routes'));
app.use('/v1/web/contabilidad', require('./web/contabilidad_module/routers/contabilidad.routes'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
