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

const ventaPorSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUC"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: ventaPorSucursal');
    }
}

const ventasNormales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXNORMALES"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasNormales:', error.message);
        throw new Error('Error al procesar la solicitud: ventasNormales');
    }
}

const ventasCadena = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXCADENAS"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasCadena:', error.message);
        throw new Error('Error al procesar la solicitud: ventasCadena');
    }
}

const ventasInstitucion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXINSTITUCIONES"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasInstitucion:', error.message);
        throw new Error('Error al procesar la solicitud: ventasInstitucion');
    }
}

const ventasIfaVet = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXIFAVET"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasIfaVet:', error.message);
        throw new Error('Error al procesar la solicitud: ventasIfaVet');
    }
}

const ventasMasivo = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXMASIVOS"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasMasivo:', error.message);
        throw new Error('Error al procesar la solicitud: ventasMasivo');
    }
}

const ventasUsuario = async (userCode, dim1, dim2, dim3, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `call "LAB_IFA_PRD".IFA_LAPP_VEN_DETALLADAS_X_AUTH('${userCode}','${dim1}','${dim2}','${dim3}',${groupBy})`

        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasUsuario:', error.message);
        throw new Error('Error al procesar la solicitud: ventasUsuario');
    }
}


const ventaPorSucursalMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUC_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: ventaPorSucursal');
    }
}

const ventasNormalesMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXNORMALES_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasNormales:', error.message);
        throw new Error('Error al procesar la solicitud: ventasNormales');
    }
}

const ventasCadenaMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXCADENAS_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasCadena:', error.message);
        throw new Error('Error al procesar la solicitud: ventasCadena');
    }
}

const ventasInstitucionMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXINSTITUCIONES_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasInstitucion:', error.message);
        throw new Error('Error al procesar la solicitud: ventasInstitucion');
    }
}

const ventasIfaVetMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXIFAVET_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasIfaVet:', error.message);
        throw new Error('Error al procesar la solicitud: ventasIfaVet');
    }
}

const ventasMasivoMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from "LAB_IFA_PRD"."IFA_LAPP_VEN_PPTOXSUCXCLIXMASIVOS_ANT"`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasMasivo:', error.message);
        throw new Error('Error al procesar la solicitud: ventasMasivo');
    }
}

const ventasPorSucursal = async (userCode, dim1, dim2, dim3, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `call "LAB_IFA_PRD".IFA_LAPP_VEN_DETALLADAS_X_ZONA_X_AUTH('${userCode}','${dim1}','${dim2}','${dim3}',${groupBy})`

        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasUsuario:', error.message);
        throw new Error('Error al procesar la solicitud: ventasUsuario');
    }
}

module.exports = {
    ventaPorSucursal,
    ventasNormales,
    ventasCadena,
    ventasInstitucion,
    ventasUsuario,
    ventasIfaVet,
    ventasMasivo,
    ventaPorSucursalMesAnterior,
    ventasNormalesMesAnterior,
    ventasCadenaMesAnterior,
    ventasInstitucionMesAnterior,
    ventasIfaVetMesAnterior,
    ventasMasivoMesAnterior,
    ventasPorSucursal   
}
