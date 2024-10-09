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
    console.log(query)
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

const medicosPorRegion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_DM_MEDICOS"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en medicosPorRegion:', error.message);
        throw new Error('Error al procesar la solicitud: medicosPorRegion');
    }
}

const todasLasRegiones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_DM_REGIONES"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en todasLasRegiones:', error.message);
        throw new Error('Error al procesar la solicitud: todasLasRegiones');
    }
}


module.exports = {
    medicosPorRegion,
    todasLasRegiones,
}
