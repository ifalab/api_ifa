const hana = require('@sap/hana-client');
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
    console.log(query)
    return new Promise((resolve, reject) => {
        connection.exec(query, (err, result) => {
            if (err) {
                console.log('error en la consulta:', err.message)
                reject(new Error(`error en la consulta: ${err.message}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);
            }
        })
    })
}

const ventaPorSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes}
        );
        
        `

        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: ventaPorSucursal');
    }
}

const ventasNormales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 100
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasNormales:', error.message);
        throw new Error('Error al procesar la solicitud: ventasNormales');
    }
}

const ventasCadena = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 104
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasCadena:', error.message);
        throw new Error('Error al procesar la solicitud: ventasCadena');
    }
}

const ventasInstitucion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 105
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasInstitucion:', error.message);
        throw new Error('Error al procesar la solicitud: ventasInstitucion');
    }
}

const ventasIfaVet = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 108
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasIfaVet:', error.message);
        throw new Error('Error al procesar la solicitud: ventasIfaVet');
    }
}

const ventasMasivo = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 107
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasMasivo:', error.message);
        throw new Error('Error al procesar la solicitud: ventasMasivo');
    }
}

const ventasUsuario = async (userCode, dim1, dim2, dim3, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        /*const query = `call "LAB_IFA_PRD".IFA_LAPP_VEN_DETALLADAS_X_AUTH('${userCode}','${dim1}','${dim2}','${dim3}',${groupBy})`*/
        const query = `call LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_USER_AND_DIM_A_B_C('${userCode}','${dim1}','${dim2}','${dim3}')`

        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasUsuario:', error.message);
        throw new Error('Error al procesar la solicitud: ventasUsuario');
    }
}


const ventaPorSucursalMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes}
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: ventaPorSucursal');
    }
}

const ventasNormalesMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 100
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasNormales:', error.message);
        throw new Error('Error al procesar la solicitud: ventasNormales');
    }
}

const ventasCadenaMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 104
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasCadena:', error.message);
        throw new Error('Error al procesar la solicitud: ventasCadena');
    }
}

const ventasInstitucionMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 105
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasInstitucion:', error.message);
        throw new Error('Error al procesar la solicitud: ventasInstitucion');
    }
}

const ventasIfaVetMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 108
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasIfaVet:', error.message);
        throw new Error('Error al procesar la solicitud: ventasIfaVet');
    }
}

const ventasMasivoMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();


        const query = `
        CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_DIM_A_BY_PERIOD_AND_DIMB(
            i_year  => ${anho},
            i_month => ${mes},
            i_dimensionb => 107
        );
        
        `
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasMasivo:', error.message);
        throw new Error('Error al procesar la solicitud: ventasMasivo');
    }
}

const ventasPorSupervisor = async (userCode, dim1, dim2, dim3, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `call "LAB_IFA_PRD".IFA_LAPP_VEN_DETALLADAS_X_ZONA_X_AUTH('${userCode}','${dim1}','${dim2}','${dim3}',${groupBy})`

        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasUsuario:', error.message);
        throw new Error(`Error al procesar ventasPorSupervisor: ${error.message}`);
    }
}

const ventasPorZonasVendedor = async (username, line, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_LAPP".LAPP_VEN_VENTAS_ZONA('${username}','${line}','${groupBy}');`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en ventas por zona: ', err.message);
        throw new Error(`Error al procesar la solicitud ventasPorZonasVendedor: ${err.message}`);
    }
}

const ventasHistoricoSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_SEMESTRAL('','')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasHistoricoSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: ventasHistoricoSucursal');
    }
}

const ventasHistoricoNormales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_SEMESTRAL('','NORMALES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasHistoricoNormales:', error.message);
        throw new Error('Error al procesar la solicitud: ventasHistoricoNormales');
    }
}

const ventasHistoricoCadenas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_SEMESTRAL('','CADENAS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasHistoricoCadenas:', error.message);
        throw new Error('Error al procesar la solicitud: ventasHistoricoCadenas');
    }
}

const ventasHistoricoInstituciones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_SEMESTRAL('','INSTITUCIONES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasHistoricoInstituciones:', error.message);
        throw new Error('Error al procesar la solicitud: ventasHistoricoInstituciones');
    }
}

const ventasHistoricoMasivos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_SEMESTRAL('','MASIVOS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasHistoricoMasivos:', error.message);
        throw new Error('Error al procesar la solicitud: ventasHistoricoMasivos');
    }
}

const ventasHistoricoIfaVet = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_SEMESTRAL('','IFAVET')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en ventasIfaVet:', error.message);
        throw new Error('Error al procesar la solicitud: ventasIfaVet');
    }
}

const ventasPorZonasVendedorMesAnt = async (username, line, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_LAPP".LAPP_VEN_VENTAS_ZONA_ANT(${username},'${line}','${groupBy}');`;
        return await executeQuery(query);
    } catch (err) {
        console.log({ error })
        return {
            error: `No se pudieron traer las ventas por zonas del mes anterior , el vendedor es ${username}`
        }
    }
}

const marcarAsistencia = async (id_vendedor_sap, fecha, hora, mensaje, lat, lon) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_LAPP.LAPP_MARCAR_ASISTENCIA(${id_vendedor_sap},'${fecha}','${hora}', '${mensaje}','${lat}','${lon}')`;
        console.log({ query })
        const response = await executeQuery(query);

        return { response, query }
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en marcar asistencia: ${err.message}`);
    }
}

const marcarAsistenciaFueraDeRuta = async (id_vendedor_sap, nombre_vendedor,  fecha, hora, mensaje, lat, lon) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.IFA_CRM_AGREGAR_VISIT_HEADER(${id_vendedor_sap},'${nombre_vendedor}', '' , '' , 0, 0,'${fecha}','${hora}', 1,'${mensaje}','${lon}' ,'${lat}', '',  0)`;
        console.log({ query })
        const response = await executeQuery(query);

        return { response, query }
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en marcar asistencia: ${err.message}`);
    }
}

const getAsistenciasVendedor = async (id_vendedor_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_LAPP.LAPP_LISTA_ASISTENCIA(${id_vendedor_sap})`;
        console.log({ query })
        const response = await executeQuery(query);

        return { response, query }
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en obtener asistencia: ${err.message}`);
    }
}

const listaAsistenciaDia = async (fecha, id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_LAPP.LAPP_ASISTENCIA_DIA('${fecha}',${id})`;
        console.log({ query })
        const response = await executeQuery(query);

        return { response, query }
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en obtener listaAsistenciaDia: ${err.message}`);
    }
}

