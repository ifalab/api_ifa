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

const findDescuentosArticulos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_VM_DESCUENTOS_POR_ARTICULO`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: findDescuentosArticulos');
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

const moraCliente = async(cardCode)=>{
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

const clientesMora = async()=>{
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

const listaPrecioOficial = async(cardCode)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_ven_catalogo_vm('${cardCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: listaPrecioOficial');
    }
}

const pedidoSugeridoXZona = async(zoneCode, cardCode)=>{
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

const pedidoSugeridoXCliente = async(cardCode)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_pedido_sugerido_by_cliente('${cardCode}')`
        console.log({ query })
        const sugeridos = await executeQuery(query)
        console.log({sugeridos})
        return {sugeridos, query}
    } catch (error) {
        // console.log({ error })
        throw new Error(error.message);
    }
}

const findZonasXVendedor = async(id_vendedor_sap)=>{
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

const pedidosPorVendedorPendientes = async(id)=>{
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

const pedidosPorVendedorFacturados = async(id)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_pedidos_por_vendedor_facturado(${id})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: pedidosPorVendedorFacturados');
    }
}

const pedidosPorVendedorAnulados = async(id)=>{
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
        return {result, query}
    } catch (error) {
        console.error('Error en pedido layout:', error.message);
        throw new Error(`Error en pedido layout ${error.message}`);
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
    pedidoLayout
}
