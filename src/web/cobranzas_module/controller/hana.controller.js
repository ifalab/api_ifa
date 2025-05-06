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

const cobranzaGeneral = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from LAB_IFA_PRD.IFA_LAPP_DASH_COBasdasdROS_Y_PPTO`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaGeneral:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaGeneral');
    }
}

const cobranzaPorSucursal = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA('','')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaPorSucursal');
    }
}

const cobranzaNormales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB('','NORMALES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaNormales:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaNormales');
    }
}

const cobranzaCadenas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB('','CADENAS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaCadenas:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaCadenas');
    }
}

const cobranzaIfavet = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB('','IFAVET')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaIfavet:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaIfavet');
    }
}

const cobranzaMasivo = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB('','MASIVOS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaMasivo:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaMasivo');
    }
}

const cobranzaInstituciones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB('','INSTITUCIONES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaInstituciones:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaInstituciones');
    }
}

const cobranzaPorSucursalMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_ANT('','')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaPorSucursal:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaPorSucursal');
    }
}

const cobranzaNormalesMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB_ANT('','NORMALES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaNormales:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaNormales');
    }
}

const cobranzaCadenasMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB_ANT('','CADENAS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaCadenas:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaCadenas');
    }
}

const cobranzaIfavetMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB_ANT('','IFAVET')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaIfavet:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaIfavet');
    }
}

const cobranzaMasivoMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB_ANT('','MASIVOS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaMasivoMesAnterior:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaMasivoMesAnterior');
    }
}

const cobranzaInstitucionesMesAnterior = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA_FIL_DIMB_ANT('','INSTITUCIONES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaInstitucionesMesAnterior:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaInstitucionesMesAnterior');
    }
}

const cobranzaPorSupervisor = async (userCode, dim1) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_PRD".IFA_COB_DETALLADO_X_ZONA_USER('${userCode}','${dim1}')`
        return await executeQuery(query)
    } catch (error) {
        console
    }
}

const cobranzaPorZona = async (username) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL "LAB_IFA_LAPP"."LAPP_COBRANZA_ZONA"(${username})`
        return await executeQuery(query)
    } catch (error) {
        console
    }
}

const cobranzaHistoricoNacional = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.COB_GROUPBY_DIMA_SEMESTRAL('','')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaHistoricoNacional:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaHistoricoNacional');
    }
}

const cobranzaHistoricoNormales = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.COB_GROUPBY_DIMA_SEMESTRAL('','NORMALES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaHistoricoNormales:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaHistoricoNormales');
    }
}

const cobranzaHistoricoCadenas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.COB_GROUPBY_DIMA_SEMESTRAL('','CADENAS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaHistoricoCadenas:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaHistoricoCadenas');
    }
}

const cobranzaHistoricoIfaVet = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.COB_GROUPBY_DIMA_SEMESTRAL('','IFAVET')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaHistoricoIfaVet:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaHistoricoIfaVet');
    }
}

const cobranzaHistoricoInstituciones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.COB_GROUPBY_DIMA_SEMESTRAL('','INSTITUCIONES')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaHistoricoInstituciones:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaHistoricoInstituciones');
    }
}

const cobranzaHistoricoMasivos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL LAB_IFA_DATA.COB_GROUPBY_DIMA_SEMESTRAL('','MASIVOS')`
        return await executeQuery(query)
    } catch (error) {
        console.error('Error en cobranzaHistoricoMasivos:', error.message);
        throw new Error('Error al procesar la solicitud: cobranzaHistoricoMasivos');
    }
}

const cobranzaPorZonaMesAnt = async (username) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL "LAB_IFA_LAPP"."LAPP_COBRANZA_ZONA_ANT"(${username})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: `no se pudieron traer las cobranzas del mes anterior del vendedor ${username}`
        }
    }
}

const clientePorVendedor = async (nombre) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_SALDO_DEUDOR_CLI_BY_VEND('${nombre}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: `no se pudo traer los datos`
        }
    }
}

