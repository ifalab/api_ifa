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

const findCajasEmpleado = async (codEmp) => {
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

const rendicionDetallada = async (id) => {
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

const rendicionByTransac = async (codTransac) => {
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

const crearRendicion = async (NEW_TransactionId, NEW_CodEmp, NEW_ESTADO, NEW_MES, NEW_YEAR) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('crearRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_CREAR_RENDICION('${NEW_TransactionId}','${NEW_CodEmp}','${NEW_ESTADO}',${NEW_MES},${NEW_YEAR})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en crearRendicion ')
    }
}

const crearGasto = async (
    new_nit,
    new_tipo,
    new_gasto,
    new_nroFactura,
    new_codAut,
    new_fecha,
    new_nombreRazon,
    new_glosa,
    new_importeTotal,
    new_ice,
    new_iehd,
    new_ipj,
    new_tasas,
    new_otroNoSujeto,
    new_exento,
    new_tasaCero,
    new_descuento,
    new_codControl,
    new_gifCard,
    idRendicion,
    month,
    year,
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('crearRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_CREAR_RENDICION_GASTOS('${new_nit}','${new_tipo}',${new_gasto},'${new_nroFactura}','${new_codAut}','${new_fecha}','${new_nombreRazon}','${new_glosa}',${new_importeTotal},${new_ice},${new_iehd},${new_ipj},${new_tasas},${new_otroNoSujeto},${new_exento},${new_tasaCero},${new_descuento},'${new_codControl}',${new_gifCard},'1',${idRendicion},${month},${year})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `Error, no se pudieron insertar los datos con nit: ${new_nit || 'No definido'},Tipo: ${new_tipo || 'No definido'}, Factura: ${new_nroFactura || 'No definido'}, Razon: ${new_nombreRazon || 'No definido'}, Glosa: ${new_glosa || 'No definido'}`
        }
       
    }
}

const actualizarGastos = async (
    ID,
    new_nit,
    new_tipo,
    new_gasto,
    new_nroFactura,
    new_codAut,
    new_fecha,
    new_nombreRazon,
    new_glosa,
    new_importeTotal,
    new_ice,
    new_iehd,
    new_ipj,
    new_tasas,
    new_otroNoSujeto,
    new_exento,
    new_tasaCero,
    new_descuento,
    new_codControl,
    new_gifCard,
    idRendicion,
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarGastos EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_RENDICION_GASTOS(${ID},'${new_nit}','${new_tipo}',${new_gasto},'${new_nroFactura}','${new_codAut}','${new_fecha}','${new_nombreRazon}','${new_glosa}',${new_importeTotal},${new_ice},${new_iehd},${new_ipj},${new_tasas},${new_otroNoSujeto},${new_exento},${new_tasaCero},${new_descuento},'${new_codControl}',${new_gifCard},'1',${idRendicion})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `Error, no se pudieron actualizar los datos con nit: ${new_nit || 'No definido'},Tipo: ${new_tipo || 'No definido'}, Factura: ${new_nroFactura || 'No definido'}, Razon: ${new_nombreRazon || 'No definido'}, Glosa: ${new_glosa || 'No definido'}`
        }
    }
    
}
module.exports = {
    findAllAperturaCaja,
    findCajasEmpleado,
    rendicionDetallada,
    rendicionByTransac,
    crearRendicion,
    crearGasto,
    actualizarGastos,
}