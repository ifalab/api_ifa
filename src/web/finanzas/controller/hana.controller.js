const hana = require('@sap/hana-client');
const { executeQueryWithConnection, executeQueryParamsWithConnection } = require('../../utils/hana-util-connection');

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

const parteDiario = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from lab_ifa_prd.ifa_fin_parte_diario`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en finanzas/ parteDiario:', error.message);
        return { message: 'Error al procesar la solicitud: finanzas/parteDiario user' }
    }
}

const abastecimiento = async (fecha) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_PRD".IFA_LAPP_ABAS_COMPRASCOMERCIALES(${fecha})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimiento')
        console.log(error)
    }
}

const abastecimientoMesAnterior = async (fecha) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_PRD".IFA_LAPP_ABAS_COMPRASCOMERCIALES__MES_ANT()`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoMesAnterior')
        console.log(error)
    }
}

const abastecimientoMesActual = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from LAB_IFA_PRD.IFA_LAPP_ABAST_COMPRASCOMERCIALES`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoMesActual')
        console.log(error)
    }
}

const abastecimientoPorFecha = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_ABAS_COMPRASCOMERCIALES_SEMESTRAL()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorFecha')
        console.log(error)
    }
}

const abastecimientoPorFechaAnual = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_ABAS_COMPRASCOMERCIALES_ANUAL()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorFechaAnual: ', error)
        return {
            error: 'no se pudo traer los datos'
        }

    }
}

const abastecimientoPorFecha_24_meses = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_ABAS_COMPRASCOMERCIALES_24MESES()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en abastecimientoPorFecha_24_meses: ', error)
        return {
            error: 'no se pudo traer los datos'
        }
    }
}

const findAllRegions = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllRegions execute')
        const query = `select * from LAB_IFA_PRD.ifa_dm_regiones`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllRegions')
    }
}

const findAllLines = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllLines execute')
        const query = `select * from LAB_IFA_PRD.IFA_DM_LINEAS`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllLines')
    }
}

const findAllSubLines = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllSubLines execute')
        const query = `select * from LAB_IFA_PRD.IFA_DM_SUBLINEAS`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllSubLines')
    }
}

const findAllGroupAlmacenes = async () => {
    try {

        if (!connection) {
            await connectHANA();
        }

        console.log('findAllGroupAlmacenes execute')
        const query = `select * from lab_ifa_prd.ifa_dm_almacenes_grupo`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllGroupAlmacenes')
    }
}

const reporteArticuloPendientes = async (startDate,endDate) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_inv_analisis_de_pendientes_por_fecha('${startDate}','${endDate}')`
        console.log({query})
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log('error en reporteArticuloPendientes')
        console.log(error)
    }
}

const reporteMargenComercial = async (year, month) => {
  try {
    const query = `CALL "LAB_IFA_DATA"."IFASP_SAL_CALCULATE_COMERCIAL_SALES_MARGINS"(?, ?, ?);`;

    // Ejecutamos la query con los parámetros year, month y una tabla de salida (generalmente nula para que la client tool la reciba)
    const result = await executeQueryParamsWithConnection(query, [year, month]);

    return result; // Este result puede ser un arreglo con los datos retornados por la tabla de resultados
  } catch (error) {
    console.error('Error en reporteMargenComercial:', error);
    throw new Error(`Error en reporteMargenComercial: ${error.message}`);
  }
};


module.exports = {
    parteDiario,
    abastecimiento,
    abastecimientoMesActual,
    abastecimientoMesAnterior,
    findAllRegions,
    findAllLines,
    findAllSubLines,
    findAllGroupAlmacenes,
    abastecimientoPorFecha,
    abastecimientoPorFechaAnual,
    abastecimientoPorFecha_24_meses,
    reporteArticuloPendientes,
    reporteMargenComercial,
}