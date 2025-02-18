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
                reject(new Error('error en la consulta'))
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

const crearRendicion = async (NEW_TransactionId, NEW_CodEmp, NEW_ESTADO, NEW_MES, NEW_YEAR,new_glosa) => {
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
    new_id_cuenta
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('crearRendicion EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_CREAR_RENDICION_GASTOS('${new_nit}','${new_tipo}','${new_gasto}','${new_nroFactura}','${new_codAut}','${new_fecha}','${new_nombreRazon}','${new_glosa}',${new_importeTotal},${new_ice},${new_iehd},${new_ipj},${new_tasas},${new_otroNoSujeto},${new_exento},${new_tasaCero},${new_descuento},'${new_codControl}',${new_gifCard},'1',${idRendicion},${month},${year},'${new_comentario || ''}',${new_id_cuenta})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        return {
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
    new_id_cuenta
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('actualizarGastos EXECUTE')
        const query = `CALL LAB_IFA_LAPP.LAPP_ACTUALIZAR_RENDICION_GASTOS(${ID},'${new_nit}','${new_tipo}','${new_gasto}','${new_nroFactura}','${new_codAut}','${new_fecha}','${new_nombreRazon}','${new_glosa}',${new_importeTotal},${new_ice},${new_iehd},${new_ipj},${new_tasas},${new_otroNoSujeto},${new_exento},${new_tasaCero},${new_descuento},'${new_codControl}',${new_gifCard},'${new_estado}',${idRendicion},'${new_comentario || ''}',${new_id_cuenta})`
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
        const query = `SELECT * FROM LAB_IFA_LAPP.LAPP_RENDICION WHERE ESTADO = '2' OR ESTADO = '3' OR ESTADO = '7'`
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
        // const query = `select * from ${process.env.PRD}."IFA_CC_AREAS"`
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
const filtroCC = async (areaCode,tipoCode,lineaCode,especialidadCode,clasificacionCode,conceptoCode, cuentaCode) => {
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
}