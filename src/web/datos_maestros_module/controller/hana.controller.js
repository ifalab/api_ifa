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

const dmClientes = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        console.error('Error en dmClientes:', error.message);
        return {
            status:400,
            message: `Error en dmClientes: ${error.message || ''}`
        }
    }
}


const dmClientesPorCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes WHERE "CardCode"= '${cardCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        console.error('Error en dmClientesPorCardCode:', error.message);
        return {
            status:400,
            message: `Error en dmClientesPorCardCode: ${error.message || ''}`
        }
    }
}

const dmTiposDocumentos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes_tipo_documentos`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        console.error('Error en dmTiposDocumentos:', error.message);
        return {
            status:400,
            message: `Error en dmTiposDocumentos: ${error.message || ''}`
        }
    }
}

module.exports = {
    dmClientes,
    dmClientesPorCardCode,
    dmTiposDocumentos,
}