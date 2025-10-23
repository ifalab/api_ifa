const hana = require('@sap/hana-client');
const { formattParam } = require('../../../helpers/formattParams.helpers');
const { executeQueryParamsWithConnection } = require('../../utils/hana-util-connection');

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
                // console.log({result})
            }
        })
    })
}

const clientesPorDimensionUno = async (dimension) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "CardCode","CardName","Dim1PrcName","GroupName" from ${process.env.PRD}.ifa_dm_clientes where "CardCode"='C000487';`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en clientesPorDimensionUno ')
    }

}

const almacenesPorDimensionUno = async (dimension) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL "${process.env.PRD}".IFA_PRD_ALMACEN_X_DIMENSION_UNO('${dimension}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en almacenesPorDimensionUno ')
    }

}

const inventarioHabilitacion = async (docentry) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL "${process.env.PRD}".IFA_LAPP_INV_HABILITACION('${docentry}')`
        console.log({ query })
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en almacenesPorDimensionUno ')
    }

}

const inventarioValorado = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from "${process.env.PRD}".ifa_inv_inventario_kardex limit 10`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en inventarioValorado: ${error.message}`)
    }

}

const descripcionArticulo = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "ItemName", "NumInSale" from ${process.env.PRD}.oitm where "ItemCode" = '${itemCode}'`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en descripcionArticulo: ${error.message}`)
    }
}

const fechaVencLote = async (lote) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_INV_HABILITACION_OBTENER_VENCIMIENTOXLOTE('${lote}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en fechaVencLote')
    }
}

const stockDisponible = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_LAPP_INV_STOCK_DISPONIBLE`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en stockDisponible')
    }
}

const stockDisponibleIfavet = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_LAPP_INV_STOCK_DISPONIBLE_IFAVET`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en stockDisponible')
    }
}

const inventarioHabilitacionDict = async (cod) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `call ${process.env.PRD}.IFA_LAPP_INV_HABILITACION_DICT('${cod}')`;
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en inventarioHabilitacionDict:', error.message);
        return { message: 'Error al procesar la solicitud: inventarioHabilitacionDict' }
    }
}

const entregaDetallerFactura = async (docentry, cuf, nrofactura, fecha) => {
    try {

        if (!connection) {
            await connectHANA();
        }

        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE_TOFACTURAR(${docentry},'${cuf}',${nrofactura},'${fecha}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en entregaDetallerFactura:', error.message);
        return { message: `Error al procesar la solicitud: entregaDetallerFactura: ${error.message}`, error }
    }
}

const entregaDetalleToProsin = async (docentry) => {
    try {

        if (!connection) {
            await connectHANA();
        }

        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_DEVOLUCION_DETALLE_TO_NDCPROSIN(${docentry})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en entregaDetalleToProsin:', error.message);
        return { message: 'Error al procesar la solicitud: entregaDetalleToProsin', error }
    }
}

const pedidoDetallerFactura = async (docentry, cuf, nrofactura, fecha) => {
    try {

        if (!connection) {
            await connectHANA();
        }

        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_PEDIDO_DETALLE_TOFACTURAR(${docentry},'${cuf}',${nrofactura},'${fecha}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en entregaDetallerFactura:', error.message);
        return { message: 'Error al procesar la solicitud: entregaDetallerFactura', error }
    }
}

const facturasClienteLoteItemCode = async (itemcode, cardCode, batchNum) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFA_FAC_FACTURAS_X_CLIENTE_LOTE_ARTICULO('${itemcode}','${cardCode}','${batchNum}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
    }
}

const facturasClienteLoteItemCodeGenesis = async (itemcode, cardCode, batchNum) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `call ${process.env.PRD}.IFA_FAC_FACTURAS_X_CLIENTE_LOTE_ARTICULO('${itemcode}','${cardCode}','${batchNum}')`
        const query = `call ${process.env.PRD}.IFA_FAC_FACTURAS_X_CLIENTE_LOTE_ARTICULO('${itemcode}','${cardCode}',${+batchNum})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
    }
}

const detalleVentas = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_ven_ventas_detalle where "DocEntry"=${id}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en detalleVentas: ${error.message || ''}`
        }
    }
}