const clientePorVendedorId = async (id) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.DBSAPPRD}.IFA_LAPP_COB_CLIENTES_CON_SALDO_DEUDOR_POR_VENDEDOR(${id})`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: `no se pudo traer los datos`
        }
    }
}
const cobranzaSaldoDeudor = async (nombre, codigo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        // const query = `CALL ${process.env.DBSAPPRD}.IFA_LAPP_SALDO_DEUDOR_BY_VEND_OR_CLI('${nombre}','${codigo}')`
        const query = `CALL ${process.env.PRD}.IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE('${codigo}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: `no se pudo traer los datos`
        }
    }
}

const cobranzaSaldoAlContadoDeudor = async (nombre, codigo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        // const query = `CALL ${process.env.DBSAPPRD}.IFA_LAPP_SALDO_DEUDOR_BY_VEND_OR_CLI('${nombre}','${codigo}')`
        const query = `CALL ${process.env.PRD}.IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE_CONTADO('${codigo}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: `no se pudo traer los datos`
        }
    }
}

const cobranzaSaldoDeudorDespachador = async (codigo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_COB_SALDO_DEUDOR_POR_CLIENTE('${codigo}')`
        console.log({ query })
        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result
        }
    } catch (error) {
        console.log({ error })
        return {
            statusCode: 400,
            message: `Error al procesar cobranzaSaldoDeudorDespachador: ${error.message || ''}`
        }
    }
}

const clientesInstitucionesSaldoDeudor = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `select * from ${process.env.DBSAPPRD}.ifa_dm_clientes where "GroupName" = 'INSTITUCIONES'`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: 'no se pudo traer los datos'
        }
    }
}

const saldoDeudorInstituciones = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL ${process.env.DBSAPPRD}.IFA_LAPP_SALDO_DEUDOR_BY_INST('${cardCode}')`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: 'no se pudo traer los datos'
        }
    }
}
const cobroLayout = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_COBRO_LAYOUT(${id})`;
        // const query = `CALL LAB_IFA_PRD.IFA_LAPP_VEN_COBRO_LAYOUT(${id})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.error('Error en cobroLayout:', error.message);
        return { message: 'Error al procesar la solicitud: IFA_LAPP_VEN_COBRO_LAYOUT' }
    }
}
const resumenCobranzaLayout = async (id_vendedor, fecha) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_CIERRE_DIA_LAYOUT(${id_vendedor},'${fecha}')`;
        // const query = `CALL LAB_IFA_PRD.IFA_LAPP_VEN_CIERRE_DIA_LAYOUT(${id_vendedor},'${fecha}')`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en cobroLayout:', error.message);
        return {
            statusCode: 400,
            message: 'Error al procesar la solicitud: IFA_LAPP_VEN_COBRO_LAYOUT'
        }
    }
}

const cobrosRealizados = async (id_vendedor) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_COBROS_POR_VENDEDOR(${id_vendedor})`;
        // const query = `CALL LAB_IFA_PRD.IFA_LAPP_VEN_COBROS_POR_VENDEDOR(${id_vendedor})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result
        }

    } catch (error) {
        console.error('Error en cobrosRealizados:', error.message);
        return {
            statusCode: 400,
            message: `Error al procesar cobrosRealizados: ${error.message}`
        }
    }
}

const clientesPorVendedor = async (id_vendedor) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_clientes_por_vendedor(${id_vendedor})`;
        // const query = `CALL LAB_IFA_PRD.ifa_lapp_clientes_por_vendedor(${id_vendedor})`;
        console.log({ query })
        const result = await executeQuery(query)
        // console.log({result})
        return {
            statusCode: 200,
            data: result
        }
    } catch (error) {
        console.error('Error en clientesPorVendedor:', error.message);
        return {
            statusCode: 400,
            message: `Error al procesar clientesPorVendedor: ${error.message || ''}`
        }
    }
}

const clientesPorSucursal = async (id_sucursal) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_clientes_por_surcursal(${id_sucursal})`;
        // const query = `CALL LAB_IFA_PRD.ifa_lapp_clientes_por_surcursal(${id_sucursal})`;
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

const clientesPorDespachador = async (id_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_lapp_clientes_por_despachador(${id_sap})`;
        // const query = `CALL LAB_IFA_PRD.ifa_lapp_clientes_por_despachador(${id_sap})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result
        }
    } catch (error) {
        console.error('Error en clientesPorDespachador:', error.message);
        return {
            statusCode: 400,
            message: `Error al procesar clientesPorDespachador: ${error.message || ''}`
        }
    }
}

