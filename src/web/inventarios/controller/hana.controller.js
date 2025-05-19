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
        const query = `select "U_COSTO_COML" from ${process.env.PRD}.oitm where "ItemCode" = '${itemCode}'`;
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

const reporteDevolucionValorados = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dev_valorados`;
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

const reporteDevolucionCambios = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dev_cambios_detalle`;//
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

const reporteDevolucionRefacturacion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dev_refacturaciones`;
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

const getEntregasParaCancelar = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = ` select * from ${process.env.PRD}.ODLN where "DocEntry" in (72669, 72667)`
        const query = `
        select 
            t0."U_UserCode", t0."DocEntry", t0."DocNum", t1."TrgetEntry", t0."DocStatus", t0."CardCode", t0."CardName", t0."Comments", t0."DocDate", t0."DocTime", t0."DocTotal",
            t1."ItemCode", t1."Dscription", t1."Quantity", t1."GTotal" "Total"
        from ${process.env.PRD}.ODLN t0
        join ${process.env.PRD}.dln1 t1 on t1."DocEntry"= t0."DocEntry"
        where t0."CANCELED" = 'N' and t0."U_UserCode"='${id_user}' 
        AND t0."DocDate" BETWEEN ADD_DAYS(CURRENT_DATE, -5) AND CURRENT_DATE
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

//TODO: obtain the reconciliation id
const getDevolucionesParaCancelar = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select 
            t0."U_UserCode", t0."DocEntry", ndc."DocEntry" "TrgetEntry", t0."DocNum", t0."CardCode", t0."CardName", t0."Comments", t0."DocDate", t0."DocTime", t0."DocTotal",
            t1."ItemCode", t1."Dscription", t1."Quantity", t1."GTotal" "Total"
        from ${process.env.PRD}.ORDN t0
        join ${process.env.PRD}.rdn1 t1 on t1."DocEntry"= t0."DocEntry"
        left join ${process.env.PRD}.orin ndc on (ndc."DocEntry" = t1."TrgetEntry" 
	        and t1."TargetType" = 14) 
        where t0."CANCELED" = 'N' and t0."U_UserCode"='${id_user}' 
        AND t0."DocDate" BETWEEN ADD_DAYS(CURRENT_DATE, -5) AND CURRENT_DATE
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
    reporteDevolucionRefacturacion, getEntregasParaCancelar, getDevolucionesParaCancelar
}