const pruebaaaBatch = async (articulo, almacen, cantidad) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_PRD.IFA_VM_SELECTION_BATCH_FEFO_TEST('${articulo}','${almacen}', ${cantidad})`;
        console.log({ query })
        const response = await executeQuery(query);

        return response
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en prueba batch: ${err.message}`);
    }
}

const prueba2Batch = async (articulo, alm) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select a."ItemCode", b."NumInSale" , a."OnHand", a."WhsCode" from lab_ifa_prd.oitw a left join lab_ifa_prd.oitm b on a."ItemCode" = b."ItemCode" where a."ItemCode" ='${articulo}' and a."WhsCode" = '${alm}'`;
        console.log({ query })
        const response = await executeQuery(query);

        return response
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en prueba batch: ${err.message}`);
    }
}

const prueba3Batch = async (articulo, alm) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "ItemCode", "WhsCode", "BatchNum","ExpDate","Quantity" from lab_ifa_prd.oibt where "ItemCode" ='${articulo}' and "WhsCode" = '${alm}' order by "ExpDate" asc`;
        console.log({ query })
        const response = await executeQuery(query);

        return response
    } catch (err) {
        console.log({ err })
        throw new Error(`Error en prueba batch: ${err.message}`);
    }
}

const listaAlmacenes = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_PRD.IFA_LAPP_VEN_ALMACENES_POR_SUCURSAL(${sucCode})`;
        console.log({ query })
        const response = await executeQuery(query);
        return response
    } catch (error) {
        console.log({ err })
        throw new Error(`Error en prueba batch: ${err.message}`);
    }
}

const ofertaPrecioPorItemCode = async (nroLista, itemCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.DBSAPPRD}.ifa_lapp_ven_precio_por_articulo_y_lista(${nroLista},'${itemCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        throw new Error('Error en la consulta: ', error)
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
        throw new Error(`Error en descripcionArticulo: ${error.message}`)
    }
}

const obtenerOfertas = async (sucCode, codCliente) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_obtener_ofertas(${sucCode}, '${codCliente}')`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en obtenerOfertas: ${error.message || ''}`
        }
    }
}

const detalleOfertaCadena = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_OFERTA_DETALLE(${id})`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en detalleOfertaCadena: ${error.message || ''}`
        }
    }
}

const detalleOfertaPendCadena = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OBTENER_OFERTA_DETALLE_PENDIENTE(${id})`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en detalleOfertaCadena: ${error.message || ''}`
        }
    }
}

const detalleOferta = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_ven_ofertas_detalle where "DocEntry"=${id} order by "LineNum"`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en detalleOferta: ${error.message || ''}`
        }
    }
}

const unidadMedida = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "SalUnitMsr" from ${process.env.PRD}.oitm where "ItemCode"='${itemCode}'`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en descripcionArticulo: ${error.message}`)
    }
}

const listaArticuloCadenas = async (cardCode, listNum) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ven_catalogo_cadenas('${cardCode}',${listNum})`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en listaArticuloCadenas: ${error.message}`)
    }
}

const clientesInstituciones = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_clientes where "GroupCode"=105 OR "GroupCode"=106 `
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en clientesInstituciones: ${error.message || ''}`)
    }
}

const clientesInstitucionByCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        // const query = `CALL ${process.env.PRD}.CLIENTE_INSTITUCION_BY_CARDCODE('${cardCode}')`
        const query = `select * from ${process.env.PRD}.ifa_dm_clientes where "CardCode"='${cardCode}'`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en clientesInstitucionByCardCode: ${error.message}`)
    }
}

const vendedoresPorSucursal = async (suc) => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const query = `CALL ${process.env.PRD}.IFA_DM_VENDEDORES_POR_SUCURSAL('${suc}')`
        const result = executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en vendedoresPorSucursal: ${error.message}`)
    }
}

const obtenerOfertasInstituciones = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_ven_ofertas where "GroupCode"=105`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en obtenerOfertasInstituciones: ${error.message || ''}`
        }
    }
}

const obtenerOfertasVendedores = async (id_sap) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_ven_ofertas where "SlpCode"='${id_sap}'`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en obtenerOfertasVendedores: ${error.message || ''}`
        }
    }
}

const obtenerPedidosDetalle = async (baseEntry) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_ven_pedidos_detalle where "BaseType" = 23 and "BaseEntry" = ${baseEntry} order by "DocEntry", "LineNum"`
        //group by "DocEntry"
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en obtenerPedidosDetalle: ${error.message || ''}`
        }
    }
}

const obtenerOfertasPorSucursal = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_ven_ofertas where "SucCode"=${sucCode}`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en obtenerOfertasPorSucursal: ${error.message || ''}`
        }
    }
}

const listaClienteEmpleado = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_CLIENTES WHERE "SucCode"= ${sucCode}`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en listaClienteEmpleado: ${error.message || ''}`
        }
    }
}

const clienteEmpleado = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_CLIENTES WHERE "CardCode"= '${cardCode}'`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en ClienteEmpleado: ${error.message || ''}`
        }
    }
}

const obtenerArticulosVehiculo = async (cadena) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where "ItemCode" like '%IFA%' AND "SellItem"='Y' AND (upper("ItemName") like '%${cadena}%' OR upper("ItemCode") like '%${cadena}%')`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en obtenerArticulosVehiculo: ${error.message || ''}`
        }
    }
}

const searchVendedores = async (cadena) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_vendedores where "SlpName" like '%${cadena}%' or "SlpCode" like '%${cadena}%'`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en searchVendedores: ${error.message || ''}`
        }
    }
}

const searchVendedorByIDSAP = async (idSap) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_vendedores where "SlpCode" = ${idSap} `
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en searchVendedores: ${error.message || ''}`
        }
    }
}

const listaPrecioSuc = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_listas_precios_por_sucursal(${sucCode})`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en listaPrecioSuc: ${error.message || ''}`
        }
    }
}

const listaPrecioInst = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_listas_de_precios where "ListName" like '%LISTA INS%'`
        console.log({ query })
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en listaPrecioInst: ${error.message || ''}`
        }
    }
}

const ventasPedidoPorVendedor = async (slpCode, starDate, endDate) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.ifa_ven_pedidos WHERE "SlpCode" = ${slpCode} AND "DocDate" BETWEEN '${starDate}' AND '${endDate}';`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en ventasPedidoPorVendedor: ${error.message || ''}`
        }
    }
}
const cantidadVentasPorZonasVendedor = async (username, line, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_LAPP".LAPP_VEN_VENTAS_ZONA(${username},'${line}','${groupBy}');`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en cantidadVentasPorZonasVendedor: ', err.message);
        throw new Error(`Error al procesar la solicitud cantidadVentasPorZonasVendedor: ${err.message}`);
    }
}