const detalleParaDevolucion = async (docEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_detalle_para_devolucion(${docEntry})`
        // const query = `call LAB_IFA_PRD.ifa_lapp_ven_obtener_detalle_para_devolucion(${docEntry})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en detalleParaDevolucion: ${error.message || ''}`
        }
    }
}

const obtenerEntregaDetalle = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_ENTREGA_DETALLE_TODEVOLVER(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerEntregaDetalle:', error.message);
        throw { message: `Error en obtenerEntregaDetalle: ${error.message || ''}` }
    }
}

const obtenerDevolucionDetalle = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_DEVOLUCION_DETALLE_TONDC(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en obtenerDevolucionDetalle:', error.message);
        throw { message: `Error en obtenerDevolucionDetalle: ${error.message || ''}` }
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

const searchArticulos = async (itemName) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where (upper("ItemName") LIKE '%${itemName}%' or upper("ItemCode") LIKE '%${itemName}%') 
        and "ItmsGrpCod"=105
        order by "ItemName" limit 50`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en searchArticulos:', error.message);
        throw {
            message: `Error al procesar searchArticulos: ${error.message || ''}`
        }
    }
}

const searchClientes = async (itemName) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_clientes where (upper("CardName") LIKE '%${itemName}%' or upper("CardCode") LIKE '%${itemName}%') limit 50`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en searchClientes:', error.message);
        throw {
            message: `Error al procesar searchClientes: ${error.message || ''}`
        }
    }
}

const stockDisponiblePorSucursal = async (sucursal) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_inv_stock_disponible_sucursal(${sucursal})`
        console.log({ query })
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de stockDisponiblePorSucursal: ${error.message}`)
    }
}

const clientesBySucCode = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT 
        *
        FROM ${process.env.PRD}.IFA_DM_CLIENTES `
        console.log({ query })
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de clientesBySucCode: ${error.message}`)
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
        console.log({ query })
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de getClienteByCardCode: ${error.message}`)
    }
}

const devolucionLayout = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_DEVOLUCION_LAYOUT(${id})`;
        // const query = `call LAB_IFA_PRD.IFA_LAPP_VEN_DEVOLUCION_LAYOUT(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en devolucionLayout:', error.message);
        throw { message: `Error en devolucionLayout: ${error.message}`, error }
    }
}

const getDeudaDelCliente = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "CardCode", "Balance" from ${process.env.PRD}.ifa_dm_clientes where "CardCode"='${cardCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDeudaDelCliente:', error.message);
        throw { message: `Error en getDeudaDelCliente: ${error.message}`, error }
    }
}

const getDeudaDelClienteFactura = async (cardCode, docNum, docDate) => {
  try {
    // Definimos la query con placeholders "?"
    const query = `CALL ${process.env.PRD}.IFASP_SAL_GET_BALANCE_FROM_INVOICE(?, ?, ?)`;

    // Pasamos los valores que recibimos como parámetros
    const params = [cardCode, docNum, docDate];

    console.log({ query, params });

    const result = await executeQueryParamsWithConnection(query, params);
    return result;

  } catch (error) {
    console.error('Error en getDeudaDelClienteFactura:', error.message);
    throw { message: `Error en getDeudaDelClienteFactura: ${error.message}`, error };
  }
};


const findCliente = async (buscar) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes 
        where "CardCode" LIKE '%${buscar}%' OR "CardName" LIKE '%${buscar}%'
        limit 50`;
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

const findClienteInstituciones = async (buscar) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_dm_clientes 
        where "GroupCode"=105 and ("CardCode" LIKE '%${buscar}%' OR "CardName" LIKE '%${buscar}%')
        limit 50`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en findClienteInstituciones:', error);
        throw {
            status: 400,
            message: `Error en findClienteInstituciones: ${error.message || ''}`
        }
    }
}

const getAlmacenesSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "WhsCode", "WhsName", "SucCode" from ${process.env.PRD}.IFA_DM_ALMACENES`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getAlmacenesSucursal: ${error.message}`)
    }
}

