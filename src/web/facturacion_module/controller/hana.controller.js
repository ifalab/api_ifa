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

const lotesArticuloAlmacenCantidad = async (articulo, almacen, lote) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_VM_SELECTION_BATCH_FEFO('${articulo}','${almacen}',${lote})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en lotesArticuloAlmacenCantidad:', error.message);
        return { message: `Error en lotesArticuloAlmacenCantidad: ${error.message || ''}` }
    }
}

const obtenerEntregaDetalle = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE(${id})`;
        const result = await executeQuery(query)
        console.log({query})
        return result

    } catch (error) {
        console.error('Error en obtenerEntregaDetalle:', error.message || '');
        return { message: `Error en obtenerEntregaDetalle: ${error.message || ''}` }
    }
}

const obtenerEntregaDetalleExportacion = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_EXP_DETALLE(${id})`;
        const result = await executeQuery(query)
        console.log({query})
        return result

    } catch (error) {
        console.error('Error en obtenerEntregaDetalle:', error.message || '');
        return { message: `Error en obtenerEntregaDetalle: ${error.message || ''}` }
    }
}

const solicitarId = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.IFA_SOLICITUD_ID(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return { result, query }

    } catch (error) {
        console.error('Error en solicitarId:', error.message);
        return { message: `Error en solicitarId: ${error.message}` }
    }
}

const notaEntrega = async (delivery) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_ENTREGA_LAYOUT(${delivery})`;
        console.log({ query })
        const result = await executeQuery(query)
        return { result, query }

    } catch (error) {
        console.error('Error en notaEntrega:', error.message);
        throw new Error(`Error al procesar notaEntrega: ${error.message || ''}`)
    }
}

const obtenerEntregasPorFactura = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_entregas_por_factura(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregasPorFactura:', error.message || '');
        return { message: `${error.message || 'Error al procesar la solicitud: obtenerEntregasPorFactura'}` }
    }
}

const facturasParaAnular = async (sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log(sucursal);
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_FACTURAS_PARA_ANULAR_POR_SUCURSAL(${sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturasParaAnular:', error.message);
        return { message: 'Error al procesar la solicitud: facturasParaAnular' }
    }
}

const facturaInfo = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_INFO_FACTURACION`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en notaEntrega:', error.message);
        return { message: 'Error al procesar la solicitud: facturaInfo' }
    }
}

const facturaPedidoDB = async (whsCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos(${whsCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturaInfo:', error.message);
        return { message: `Error al procesar la solicitud facturaPedidoDB: ${error.message || ''}` }
    }
}
const facturaPedidoTodos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_todos_pedidos()`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturaInfo:', error.message);
        return { message: `Error al procesar la solicitud facturaPedidoTodos: ${error.message || ''}` }
    }
}

const actualizarEstadoPedido = async (docNum,estado) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `update ${process.env.PRD}.ordr set "U_B_State" = '${estado}' where "DocNum" = ${docNum}`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en actualizarEstadoPedido:', error.message);
        return { message: `Error al procesar actualizarEstadoPedido: ${error.message || ''}` }
    }
}

const pedidosFacturados = async (SucCode, fecha) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_facturados(${SucCode}, '${fecha}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en pedidosFacturados:', error.message);
        return { message: `Error al procesar la solicitud: pedidosFacturados: ${error.message}` }
    }
}

const obtenerEntregas = async (id_sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_entregas(${id_sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregas:', error.message);
        return { message: 'Error al procesar la solicitud: obtenerEntregas' }
    }
}

const facturasPedidoCadenas = async (id_sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_cadenas(${id_sucursal})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en facturasPedidoCadenas:', error.message);
        return { message: 'Error al procesar la solicitud: facturasPedidoCadenas' }
    }
}

const facturasAnuladas = async (SucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        //Cambiar query
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_FACTURAS_ANULADAS_POR_SUCURSAL(${SucCode})`;

        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturasAnuladas:', error.message);
        return { message: `Error al procesar la solicitud: facturasAnuladas. ${error.message || ''}` }
    }
}

const pedidosPorEntrega = async (DeliveryNum) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_entregas(${DeliveryNum})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en pedidosPorEntrega:', error.message);
        return { message: `Error al procesar la solicitud: pedidosPorEntrega. ${error.message || ''}` }
    }
}

const entregasSinFacturas = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGAS_SIN_FACTURA(${sucCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en entregasSinFacturas:', error.message);
        return { message: `Error al procesar la solicitud: entregasSinFacturas. ${error.message || ''}` }
    }
}

const obtenerEntregaPorPedido = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_entregas_por_pedido(${id})`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregaDetalle:', error.message || '');
        return { message: `Error en obtenerEntregaPorPedido: ${error.message || ''}` }
    }
}

const facturaPedidoInstituciones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_instituciones()`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturaPedidoInstituciones:', error.message);
        return { message: `Error al procesar la solicitud facturaPedidoInstituciones: ${error.message || ''}` }
    }
}

