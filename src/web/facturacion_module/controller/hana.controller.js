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
                reject(new Error('error en la consulta'))
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
        // const query = `CALL LAB_IFA_DEV.IFA_VM_SELECTION_BATCH_FEFO('${articulo}','${almacen}',${lote})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en lotesArticuloAlmacenCantidad:', error.message);
        return { message: 'Error al procesar la solicitud: lotesArticuloAlmacenCantidad' }
    }
}

const obtenerEntregaDetalle = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE(${id})`;
        // const query = `CALL LAB_IFA_DEV.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE(${id})`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregaDetalle:', error.message);
        return { message: 'Error al procesar la solicitud: obtenerEntregaDetalle' }
    }
}

const solicitarId = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_SOLICITUD_ID(${id})`;
        // const query = `CALL LAB_IFA_DEV.IFA_SOLICITUD_ID(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en solicitarId:', error.message);
        return { message: 'Error al procesar la solicitud: solicitarId' }
    }
}

const notaEntrega = async (delivery) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_VEN_ENTREGA_LAYOUT(${delivery})`;
        // const query = `CALL LAB_IFA_DEV.IFA_VEN_ENTREGA_LAYOUT(${delivery})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en notaEntrega:', error.message);
        return { message: 'Error al procesar la solicitud: notaEntrega' }
    }
}

const obtenerEntregasPorFactura = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_entregas_por_factura(${id})`;
        // const query = `CALL lab_ifa_dev.ifa_lapp_ven_obtener_entregas_por_factura(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregasPorFactura:', error.message);
        return { message: 'Error al procesar la solicitud: obtenerEntregasPorFactura' }
    }
}

const facturasParaAnular = async (sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `CALL lab_ifa_dev.ifa_lapp_ven_obtener_factura('${sucursal}')`;
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
        // const query = `SELECT * FROM LAB_IFA_DEV.IFA_INFO_FACTURACION`;
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
        // const query = `CALL LAB_IFA_DEV.ifa_lapp_ven_obtener_pedidos(${whsCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en notaEntrega:', error.message);
        return { message: 'Error al procesar la solicitud: facturaInfo' }
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
    facturaPedidoDB
}