const getStockdeItemAlmacen = async (itemCode, whsCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_INV_INVENTARIO_STOCK where "ItemCode" = '${itemCode}' and "WhsCode"='${whsCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getStockdeItemAlmacen:', error.message);
        throw { message: `Error en getStockdeItemAlmacen: ${error.message}`, error }
    }
}

const getLineaArticulo = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "LineItemName", "LineItemCode" from ${process.env.PRD}.ifa_dm_articulos where "ItemCode"='${itemCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getLineaArticulo:', error.message);
        throw {
            message: `Error al procesar getLineaArticulo: ${error.message || ''}`
        }
    }
}

// const articuloDiccionario= async (itemCode) => {
//     try {
//         if (!connection) {
//             await connectHANA();
//         }
//         const query = `
//         select 
//         ITEMCODE, 
//         dmArt."ItemName" as ItemNamePrincipal, 
//         ITEMEQ, 
//         dmArt2."ItemName" as ItemNameEquivalente,
//         ISACTIVE 
//         from ${process.env.LAPP}.LAPP_HABILITACION_DICCIONARIO as hd
//         join ${process.env.PRD}.IFA_DM_ARTICULOS dmArt on hd.ITEMCODE = dmArt."ItemCode" 
//         join ${process.env.PRD}.IFA_DM_ARTICULOS dmArt2 on hd.ITEMEQ = dmArt2."ItemCode" 
//         `;
//         console.log({ query })
//         const result = await executeQuery(query)
//         return result
//     } catch (error) {
//         console.error('Error en articuloDiccionario:', error.message);
//         throw { 
//             message: `Error al procesar articuloDiccionario: ${error.message || ''}` 
//         }
//     }
// }

const articuloDiccionario = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_ARTICULOS_DICCIONARIO_HABILITACION ORDER BY "ItemCode"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en articuloDiccionario:', error.message);
        throw {
            message: `Error al procesar articuloDiccionario: ${error.message || ''}`
        }
    }
}

const relacionArticulo = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_INV_HABILITACION_DICT('${itemCode}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en relacionArticulo:', error.message);
        throw {
            message: `Error al procesar relacionArticulo: ${error.message || ''}`
        }
    }
}

const articulos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "ItemCode","ItemName","SalUnitMsr","UomSinName","UserText" from ${process.env.PRD}.ifa_dm_articulos WHERE "validFor" = 'Y' AND "ItmsGrpCod" = 105`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en articulos:', error.message);
        throw {
            message: `Error al procesar articulos: ${error.message || ''}`
        }
    }
}

const saveDiccionario = async (relaciones) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        for (const relacion of relaciones) {
            const query = `
          CALL "LAB_IFA_LAPP"."LAPP_SAVE_DICCIONARIO"('${relacion.desdeCode}', '${relacion.haciaCode}')
        `;
            console.log(`Ejecutando: ${query}`);
            await executeQuery(query);
        }

        return { mensaje: `${relaciones.length} relaciones guardadas correctamente.` };

    } catch (error) {
        console.error('Error en saveDiccionario:', error.message);
        throw {
            message: `Error al procesar el diccionario: ${error.message || ''}`
        };
    }
}

const tipoSolicitud = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "FldValue", "Descr" from ${process.env.PRD}.ufd1 where "TableID" = 'OWTR' and "FieldID" = 115`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en tipoSolicitud:', error.message);
        throw {
            message: `Error al procesar tipoSolicitud: ${error.message || ''}`
        }
    }
}

const costoComercialByItemCode = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "ComlPriceAct" from ${process.env.PRD}.ifa_dm_articulos where "ItemCode" = '${itemCode}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en costoComercialByItemCode:', error.message);
        throw {
            message: `Error al procesar costoComercialByItemCode: ${error.message || ''}`
        }
    }
}

const tipoCliente = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "GroupCode","GroupName" from ${process.env.PRD}.ifa_dm_tipos`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en tipoCliente:', error.message);
        throw {
            message: `Error al procesar tipoCliente: ${error.message || ''}`
        }
    }
}

const solicitudesPendiente = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_obtener_traslados_solicitud_pendientes_por_sucursal(${sucCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en solicitudesPendiente:', error.message);
        throw {
            message: `Error al procesar solicitudesPendiente: ${error.message || ''}`
        }
    }
}

const todasSolicitudesPendiente = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_obtener_todos_traslados_solicitud_pendientes`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en todasSolicitudesPendiente:', error.message);
        throw {
            message: `Error al procesar todasSolicitudesPendiente: ${error.message || ''}`
        }
    }
}

