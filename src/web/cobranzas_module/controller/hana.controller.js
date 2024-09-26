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

const cobranzaGeneral = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_PRD.IFA_LAPP_DASH_COBROS_Y_PPTO`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaGeneral:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaGeneral');
    }
}

const cobranzaPorSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUC"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaPorSucursal');
    }
}

const cobranzaNormales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUCXCLIXNORMALES"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaNormales:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaNormales');
    }
}

const cobranzaCadenas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUCXCLIXCADENAS"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaCadenas:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaCadenas');
    }
}

const cobranzaIfavet = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUCXCLIXIFAVET"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaIfavet:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaIfavet');
    }
}

const cobranzaPorSucursalMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUC_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaPorSucursal');
    }
}

const cobranzaNormalesMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUCXCLIXNORMALES_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaNormales:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaNormales');
    }
}

const cobranzaCadenasMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUCXCLIXCADENAS_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaCadenas:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaCadenas');
    }
}

const cobranzaIfavetMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_COB_PPTOXSUCXCLIXIFAVET_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaIfavet:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaIfavet');
    }
}

module.exports = {
    cobranzaGeneral,
    cobranzaPorSucursal,
    cobranzaNormales,
    cobranzaCadenas,
    cobranzaIfavet,
    cobranzaPorSucursalMesAnterior,
    cobranzaNormalesMesAnterior,
    cobranzaCadenasMesAnterior,
    cobranzaIfavetMesAnterior,
}
