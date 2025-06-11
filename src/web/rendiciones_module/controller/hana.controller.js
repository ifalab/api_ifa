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
        console.log(query)
        connection.exec(query, (err, result) => {
            if (err) {
                console.log('error en la consulta:', err.message)
                reject(new Error(`Error en la consulta: ${err.message}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);
                // console.log({result})
            }
        })
    })
}

const tipoDeCambion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('tipoDeCambion EXECUTE')
        const query = `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS();`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en tipoDeCambion')
    }
}

const findAllAperturaCaja = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findAllAperturaCaja EXECUTE')
        const query = `SELECT * FROM "${process.env.PRD}".ifa_rw_cajas_vigentes`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllAperturaCaja')
    }
}

const findCajasEmpleado = async (codEmp) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findCajasEmpleado EXECUTE')
        const query = `CALL ${process.env.PRD}.IFA_LAPP_RW_CAJAS_X_EMPLEADO('${codEmp}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findCajasEmpleado ')
    }
}

const findAllCajasEmpleados = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.PRD}.IFA_LAPP_TODAS_CAJAS`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findCajasEmpleado ')
    }
}

const rendicionDetallada = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rendicionDetallada EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_RENDICION_DETALLADA_BY_ID(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rendicionDetallada ')
    }
}

const rendicionByTransac = async (codTransac) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rendicionDetallada EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_LISTA_REND_BY_TRANSID(${codTransac})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rendicionDetallada ')
    }
}

const crearRendicion = async (NEW_TransactionId, NEW_CodEmp, NEW_ESTADO, NEW_MES, NEW_YEAR, new_glosa) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('crearRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_CREAR_RENDICION('${NEW_TransactionId}','${NEW_CodEmp}','${NEW_ESTADO}',${NEW_MES},${NEW_YEAR},'${new_glosa}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en crearRendicion ')
    }
}

const crearGasto = async (
    new_nit,
    new_tipo,
    new_gasto,
    new_nroFactura,
    new_codAut,
    new_fecha,
    new_nombreRazon,
    new_glosa,
    new_importeTotal,
    new_ice,
    new_iehd,
    new_ipj,
    new_tasas,
    new_otroNoSujeto,
    new_exento,
    new_tasaCero,
    new_descuento,
    new_codControl,
    new_gifCard,
    idRendicion,
    month,
    year,
    new_comentario,
    new_id_cuenta,
    new_beneficiario,
    new_cod_beneficiario,
    new_detalle_cuenta,
    new_cod_proveedor,
    code
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('crearRendicion EXECUTE')
        ///query
        const query = `CALL LAB_IFA_LAPP.LAPP_CREAR_RENDICION_GASTOS('${new_nit}','${new_tipo}','${new_gasto}','${new_nroFactura}','${new_codAut}','${new_fecha}','${new_nombreRazon}','${new_glosa}',${new_importeTotal},${new_ice},${new_iehd},${new_ipj},${new_tasas},${new_otroNoSujeto},${new_exento},${new_tasaCero},${new_descuento},'${new_codControl}',${new_gifCard},'1',${idRendicion},${month},${year},'${new_comentario || ''}',${new_id_cuenta}, '${new_beneficiario}', '${new_cod_beneficiario}','${new_detalle_cuenta}','${new_cod_proveedor || ''}','${code||''}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            mensaje: `${error.message || ''}`,
            error: `Error, no se pudieron insertar los datos con nit: ${new_nit || 'No definido'},Tipo: ${new_tipo || 'No definido'}, Factura: ${new_nroFactura || 'No definido'}, Razon: ${new_nombreRazon || 'No definido'}, Glosa: ${new_glosa || 'No definido'}`
        }

    }
}


const actualizarGastos = async (
    ID,
    new_nit,
    new_tipo,
    new_gasto,
    new_nroFactura,
    new_codAut,
    new_fecha,
    new_nombreRazon,
    new_glosa,
    new_importeTotal,
    new_ice,
    new_iehd,
    new_ipj,
    new_tasas,
    new_otroNoSujeto,
    new_exento,
    new_tasaCero,
    new_descuento,
    new_codControl,
    new_gifCard,
    new_estado,
    idRendicion,
    new_comentario,
    new_id_cuenta,
    new_beneficiario,
    new_cod_beneficiario,
    new_detalle_cuenta,
    new_cod_proveedor,
    code

) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarGastos EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_RENDICION_GASTOS(${ID},'${new_nit}','${new_tipo}','${new_gasto}','${new_nroFactura}','${new_codAut}','${new_fecha}','${new_nombreRazon}','${new_glosa}',${new_importeTotal},${new_ice},${new_iehd},${new_ipj},${new_tasas},${new_otroNoSujeto},${new_exento},${new_tasaCero},${new_descuento},'${new_codControl}',${new_gifCard},'${new_estado}',${idRendicion},'${new_comentario || ''}',${new_id_cuenta}, '${new_beneficiario}', '${new_cod_beneficiario}','${new_detalle_cuenta}','${new_cod_proveedor}','${code}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `Error, no se pudieron actualizar los datos con nit: ${new_nit || 'No definido'},Tipo: ${new_tipo || 'No definido'}, Factura: ${new_nroFactura || 'No definido'}, Razon: ${new_nombreRazon || 'No definido'}, Glosa: ${new_glosa || 'No definido'}`
        }
    }

}

