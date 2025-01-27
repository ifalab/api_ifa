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
                reject(new Error('error en la consulta'))
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA('','')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA('','NORMALES')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA('','CADENAS')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA('','INSTITUCIONES')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA('','IFAVET')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA('','MASIVOS')`
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
        const query = `call LAB_IFA_DATA.VEN_GROUPBY_DIMA_CUBE_B_X_C1('${userCode}','${dim1}','${dim2}','${dim3}',${groupBy})`

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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_ANT('','')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_ANT('','NORMALES')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_ANT('','CADENAS')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_ANT('','INSTITUCIONES')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_ANT('','IFAVET')`
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
        const query = `CALL LAB_IFA_DATA.VEN_GROUPBY_DIMA_ANT('','MASIVOS')`
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
        throw new Error('Error al procesar la solicitud: ventasUsuario');
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
        throw new Error('Error al procesar la solicitud: ventasUsuario');
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
        const query = `call "LAB_IFA_LAPP".LAPP_VEN_VENTAS_ZONA_ANT('${username}','${line}','${groupBy}');`;
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
        throw new Error('error en descripcionArticulo')
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
        throw new Error('error en descripcionArticulo')
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
    unidadMedida
}