const cantidadVentasPorZonasMesAnt = async (username, line, groupBy) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_LAPP".LAPP_VEN_VENTAS_ZONA_ANT(${username},'${line}','${groupBy}');`;
        return await executeQuery(query);
    } catch (err) {
        console.log({ err })
        throw new Error(`Error al procesar la solicitud cantidadVentasPorZonasMesAnt: ${err.message}`);
    }
}

const insertarUbicacionCliente = async (cliente, latitud, longitud, id_sap) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `insert into LAB_IFA_LAPP.LAPP_UBICACION_CLIENTE (id_vendedor_sap, card_code, latitud, longitud) values (${id_sap}, '${cliente}', ${latitud}, ${longitud})`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en insertarUbicacionCliente: ${error.message || ''}`
        }
    }
}

const obtenerClientesSinUbicacion = async (codVendedor) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_lapp_clientes_para_ubicacion_by_vendedor(${codVendedor})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en obtenerClientesSinUbicacion: ${error.message || ''}`
        }
    }
}

const clienteByVendedor = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_CLIENTES WHERE "SucCode"=${sucCode}`;
        return await executeQuery(query);
    } catch (err) {
        console.log({ err })
        throw new Error(`Error al procesar la solicitud clienteByVendedor: ${err.message}`);
    }
}

const lineas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_LINEAS`;
        return await executeQuery(query);
    } catch (err) {
        console.log({ err })
        throw new Error(`Error al procesar la solicitud lineas: ${err.message}`);
    }
}

const sublineas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_SUBLINEAS`;
        console.log({ query })
        return await executeQuery(query);
    } catch (err) {
        console.log({ err })
        throw new Error(`Error al procesar la solicitud sublineas: ${err.message}`);
    }
}

const analisisVentas = async (CardCode, DimensionCCode, starDate, endDate) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM LAB_IFA_DATA.kds_sales_analysis WHERE "CardCode" = '${CardCode}' AND "DimensionCCode" = ${DimensionCCode} AND "Date" BETWEEN '${starDate}' AND '${endDate}'`;
        return await executeQuery(query);
    } catch (err) {
        console.log({ err })
        throw new Error(`Error al procesar la solicitud lineas: ${err.message}`);
    }
}

const clienteByCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_CLIENTES WHERE "CardCode"='${cardCode}'`;
        return await executeQuery(query);
    } catch (err) {
        console.log({ err })
        throw new Error(`Error al procesar la solicitud clienteByCardCode: ${err.message}`);
    }
}

const getYTDByVendedor = async (codVendedor, tipo, linea, sublinea, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        /*
            ytd_by_vendedor(
                IN vendedorCode int,
                IN dim2 int,
                IN linea int,
                IN sublinea int,
                IN fechaInicio1 VARCHAR(8),
                IN fechaFin1 VARCHAR(8),
                IN fechaInicio2 VARCHAR(8),
                IN fechaFin2 VARCHAR(8)
            )
        */
        const query = `call LAB_IFA_DATA.ytd_by_vendedor(${codVendedor}, ${tipo}, ${linea}, ${sublinea},
        '${fechaInicio1}', '${fechaFin1}', '${fechaInicio2}', '${fechaFin2}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getYTDByVendedor: ${error.message || ''}`
        }
    }
}

const getYTDDelVendedor = async (sucCode, linea, sublinea, fechaInicio1, fechaFin1) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call LAB_IFA_DATA.ytd_of_vendedores_sucursal(${sucCode}, ${linea}, ${sublinea},
        '${fechaInicio1}', '${fechaFin1}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getYTDDelVendedor: ${error.message || ''}`
        }
    }
}

const clientesSinUbicacionSupervisor = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_CLIENTES WHERE "Longitude"='0' OR "Latitude"='0'`;
        return await executeQuery(query);
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud clienteByCardCode: ${error.message}`);
    }
}

const allCampaignFilter = async (idCampaign, agrupar, codAgencia, codVendedor, codLinea) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_analisis_campanha(${idCampaign},${agrupar},${codAgencia},${codVendedor},${codLinea})`;
        return await executeQuery(query);
    } catch (error) {
        console.log({ error })
        throw new Error(`Error al procesar la solicitud allCampaignFilter: ${error.message}`);
    }
}

const getYTDMontoByVendedor = async (codVendedor, tipo, linea, sublinea, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call LAB_IFA_DATA.ytd_monto_by_vendedor(${codVendedor}, ${tipo}, ${linea}, ${sublinea},
        '${fechaInicio1}', '${fechaFin1}', '${fechaInicio2}', '${fechaFin2}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getYTDMontoByVendedor: ${error.message || ''}`
        }
    }
}

const getYTDDelVendedorMonto = async (sucCode, linea, sublinea, fechaInicio1, fechaFin1) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call LAB_IFA_DATA.ytd_monto_of_vendedores_sucursal(${sucCode}, ${linea}, ${sublinea},
        '${fechaInicio1}', '${fechaFin1}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getYTDDelVendedorMonto: ${error.message || ''}`
        }
    }
}

const reporteOfertaPDF = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_VEN_OFERTA_LAYOUT(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getYTDDelVendedorMonto: ${error.message || ''}`
        }
    }
}

const getCoberturaVendedor = async (idVendedor, mes, año) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_COBERTURA_BY_VENDEDOR(${idVendedor}, ${mes}, ${año})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getCoberturaVendedor: ${error.message || ''}`
        }
    }
}

const getCobertura = async (sucCode, mes, año) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_COBERTURA(${sucCode},${mes}, ${año})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getCobertura: ${error.message || ''}`
        }
    }
}

const clientesNoVenta = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_CLIENTES_NO_VENTA(${sucCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesNoVenta: ${error.message || ''}`
        }
    }
}

const clientesNoVentaPorVendedor = async (vendedorCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_CLIENTES_NO_VENTA_POR_VENDEDOR(${vendedorCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesNoVentaPorVendedor: ${error.message || ''}`
        }
    }
}

const vendedoresAsignedWithClientsBySucursal = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_LAPP_VENDEDORES_QUE_TIENEN_CLIENTES_POR_SUC(${sucCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en vendedoresAsignedWithClientsBySucursal: ${error.message || ''}`
        }
    }
}

const clientesConMora = async (sucCode, slpCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_clientes_mora_by_sucode_slpcode(${sucCode},${slpCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesConMora: ${error.message || ''}`
        }
    }
}

const facturasMoraByClients = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_facturas_mora_by_cliente('${cardCode}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en facturasMoraByClients: ${error.message || ''}`
        }
    }
}