const detalleSolicitudPendiente = async (docEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_obtener_traslados_solicitud_detalle_por_id_para_traslado(${docEntry})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en detalleSolicitudPendiente:', error.message);
        throw {
            message: `Error al procesar detalleSolicitudPendiente: ${error.message || ''}`
        }
    }
}

const reporteDevolucionValorados = async (fechaIni, fechaFin, user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        let query
        if (!fechaIni && !fechaFin) {
            // query = `select * from ${process.env.PRD}.ifa_dev_valorados where "UserID"=${user}`;
            query = `select * from ${process.env.PRD}.ifa_dev_valorados `;
        } else {
            // query = `select * from ${process.env.PRD}.ifa_dev_valorados where "UserID"=${user} and "CreateDate" between '${fechaIni}' and '${fechaFin}'`;
            query = `select * from ${process.env.PRD}.ifa_dev_valorados where "CreateDate" between '${fechaIni}' and '${fechaFin}'`;
        }

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en reporteDevolucionValorados:', error.message);
        throw {
            message: `Error al procesar reporteDevolucionValorados: ${error.message || ''}`
        }
    }
}

const reporteDevolucionCambios = async (fechaIni, fechaFin, user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        let query
        if (!fechaIni && !fechaFin) {
            query = `select * from ${process.env.PRD}.ifa_dev_cambios`;
        } else {
            query = `select * from ${process.env.PRD}.ifa_dev_cambios WHERE "CreateDate" between '${fechaIni}' and '${fechaFin}'`;
            // query = `select * from ${process.env.PRD}.ifa_dev_cambios where "UserID"=${user} and "CreateDate" between '${fechaIni}' and '${fechaFin}'`;
        }
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en reporteDevolucionCambios:', error.message);
        throw {
            message: `Error al procesar reporteDevolucionCambios: ${error.message || ''}`
        }
    }
}

const reporteDevolucionRefacturacion = async (fechaIni, fechaFin, user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        let query
        if (!fechaIni && !fechaFin)
            query = `select * from ${process.env.PRD}.ifa_dev_refacturaciones`;
        else
            query = `select * from ${process.env.PRD}.ifa_dev_refacturaciones WHERE "DocDate" between '${fechaIni}' and '${fechaFin}'`;
        // query = `select * from ${process.env.PRD}.ifa_dev_refacturaciones where "UserID"=${user} and "DocDate" between '${fechaIni}' and '${fechaFin}'`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en reporteDevolucionRefacturacion:', error.message);
        throw {
            message: `Error al procesar reporteDevolucionRefacturacion: ${error.message || ''}`
        }
    }
}

const getEntregasParaCancelar = async (id_user, fechaIni, fechaFin) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = ` select * from ${process.env.PRD}.ODLN where "DocEntry" in (72669, 72667)`
        const query = `
        select 
            t0."U_UserCode", t0."DocEntry", t0."DocNum", t1."TrgetEntry", t1."TargetType", t0."DocStatus", t0."CardCode", t0."CardName", t0."Comments", t0."DocDate", t0."DocTime", t0."DocTotal",
            t1."ItemCode", t1."Dscription", t1."Quantity", t1."GTotal" "Total"
        from ${process.env.PRD}.ODLN t0
        join ${process.env.PRD}.dln1 t1 on t1."DocEntry"= t0."DocEntry"
        where t0."CANCELED" = 'N' and t0."U_UserCode"='${id_user}'
        AND t0."DocDate" BETWEEN '${fechaIni}' and '${fechaFin}'
        order by t0."DocDate" desc, t0."DocTime" desc`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getEntregasParaCancelar:', error.message);
        throw {
            message: `Error al procesar getEntregasParaCancelar: ${error.message || ''}`
        }
    }
}

