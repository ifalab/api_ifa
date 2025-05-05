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

const tipoDeCambio = async () => {
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

const tipoDeCambioByFecha = async (fecha) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('tipoDeCambion EXECUTE')
        const query = `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS_BY_FECHA('${fecha}');`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en tipoDeCambion')
    }
}

const empleadosHana = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('empleadosHana EXECUTE')
        const query = `SELECT * FROM "${process.env.PRD}"."IFA_DM_EMPLEADOS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en empleadosHana')
    }
}

const findEmpleadoByCode = async (code) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findEmpleadoByCode EXECUTE')
        const query = `CALL "${process.env.PRD}".IFA_DM_BUSCAR_EMPLEADO_POR_CODIGO('${code}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findEmpleadoByCode')
    }
}

const findAllBancos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findAllBancos EXECUTE')
        const query = `SELECT * FROM "${process.env.PRD}"."IFA_DM_TODOS_BANCOS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllBancos')
    }
}

const findAllAccount = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findAllAccount EXECUTE')
        const query = `select "AcctCode", "AcctName" from ${process.env.PRD}.ifa_dm_cuentas where "AcctCode" in ('1120501','1110301')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllAccount')
    }
}

const dataCierreCaja = async (id)=>{
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('dataCierreCaja EXECUTE')
        const query = `call ${process.env.PRD}.ifa_lapp_rw_obtener_caja_para_cerrar(${id})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en dataCierreCaja')
    }
}

const cuentasCC = async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cuentasCC EXECUTE')
        const query = `SELECT "AcctCode", "AcctName" FROM LAB_IFA_COM.ACCOUNT WHERE "Postable" = 'Y'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en cuentasCC')
    }
}

const sucursalesCC= async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cuentasCC EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM.DIM1`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en cuentasCC')
    }
}

const tipoClienteCC= async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cuentasCC EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM.DIM2`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en cuentasCC')
    }
}

const lineaCC= async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cuentasCC EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM.DIM3`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en cuentasCC')
    }
}

const subLineaCC= async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cuentasCC EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM.DIM31`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en cuentasCC')
    }
}

const asientosContablesCC= async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('cuentasCC EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_JOURNAL`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en cuentasCC')
    }
}

const asientosPreliminaresCC= async(id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('IFA_CC_JOURNAL_PRELIMINAR EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM."IFA_CC_JOURNAL_PRELIMINAR" WHERE "TransId" = ${id}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en asientosPreliminaresCC')
    }
}

const asientosPreliminaresCCIds= async() => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('IFA_CC_JOURNAL_PRELIMINAR_IDS EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM."IFA_CC_JOURNAL_PRELIMINAR_IDS"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en asientosPreliminaresCCIds')
    }
}

const rendicionesPorCaja= async(idCaja) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rendicionesPorCaja EXECUTE')
        const query = `call ${process.env.PRD}.ifa_rw_obtener_rendiciones_por_caja(${idCaja});`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rendicionesPorCaja')
    }
}

const sociosNegocio= async(idCaja) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('sociosNegocio EXECUTE')
        const query = `SELECT "CardCode", "CardName" FROM LAB_IFA_COM.PARTNERS ORDER BY "CardCode"`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en sociosNegocio')
    }
}
module.exports = {
    tipoDeCambio,
    empleadosHana,
    findEmpleadoByCode,
    findAllBancos,
    findAllAccount,
    dataCierreCaja,
    tipoDeCambioByFecha,
    cuentasCC,
    asientosContablesCC,
    sucursalesCC,
    tipoClienteCC,
    lineaCC,
    subLineaCC,
    rendicionesPorCaja,
    asientosPreliminaresCC,
    asientosPreliminaresCCIds,
    sociosNegocio
}