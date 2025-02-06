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

        const query = `SELECT * FROM LAB_IFA_PRD.ifa_dm_clientes`;
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
        const query = `SELECT * FROM LAB_IFA_PRD.ifa_dm_clientes WHERE "CardCode"= '${cardCode}'`;
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

const setPrecioOficial = async (itemCode, precio, id_vend_sap, glosa) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_agregar_precio_oficial('${itemCode}',${precio},${id_vend_sap},'${glosa}');`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.error('Error en setPrecioOficial:', error);
        return {
            status:400,
            message: `Error en setPrecioOficial: ${error.message || ''}`
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
const getZonasPorSucursal = async (code) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        let query;
        if(code==0){
            query = `select * from ${process.env.PRD}.ifa_dm_zonas`;
        }else{
            query = `select * from ${process.env.PRD}.ifa_dm_zonas where "SucCode"=${code}`;
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

const getListaPreciosByIdCadenas = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        
        const query = `call ${process.env.PRD}.ifa_dm_precios_por_lista(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result}
    } catch (error) {
        console.error('Error en getListaPreciosByIdCadenas:', error);
        return {
            status:400,
            message: `Error en getListaPreciosByIdCadenas: ${error.message || ''}`
        }
    }
}

const setPrecioCadena = async (listCode, itemCode, precio, id_vend_sap, glosa) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_agregar_precios(${listCode},'${itemCode}',${precio},${id_vend_sap},'${glosa}');`;
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

const actualizarCliente= async(cardCode, columna, str, num)=>{
    let query=''
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `call ${process.env.PRD}.ifa_dm_update_cliente('${cardCode}','${columna}','${str}',${num});`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result,
            query
        }
    } catch (error) {
        console.error('Error en actualizarCliente:', error);
        throw {
            status: 400,
            message: `Error en actualizarCliente: ${error.message || ''}`,
            query
        }
    }
}

const descuentoOfertasPorLinea= async(lineaItem, desc, fechaInicial, fechaFinal, id_sap)=>{
    let query=''
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_articulos(${lineaItem}, ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap});`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: result[0].response || 200,
            message: result[0].message || '',
            data: result,
            query
        }
    } catch (error) {
        console.error('Error en descuentoOfertasPorLinea:', error);
        return {
            status: 400,
            message: `Error en descuentoOfertasPorLinea: ${error.message || ''}`,
            query
        }
    }
}

const getAllLineas= async()=>{
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from LAB_IFA_PRD.ifa_dm_lineas`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllLineas:', error);
        throw {
            status: 400,
            message: `Error en getAllLineas: ${error.message || ''}`
        }
    }
}

const setDescuentoOfertasPorCantidad= async(row,itemCode,cantMin, cantMax, desc, fechaInicial, fechaFinal, id_sap, del)=>{
    let query=''
    try {
        if (!connection) {
            await connectHANA();
        }
        
        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_articulos_detalle(${row},'${itemCode}',${cantMin}, ${cantMax}, ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap}, '${del}');`;
        console.log({ query })
        const result = await executeQuery(query)
        console.log(result)
        if(typeof result === 'number')
            return {
                status: 200, 
                message: '',
                data: result,
                query
            }
        return {
            status: result[0].response || 200, 
            message: result[0].message || '',
            data: result,
            query
        }
    } catch (error) {
        console.error('Error en setDescuentoOfertasPorCantidad:', error);
        return {
            status: 400,
            message: `Error en setDescuentoOfertasPorCantidad: ${error.message || ''}`,
            query
        }
    }
}

const getArticulos = async(lineCode)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where "LineItemCode"='${lineCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getArticulos:', error);
        throw {
            status: 400,
            message: `Error en getArticulos: ${error.message || ''}`
        }
    }
}

const findCliente = async(buscar)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM LAB_IFA_PRD.ifa_dm_clientes where "CardCode" LIKE '%${buscar}%' OR "CardName" LIKE '%${buscar}%'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en findCliente:', error);
        throw {
            status: 400,
            message: `Error en findCliente: ${error.message || ''}`
        }
    }
}

const getIdDescuentosCantidad = async(itemCode)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_id_descuentos_por_articulo('${itemCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getIdDescuentosCantidad:', error);
        throw {
            status: 400,
            message: `Error en getIdDescuentosCantidad: ${error.message || ''}`
        }
    }
}

const getDescuentosCantidad = async(docNum,itemCode)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_descuentos_articulo_por_id(${docNum},'${itemCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDescuentosCantidad:', error);
        throw {
            status: 400,
            message: `Error en getDescuentosCantidad: ${error.message || ''}`
        }
    }
}

const getArticuloByCode = async(code)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where "ItemCode"='${code}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getArticuloByCode:', error);
        throw {
            status: 400,
            message: `Error en getArticuloByCode: ${error.message || ''}`
        }
    }
}

const setDescuentoEspecial= async(cardCode, lineCode, desc, fechaInicial, fechaFinal)=>{
    let query=''
    try {
        if (!connection) {
            await connectHANA();
        }
        
        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_especiales('${cardCode}',${lineCode}, ${desc}, '${fechaInicial}', '${fechaFinal}');`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: result[0].response || 200,
            message: result[0].message || '',
            data: result,
            query
        }
    } catch (error) {
        console.error('Error en setDescuentoEspecial:', error);
        return {
            status: 400,
            message: `Error en setDescuentoEspecial: ${error.message || ''}`,
            query
        }
    }
}

const getAllDescuentosLinea = async()=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_id_y_linea_descuentos_articulos()`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllDescuentosLinea:', error);
        throw {
            status: 400,
            message: `Error en getAllDescuentosLinea: ${error.message || ''}`
        }
    }
}

const deleteDescuentoLinea = async(id, lineaItemCode, id_sap)=>{
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `call ${process.env.PRD}.ifa_dm_eliminar_descuentos_articulos(${id}, ${lineaItemCode}, ${id_sap})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status:200,
            data: result,
            query
        }
    } catch (error) {
        console.error('Error en deleteDescuentoLinea:', error);
        return {
            status: 400,
            message: `Error en deleteDescuentoLinea: ${error.message || ''}`,
            query
        }
    }
}

const setDescuentoEspecialPorArticulo= async(cardCode, itemCode, desc, fechaInicial, fechaFinal, id_sap)=>{
    let query=''
    try {
        if (!connection) {
            await connectHANA();
        }
        
        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_especiales_articulos('${cardCode}','${itemCode}', ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap});`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: result[0].response || 200,
            message: result[0].message || '',
            data: result,
            query
        }
    } catch (error) {
        console.error('Error en setDescuentoEspecialPorArticulo:', error);
        return {
            status: 400,
            message: `Error en setDescuentoEspecialPorArticulo: ${error.message || ''}`,
            query
        }
    }
}

module.exports = {
    dmClientes,
    dmClientesPorCardCode,
    dmTiposDocumentos,
    getListaPreciosOficiales,
    setPrecioOficial,
    getSucursales,
    getAreasPorSucursal,
    getZonasPorArea,
    getListaPreciosByIdCadenas,
    setPrecioCadena,
    getZonasPorSucursal,
    actualizarCliente,
    descuentoOfertasPorLinea,
    getAllLineas,
    setDescuentoOfertasPorCantidad,
    getArticulos,
    findCliente,
    getIdDescuentosCantidad,
    getDescuentosCantidad,
    getArticuloByCode,
    setDescuentoEspecial,
    getAllDescuentosLinea,
    deleteDescuentoLinea,
    setDescuentoEspecialPorArticulo
}