const vendedorPorSucCode = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_vendedores where "SucCode" = ${sucCode} AND "Rol" <> 'Despachador' and "SlpCode" in (SELECT ID_VENDEDOR_SAP FROM LAB_IFA_LAPP.LAPP_USUARIO)`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en vendedorPorSucCode: ${error.message || ''}`
        }
    }
}

createCampaign = async (name, descrip, sucCode, starDate, endDate) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.LAPP}.CREATE_CAMPAIGN('${name}','${descrip}',${sucCode},'${starDate}','${endDate}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en createCampaign: ${error.message || ''}`
        }
    }
}

createDetailsCampaign = async (id, zoneCode, itemCode, quantity) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.LAPP}.CREATE_DETAILSCAMPAIGN(${id},${zoneCode},'${itemCode}',${quantity})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en createDetailsCampaign: ${error.message || ''}`
        }
    }
}

bannedCampaign = async (id,) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.LAPP}.BANNED_CAMPAIGN(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en bannedCampaign: ${error.message || ''}`
        }
    }
}

allCampaign = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.LAPP}.lapp_campaign where lapp_campaign.ISACTIVE = TRUE`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en allCampaign: ${error.message || ''}`
        }
    }
}

oneDetailsCampaignById = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.LAPP}.LAPP_ONECAMPAIGN_BY_ID(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en oneDetailsCampaignById: ${error.message || ''}`
        }
    }
}

oneCampaignById = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.LAPP}.LAPP_CAMPAIGN WHERE ID = ${id} AND ISACTIVE = TRUE`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en oneDetailsCampaignById: ${error.message || ''}`
        }
    }
}

rollBackCampaignById = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `delete from ${process.env.LAPP}.lapp_campaign where ID = ${id} `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en rollBackCampaignById: ${error.message || ''}`
        }
    }
}

validateItem = async (itemCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_articulos where "ItemCode" = '${itemCode}' and "validFor" = 'Y'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en validateItem: ${error.message || ''}`
        }
    }
}

validateZona = async (zoneCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_zonas where "ZoneCode" = ${zoneCode}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en validateZona: ${error.message || ''}`
        }
    }
}

allAgencies = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_sucursales`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en allAgencies: ${error.message || ''}`
        }
    }
}



agencyBySucCode = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_sucursales where "SucCode" = ${sucCode}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en agencyBySucCode: ${error.message || ''}`
        }
    }
}

const reporteConUbicacionCliente = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.LAPP}.LAPP_CLIENTES_UBICACION_BY_SUCODE(${sucCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en reporteConUbicacionCliente: ${error.message || ''}`
        }
    }
}

const reporteSinUbicacionCliente = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.LAPP}.LAPP_CLIENTES_SIN_UBICACION_BY_SUCCODE(${sucCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en reporteSinUbicacionCliente: ${error.message || ''}`
        }
    }
}

const getClientName = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "CardName" from ${process.env.PRD}.ifa_dm_clientes where "CardCode" = '${cardCode}'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getClientName: ${error.message || ''}`
        }
    }
}

///Solicitud Descuentos
const agregarSolicitudDeDescuento = async (p_SlpCode, p_SlpName, p_ClientCode, p_ClientName,
    p_ItemCode, p_ItemName, p_CantMin, p_DescPrct, p_FechaIni, p_FechaFin, p_CreatedBy) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.ifa_crm_solicitar_descuento(${p_SlpCode}, 
        '${p_SlpName}', '${p_ClientCode}', '${p_ClientName}', '${p_ItemCode}', '${p_ItemName}', 
        ${p_CantMin}, ${p_DescPrct}, '${p_FechaIni}', '${p_FechaFin}', ${p_CreatedBy})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en agregarSolicitudDeDescuento: ${error.message || ''}`
        }
    }
}

const actualizarStatusSolicitudDescuento = async (id, status, p_CreatedBy, p_SlpCode, p_ClientCode, p_ItemCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_CRM_ACTUALIZAR_STATUS_SOLICITUD_DESCUENTO(
            ${id}, ${status}, ${p_CreatedBy}, ${p_SlpCode}, '${p_ClientCode}', '${p_ItemCode}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en actualizarStatusSolicitudDescuento: ${error.message || ''}`
        }
    }
}

const getVendedoresSolicitudDescuento = async (status) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "SlpCode", "SlpName"
        from ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO
        group by "SlpCode", "SlpName"`

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVendedoresSolicitudDescuento: ${error.message || ''}`
        }
    }
}

const getVendedoresSolicitudDescByStatus = async (status) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select "SlpCode", "SlpName", "Status"
        from ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO
        where "Status" = ${status} and "Deleted"=0
        group by "SlpCode", "SlpName", "Status"`

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVendedoresSolicitudDescByStatus: ${error.message || ''}`
        }
    }
}

const getVendedoresSolicitudDescByStatusSucursal = async (status, sucursal) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select t0."SlpCode", t0."SlpName", t0."Status", t1."SucCode"
        from ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO t0
        join ${process.env.PRD}.ifa_dm_vendedores t1 on t1."SlpCode" = t0."SlpCode"
        where t0."Status" = ${status} and t0."Deleted"=0 and t1."SucCode"=${sucursal}
        group by t0."SlpCode", t0."SlpName", t0."Status", t1."SucCode"`

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVendedoresSolicitudDescByStatusSucursal: ${error.message || ''}`
        }
    }
}

const getSolicitudesDescuentoByStatus = async (status, slpCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select *
            from ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO
            where  "Status" = ${status} and "SlpCode" = ${slpCode} 
            and "Deleted" = 0`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en actualizarStatusSolicitudDescuento: ${error.message || ''}`
        }
    }
}

const getSolicitudesDescuentoByVendedor = async (slpCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select *
            from ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO
            where "SlpCode" = ${slpCode} and "Deleted" = 0 
            order by "CreatedAt" desc, "StatusUpdatedAt" desc
            limit 50`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getSolicitudesDescuentoByVendedor: ${error.message || ''}`
        }
    }
}

const actualizarSolicitudDescuento = async (id, p_FechaIni, p_FechaFin, p_CantMin, p_DescPrct) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFA_CRM_EDITAR_SOLICITUD_DESCUENTO(
                ${id}, '${p_FechaIni}', '${p_FechaFin}', ${p_CantMin}, ${p_DescPrct}
            )`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en actualizarSolicitudDescuento: ${error.message || ''}`
        }
    }
}

