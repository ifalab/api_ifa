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
        const query = `select "ItemName" from ${process.env.PRD}.oitm where "ItemCode" = '${itemCode}'`
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
        const query = `call ${process.env.PRD}.IFA_FAC_FACTURAS_X_CLIENTE_LOTE_ARTICULO('${itemcode}','${cardCode}',${batchNum})`
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
        // const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_detalle_para_devolucion(${docEntry})`
        const query = `call LAB_IFA_PRD.ifa_lapp_ven_obtener_detalle_para_devolucion(${docEntry})`
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
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getAllAlmacenes ${error.message}`)
    }
}

const searchArticulos= async (itemName) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where (upper("ItemName") LIKE '%${itemName}%' or upper("ItemCode") LIKE '%${itemName}%') order by "ItemName" limit 15`;
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

const stockDisponiblePorSucursal = async (sucursal) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_inv_stock_disponible_sucursal('${sucursal}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error de stockDisponiblePorSucursal: ${error.message}`)
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
    stockDisponiblePorSucursal
}