const getInvoice = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.oinv where "DocEntry"=487939`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getEntregasParaCancelar:', error.message);
        throw {
            message: `Error al procesar getEntregasParaCancelar: ${error.message || ''}`
        }
    }
}


/*
TargetType
14: CN
13: Invoice
16: Return
*/
const getDevolucionesParaCancelar = async (id_user, fechaIni, fechaFin) => {
    try {
        if (!connection) {
            await connectHANA();
        }//ADD_DAYS(CURRENT_DATE, -3) AND CURRENT_DATE
        const query = `select 
            t0."U_UserCode", t0."DocEntry", ndc."DocEntry" "TrgetEntry", rec."ReconNum", t0."DocNum", t0."CardCode", t0."CardName", t0."Comments", t0."DocDate", t0."DocTime", t0."DocTotal",
            case when t0."Comments" like 'CAMBIO X VENCIMIENTO%' 
            then 'Vencido' 
            when t0."Comments" like 'CAMBIO X MAL ESTADO%' 
            then 'Mal estado' 
            when t0."Comments" like 'CAMBIO X VALORADO%' 
            then 'Valorado'
            else 'Otro' 
            end "TransClass",
            t1."ItemCode", t1."Dscription", t1."Quantity", t1."GTotal" "Total"
        from ${process.env.PRD}.ORDN t0
        join ${process.env.PRD}.rdn1 t1 on t1."DocEntry"= t0."DocEntry"
        left join ${process.env.PRD}.orin ndc on (ndc."DocEntry" = t1."TrgetEntry" 
	        and t1."TargetType" = 14)
        left join ${process.env.PRD}.ojdt trans on (trans."TransType" = 14 and trans."BaseRef" = ndc."DocNum")
        left join ${process.env.PRD}.itr1 rec on rec."TransId"=trans."TransId"
        where t0."CANCELED" = 'N' and t0."U_UserCode"='${id_user}' 
        AND t0."DocDate" BETWEEN '${fechaIni}' and '${fechaFin}'
        order by t0."DocDate" desc, t0."DocTime" desc`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDevolucionesParaCancelar:', error.message);
        throw {
            message: `Error al procesar getDevolucionesParaCancelar: ${error.message || ''}`
        }
    }
}

const detalleTraslado = async (docEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_obtener_traslados_detalle_por_id(${docEntry})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en detalleTraslado:', error.message);
        throw {
            message: `Error al procesar detalleTraslado: ${error.message || ''}`
        }
    }
}

const selectionBatchPlazo = async (itemCode, whsCodeFrom, plazo) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_selection_batch_plazo('${itemCode}','${whsCodeFrom}',${plazo})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en selection_batch_plazo:', error.message);
        throw {
            message: `Error al procesar selection_batch_plazo: ${error.message || ''}`
        }
    }
}

const insertWorkFlowWithCheck = async (idSolicitud, tipoSolicitud, nombreProceso, username, idSap, ip, tipo, idTransito, tipoTransito, baseType, baseKey) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.LAPP}.INSERT_WORKFLOW_WITHCHECK('${idSolicitud}','${tipoSolicitud}','${nombreProceso}','${username}',${idSap},'${ip}','WEB','O','${tipo}','${idTransito}','${tipoTransito}','${baseType}','${baseKey}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en insertWorkFlowWithCheck:', error.message);
        throw {
            message: `Error al procesar insertWorkFlowWithCheck: ${error.message || ''}`
        }
    }
}

const getReconciliationIdByCN = async (id_CN) => {
    try {
        if (!connection) {
            await connectHANA();
        }//${process.env.PRD}
        const query = `call LAB_IFA_PRD.ifa_lapp_obtener_id_reconciliacion_por_id_ndc(${id_CN})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getReconciliationIdByCN:', error.message);
        throw {
            message: `Error al procesar getReconciliationIdByCN: ${error.message || ''}`
        }
    }
}