const detalleFactura = async (docEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.IFA_LAPP_VEN_VENTAS_DETALLE_POR_ID(${docEntry})`;
        console.log({ query })
        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result
        }
    } catch (error) {
        console.error('Error en detalleFactura:', error.message);
        return {
            statusCode: 400,
            message: `Error al procesar detalleFactura: ${error.message || ''}`
        }
    }
}
const cobranzaNormalesPorSucursal = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_DATA".COB_GROUPBY_DIMA1A_FILBY_DIMA_NORMALES(${sucCode})`
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en cobranzaNormalesPorSucursal: ${error.message || ''}`
        }
    }
}
const cobranzaPorSucursalYTipo = async (sucCode, tipo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `call "LAB_IFA_LAPP".LAPP_COB_COBRANZA_ZONA_POR_SUCURSAL_Y_TIPO(${sucCode}, '${tipo}')`
        console.log({query})
        const result = await executeQuery(query)
        return {
            status: 200,
            data: result
        }
    } catch (error) {
        return {
            status: 400,
            message: `Error en cobranzaPorSucursalYTipo: ${error.message || ''}`
        }
    }
}
const getVendedores = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_vendedores`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getVendedores: ${error.message || ''}`)
    }
}
const getCobradores = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        // const query = `select * from ${process.env.PRD}.ifa_dm_vendedores
        //         union all
        //         select * from ${process.env.PRD}.ifa_dm_despachadores
        //         order by "SlpCode"`
        const query = `select * from ${process.env.PRD}.ifa_dm_cobradores`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getCobradores: ${error.message || ''}`)
    }
}

const getCobradoresBySucursales = async (listSucursales) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select DISTINCT * from ${process.env.PRD}.ifa_dm_cobradores where "SucCode" in (${listSucursales})`
        // const query = `SELECT DISTINCT "ClpCode", "ClpName" FROM ${process.env.PRD}.ifa_dm_cobradores WHERE "SucCode" in (800,500)`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getCobradoresBySucursales: ${error.message || ''}`)
    }
}

const saldoDeudorIfavet = async () => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `SELECT * FROM ${process.env.DBSAPPRD}.IFA_COB_SALDO_DEUDOR_IFAVET`
        console.log({ query })
        return await executeQuery(query)
    } catch (error) {
        console.log({ error })
        return {
            error: 'no se pudo traer los datos'
        }
    }
}

const getAllSublines = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_SUBLINEAS`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllSublines:', error.message);
        throw {
            message: `Error al procesar getAllSublines: ${error.message || ''}`
        }
    }
}

const getAllLines = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_LINEAS`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getAllLines:', error.message);
        throw {
            message: `Error al procesar getAllLines: ${error.message || ''}`
        }
    }
}
const getVendedoresBySuc = async (sucCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_cobradores where "SucCode"=${sucCode} and "ClpCode">0`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getVendedoresBySuc: ${error.message || ''}`)
    }
}
const getYearToDayBySuc = async (sucCode, dim2, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_DATA.ytd_cobranzas_by_sucursal(${sucCode},'${dim2}','${fechaInicio1}', 
       '${fechaFin1}', '${fechaInicio2}', '${fechaFin2}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getYearToDayBySuc: ${error.message || ''}`)
    }
}
const getYearToDayByCobrador = async (cobradorName, dim2, fechaInicio1, fechaFin1, fechaInicio2, fechaFin2) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_DATA.ytd_by_cobrador('${cobradorName}','${dim2}','${fechaInicio1}', 
       '${fechaFin1}', '${fechaInicio2}', '${fechaFin2}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getYearToDayByCobrador: ${error.message || ''}`)
    }
}
const getYtdCobradores = async (sucCode, mes, anio) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.cobradores_ytd_sucursal(${sucCode},${mes}, ${anio})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getYtdCobradores: ${error.message || ''}`)
    }
}

const getPendientesBajaPorCobrador = async (clpCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_cob_cobranzas_pendientes_de_baja(${clpCode})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getPendientesBajaPorCobrador: ${error.message || ''}`)
    }
}

const cuentasParaBajaCobranza = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM LAB_IFA_PRD.IFA_DM_CUENTAS_PERMITIDAS_PARA_BAJA_COBRANZA`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en cuentasParaBajaCobranza: ${error.message || ''}`)
    }
}

