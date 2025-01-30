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
                reject(new Error(`${err.message || 'Error en la consulta'}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);
                // console.log({result})
            }
        })
    })
}

const findClientesByVendedor = async(id_vendedor)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_PRD.ifa_lapp_clientes_by_vendedor(${id_vendedor})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: clientes by vendedor');
    }
}

const findClientesByFacturador = async(sucCode)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_clientes_by_vendedor(${sucCode})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: clientes by vendedor');
    }
}

const grabarLog = async(userCode, username, modulo, mensaje, querystr, endpoint, base )=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const escapedQuerystr = querystr.replace(/'/g, "''");
        const escapedMensaje = mensaje.replace(/'/g, "''");
        const query = `CALL LAB_IFA_LAPP.LAPP_GRABAR_LOG('${userCode}','${username}','${modulo}', '${escapedMensaje}','${escapedQuerystr}','${endpoint}','${base}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        // throw new Error('Error al grabarLog');
    }
}

const listaEncuesta = async()=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM LAB_IFA_LAPP.LAPP_ENCUESTA`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar listaEncuesta: ${error.message || ''}`);
    }

}

const crearEncuesta = async(
    new_primeraPregunta,
    new_segundaPregunta,
    new_terceraPregunta,
    new_cuartaPregunta,
    new_quintaPregunta,
    new_recomendaciones,
    new_fullname,
    new_rol_user,
    id_user,
    new_puntajePrimerPregunta,
    new_puntajeSegundaPregunta,
    new_puntajeTerceraPregunta,
    new_puntajeCuartaPregunta,
    new_puntajeQuintaPregunta
)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_LAPP.LAPP_CREAR_ENCUESTA('${new_primeraPregunta}','${new_segundaPregunta}','${new_terceraPregunta}','${new_cuartaPregunta}','${new_quintaPregunta}','${new_recomendaciones}','${new_fullname}','${new_rol_user}',${id_user},${new_puntajePrimerPregunta},${new_puntajeSegundaPregunta},${new_puntajeTerceraPregunta},${new_puntajeCuartaPregunta},${new_puntajeQuintaPregunta});`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar crearEncuesta: ${error.message || ''}`);
    }

}

module.exports = {
    findClientesByVendedor,
    grabarLog,
    findClientesByFacturador,
    listaEncuesta,
    crearEncuesta,
}