const procesoAbastecimiento = async (id_CN) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.LAPP}.PROCESO_ABASTECIMIENTO_STATUS`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en procesoAbastecimiento:', error.message);
        throw {
            message: `Error al procesar procesoAbastecimiento: ${error.message || ''}`
        }
    }
}

const datosRecepcionTraslado = async (docEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_obtener_traslados_detalle_por_id(${docEntry})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en datosRecepcionTraslado:', error.message);
        throw {
            message: `Error al procesar datosRecepcionTraslado: ${error.message || ''}`
        }
    }
}

const entregasClienteDespachadorCabecera = async (cardCode, skip, limit, search, fecha) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        let fechaPass = null;
        if (fecha && fecha !== 'undefined' && fecha !== null) {
            fechaPass = `'${fecha}'`;
        }

        const query = `call ${process.env.PRD}.IFA_LAPP_ENTREGAS_POR_CLIENTE_CABECERA('${cardCode}', ${skip}, ${limit}, '${search}',  ${fechaPass})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en entregasClienteDespachador:', error.message);
        throw {
            message: `Error al procesar entregasClienteDespachador: ${error.message || ''}`
        }
    }
}

const entregasClienteDespachadorDetalle = async (docEntry, skip, limit, search) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_ENTREGAS_POR_CLIENTE_DETALLE(${docEntry}, ${skip}, ${limit}, '${search}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en entregasClienteDespachadorDetalle:', error.message);
        throw {
            message: `Error al procesar entregasClienteDespachadorDetalle: ${error.message || ''}`
        }
    }
}


const updateOpenqtyTrasladoSolicitud = async (idTralado, LineTralado, itemcode, idSolicitud, LineSolicitud) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_sis_update_openqty_traslado_solicitud_segun_traslados(${idTralado},${LineTralado},'${itemcode}',${idSolicitud},${LineSolicitud})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en updateOpenqtyTrasladoSolicitud:', error.message);
        throw {
            message: `Error al procesar updateOpenqtyTrasladoSolicitud: ${error.message || ''}`
        }
    }
}

const ndcByDateRange = async (start, end, sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_GET_DEBIT_CREDIT_MEMOS_BY_DATE_RANGE('${start}','${end}',${sucCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en ndcByDateRange:', error.message);
        throw {
            message: `Error al procesar ndcByDateRange: ${error.message || ''}`
        }
    }
}

const getAllWarehousePlantByParams = async (params) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFASP_MD_GET_ALL_WAREHOUSE_PLANT_BY_WHSPARAM('${params}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllWarehousePlantByParams:', error.message);
        throw {
            message: `Error al procesar getAllWarehousePlantByParams: ${error.message || ''}`
        }
    }
}

const getAllWarehouseCommercialByParams = async (params) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFASP_MD_GET_ALL_WAREHOUSE_COMMERCIAL_BY_WHSPARAM('${params}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllWarehouseCommercialByParams:', error.message);
        throw {
            message: `Error al procesar getAllWarehouseCommercialByParams: ${error.message || ''}`
        }
    }
}

const kardexPlant = async (start, end, whsCode, itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const whsCodeParams = formattParam(whsCode)
        const itemCodeParams = formattParam(itemCode)
        const query = `call ${process.env.PRD}.IFASP_INV_GET_KARDEX(
        i_dateini => '${start}',
	    i_datefin => '${end}',
	    i_whscode => ${whsCodeParams},
	    i_itemcode =>${itemCodeParams})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en kardexPlant:', error.message);
        throw {
            message: `Error al procesar kardexPlant: ${error.message || ''}`
        }
    }
}

const kardexCommercial = async (start, end, whsCode, itemCode, sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const whsCodeParams = formattParam(whsCode)
        const itemCodeParams = formattParam(itemCode)
        const query = `call ${process.env.PRD}.IFASP_INV_GET_KARDEX_COMMERCIAL(
        i_dateini => '${start}',
	    i_datefin => '${end}',
	    i_whscode => ${whsCodeParams},
	    i_itemcode =>${itemCodeParams},
        i_succode =>${sucCode})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en kardexCommercial:', error.message);
        throw {
            message: `Error al procesar kardexCommercial: ${error.message || ''}`
        }
    }
}

const habilitacionesPorIduser = async (iduser) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFASP_INV_CODE_CHANGE_PROCCES_STATUS_BY_USERID(${iduser})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en habilitacionesPorIduser:', error.message);
        throw {
            message: `Error al procesar habilitacionesPorIduser: ${error.message || ''}`
        }
    }
}