const cuentasBancoParaBajaCobranza = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM LAB_IFA_PRD.IFA_DM_CUENTAS_PERMITIDAS_PARA_BAJA_COBRANZA WHERE "AcctCode" IN ('1110604','1110605','1110606','1110612')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en cuentasBancoParaBajaCobranza: ${error.message || ''}`)
    }
}

const getBaja = async (docEntry) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_cob_bajas_por_id(${docEntry})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getBaja: ${error.message || ''}`)
    }
}

const getLayoutComprobanteContable = async (transId) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ACB_INV_LayOutCoomprobanteContablePR(${transId})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getLayoutComprobanteContable: ${error.message || ''}`)
    }
}
const getBajasByUser = async (id_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_cob_bajas_por_usuario(${id_sap})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getBajasByUser: ${error.message || ''}`)
    }
}

const getComprobantesBajasByUser = async (id_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_lapp_cob_bajas_por_usuario_comprobante(${id_sap})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getComprobantesBajasByUser: ${error.message || ''}`)
    }
}

const reporteBajaCobranzas = async (UserSign, month, year) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        //"SucCode" in (${sucCodes}) 
        const query = `select * from ${process.env.PRD}.ifa_cob_cobranzas where 
        "UserSign" =${UserSign} 
        and EXTRACT(MONTH FROM "DocDate") =${month}
  	    AND EXTRACT(YEAR FROM "DocDate") =${year}`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en reporteBajaCobranzas: ${error.message || ''}`)
    }
}

const getClienteById = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from ${process.env.PRD}.ifa_dm_clientes where 
            "CardCode" ='${id}'`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getClienteById: ${error.message || ''}`)
    }
}

const getClientes = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from ${process.env.PRD}.ifa_dm_clientes WHERE "validFor" = 'Y'`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getClientes: ${error.message || ''}`)
    }
}


const getEstadoCuentaCliente = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = ` CALL ${process.env.PRD}.ifa_lapp_cob_estado_de_cuenta_por_cliente('${id}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getEstadoCuentaCliente: ${error.message || ''}`)
    }
}

module.exports = {
    cobranzaGeneral,
    cobranzaPorSucursal,
    cobranzaNormales,
    cobranzaCadenas,
    cobranzaIfavet,
    cobranzaMasivo,
    cobranzaInstituciones,
    cobranzaPorSucursalMesAnterior,
    cobranzaNormalesMesAnterior,
    cobranzaCadenasMesAnterior,
    cobranzaIfavetMesAnterior,
    cobranzaMasivoMesAnterior,
    cobranzaInstitucionesMesAnterior,
    cobranzaPorSupervisor,
    cobranzaPorZona,
    cobranzaHistoricoNacional,
    cobranzaHistoricoNormales,
    cobranzaHistoricoCadenas,
    cobranzaHistoricoIfaVet,
    cobranzaHistoricoInstituciones,
    cobranzaHistoricoMasivos,
    cobranzaPorZonaMesAnt,
    cobranzaSaldoDeudor,
    clientePorVendedor,
    clientesInstitucionesSaldoDeudor,
    saldoDeudorInstituciones,
    cobroLayout,
    resumenCobranzaLayout,
    cobrosRealizados,
    clientesPorVendedor,
    clientesPorSucursal,
    cobranzaSaldoDeudorDespachador,
    clientePorVendedorId,
    clientesPorDespachador,
    cobranzaSaldoAlContadoDeudor,
    detalleFactura,
    cobranzaNormalesPorSucursal,
    cobranzaPorSucursalYTipo,
    getVendedores,
    getCobradores,
    saldoDeudorIfavet,
    getAllSublines,
    getAllLines,
    getVendedoresBySuc,
    getYearToDayBySuc,
    getYearToDayByCobrador,
    getYtdCobradores,
    getPendientesBajaPorCobrador, cuentasParaBajaCobranza, cuentasBancoParaBajaCobranza,
    getBaja, getLayoutComprobanteContable,
    getBajasByUser,
    reporteBajaCobranzas, getCobradoresBySucursales,
    getClienteById,
    getClientes,
    getEstadoCuentaCliente,
    getComprobantesBajasByUser,
}
