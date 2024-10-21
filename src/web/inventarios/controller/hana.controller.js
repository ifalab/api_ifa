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
                // console.log({result})
            }
        })
    })
}

const clientesPorDimensionUno = async (dimension) => {
    try {
        if(!connection){
            await connectHANA()
        }
        const query = `CALL "LAB_IFA_PRD".IFA_PRD_CLIENTE_X_DIM_UNO('${dimension}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en clientesPorDimensionUno ')
    }

}

const almacenesPorDimensionUno = async (dimension) => {
    try {
        if(!connection){
            await connectHANA()
        }
        const query = `CALL "LAB_IFA_PRD".IFA_PRD_ALMACEN_X_DIMENSION_UNO('${dimension}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en almacenesPorDimensionUno ')
    }

}

const inventarioHabilitacion = async (docentry) => {
    try {
        if(!connection){
            await connectHANA()
        }
        const query = `CALL "LAB_IFA_PRD".IFA_LAPP_INV_HABILITACION('${docentry}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en almacenesPorDimensionUno ')
    }

}

module.exports = {
    clientesPorDimensionUno,
    almacenesPorDimensionUno,
    inventarioHabilitacion,
}