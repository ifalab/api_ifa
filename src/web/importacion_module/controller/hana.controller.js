const hana = require('@sap/hana-client');
const { formattParam } = require('../../../helpers/formattParams.helpers');
const { grabarLog } = require("../../shared/controller/hana.controller");

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

//
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


const obtenerimportacionStatus = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFASP_IMP_GET_PURCHASE_ORDERS()`;
        const result = await executeQuery(query)
        console.log({ query })
        return result

    } catch (error) {
        console.error('Error en impotationStatus:', error.message || '');
        throw new Error(`Error en impotationStatus: ${error.message}`)
    }
}



module.exports = {
    obtenerimportacionStatus
}