const deleteSolicitudDescuento = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `UPDATE ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO 
                set "Deleted" = 1
                where "Id"=${id};`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en deleteSolicitudDescuento: ${error.message || ''}`
        }
    }
}


const getVentasPrespuestosSubLinea = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth() + 1;

        const query = `
            CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_ALL_DIMENSIONS_BY_PERIOD(
                i_year  => ${anho},
                i_month => ${mes}
            );
        `;

        const result = await executeQuery(query);
        return result;

    } catch (error) {
        throw {
            message: `Error en getVentasPrespuestosSubLinea: ${error.message || ''}`
        };
    }
};



const getVentasPrespuestosSubLineaAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }

        const now = new Date();
        const anho = now.getFullYear();
        const mes = now.getMonth();

        const query = `
            CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_ALL_DIMENSIONS_BY_PERIOD(
                i_year  => ${anho},
                i_month => ${mes}
            );
        `;

        const result = await executeQuery(query);
        return result;

    } catch (error) {
        throw {
            message: `Error en getVentasPrespuestosSubLineaAnterior: ${error.message || ''}`
        }
    }
}


const CREATETABLE = async (subscription) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `create column table ${process.env.PRD}."PUSH_SUBSCRIPTIONS" (
            "Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            "Subscription" NCLOB
        )`

        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en notificationSubscription: ${error.message || ''}`
        }
    }
}

const notificationSubscription = async (subscription) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `INSERT INTO ${process.env.PRD}.PUSH_SUBSCRIPTIONS ("Subscription") VALUES ('${subscription}')`

        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en notificationSubscription: ${error.message || ''}`
        }
    }
}

const notificationUnsubscribe = async (subscription) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `delete from ${process.env.PRD}.PUSH_SUBSCRIPTIONS 
        where TO_VARCHAR("Subscription") = TO_VARCHAR('${subscription}')`

        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en notificationUnsubscribe: ${error.message || ''}`
        }
    }
}

const getSubscriptions = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT "Subscription" FROM ${process.env.PRD}.PUSH_SUBSCRIPTIONS`

        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getSubscriptions: ${error.message || ''}`
        }
    }
}

const insertNotification = async (title, body, vendedor = -1, rol, created_at, usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }

        let query = `call ${process.env.PRD}.INSERTAR_NOTIFICACION('${title}','${body}', '${rol}',${vendedor},'${created_at}',${usuario})`
        const result = await executeQuery(query)
        return {
            status: 200,
            result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en insertNotification: ${error.message || ''}`
        }
    }
}

const getNotifications = async (vendedor = -1, usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        let query = `call ${process.env.PRD}.GET_NOTIFICATIONS(${vendedor}, ${usuario})`

        return await executeQuery(query)
    } catch (error) {
        throw {
            message: `Error en getNotifications: ${error.message || ''}`
        }
    }
}

const deleteNotification = async (id_notification, id_usuario) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        let query = `call ${process.env.PRD}.DELETE_NOTIFICATION(${id_notification},${id_usuario})`
        console.log(query)
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en deleteNotification: ${error.message || ''}`
        }
    }
}

const getVendedorByCode = async (code) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        let query = `select * from ${process.env.PRD}.ifa_dm_vendedores where "SlpCode"=${code}`
        console.log(query)
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVendedorByCode: ${error.message || ''}`
        }
    }
}

const getDescuentosDeVendedoresParaPedido = async (cliente, vendedor, fecha) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        let query = `select "ClientCode", "ItemCode", "CantMin", "DescPrct" 
        from ${process.env.PRD}.IFA_CRM_SOLICITUD_DESCUENTO 
        where '${fecha}' between "FechaIni" and "FechaFin" 
        and "ClientCode"='${cliente}' and "SlpCode"=${vendedor}
        and "Status"=2 and "Deleted"=0`
        console.log(query)
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getDescuentosDeVendedoresParaPedido: ${error.message || ''}`
        }
    }
}

const ventasPorZonasVendedor2 = async (year, month, slpCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_LINE_ZONE_SALES_BY_SELLER(
            i_year         => ${year},
            i_month        => ${month},
            i_slpcode => ${slpCode})`;
        console.log({ query })
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en ventas por zona: ', err.message);
        throw new Error(`Error al procesar la solicitud ventasPorZonasVendedor2: ${err.message}`);
    }
}

const ventasPorZonasVendedorMesAnt2 = async (userCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.LAPP_VEN_VENTAS_ZONA_ANT2(${userCode});`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en ventas por zona: ', err.message);
        throw new Error(`Error al procesar la solicitud ventasPorZonasVendedorMesAnt2: ${err.message}`);
    }
}


const getUbicacionClientesByVendedor = async (codVendedor) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_ubicacion_clientes_by_vendedor(${codVendedor})`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getUbicacionClientesByVendedor: ', err.message);
        throw new Error(`Error en getUbicacionClientesByVendedor: ${err.message}`);
    }
}

const getVentasZonaSupervisor = async (year, month, supCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `SELECT * FROM  LAB_IFA_LAPP.LAPP_VEN_VENTAS_ZONA_SUPERVISOR WHERE "SucCode" in (${sucursales})`;
        const query = `CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_BRANCH_SELLER_SALES_BY_SUPERVISOR(
    i_year         => ${year},
    i_month        => ${month},
    i_supervisorcode=>${supCode} );`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasZonaSupervisor: ', err.message);
        throw new Error(`Error en getVentasZonaSupervisor: ${err.message}`);
    }
}

const getVentasZonaAntSupervisor = async (sucursales) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM  LAB_IFA_LAPP.LAPP_VEN_VENTAS_ZONA_ANT_SUPERVISOR WHERE "SucCode" in (${sucursales})`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasZonaAntSupervisor: ', err.message);
        throw new Error(`Error en getVentasZonaAntSupervisor: ${err.message}`);
    }
}

const clientesZonaBloqueadosPorcentaje = async (sucursales) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_VEN_CLIENTES_BLOQUEADOS_PRCT where "SucCode" in (${sucursales})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesZonaBloqueadosPorcentaje: ${error.message || ''}`
        }
    }
}

const clientesVendedorBloqueadosPorcentaje = async (slpCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_VEN_CLIENTES_VENDEDOR_BLOQUEADO where "SlpCode" = ${slpCode}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesVendedorBloqueadosPorcentaje: ${error.message || ''}`
        }
    }
}

