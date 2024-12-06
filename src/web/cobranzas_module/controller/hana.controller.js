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
        console.log({query})
        return await executeQuery(query)
    } catch (error) {
        console.log({error})
        return {
            error:`no se pudieron traer las cobranzas del mes anterior del vendedor ${username}`
        }
    }
}

const clientePorVendedor = async(nombre)=>{
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL LAB_IFA_PRD.IFA_LAPP_SALDO_DEUDOR_CLI_BY_VEND('${nombre}')`
        console.log({query})
        return await executeQuery(query)
    } catch (error) {
        console.log({error})
        return {
            error:`no se pudo traer los datos`
        }
    }
}

const cobranzaSaldoDeudor = async (nombre,codigo) => {
    try {
        if (!connection) {
            await connectHANA()
        }
        const query = `CALL LAB_IFA_PRD.IFA_LAPP_SALDO_DEUDOR_BY_VEND_OR_CLI('${nombre}','${codigo}')`
        console.log({query})
        return await executeQuery(query)
    } catch (error) {
        console.log({error})
        return {
            error:`no se pudo traer los datos`
        }
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
}
