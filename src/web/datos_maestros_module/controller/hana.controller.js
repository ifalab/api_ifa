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
            status: 400,
            message: `Error en dmClientes: ${error.message || ''}`
        }
    }
}

const dmSearchClientes = async (search) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes WHERE "CardCode" LIKE '%${search}%' or "CardName" LIKE '%${search}%' limit 50 `;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        console.error('Error en dmClientes:', error.message);
        return {
            status: 400,
            message: `Error en dmClientes: ${error.message || ''}`
        }
    }
}

const dmClientesPorCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * from ${process.env.PRD}.ifa_dm_clientes WHERE "CardCode"= '${cardCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        console.error('Error en dmClientesPorCardCode:', error.message);
        throw {
            status: 400,
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
            status: 400,
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
            data: result
        }
    } catch (error) {
        console.error('Error en getListaPreciosOficiales:', error);
        return {
            status: 400,
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
            data: result
        }
    } catch (error) {
        console.error('Error en setPrecioOficial:', error);
        return {
            status: 400,
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
            data: result
        }
    } catch (error) {
        console.log({ error })
        console.error('Error en getSucursales:', error.message);
        return {
            status: 400,
            message: `Error en getSucursales: ${error.message || ''}`
        }
    }
}

const sucursalBySucCode = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_sucursales where "SucCode" = ${sucCode}`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        console.log({ error })
        console.error('Error en sucursalBySucCode:', error.message);
        return {
            status: 400,
            message: `Error en sucursalBySucCode: ${error.message || ''}`
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
            data: result
        }
    } catch (error) {
        console.log({ error })
        console.error('Error en getAreasPorSucursal:', error.message);
        return {
            status: 400,
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
        if (areaCode == 0) {
            query = `select * from ${process.env.PRD}.ifa_dm_zonas`;
        } else {
            query = `select * from ${process.env.PRD}.ifa_dm_zonas where "AreaCode"=${areaCode}`;
        }
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        console.log({ error })
        console.error('Error en getZonasPorArea:', error.message);
        return {
            status: 400,
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
        if (code == 0) {
            query = `select * from ${process.env.PRD}.ifa_dm_zonas`;
        } else {
            query = `select * from ${process.env.PRD}.ifa_dm_zonas where "SucCode"=${code}`;
        }
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        console.log({ error })
        console.error('Error en getZonasPorArea:', error.message);
        return {
            status: 400,
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
            data: result
        }
    } catch (error) {
        console.error('Error en getListaPreciosByIdCadenas:', error);
        return {
            status: 400,
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
            data: result
        }
    } catch (error) {
        console.error('Error en setPrecioItem:', error);
        return {
            status: 400,
            message: `Error en setPrecioItem: ${error.message || ''}`
        }
    }
}

const actualizarCliente = async (cardCode, columna, str, num) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `call ${process.env.PRD}.ifa_dm_update_cliente('${cardCode}','${columna}','${str}',${num});`;
        console.log({ query })
        const result = await executeQuery(query)
        console.log({ resultActualizarCliente: result })
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

const descuentoOfertasPorLinea = async (lineaItem, desc, fechaInicial, fechaFinal, id_sap) => {
    let query = ''
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

const getAllLineas = async () => {
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

const lineaByCode = async (lineCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from LAB_IFA_PRD.ifa_dm_lineas where "LineItemCode" = ${lineCode}`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en lineaByCode:', error);
        throw {
            status: 400,
            message: `Error en lineaByCode: ${error.message || ''}`
        }
    }
}

const setDescuentoOfertasPorCantidad = async (row, itemCode, cantMin, cantMax, desc, fechaInicial, fechaFinal, id_sap, del) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }

        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_articulos_detalle(${row},'${itemCode}',${cantMin}, ${cantMax}, ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap}, '${del}');`;
        console.log({ query })
        const result = await executeQuery(query)
        console.log(result)
        if (typeof result === 'number')
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

const setDescuentoOfertasPorCantidadCortoVencimiento = async (row, itemCode, cantMin, cantMax, desc, fechaInicial, fechaFinal, id_sap, del) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }

        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_articulos_detalle_corto_vencimiento(${row},'${itemCode}',${cantMin}, ${cantMax}, ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap}, '${del}');`;
        console.log({ query })
        const result = await executeQuery(query)
        console.log(result)
        if (typeof result === 'number')
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
        console.error('Error en setDescuentoOfertasPorCantidadCortoVencimiento:', error);
        return {
            status: 400,
            message: `Error en setDescuentoOfertasPorCantidadCortoVencimiento: ${error.message || ''}`,
            query
        }
    }
}

const setDescuentoOfertasPorCortoVencimiento = async (row, itemCode, cantMin, cantMax, desc, fechaInicial, fechaFinal, id_sap, del) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }

        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_articulos_detalle_corto_vencimiento(${row},'${itemCode}',${cantMin}, ${cantMax}, ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap}, '${del}');`;
        console.log({ query })
        const result = await executeQuery(query)
        console.log(result)
        if (typeof result === 'number')
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
        console.error('Error en setDescuentoOfertasPorCortoVencimiento:', error);
        return {
            status: 400,
            message: `Error en setDescuentoOfertasPorCortoVencimiento: ${error.message || ''}`,
            query
        }
    }
}