const cambiarEstadoRendicion = async (id, estado) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cambiarEstadoRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_ESTADO_RENDICION(${id},'${estado}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `cambiarEstadoRendicion`
        }
    }
}

const verRendicionesEnRevision = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('verRendicionesEnRevision EXECUTE')
        const query = `SELECT * FROM LAB_IFA_LAPP.LAPP_RENDICION WHERE ESTADO = '2' OR ESTADO = '7'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudieron traer las rendiciones desde la base de datos`
        }
    }
}

const findAllRendiciones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findAllRendiciones EXECUTE')
        const query = `SELECT * FROM LAB_IFA_LAPP.LAPP_RENDICION`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudieron traer las rendiciones desde la base de datos`
        }
    }
}

const employedByCardCode = async (cardCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('verRendicionesEnRevision EXECUTE')
        const query = `CALL LAB_IFA_PRD.IFA_DM_BUSCAR_EMPLEADO_POR_CODIGO('${cardCode}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudieron traer los datos del empleado de la base de datos`
        }

    }
}

const empleadoConCajaChicas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('empleadoConCajaChicas EXECUTE')
        const query = `select * from ${process.env.LAPP}.lapp_usuario WHERE CODEMP IN (select CODEMP from ${process.env.LAPP}.lapp_rendicion)`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `empleadoConCajaChicas`
        }

    }
}

const actualizarEstadoComentario = async (id, estado, comentario) => {

    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarEstadoComentario EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_RENDICION_GASTOS_ESTADO_COMENTARIO(${id},'${estado}','${comentario}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudieron actualizar el estado y comentario`
        }

    }
}

const actualizarEstadoRendicion = async (id, estado) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarEstadoRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_ESTADO_RENDICION(${id},'${estado}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudieron actualizar el estado de la rendicion`
        }

    }
}

const eliminarGastoID = async (idGasto) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('eliminarGastoID EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ELIMINAR_GASTO_ID(${idGasto});`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo eliminar el gasto`
        }
    }
}

const costoComercialAreas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialAreas EXECUTE')
        const query = `select * from LAB_IFA_PRD."IFA_CC_AREAS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - areas`
        }

    }
}

const costoComercialTipoCliente = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialTipoCliente EXECUTE')
        // const query = `select * from  ${process.env.PRD}."IFA_CC_TIPOS"`
        const query = `select * from  LAB_IFA_PRD."IFA_CC_TIPOS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Tipo clientes`
        }

    }
}

const costoComercialLineas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialLineas EXECUTE')
        // const query = `select * from  ${process.env.PRD}."IFA_CC_LINEAS"`
        const query = `select * from  LAB_IFA_PRD."IFA_CC_LINEAS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Lineas`
        }

    }
}

const costoComercialEspecialidades = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialEspecialidades EXECUTE')
        // const query = `select * from  ${process.env.PRD}."IFA_CC_ESPECIALIDADES"`
        const query = `select * from  LAB_IFA_PRD."IFA_CC_ESPECIALIDADES"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Especialidades`
        }

    }
}

const costoComercialClasificaciones = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialClasificaciones EXECUTE')
        // const query = `select * from  ${process.env.PRD}."IFA_CC_CLASIFICACIONES"`
        const query = `select * from  LAB_IFA_PRD."IFA_CC_CLASIFICACIONES"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Clasificaciones`
        }

    }
}
const costoComercialConceptos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialConceptos EXECUTE')
        // const query = `select * from  ${process.env.PRD}."IFA_CC_CONCEPTOS"`
        const query = `select * from  LAB_IFA_PRD."IFA_CC_CONCEPTOS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Conceptos`
        }

    }
}

