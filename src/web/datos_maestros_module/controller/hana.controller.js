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

const getListaPreciosOficiales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_precios_oficial`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.error('Error en getListaPreciosOficiales:', error);
        return {
            status:400,
            message: `Error en getListaPreciosOficiales: ${error.message || ''}`
        }
    }
}

const setPrecioItem = async (itemCode, precio, id_vend_sap, glosa) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        ///Faltaa
        const query = `call ${process.env.PRD}.ifa_dm_agregar_precio_oficial('${itemCode}',${precio},${id_vend_sap},'${glosa}');`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.error('Error en setPrecioItem:', error);
        return {
            status:400,
            message: `Error en setPrecioItem: ${error.message || ''}`
        }
    }
}

const getSucursales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_sucursales where "SucCode">99`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.log({ error })
        console.error('Error en getSucursales:', error.message);
        return {
            status:400,
            message: `Error en getSucursales: ${error.message || ''}`
        }
    }
}

const getAreasPorSucursal = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_PRD.ifa_dm_areas where "SucCode"='${sucCode}'`;
        // const query = `select * from ${process.env.PRD}.ifa_dm_areas where "SucCode"='${sucCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.log({ error })
        console.error('Error en getAreasPorSucursal:', error.message);
        return {
            status:400,
            message: `Error en getAreasPorSucursal: ${error.message || ''}`
        }
    }
}

const getZonasPorArea = async (areaCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        let query;
        if(areaCode==0){
            query = `select * from ${process.env.PRD}.ifa_dm_zonas`;
        }else{
            query = `select * from ${process.env.PRD}.ifa_dm_zonas where "AreaCode"=${areaCode}`;
        }
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.log({ error })
        console.error('Error en getZonasPorArea:', error.message);
        return {
            status:400,
            message: `Error en getZonasPorArea: ${error.message || ''}`
        }
    }
}

const getListaPreciosCadenas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        //Cambiar query
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_precios_oficial`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.error('Error en getListaPreciosCadenas:', error);
        return {
            status:400,
            message: `Error en getListaPreciosCadenas: ${error.message || ''}`
        }
    }
}


module.exports = {
    dmClientes,
    dmClientesPorCardCode,
    dmTiposDocumentos,
    getListaPreciosOficiales,
    setPrecioItem,
    getSucursales,
    getAreasPorSucursal,
    getZonasPorArea,
    getListaPreciosCadenas
}