const getArticulos = async (lineCode) => {
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

const searchArticulos = async (search) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where "ItemCode" LIKE '%${search}%' OR "ItemName" LIKE '%${search}%' LIMIT 50`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en searchArticulos:', error);
        throw {
            status: 400,
            message: `Error en searchArticulos: ${error.message || ''}`
        }
    }
}

const findAllArticulos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos limit 50`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en findAllArticulos:', error);
        throw {
            status: 400,
            message: `Error en findAllArticulos: ${error.message || ''}`
        }
    }
}

const findCliente = async (buscar) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes where "CardCode" LIKE '%${buscar}%' OR "CardName" LIKE '%${buscar}%'`;
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

const clientByCardCode = async (buscar) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes where "CardCode" = '${buscar}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en clientByCardCode:', error);
        throw {
            status: 400,
            message: `Error en clientByCardCode: ${error.message || ''}`
        }
    }
}

const getIdDescuentosCantidad = async (itemCode) => {
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

const getIdDescuentosCortoCantidad = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_id_descuentos_por_articulo_cv('${itemCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getIdDescuentosCortoCantidad:', error);
        throw {
            status: 400,
            message: `Error en getIdDescuentosCortoCantidad: ${error.message || ''}`
        }
    }
}

const getDescuentosCantidad = async (docNum, itemCode) => {
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

const getDescuentosCantidadCorto = async (docNum, itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_descuentos_articulo_cv_por_id(${docNum},'${itemCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDescuentosCantidadCorto:', error);
        throw {
            status: 400,
            message: `Error en getDescuentosCantidadCorto: ${error.message || ''}`
        }
    }
}

const getArticuloByCode = async (code) => {
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

const setDescuentoEspecial = async (cardCode, lineCode, desc, fechaInicial, fechaFinal, id_sap) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }

        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_especiales('${cardCode}',${lineCode}, ${desc}, '${fechaInicial}', '${fechaFinal}', ${id_sap});`;
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

