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
                // console.log('error en la consulta:', err.message)
                reject(new Error(`error en la consulta: ${err.message}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);
            }
        })
    })
}


const getLotes = async (status) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `
        select a.*, b."Status", b."StatusDescr", 
            b."CreateDate" "CreateDateStatus"
        from ${process.env.PRD}.ifa_dm_articulos_lotes_pt a
        join (
            select * from ${process.env.PRD}.ifa_dm_articulos_lotes_pt_status 
            where "Status"=${status}
            limit 200
        ) b on a."BatchNum"=b."BatchNum"
        order by b."CreateDate" desc`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud getLotes: ${error.message || ''}`);
    }
}

const searchLotes = async (cadena, status) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `
        select a.*, b."Status", b."StatusDescr", 
            b."CreateDate" "CreateDateStatus"
        from ${process.env.PRD}.ifa_dm_articulos_lotes_pt a
        join( select * from
            ${process.env.PRD}.ifa_dm_articulos_lotes_pt_status 
            where "BatchNum" like '%${cadena}%' and "Status"=${status}) b on a."BatchNum"=b."BatchNum"
        where a."BatchNum" like '%${cadena}%'
        order by b."CreateDate" desc`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud searchLotes: ${error.message || ''}`);
    }
}

const cambiarEstadoLote = async (lote, estado, usuario, comentario) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFA_INV_ARTICULO_CAMBIAR_ESTADO_LOTE(
        '${lote}', ${estado}, ${usuario}, '${comentario}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud cambiarEstadoLote: ${error.message || ''}`);
    }
}


module.exports = {
    getLotes,
    cambiarEstadoLote,
    searchLotes
}