const costoComercialCuenta = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialConceptos EXECUTE')
        // const query = `select "Account","AcctName" from ${process.env.PRD}."IFA_RW_CONCEPTOS_COMERCIALES" GROUP BY  "Account","AcctName"`
        const query = `select "Account","AcctName" from LAB_IFA_PRD."IFA_RW_CONCEPTOS_COMERCIALES" GROUP BY  "Account","AcctName"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Conceptos`
        }

    }
}
const filtroCC = async (areaCode, tipoCode, lineaCode, especialidadCode, clasificacionCode, conceptoCode, cuentaCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('costoComercialConceptos EXECUTE')
        const query = `CALL ${process.env.PRD}.IFA_LAPP_RW_FILTRAR_CONCEPTOS_COMERCIALES(${areaCode},${tipoCode},${lineaCode},${especialidadCode},${clasificacionCode},${conceptoCode},${cuentaCode})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo traer datos del costo comercial - Conceptos`
        }

    }
}

const actualizarGlosaRendicion = async (idRend, new_glosa) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarGlosaRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_GLOSA_RENDICION(${idRend},'${new_glosa}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            message: `${error.message || ''}`,
            error: `No se pudo actualizar la glosa`
        }

    }
}

const actualizarfechaContRendicion = async (idRend, new_date) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarGlosaRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_FECHACONT_RENDICION(${idRend},'${new_date}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo actualizar la fecha de la rendicion`
        }

    }
}

const actualizarGlosaPRDGastos = async (id, new_glosa_prd) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarCCRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_RENDICION_GASTOS_GLOSA_PRD(${id},'${new_glosa_prd}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo actualizar la glosa PRD del Gasto`
        }

    }
}

const actualizarCCRendicion = async (id, idRend, new_cuenta_cc) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarCCRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_CUENTA_CC(${id},${idRend},'${new_cuenta_cc}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo actualizar la cuenta CC`
        }

    }
}
const getProveedor = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select "LicTradNum", "CardFName", "CardCode" from ${process.env.PRD}.ifa_dm_proveedores where "LicTradNum" = '${id}'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en getProveedor: ${error.message | ''}`)
    }
}

const searchBeneficiarios = async (cadena) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_beneficiarios where upper("Code") LIKE '%${cadena}%' OR upper("Name") LIKE '%${cadena}%'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en searchBeneficiarios: ${error.message | ''}`)
    }
}

const concepComercialById = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL ${process.env.PRD}.ifa_rw_concepto_comercial_by_id(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en searchClients: ${error.message | ''}`)
    }
}


const busquedaProd = async (parametro) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarCCRendicion EXECUTE')
        const query = `select "AcctCode", "AcctName" from ${process.env.PRD}.ifa_dm_cuentas where "Postable" = 'Y' and ("AcctCode" like '6%' or "AcctCode" like '21%' or "AcctCode" = '1121201')  and (concat("AcctName","AcctCode") like '%${parametro}%')order by "AcctCode" limit 40`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo actualizar la cuenta CC`
        }

    }
}

const busquedaProveedor = async (parametro) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarCCRendicion EXECUTE')
        const query = `select * from ${process.env.PRD}.IFA_DM_PROVEEDORES where "CardName" like '%${parametro}%' OR "CardFName" like '%${parametro}%' limit 30 `
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo ejecutar busquedaProveedor`
        }

    }
}

const idJournalPreliminar = async (glosa) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('idJournalPreliminar EXECUTE')
        const query = `CALL "LAB_IFA_COM".IFA_INSERT_JOURNALS_PRELIMINAR('${glosa}');`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo ejecutar idJournalPreliminar`
        }

    }
}