const getAllDescuentosLinea = async () => {
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

const deleteDescuentoLinea = async (id, lineaItemCode, id_sap) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `call ${process.env.PRD}.ifa_dm_eliminar_descuentos_articulos(${id}, ${lineaItemCode}, ${id_sap})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
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

const setDescuentoEspecialPorArticulo = async (row, cardCode, itemCode, cantMin, cantMax, desc, fechaInicial, fechaFinal, id_sap, del) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }
        /*
    IN cardcode VARCHAR(100),
    IN ItemCode VARCHAR(60),
    IN disco DECIMAL(16,2), 
    IN fechainicio DATE,
    IN fechafin DATE,
    IN usuario INT,
    IN rownum int,
    IN mini int,
    IN maxi int,
    IN deleterow varchar(30)
        */
        query = `call ${process.env.PRD}.ifa_dm_agregar_descuentos_especiales_articulos('${cardCode}','${itemCode}', ${desc}, '${fechaInicial}', '${fechaFinal}',${id_sap},${row}, ${cantMin}, ${cantMax}, '${del}');`;
        console.log({ query })
        const result = await executeQuery(query)
        console.log({ result })
        if (typeof result === 'number')
            return {
                status: 200,
                message: 'Item actualizado con exito',
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
        console.error('Error en setDescuentoEspecialPorArticulo:', error);
        return {
            status: 400,
            message: `Error en setDescuentoEspecialPorArticulo: ${error.message || ''}`,
            query
        }
    }
}

const obtenerTipos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from ${process.env.PRD}.ifa_dm_tipos where "GroupCode"!=109 AND "GroupCode"!=110 AND "GroupCode"!=111 AND "GroupCode"!=114`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenertipos:', error.message || '');
        return { message: `Error en obtenertipos: ${error.message || ''}` }
    }
}

const tipoByGroupCode = async (groupCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from ${process.env.PRD}.ifa_dm_tipos where "GroupCode"=${groupCode}`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en tipoByGroupCode:', error.message || '');
        return { message: `Error en tipoByGroupCode: ${error.message || ''}` }
    }
}

const obtenerDescuetosEspeciales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        //change query
        const query = `select * from ${process.env.PRD}.`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerDescuetosEspeciales:', error.message || '');
        throw { message: `Error en obtenerDescuetosEspeciales: ${error.message || ''}` }
    }
}


const getIdsDescuentoEspecial = async (cardCode, itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_id_descuentos_especiales_por_articulo('${itemCode}', '${cardCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getIdsDescuentoEspecial:', error);
        throw {
            status: 400,
            message: `Error en getIdsDescuentoEspecial: ${error.message || ''}`
        }
    }
}

const getDescuentosEspecialesById = async (docNum, itemCode, cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_descuentos_especiales_articulos_por_id(${docNum},'${itemCode}', '${cardCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDescuentosEspecialesById:', error);
        throw {
            status: 400,
            message: `Error en getDescuentosEspecialesById: ${error.message || ''}`
        }
    }
}

const getVendedores = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "SlpCode", "SlpName" from ${process.env.PRD}.ifa_dm_vendedores`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getVendedores:', error);
        throw {
            status: 400,
            message: `Error en getVendedores: ${error.message || ''}`
        }
    }
}

const getAllTipos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "GroupCode", "GroupName" from ${process.env.PRD}.ifa_dm_tipos`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllTipos:', error);
        throw {
            status: 400,
            message: `Error en getAllTipos: ${error.message || ''}`
        }
    }
}

const getZonas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "ZoneCode", "ZoneName" from ${process.env.PRD}.ifa_dm_zonas`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getZonas:', error);
        throw {
            status: 400,
            message: `Error en getZonas: ${error.message || ''}`
        }
    }
}

const getZonasTiposPorVendedor = async (id_vendedor) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "SlpCodeCli", "SlpNameCli", "ZoneCode", "ZoneName", "GroupCode", "GroupName" 
from ${process.env.PRD}.ifa_dm_vendedores_zonasytipos
where "SlpCodeCli" = ${id_vendedor}`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getZonasTiposPorVendedor:', error);
        throw {
            status: 400,
            message: `Error en getZonasTiposPorVendedor: ${error.message || ''}`
        }
    }
}
const asignarZonasYTiposAVendedores = async (id_vendedor, zona, tipo) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_agregar_zonasytipos_a_vendedores(${tipo}, ${zona}, ${id_vendedor})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            result
        }
    } catch (error) {
        console.error('Error en asignarZonasYTiposAVendedores:', error);
        return {
            status: 400,
            message: `Error en asignarZonasYTiposAVendedores: ${error.message || ''}`
        }
    }
}

const deleteZonasYTiposAVendedores = async (id_vendedor, zona, tipo) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `delete from ${process.env.PRD}."@IFA_VEND_ZONAS" where "U_CodZona"=${zona} and "U_TipoCliente"=${tipo} and "U_CodVendedor"=${id_vendedor}`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            result
        }
    } catch (error) {
        console.error('Error en deleteZonasYTiposAVendedores:', error);
        return {
            status: 400,
            message: `Error en deleteZonasYTiposAVendedores: ${error.message || ''}`
        }
    }
}

const getDescuentosEspecialesLinea = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_CRM_DESCUENTOS_POR_LINEA WHERE CURRENT_DATE BETWEEN "FromDate" AND "ToDate" AND "CardCode" = '${cardCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDescuentosEspecialesLinea:', error);
        throw {
            status: 400,
            message: `Error en getDescuentosEspecialesLinea: ${error.message || ''}`
        }
    }
}

const deleteDescuentosEspecialesLinea = async (id) => {
    let query = ''
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `CALL ${process.env.PRD}.ifa_dm_eliminar_descuentos_especiales_por_linea(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            result,
            query
        }
    } catch (error) {
        console.error('Error en deleteDescuentosEspecialesLinea:', error);
        return {
            status: 400,
            message: `Error en deleteDescuentosEspecialesLinea: ${error.message || ''}`,
            query
        }
    }
}