const obtenerPedidoDetalle = async (nro_ped) => {
    // console.log(nro_ped)
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_ven_pedidos_detalle WHERE "DocEntry" = ${nro_ped}`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en facturarVehiculo:', error.message);
        return { message: `Error al procesar la solicitud facturarVehiculo: ${error.message || ''}` }
    }
}

const obtenerDevoluciones = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_obtener_devoluciones(${sucCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerDevoluciones:', error.message);
        return { message: `Error al procesar obtenerDevoluciones: ${error.message || ''}` }
    }
}

const detalleDevolucion = async (idReturn) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_DEVOLUCION_DETALLE_TOORDER(${idReturn})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en detalleDevolucion:', error.message);
        return { message: `Error al procesar detalleDevolucion: ${error.message || ''}` }
    }
}

const obtenerGroupCode = async (CardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "GroupCode" from ${process.env.PRD}.ifa_dm_clientes where "CardCode"='${CardCode}' group by "GroupCode"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result[0]
    } catch (error) {
        console.error('Error en ofertaDelPedido:', error.message);
        return { message: `Error al procesar ofertaDelPedido: ${error.message || ''}` }
    }
}

const ofertaDelPedido = async (DocEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "BaseEntry" from ${process.env.PRD}.ifa_ven_pedidos_detalle where "DocEntry"=${DocEntry} group by "BaseEntry"`;
        // const query = `select * from ${process.env.PRD}.ifa_ven_pedidos_detalle limit 20`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en ofertaDelPedido:', error.message);
        return { message: `Error al procesar ofertaDelPedido: ${error.message || ''}` }
    }
}


const clienteByCardName = async (cardName) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_clientes where "CardName" like '%${cardName}%' limit 30`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en detalleDevolucion:', error.message);
        return { message: `Error al procesar clienteByCardName: ${error.message || ''}` }
    }
}

const clientesExportacion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_clientes where "Currency" = 'USD' limit 50`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en clientesExportacion:', error.message);
        return { message: `Error al procesar clientesExportacion: ${error.message || ''}` }
    }
}

const getAllAlmacenes = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "WhsCode", "WhsName" from ${process.env.PRD}.IFA_DM_ALMACENES`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getAllAlmacenes ${error.message}`)
    }
}

const articulosExportacion = async (parameter) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where "ItemName" LIKE '%${parameter}%' AND "SellItem" = 'Y' limit 50`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en articulosExportacion ${error.message}`)
    }
}

const intercom = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.INCOTERM`
        console.log({query})
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en intercom ${error.message}`)
    }
}

const pedidosExportacion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_exportacion()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en pedidosExportacion ${error.message}`)
    }
}

const reabrirOferta = async (id_oferta) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_sis_open_oferta_venta(${id_oferta})`
        console.log({query})
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en reabrirOferta ${error.message}`)
    }
}

const obtenerDetallePedidoAnulado = async(id_pedido) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}."IFA_VEN_PEDIDOS_DETALLE_ANULADOS" where "DocEntry" = ${id_pedido}`
        console.log({query})
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en obtenerDetallePedidoAnulado ${error.message}`)
    }
}

const reabrirLineas = async (id_linea, doc_lin) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_sis_open_lines_oferta_venta_con_orden(${id_linea}, ${doc_lin})`
        console.log({query})
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en reabrirLineas ${error.message}`)
    }
}

const getClienteByCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT 
        *
        FROM ${process.env.PRD}.IFA_DM_CLIENTES WHERE "CardCode"='${cardCode}'`
        console.log({query})
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de getClienteByCardCode: ${error.message}`)
    }
}

const getOrdersById = async(id)=>{
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.getOrderByDocEntry(${id})`
        console.log({query})
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de getOrdersById: ${error.message}`)
    }
}

const setOrderState= async(id,state)=>{
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.setOrderState(${id},'${state}')`
        console.log({query})
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de setOrderState: ${error.message}`)
    }
}

module.exports = {
    lotesArticuloAlmacenCantidad,
    obtenerEntregaDetalle,
    solicitarId,
    notaEntrega,
    obtenerEntregasPorFactura,
    facturasParaAnular,
    facturaInfo,
    facturaPedidoDB,
    pedidosFacturados,
    obtenerEntregas,
    facturasPedidoCadenas,
    facturasAnuladas,
    pedidosPorEntrega,
    entregasSinFacturas,
    obtenerEntregaPorPedido,
    facturaPedidoInstituciones,
    obtenerPedidoDetalle,
    obtenerDevoluciones,
    detalleDevolucion,
    clienteByCardName,
    ofertaDelPedido,
    obtenerGroupCode,
    clientesExportacion,
    getAllAlmacenes,
    articulosExportacion,
    pedidosExportacion,
    intercom,
    obtenerEntregaDetalleExportacion,
    reabrirOferta,
    reabrirLineas,
    obtenerDetallePedidoAnulado,
    getClienteByCardCode,
    getOrdersById,
    setOrderState,
    facturaPedidoTodos,
    actualizarEstadoPedido,
}