const getLotesExpDate = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFASP_GET_BRANCHES()`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getLotesExpDate:', error.message);
        throw {
            message: `Error al procesar getLotesExpDate: ${error.message || ''}`
        }
    }
}


const getValoradosPorIdSap = async (idSap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `CALL ${process.env.PRD}.IFASP_INV_GET_VALUED_INVENTORY_CHANGES_BY_USER(${idSap}) `;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getValoradosPorIdSap:', error.message);
        throw {
            message: `Error al procesar getValoradosPorIdSap: ${error.message || ''}`
        }
    }
}

const getReturnValuesProcess = async (idSap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `CALL ${process.env.PRD}.IFASP_SAL_GET_RETURN_VALUE_PROCESS(${idSap}) `;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getReturnValuesProcess:', error.message);
        throw {
            message: `Error al procesar getReturnValuesProcess: ${error.message || ''}`
        }
    }
}


const getDetailsDocuments = async (DocEntry, DocType) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `CALL ${process.env.PRD}.IFASP_GET_DOCUMENT_DETAILS('${DocEntry}','${DocType}') `;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDetailsDocuments:', error.message);
        throw {
            message: `Error al procesar getDetailsDocuments: ${error.message || ''}`
        }
    }
}


const getInvoiceByDocNum = async (DocNum) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `SELECT * FROM ${process.env.PRD}.OINV WHERE "DocNum" = ${DocNum} `;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getDetailsDocuments:', error.message);
        throw {
            message: `Error al procesar getDetailsDocuments: ${error.message || ''}`
        }
    }
}

const actualizarPrecioProducto = async (CardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        query = `CALL  ${process.env.PRD}.IFASP_SIS_UPDATE_STOCK_PRICE_AVG('${CardCode}') `;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en actualizarPrecioProducto:', error.message);
        throw {
            message: `Error al procesar actualizarPrecioProducto: ${error.message || ''}`
        }
    }
}

module.exports = {
    clientesPorDimensionUno,
    almacenesPorDimensionUno,
    inventarioHabilitacion,
    inventarioValorado,
    descripcionArticulo,
    fechaVencLote,
    stockDisponible,
    inventarioHabilitacionDict,
    entregaDetallerFactura,
    stockDisponibleIfavet,
    facturasClienteLoteItemCode,
    detalleVentas,
    detalleParaDevolucion,
    obtenerEntregaDetalle,
    obtenerDevolucionDetalle,
    getAllAlmacenes,
    entregaDetalleToProsin,
    pedidoDetallerFactura,
    searchArticulos,
    facturasClienteLoteItemCodeGenesis,
    stockDisponiblePorSucursal,
    clientesBySucCode,
    getClienteByCardCode,
    devolucionLayout,
    getDeudaDelCliente,
    findCliente, findClienteInstituciones,
    getAlmacenesSucursal,
    getStockdeItemAlmacen,
    getLineaArticulo,
    relacionArticulo,
    articuloDiccionario,
    articulos,
    saveDiccionario,
    tipoSolicitud,
    costoComercialByItemCode,
    tipoCliente,
    solicitudesPendiente,
    detalleSolicitudPendiente,
    reporteDevolucionValorados,
    searchClientes,
    reporteDevolucionCambios,
    reporteDevolucionRefacturacion,
    getEntregasParaCancelar,
    getDevolucionesParaCancelar, getInvoice, getReconciliationIdByCN,
    detalleTraslado,
    insertWorkFlowWithCheck,
    selectionBatchPlazo,
    procesoAbastecimiento,
    datosRecepcionTraslado,
    updateOpenqtyTrasladoSolicitud,
    entregasClienteDespachadorCabecera,
    entregasClienteDespachadorDetalle,
    todasSolicitudesPendiente,
    ndcByDateRange,
    getAllWarehousePlantByParams,
    kardexPlant,
    getAllWarehouseCommercialByParams,
    kardexCommercial,
    habilitacionesPorIduser,
    getValoradosPorIdSap,
    getReturnValuesProcess,
    getLotesExpDate,
    getDetailsDocuments,
    getInvoiceByDocNum,
    getDeudaDelClienteFactura,
    actualizarPrecioProducto
}