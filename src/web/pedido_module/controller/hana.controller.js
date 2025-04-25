const hana = require('@sap/hana-client');
const { query } = require('express');

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

const findClientePorVendedor = async (name) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_DM_CLIENTES_X_VENDEDOR('${name}')`
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: findClientePorVendedor');
    }
}

const findDescuentosArticulos = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `SELECT * FROM ${process.env.PRD}.IFA_VM_DESCUENTOS_POR_ARTICULO`
        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_DESCUENTOS_OFERTAS('${cardCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud findDescuentosArticulos: ${error.message}`);
    }
}

const findDescuentosCondicion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_VM_DESCUENTOS_POR_CONDICION`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: findDescuentosCondicion');
    }
}

const findDescuentosLineas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_VM_DESCUENTOS_POR_LINEA`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: findDescuentosLineas');
    }
}

const findDescuentosArticulosCatalogo = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_ARTICULOS_CATALOGO`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: findDescuentosArticulosCatalogo');
    }
}

const moraCliente = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_VM_MORA_CLIENTE('${cardCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: moraCliente');
    }
}

const clientesMora = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_VEN_WHITE_LIST`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: clientesMora');
    }
}

const listaPrecioOficial = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_catalogo_vm('${cardCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud: listaPrecioOficial: ${error.message}`);
    }
}

const pedidoSugeridoXZona = async (zoneCode, cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_pedido_sugerido_by_zona('${zoneCode}', '${cardCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: pedido sugerido por zona');
    }
}

const pedidoSugeridoXCliente = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_pedido_sugerido_by_cliente('${cardCode}')`
        console.log({ query })
        const sugeridos = await executeQuery(query)
        console.log({ sugeridos })
        return { sugeridos, query }
    } catch (error) {
        // console.log({ error })
        throw new Error(error.message);
    }
}

const findZonasXVendedor = async (id_vendedor_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_zonas_by_vendedor('${id_vendedor_sap}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: findZonasXVendedor');
    }
}

const pedidosPorVendedorPendientes = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_vendedor_pendiente(${id})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: pedidosPorVendedorPendientes');
    }
}

const pedidosPorVendedorFacturados = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_vendedor_facturado(${id})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud: pedidosPorVendedorFacturados: ${error.message}`);
    }
}

const pedidosPorVendedorAnulados = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_vendedor_anulado(${id})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: pedidosPorVendedorAnulados');
    }
}
const pedidoLayout = async (delivery) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `CALL LAB_IFA_PRD.IFA_LAPP_VEN_PEDIDO_LAYOUT(${delivery})`;
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_PEDIDO_LAYOUT(${delivery})`;
        console.log({ query })
        const result = await executeQuery(query)
        return { result, query }
    } catch (error) {
        console.error('Error en pedido layout:', error.message);
        throw new Error(`Error en pedido layout ${error.message}`);
    }
}
const pedidosPorVendedorHoy = async (id_vendedor, fecha) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_vendedor_hoy(${id_vendedor}, '${fecha}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: pedidosPorVendedorHoy');
    }
}

const listaPrecioCadenas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "ListCode", "ListName" from ${process.env.PRD}.ifa_dm_listas_de_precios`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({error})
        throw new Error('Error al procesar la solicitud: listaPrecioCadenas');
    }
}

const precioArticuloCadena = async (nroLista, itemArticulo) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_precio_por_articulo_y_lista(${nroLista}, ${itemArticulo})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: precioArticuloCadena');
    }
}

const clientesPorSucursal= async (id_sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_clientes_por_surcursal(${id_sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result
        }
    } catch (error) {
        console.error('Error en clientesPorSucursal:', error.message);
        return { 
            statusCode: 400,
            message: `Error al procesar clientesPorSucursal: ${error.message || ''}` 
        }
    }
}

const getAllArticulos= async (itemName) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where (upper("ItemName") LIKE '%${itemName}%' or upper("ItemCode") LIKE '%${itemName}%') and "ItmsGrpCod" = 105 and "validFor"='Y' order by "ItemName" limit 15`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllArticulos:', error.message);
        throw { 
            message: `Error al procesar getAllArticulos: ${error.message || ''}` 
        }
    }
}

const articuloDiccionario = async (cod) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `call ${process.env.PRD}.IFA_LAPP_INV_HABILITACION_DICT('${cod}')`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en articuloDiccionario:', error.message);
        return { message: `Error al procesar la solicitud: articuloDiccionario: ${error.message}` }
    }
}

const stockInstitucionPorArticulo = async (cod) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `call ${process.env.PRD}.ifa_inv_obtener_stock_institucion_por_articulo('${cod}')`;
        const query = `call LAB_IFA_PRD.ifa_inv_obtener_stock_institucion_por_articulo('${cod}')`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en stockInstitucionPorArticulo:', error.message);
        throw { message: `Error al procesar stockInstitucionPorArticulo: ${error.message}` }
    }
}

const listaNegraDescuentos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `select * from ${process.env.PRD}.IFA_DM_ARTICULOS_LISTA_NEGRA_DESCUENTOS`;
        const query = `select * from LAB_IFA_PRD.IFA_DM_ARTICULOS_LISTA_NEGRA_DESCUENTOS`;

        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en listaNegraDescuentos:', error.message);
        throw { message: `Error al procesar listaNegraDescuentos: ${error.message}` }
    }
}

const clientePorCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_CLIENTES WHERE "CardCode" = '${cardCode}'`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en listaNegraDescuentos:', error.message);
        throw { message: `Error al procesar clientePorCardCode: ${error.message}` }
    }
}

const articuloPorItemCode= async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos WHERE "ItemCode" = '${itemCode}'`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en listaNegraDescuentos:', error.message);
        throw { message: `Error al procesar articuloPorItemCode: ${error.message}` }
    }
}

const descuentosCortoVencimiento = async()=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_VM_DESCUENTOS_POR_ARTICULO_CORTO_VENCIMIENTO`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en listaNegraDescuentos:', error.message);
        throw { message: `Error al procesar articuloPorItemCode: ${error.message}` }
    }
}

module.exports = {
    findClientePorVendedor,
    findDescuentosArticulos,
    findDescuentosArticulosCatalogo,
    findDescuentosCondicion,
    findDescuentosLineas,
    moraCliente,
    clientesMora,
    listaPrecioOficial,
    pedidoSugeridoXZona,
    pedidoSugeridoXCliente,
    findZonasXVendedor,
    pedidosPorVendedorPendientes,
    pedidosPorVendedorFacturados,
    pedidosPorVendedorAnulados,
    pedidoLayout,
    pedidosPorVendedorHoy,
    precioArticuloCadena,
    listaPrecioCadenas,
    clientesPorSucursal,
    getAllArticulos,
    articuloDiccionario,
    stockInstitucionPorArticulo,
    listaNegraDescuentos,
    clientePorCardCode,
    articuloPorItemCode,
    descuentosCortoVencimiento,
}
