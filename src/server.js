const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const path = require('path');
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const port = 97;



require('dotenv').config();

//cors
app.use(cors({
  origin: '*',
  exposedHeaders: ['Content-Disposition'],
}))
// Middleware
app.use(morgan('dev'));
// app.use(express.json());
// Aumenta el límite de carga útil a 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
//TODO VERSION WEB --------------------------------------------------------------------------------------
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/v1', require('./routes/v1Routes'));
app.use('/v1/web/auth', require('./web/auth_module/routers/auth.router'));
app.use('/v1/web/dashboard', require('./web/dashboard_moudle/routes/dashboard.route'));
app.use('/v1/web/venta', require('./web/ventas_module/routes/venta.routes'));
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
app.use('/v1/web/datos-maestros', require('./web/datos_maestros_module/routers/datos_maestros.routes'));
app.use('/v1/web/excel', require('./web/excel_reader/routes/excel.routes'));
app.use('/v1/web/planificacion', require('./web/planificacion_module/routes/planificacion.routes'));
app.use('/v1/web/produccion', require('./web/produccion_module/routes/produccion.routes'));
app.use('/v1/web/personas', require('./web/personas_module/routes/personas.route'));

//TODO DIGILITZACION --------------------------------------------------------------------------------------
app.use('/v1/web/contabilidad/digitalizacion', require('./web/digitalizacion_module/routes/digitalizacion.routes'));

//TODO BANCO QR --------------------------------------------------------------------------------------
app.use('/v1/web/pago-qr-bg', require('./web/pagos_qr_bg_module/routes/pago-qr.bg.routes'));
app.use('/v1/web/pago-qr-bg/prod/notification', require('./web/pagos_qr_bg_module/routes/pago-qr.bg-prod.routes'));
app.use('/v1/web/pago-qr-bg/test', require('./web/pagos_qr_bg_module/routes/banco-qr-test.routes'));
app.use('/v1/web/pago-qr-bg/prod', require('./web/pagos_qr_bg_module/routes/banco-qr-prod.routes'));

//TODO VERSION MOVIL --------------------------------------------------------------------------------------
app.use('/v1/movil/ventas', require('./movil/ventas_module/routes/ventas.routes'))

//TODO VERSION MOVIL V2 -----------------------------------------------------------------------------------
app.use('/v1/movil-v2/sync', require('./movil-v2/sincronizacion/routes/sync.routes'));
app.use('/v1/movil-v2/pedidos', require('./movil-v2/pedidos/routes/pedidos.routes'));
//!------------------------------------------------------------------------------------------
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
//
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
});