const getVentasLineaSupervisor = async (sucursales) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_LAPP.LAPP_VEN_VENTAS_LINEA_SUPERVISOR where "SucCode" in (${sucursales})`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasLineaSupervisor: ', err.message);
        throw new Error(`Error en getVentasLineaSupervisor: ${err.message}`);
    }
}

const getVentasLineaSucursalSupervisor = async (year, month, supCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        let query

        query = `CALL LAB_IFA_DATA.IFASP_SAL_CALCULATE_LINE_BRANCH_SALES_BY_SUPERVISOR(
            i_year         => ${year},
            i_month        => ${month},
            i_supervisorcode => ${supCode});`;

        console.log({ query })

        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasLineaSucursalSupervisor: ', err.message);
        throw new Error(`Error en getVentasLineaSucursalSupervisor: ${err.message}`);
    }
}

const getVentasLineaSupervisorAnt = async (sucursales) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_LAPP.LAPP_VEN_VENTAS_LINEA_SUPERVISOR_ANT where "SucCode" in (${sucursales})`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasLineaSupervisorAnt: ', err.message);
        throw new Error(`Error en getVentasLineaSupervisorAnt: ${err.message}`);
    }
}

const getVentasTipoSupervisor = async (sucursal, linea) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_LAPP.LAPP_VEN_VENTAS_TIPO_SUPERVISOR 
        where "SucCode"=${sucursal} and "LineName"='${linea}'`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasTipoSupervisor: ', err.message);
        throw new Error(`Error en getVentasTipoSupervisor: ${err.message}`);
    }
}

const getVentasTipoSupervisorAnt = async (sucursal, linea) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_LAPP.LAPP_VEN_VENTAS_TIPO_SUPERVISOR_ANT 
        where "SucCode"=${sucursal} and "LineName"='${linea}'`;
        return await executeQuery(query);
    } catch (err) {
        console.error('Error en getVentasTipoSupervisorAnt: ', err.message);
        throw new Error(`Error en getVentasTipoSupervisorAnt: ${err.message}`);
    }
}
/*
"IFA_VEN_CLIENTES_BLOQUEADOS_GROUP" ( "SucCode",
     "SucName",
     "GroupCode",
     "GroupName",
     "ZoneCode",
     "ZoneName",
     "rowspanZona",
     "rowspan",
     "SlpCode",
     "SlpName",
     "Universal",
     "Bloqueados",
     "Porcentaje" 
*/
const clientesZonaBloqueadosPorGrupo = async (sucursales, grupo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.PRD}.IFA_VEN_CLIENTES_BLOQUEADOS_GROUP where "SucCode" in (${sucursales}) and "GroupCode"=${grupo}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesZonaBloqueadosPorGrupo: ${error.message || ''}`
        }
    }
}

const ventasVendedoresByLineasSucursal = async (year, month, sucCode, clientType, lineCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call LAB_IFA_DATA.get_seller_sales_and_quotas_by_period_branch_division_line(${year},${month},${sucCode},${clientType},${lineCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en ventasVendedoresByLineasSucursal: ${error.message || ''}`
        }
    }
}
const ventasZonasVendedoresByLineasSucursal = async (year, month, sucCode, clientType, lineCode, slpCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call LAB_IFA_DATA.get_zone_sales_and_quotas_by_period_branch_division_line_seller(${year},${month},${sucCode},${clientType},${lineCode},${slpCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en ventasZonasVendedoresByLineasSucursal: ${error.message || ''}`
        }
    }
}

const clientesCadenasParent = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_MD_CUSTOMER_PARENT`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesCadenasParent: ${error.message || ''}`
        }
    }
}

const searchClientesCadenasParent = async (parametro) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_MD_CUSTOMER_PARENT WHERE "CustomerParentName" LIKE '%${parametro}%'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientesCadenasParent: ${error.message || ''}`
        }
    }
}