const articuloByItemCode = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `select * from ${process.env.PRD}.ifa_dm_articulos where "ItemCode"= '${itemCode}'`;
        // console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            result,
            query
        }
    } catch (error) {
        console.error('Error en deleteDescuentosEspecialesLinea:', error);
        return {
            status: 400,
            message: `Error en deleteDescuentosEspecialesLinea: ${error.message || ''}`,
            query
        }
    }
}

const updateListaPrecios = async (data, user, comentario) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        for (const element of data) {
            const { ItemCode, Precio, PriceList } = element;

            const query = `CALL ${process.env.PRD}."IFA_DM_AGREGAR_PRECIOS"(${PriceList}, '${ItemCode}', ${Precio}, ${user}, '${comentario}')`;

            console.log({ query })
            await executeQuery(query);
        }

        return {
            status: 200,
            message: 'Lista de precios actualizada correctamente.'
        };
    } catch (error) {
        console.error('Error en updateListaPrecios:', error);
        return {
            status: 400,
            message: `Error en updateListaPrecios: ${error.message || ''}`,
            query
        }
    }
}

const desactivePriceList = async (priceList) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `
            call ${process.env.PRD}.ifa_dm_desactivar_precios_por_lista(${priceList})
        `;

        await executeQuery(query);

        return {
            status: 200,
            message: 'Lista de Precios Desactivada.'
        };
    } catch (error) {
        console.error('Error en desactivePriceList:', error);
        return {
            status: 400,
            message: `Error en desactivePriceList: ${error.message || ''}`,
            query
        }
    }
}

const getItemsByLine = async (line) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFASP_MD_ITEMS_BY_LINE(${line})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en clientByCardCode:', error);
        throw {
            status: 400,
            message: `Error en clientByCardCode: ${error.message || ''}`
        }
    }
}

const getAllSublines = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from LAB_IFA_PRD.IFA_DM_SUBLINEAS`;
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
    setDescuentoEspecialPorArticulo,
    obtenerTipos,
    obtenerDescuetosEspeciales,
    getIdsDescuentoEspecial,
    getDescuentosEspecialesById,
    getVendedores,
    getAllTipos,
    getZonas,
    getZonasTiposPorVendedor,
    asignarZonasYTiposAVendedores,
    deleteZonasYTiposAVendedores,
    getDescuentosEspecialesLinea,
    deleteDescuentosEspecialesLinea,
    articuloByItemCode,
    updateListaPrecios,
    desactivePriceList,
    getIdDescuentosCortoCantidad,
    setDescuentoOfertasPorCortoVencimiento,
    getDescuentosCantidadCorto,
    setDescuentoOfertasPorCantidadCortoVencimiento,
    lineaByCode,
    sucursalBySucCode,
    tipoByGroupCode,
    dmSearchClientes,
    findAllArticulos,
    searchArticulos,
    clientByCardCode,
    getItemsByLine,
    getAllSublines
}