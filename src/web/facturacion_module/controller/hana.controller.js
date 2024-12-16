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

        const query = `CALL LAB_IFA_DEV.IFA_VM_SELECTION_BATCH_FEFO('${articulo}','${almacen}',${lote})`;
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

        const query = `CALL LAB_IFA_DEV.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE(${id})`;
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

        const query = `CALL LAB_IFA_PRD.IFA_SOLICITUD_ID(${id})`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en solicitarId:', error.message);
        return { message: 'Error al procesar la solicitud: solicitarId' }
    }
}

module.exports = {
    lotesArticuloAlmacenCantidad,
    obtenerEntregaDetalle,
    solicitarId
}