const reportePendienteCadenas = async (fechaInicial, fechaFinal, tipo, groupCode, cardCode, headerParent) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramTipo = formatParam(tipo)
        const paramGroupCode = formatParam(groupCode)
        const paramCardCode = formatParam(cardCode)
        const paramFechaInicial = formatParam(fechaInicial)
        const paramFechaFinal = formatParam(fechaFinal)
        const paramHeaderParent = formatParam(headerParent)

        const query = `call ${process.env.PRD}.IFASP_SAL_CALCULATE_PENDING_DELIVERIES_BY_CUSTOMER_OR_ITEM(
        i_date_from => ${paramFechaInicial},
        i_date_to => ${paramFechaFinal},
        i_document_type =>${paramTipo},
        i_group_code => ${paramGroupCode},
        i_card_code =>  ${paramCardCode},
        i_parent_name =>${paramHeaderParent})`

        console.log({ query })

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en reportePendienteCadenas: ${error.message || ''}`
        }
    }
}

const formatParam = (param) => {
    if (param === null || param === undefined) {
        return 'null'
    }
    if (typeof param === 'string') {
        return `'${param}'`
    }
    return param
}

const ventasPendientes = async (startDate, endDate, tipoPendiente, cardCode, itemCode, groupCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramStartDate = formatParam(startDate)
        const paramTipo = formatParam(tipoPendiente)
        const paramCardCode = formatParam(cardCode)
        const paramEndDate = formatParam(endDate)
        const paramitemCode = formatParam(itemCode)
        const paramitemGroup = formatParam(groupCode)
        const query = `call ${process.env.PRD}.ifasp_sal_get_pending_detail_to_sale_by_cardcode(i_date1 => ${paramStartDate},i_date2 => ${paramEndDate},i_tipo => ${paramTipo},i_cardcode => ${paramCardCode},i_itemcode => ${paramitemCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en ventasPendientes: ${error.message || ''}`
        }
    }
}

const findBlockedClientsByZoneOrSuc = async (SucCode, ZoneCode) => {
    try {
        const query = `
      CALL ${process.env.PRD}.IFASP_MD_GET_BLOCKED_CUSTOMERS_BY_BRANCH_OR_ZONE(?, ?)
    `;

        const result = await executeQueryParamsWithConnection(query, [SucCode, ZoneCode]);
        return result;
    } catch (error) {
        console.log({ error });
        throw {
            message: `Error en findBlockedClientsByZoneOrSuc: ${error.message || ''}`
        };
    }
};

const findBlockedClients = async (tipoCliente) => {
    try {
        const query = `CALL LAB_IFA_PRD.IFASP_MD_GET_BLOCKED_OVERDUE_CLIENTS_BY_BRANCH_ZONE(${tipoCliente})`;

        console.log(query);
        const result = await executeQueryParamsWithConnection(query);
        return result;
    } catch (error) {
        console.log({ error });
        throw {
            message: `Error en findBlockedClients: ${error.message || ''}`
        };
    }
};

const findBlockedClientsByZoneAndSuc = async (suc, zone, group) => {
    try {
        const query = `
      CALL LAB_IFA_PRD.IFASP_MD_GET_BLOCKED_OVERDUE_DETAIL_CLIENTS_BY_BRANCH_ZONE(
        i_succode => ?,
        i_zonecode => ?,
        i_divcode => ?
      )
    `;

        console.log('Query:', query, 'Params:', [suc, zone, group]);

        // Pasa los parámetros como arreglo (o como lo acepte tu función)
        const result = await executeQueryParamsWithConnection(query, [suc, zone, group]);
        return result;
    } catch (error) {
        console.log({ error });
        throw {
            message: `Error en findBlockedClients: ${error.message || ''}`
        };
    }
};

const clientesVendedorBloqueados = async (groupCode, slpCodes) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        let allResults = [];

        for (const code of slpCodes) {
            const query = `CALL ${process.env.PRD}.IFASP_MD_GET_BLOCKED_OVERDUE_CLIENTS_BY_BRANCH_ZONE_BY_SELLER(${groupCode}, ${code})`;
            console.log({ query });
            const result = await executeQuery(query);

            // Asegúrate que result sea array, si no, lo conviertes
            if (Array.isArray(result)) {
                allResults = allResults.concat(result);
            }
        }

        return allResults;
    } catch (error) {
        throw {
            message: `Error en clientesVendedorBloqueados: ${error.message || ''}`
        };
    }
};


const clientesBloqueadoByGroup = async (groupCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const safeGroupCode = groupCode !== null && groupCode !== undefined ? parseInt(groupCode) : 'NULL';
        const query = `CALL ${process.env.PRD}.IFASP_MD_GET_BLOCKED_OVERDUE_DETAIL_CLIENTS_BY_GROUP_CODE(${safeGroupCode})`;
        console.log({ query });

        const result = await executeQuery(query);

        return Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;

    } catch (error) {
        throw new Error(`Error en clientesBloqueadoByGroup: ${error.message || 'Error no definido'}`);
    }
};

//sexo
const ventasPendientesByItem = async (startDate, endDate, tipoPendiente, cardCode, itemCode, groupCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramStartDate = formatParam(startDate)
        const paramTipo = formatParam(tipoPendiente)
        const paramCardCode = formatParam(cardCode)
        const paramEndDate = formatParam(endDate)
        const paramitemCode = formatParam(itemCode)
        const paramGroup = formatParam(groupCode)
        const query = `call ${process.env.PRD}.ifasp_sal_calculate_pending_detail_to_sale_by_customer_or_item(i_date1 => ${paramStartDate},i_date2 => ${paramEndDate},i_tipo => ${paramTipo},i_groupcode =>${paramGroup},i_cardcode => ${paramCardCode},i_itemcode => ${paramitemCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en ventasPendientesByItem: ${error.message || ''}`
        }
    }
}

const reportePendienteByItem = async (fechaInicial, fechaFinal, tipo, groupCode, cardCode, headerParent, itemCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramTipo = formatParam(tipo)
        const paramGroupCode = formatParam(groupCode)
        const paramCardCode = formatParam(cardCode)
        const paramFechaInicial = formatParam(fechaInicial)
        const paramFechaFinal = formatParam(fechaFinal)
        const paramHeaderParent = formatParam(headerParent)
        //sexo
        const paramitemCode = formatParam(itemCode)
        // const query = `call ${ process.env.PRD }.IFASP_SAL_CALCULATE_PENDING_DELIVERIES_BY_CUSTOMER_OR_ITEM(
        const query = `call ${process.env.PRD}.IFASP_SAL_CALCULATE_PENDING_DELIVERIES_BY_CUSTOMER_AND_ITEM(
            i_date_from => ${paramFechaInicial},
        i_date_to => ${paramFechaFinal},
        i_document_type => ${paramTipo},
        i_group_code => ${paramGroupCode},
        i_card_code => ${paramCardCode},
        i_parent_name => ${paramHeaderParent},
        i_item_code => ${paramitemCode})`

        console.log({ query })

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en reportePendienteByItem: ${error.message || ''} `
        }
    }
}

const reportePendienteUngroupByItem = async (fechaInicial, fechaFinal, tipo, groupCode, cardCode, headerParent, itemCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramTipo = formatParam(tipo)
        const paramGroupCode = formatParam(groupCode)
        const paramCardCode = formatParam(cardCode)
        const paramFechaInicial = formatParam(fechaInicial)
        const paramFechaFinal = formatParam(fechaFinal)
        const paramHeaderParent = formatParam(headerParent)
        const paramitemCode = formatParam(itemCode)
        const query = `call ${process.env.PRD}.IFASP_SAL_CALCULATE_PENDING_DELIVERIES_BY_CUSTOMER_AND_ITEM(
            i_date_from => ${paramFechaInicial},
            i_date_to => ${paramFechaFinal},
            i_document_type => ${paramTipo},
            i_group_code => ${paramGroupCode},
            i_card_code => ${paramCardCode},
            i_parent_name => ${paramHeaderParent},
            i_item_code => ${paramitemCode})`

        console.log({ query })

        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en reportePendienteUngroupByItem: ${error.message || ''} `
        }
    }
}

const reportePendienteBySucursalesResume = async (tipo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramTipo = formatParam(tipo)
        // const query = `call ${ process.env.PRD }.IFA_SP_PENDING_DELIVERIES_GROUPED_RESUME()`
        const query = `call ${process.env.PRD}.IFA_SP_SAL_PENDING_DELIVERIES_SUCURSAL_GROUPED_RESUME(
                P_TIPODOCUMENTO => ${paramTipo}
            )`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en reportePendienteBySucursalesResume: ${error.message || ''} `
        }
    }
}


const clientExpiryPolicy = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramCardCode = formatParam(cardCode)
        const query = `call ${process.env.PRD}.IFASP_CRM_READ_CLIENTS_EXPIRY_POLICY(${paramCardCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}

const selectionBatchByItemWhsCode = async (itemCode, whsCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const paramItemCode = formatParam(itemCode)
        const paramWhsCode = formatParam(whsCode)
        const query = `call ${process.env.PRD}.IFASP_INV_SELECTION_BATCH_BY_ITEM_AND_WAREHOUSE(${paramItemCode}, ${paramWhsCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en selectionBatchByItemWhsCode: ${error.message || ''} `
        }
    }
}

const clientesCreadosPorSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_CALCULATE_COSTUMERS_BY_CREATE_DATE()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}

const ventasClientesPorSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_CALCULATE_COSTUMERS_SALES_BY_BRANCH()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}

const clientesAcumuladosPorSucursalGrupo = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_LIST_CLIENTES_ACUMULADOS()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}

const consulta1 = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_UNIQUE_SALES_CLIENTS_BY_GROUP_ZONE()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}

