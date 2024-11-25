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
        console.log(query)
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

const tipoDeCambion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('tipoDeCambion EXECUTE')
        const query = `CALL "LAB_IFA_PRD".IFA_CON_MONEDAS_TIPOS();`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en tipoDeCambion')
    }
}

const findAllAperturaCaja = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findAllAperturaCaja EXECUTE')
        const query = `SELECT * FROM "LAB_IFA_DEV".ifa_rw_estado_cajas`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllAperturaCaja')
    }
}

const findCajasEmpleado = async (codEmp)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findCajasEmpleado EXECUTE')
        const query = `CALL LAB_IFA_DEV.IFA_CAJAS_X_EMPLEADO('${codEmp}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findCajasEmpleado ')
    }
}

const rendicionDetallada = async (id)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rendicionDetallada EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_RENDICION_DETALLADA_BY_ID(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rendicionDetallada ')
    }
}

const rendicionByTransac = async (codTransac)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rendicionDetallada EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_LISTA_REND_BY_TRANSID(${codTransac})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rendicionDetallada ')
    }
}

module.exports = {
    findAllAperturaCaja,
    findCajasEmpleado,
    rendicionDetallada,
    rendicionByTransac,
}