const updateSendToAccounting = async(idRend)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('idJournalPreliminar EXECUTE')
        const query = `UPDATE ${process.env.LAPP}.LAPP_RENDICION_GASTOS SET SENDTOACCOUNTING = CURRENT_DATE WHERE ID_RENDICION_GASTOS = ${idRend}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo ejecutar updateSendToAccounting`
        }

    }
}

    
const lineaDetalleCC = async (
    idCom,
    Line_ID,
    AccountCode,
    ShortName,
    ContraAccount,
    Debit,
    Credit,
    DebitSys,
    CreditSys,
    ProjectCode,
    I_IdConceptoComercial,
    AdditionalReference,
    Reference1,
    Reference2,
    CostingCode,
    CostingCode2,
    CostingCode3,
    CostingCode4,
    CostingCode5,
    LineMemo,
    U_ComercialComments,
    U_TIPODOC,
    U_NIT,
    U_RSocial,
    U_NumAuto,
    U_B_cuf,
    U_NumDoc,
    U_FECHAFAC,
    U_IMPORTE,
    U_ICE,
    U_IEHD,
    U_IPJ,
    U_TASAS,
    U_OP_EXENTO,
    U_EXENTO,
    U_TASACERO,
    U_DESCTOBR,
    U_GIFTCARD,
    U_ESTADOFC,
    U_TIPOCOM,
    U_CODALFA,
    U_BenefCode,
    U_CardCode
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarCCRendicion EXECUTE')
        const query = `CALL "LAB_IFA_COM"."spInsertarLineaDetalle" (
            ${idCom || 0},
            ${Line_ID || 0},
        '${AccountCode || ''}',
        '${ShortName || ''}',
        '${ContraAccount || ''}',
        ${Debit || 0},
        ${Credit || 0},
        ${DebitSys || 0},
        ${CreditSys || 0},
       '${ProjectCode || ''}',
       ${I_IdConceptoComercial || 0},
        ${AdditionalReference || 0},
        '${Reference1 || ''}',
        '${Reference2 || ''}',
        '${CostingCode || ''}',
        '${CostingCode2 || ''}',
        '${CostingCode3 || ''}',
        '${CostingCode4 || ''}',
        '${CostingCode5 || ''}',
        '${LineMemo || ''}',
        '${U_ComercialComments || ''}',
        '${U_TIPODOC || ''}',
        '${U_NIT || ''}',
        '${U_RSocial || ''}',
        '${U_NumAuto || ''}',
        '${U_B_cuf || ''}',
        '${U_NumDoc || ''}',
        '${U_FECHAFAC || ''}',
        ${U_IMPORTE || 0},
        ${U_ICE || 0},
        ${U_IEHD || 0},
        ${U_IPJ || 0},
        ${U_TASAS || 0},
        ${U_OP_EXENTO || 0},
        ${U_EXENTO || 0},
        ${U_TASACERO || 0},
        ${U_DESCTOBR || 0},
        ${U_GIFTCARD || 0},
        '${U_ESTADOFC || ''}',
        ${U_TIPOCOM || 0},
        '${U_CODALFA || ''}',
        '${U_BenefCode || ''}',
        '${U_CardCode || ''}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo insertar el detalle preliminar bruto en COM`
        }
    }
}

const detallePreliminarCC = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('detallePreliminarCC EXECUTE')
        const query = `CALL "LAB_IFA_COM".ifa_copiar_journal_preliminar()`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
            error: `No se pudo insertar el detalle preliminar en COM. ${error.message | ''}`
        }
    }
}

const getRendicionesByEstado = async (estado) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * 
from LAB_IFA_LAPP.lapp_rendicion lr 
JOIN LAB_IFA_PRD.IFA_DM_EMPLEADOS le
on le."CardCode" = lr.CODEMP
where  "ESTADO"=${estado}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en getRendicionesByEstado: ${error.message | ''}`
        }
    }
}

const cambiarPreliminarRendicion = async (idRend) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_LAPP.LAPP_ACTUALIZAR_ESTADOS_RENDICION_GASTOS(${idRend})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en getRendicionesByEstado: ${error.message | ''}`
        }
    }
}

const listaRendicionesByCODEMP = async (codEmp) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.LAPP}.lapp_rendicion WHERE CODEMP = '${codEmp}'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en listaRendicionesByCODEMP: ${error.message | ''}`
        }
    }
}

const allGastosRange = async (starDate, endDate) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.LAPP}.LAPP_TODOS_GASTO_FECHA('${starDate}','${endDate}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en allGastosRange: ${error.message | ''}`
        }
    }
}

const importeByRend = async (idRend) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.LAPP}.LAPP_IMPORTETOTAL_BY_REND(${idRend})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw {
            message: `Error en importeByRend: ${error.message | ''}`
        }
    }
}

module.exports = {
    findAllAperturaCaja,
    findCajasEmpleado,
    rendicionDetallada,
    rendicionByTransac,
    crearRendicion,
    crearGasto,
    actualizarGastos,
    cambiarEstadoRendicion,
    verRendicionesEnRevision,
    employedByCardCode,
    actualizarEstadoComentario,
    actualizarEstadoRendicion,
    eliminarGastoID,
    costoComercialAreas,
    costoComercialTipoCliente,
    costoComercialLineas,
    costoComercialEspecialidades,
    costoComercialClasificaciones,
    costoComercialConceptos,
    costoComercialCuenta,
    filtroCC,
    actualizarGlosaRendicion,
    actualizarfechaContRendicion,
    getProveedor,
    searchBeneficiarios,
    findAllCajasEmpleados,
    concepComercialById,
    actualizarCCRendicion,
    actualizarGlosaPRDGastos,
    busquedaProd,
    busquedaProveedor,
    lineaDetalleCC,
    idJournalPreliminar,
    getRendicionesByEstado,
    cambiarPreliminarRendicion,
    findAllRendiciones,
    empleadoConCajaChicas,
    listaRendicionesByCODEMP,
    allGastosRange,
    detallePreliminarCC,
    importeByRend,
    updateSendToAccounting
}