const consulta2 = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_UNIQUE_SALES_CLIENTS_BY_GROUP_ZONE_VENDOR()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}

const consulta3 = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call ${process.env.PRD}.IFASP_SAL_GET_ASSIGNED_CLIENTS_REPORT()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en clientExpiryPolicy: ${error.message || ''} `
        }
    }
}


const getSucursales = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_SUCURSALES`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getSucursales: ${error.message || ''} `
        }
    }
}

const getTiposClientes = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_CLIENTES_TIPOS`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getTiposClientes: ${error.message || ''} `
        }
    }
}

const getZonas = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_ZONAS`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getZonas: ${error.message || ''} `
        }
    }
}

const getVendedores = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_VENDEDORES`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getVendedores: ${error.message || ''} `
        }
    }
}

const getSalesOperationalEfficiencyDashboard = async (cardCode, startDate, endDate,) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const formattCardCode = formatParam(cardCode)
        const formattStartDate = formatParam(startDate)
        const formattEndDate = formatParam(endDate)
        const query = `CALL ${process.env.PRD}.IFASP_SAL_GET_SALES_OPERATIONAL_EFFICIENCY_DASHBOARD(${formattCardCode},${formattStartDate},${formattEndDate})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        throw {
            message: `Error en getSalesOperationalEfficiencyDashboard: ${error.message || ''}`
        }
    }
}



module.exports = {
    ventaPorSucursal,
    ventasNormales,
    ventasCadena,
    ventasInstitucion,
    ventasUsuario,
    ventasIfaVet,
    ventasMasivo,
    ventaPorSucursalMesAnterior,
    ventasNormalesMesAnterior,
    ventasCadenaMesAnterior,
    ventasInstitucionMesAnterior,
    ventasIfaVetMesAnterior,
    ventasMasivoMesAnterior,
    ventasPorSupervisor,
    ventasPorZonasVendedor,
    ventasHistoricoSucursal,
    ventasHistoricoNormales,
    ventasHistoricoCadenas,
    ventasHistoricoIfaVet,
    ventasHistoricoMasivos,
    ventasHistoricoInstituciones,
    ventasPorZonasVendedorMesAnt,
    marcarAsistencia,
    getAsistenciasVendedor,
    pruebaaaBatch,
    prueba2Batch,
    prueba3Batch,
    listaAlmacenes,
    listaAsistenciaDia,
    ofertaPrecioPorItemCode,
    descripcionArticulo,
    obtenerOfertas,
    detalleOfertaCadena,
    unidadMedida,
    listaArticuloCadenas,
    clientesInstituciones,
    clientesInstitucionByCardCode,
    vendedoresPorSucursal,
    obtenerOfertasInstituciones,
    detalleOferta,
    obtenerOfertasVendedores,
    obtenerPedidosDetalle,
    obtenerOfertasPorSucursal,
    detalleOfertaPendCadena,
    listaClienteEmpleado,
    clienteEmpleado,
    obtenerArticulosVehiculo,
    searchVendedores,
    listaPrecioSuc,
    listaPrecioInst,
    ventasPedidoPorVendedor,
    cantidadVentasPorZonasVendedor,
    cantidadVentasPorZonasMesAnt,
    clienteByVendedor,
    lineas,
    analisisVentas,
    clienteByCardCode,
    insertarUbicacionCliente,
    obtenerClientesSinUbicacion,
    clientesSinUbicacionSupervisor,
    allCampaignFilter,
    getYTDByVendedor, getYTDDelVendedor,
    getYTDDelVendedorMonto, getYTDMontoByVendedor,
    reporteOfertaPDF,
    getCoberturaVendedor, getCobertura,
    clientesNoVenta,
    clientesNoVentaPorVendedor,
    vendedoresAsignedWithClientsBySucursal,
    facturasMoraByClients,
    clientesConMora,
    vendedorPorSucCode,
    createCampaign,
    createDetailsCampaign,
    bannedCampaign,
    allCampaign,
    oneDetailsCampaignById,
    validateItem,
    validateZona,
    allAgencies,
    agencyBySucCode,
    oneCampaignById,
    rollBackCampaignById,
    sublineas,
    reporteConUbicacionCliente,
    reporteSinUbicacionCliente,
    searchVendedorByIDSAP,
    agregarSolicitudDeDescuento,
    getVendedoresSolicitudDescByStatus, actualizarStatusSolicitudDescuento,
    getSolicitudesDescuentoByStatus,
    getClientName,
    actualizarSolicitudDescuento, deleteSolicitudDescuento, notificationSubscription,
    getSubscriptions, CREATETABLE,
    getVentasPrespuestosSubLinea,
    getVentasPrespuestosSubLineaAnterior,
    getSolicitudesDescuentoByVendedor, getNotifications, insertNotification,
    deleteNotification, notificationUnsubscribe, getVendedoresSolicitudDescuento,
    getVendedorByCode, getVendedorByCode, getDescuentosDeVendedoresParaPedido,
    ventasPorZonasVendedor2, getUbicacionClientesByVendedor, getVentasZonaSupervisor,
    ventasPorZonasVendedorMesAnt2, getVendedoresSolicitudDescByStatusSucursal,
    getVentasZonaAntSupervisor, clientesZonaBloqueadosPorcentaje,
    getVentasLineaSupervisor, getVentasTipoSupervisor, getVentasTipoSupervisor,
    clientesVendedorBloqueadosPorcentaje, clientesZonaBloqueadosPorGrupo, getVentasLineaSupervisorAnt, getVentasTipoSupervisorAnt,
    getVentasLineaSucursalSupervisor,
    ventasVendedoresByLineasSucursal,
    ventasZonasVendedoresByLineasSucursal,
    reportePendienteCadenas,
    clientesCadenasParent,
    searchClientesCadenasParent,
    ventasPendientes,
    findBlockedClientsByZoneOrSuc,
    findBlockedClients,
    findBlockedClientsByZoneAndSuc,
    clientesVendedorBloqueados,
    reportePendienteByItem,
    ventasPendientesByItem,
    clientesBloqueadoByGroup,
    clientExpiryPolicy,
    selectionBatchByItemWhsCode,
    clientesCreadosPorSucursal,
    ventasClientesPorSucursal,
    clientesAcumuladosPorSucursalGrupo,
    consulta1,
    consulta2,
    consulta3,
    getVendedores,
    getZonas,
    getSucursales,
    getTiposClientes,
    reportePendienteUngroupByItem,
    getSalesOperationalEfficiencyDashboard,
    reportePendienteBySucursalesResume,
    marcarAsistenciaFueraDeRuta
}
