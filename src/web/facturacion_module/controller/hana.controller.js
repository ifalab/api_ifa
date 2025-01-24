const hana = require('@sap/hana-client');

// Configura la conexión a la base de datos HANA
const connOptions = {
    serverNode: `${process.env.HANASERVER}:${process.env.HANAPORT}`,
    uid: process.env.HANAUSER,
    pwd: process.env.HANAPASS
};

// Variable para almacenar la conexión a la base de datos
let connection = null;

// Función para conectar a la base de datos HANA
const connectHANA = () => {
    return new Promise((resolve, reject) => {
        connection = hana.createConnection();
        connection.connect(connOptions, (err) => {
            if (err) {
                console.error('Error de conexión a HANA:', err.message);
                reject(err);
            } else {
                console.log('Conectado a la base de datos HANA');
                resolve(connection);
            }
        });
    });
};


const executeQuery = async (query) => {
    return new Promise((resolve, reject) => {
        connection.exec(query, (err, result) => {
            if (err) {
                console.log('error en la consulta:', err.message)
                reject(new Error(`error en la consulta ${err.message || ''}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);

            }
        })
    })
}

const lotesArticuloAlmacenCantidad = async (articulo, almacen, lote) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_VM_SELECTION_BATCH_FEFO('${articulo}','${almacen}',${lote})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en lotesArticuloAlmacenCantidad:', error.message);
        return { message: `Error en lotesArticuloAlmacenCantidad: ${error.message || ''}` }
    }
}

const obtenerEntregaDetalle = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE(${id})`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregaDetalle:', error.message || '');
        return { message: `Error en obtenerEntregaDetalle: ${error.message || ''}` }
    }
}

const solicitarId = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_SOLICITUD_ID(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return { result, query }

    } catch (error) {
        console.error('Error en solicitarId:', error.message);
        return { message: `Error en solicitarId: ${error.message}` }
    }
}

const notaEntrega = async (delivery) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_ENTREGA_LAYOUT(${delivery})`;
        console.log({ query })
        const result = await executeQuery(query)
        return { result, query }

    } catch (error) {
        console.error('Error en notaEntrega:', error.message);
        throw new Error(`Error al procesar notaEntrega: ${error.message || ''}`)
    }
}

const obtenerEntregasPorFactura = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_entregas_por_factura(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregasPorFactura:', error.message || '');
        return { message: `${error.message || 'Error al procesar la solicitud: obtenerEntregasPorFactura'}` }
    }
}

const facturasParaAnular = async (sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_factura(${sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturasParaAnular:', error.message);
        return { message: 'Error al procesar la solicitud: facturasParaAnular' }
    }
}

const facturaInfo = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_INFO_FACTURACION`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en notaEntrega:', error.message);
        return { message: 'Error al procesar la solicitud: facturaInfo' }
    }
}

const facturaPedidoDB = async (whsCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos(${whsCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturaInfo:', error.message);
        return { message: 'Error al procesar la solicitud: facturaPedidoDB' }
    }
}

const pedidosFacturados = async (SucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_facturados(${SucCode})`;
        // const query = `CALL lab_ifa_prd.ifa_lapp_ven_obtener_pedidos_facturados(${SucCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en pedidosFacturados:', error.message);
        return { message: 'Error al procesar la solicitud: pedidosFacturados' }
    }
}

const obtenerEntregas = async (id_sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_entregas(${id_sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregas:', error.message);
        return { message: 'Error al procesar la solicitud: obtenerEntregas' }
    }
}

const facturasPedidoCadenas = async (id_sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_cadenas(${id_sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en facturasPedidoCadenas:', error.message);
        return { message: 'Error al procesar la solicitud: facturasPedidoCadenas' }
    }
}

const facturasAnuladas = async (SucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        //Cambiar query
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_facturados(${SucCode})`;
        // const query = `SELECT * FROM ${process.env.PRD}.IFA_INFO_FACTURACION`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturasAnuladas:', error.message);
        return { message: `Error al procesar la solicitud: facturasAnuladas. ${error.message || ''}` }
    }
}

const pedidosPorEntrega = async (DeliveryNum) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_entregas(${DeliveryNum})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturasAnuladas:', error.message);
        return { message: `Error al procesar la solicitud: pedidosPorEntrega. ${error.message || ''}` }
    }
}

module.exports = {
    lotesArticuloAlmacenCantidad,
    obtenerEntregaDetalle,
    solicitarId,
    notaEntrega,
    obtenerEntregasPorFactura,
    facturasParaAnular,
    facturaInfo,
    facturaPedidoDB,
    pedidosFacturados,
    obtenerEntregas,
    facturasPedidoCadenas,
    facturasAnuladas,
    pedidosPorEntrega
}