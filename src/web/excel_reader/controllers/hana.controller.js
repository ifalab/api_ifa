const hana = require('@sap/hana-client');
const bcrypt = require('bcryptjs')

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

            }
        })
    })
}

const insertDataLabVenCuotasDetalle = async (data) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log(data);
        const docDate = '2025-03-01'; 

        const tipoCliente = data.Tipo_Cliente || '';
        const linea = data.Linea.trim() || '';
        const lineNum = data.LineNum || 0;
        const itemCode = data.ItemCode || '';
        const cuotaCantidad = data.Cuota_Cantidad.toFixed(2) || 0;
        const cuotaVentaBs = data.Cuota_Venta_Bs.toFixed(2) || 0;
        const codAgencia = data.Cod_Agencia || 0;
        const codArea = data.Cod_Area || 0;
        const codZona = data.Cod_Zona || 0;

        const query = `insert into "LAB_IFA_DATA"."IFA_VEN_CUOTA_DETALLE" values(TO_DATE('${docDate}', 'YYYY-MM-DD'), '','','','${tipoCliente}','${linea}','',${lineNum},'${itemCode}','','',${cuotaCantidad},${cuotaVentaBs},${codAgencia},${codArea},${codZona},${0},${0},${0})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en insertDataLabVenCuotasDetalle:', error.message);
        return { message: `Error en insertDataLabVenCuotasDetalle: ${error.message || ''}` }
    }
}

const obtenerCodigoLineas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from  LAB_IFA_PRD."IFA_CC_LINEAS"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigoLineas:', error.message);
        return { message: `Error en obtenerCodigoLineas: ${error.message || ''}` }
    }
}
const obtenerCodigoAreas = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from LAB_IFA_PRD."IFA_CC_AREAS"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigoAreas:', error.message);
        return { message: `Error en obtenerCodigoAreas: ${error.message || ''}` }
    }
}
const obtenerCodigosTipos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from  LAB_IFA_PRD."IFA_CC_TIPOS"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigosTipos:', error.message);
        return { message: `Error en obtenerCodigosTipos: ${error.message || ''}` }
    }
}
const obtenerCodigosEspecialidades = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from  LAB_IFA_PRD."IFA_CC_ESPECIALIDADES"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigosEspecialidades:', error.message);
        return { message: `Error en obtenerCodigosEspecialidades: ${error.message || ''}` }
    }
}
const obtenerCodigosClasificacion = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from  LAB_IFA_PRD."IFA_CC_CLASIFICACIONES"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigosClasificacion:', error.message);
        return { message: `Error en obtenerCodigosClasificacion: ${error.message || ''}` }
    }
}

const obtenerCodigosConceptos = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `select * from  LAB_IFA_PRD."IFA_CC_CONCEPTOS"`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigosConceptos:', error.message);
        return { message: `Error en obtenerCodigosConceptos: ${error.message || ''}` }
    }
}

const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const insertDataIfaConceptosComerciales = async (data) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log(data);
        const createdAt = getCurrentDateTime();

        const id = data.Id || '';
        const codArea = data.CodigoArea || 0;
        const CodTipoCliente = data.CodigoTipoCliente || 0;
        const codLinea = data.CodigoLinea || 0;
        const codEspecialidad = data.CodigoEspecialidad || 0;
        const codClasificacion = data.CodigoClasificacion || 0;
        const codConceptos = data.CodigosConceptos || 0;
        const cuenta_contable = data.cuenta_contable || 0;


        const query = `insert into LAB_IFA_PRD.ifa_cc_conceptos_comerciales values(${id}, ${codArea},${CodTipoCliente},${codLinea},${codEspecialidad}, ${codClasificacion}, ${codConceptos}, ${cuenta_contable},${1}, '${createdAt}', null, null, ${true})`;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en insertDataIfaConceptosComerciales:', error.message);
        return { message: `Error en insertDataIfaConceptosComerciales: ${error.message || ''}` }
    }
}


const obtenerEmpleados = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `SELECT "CardCode", "CardName"
            FROM LAB_IFA_PRD."IFA_DM_CLIENTES" 
            WHERE "CardCode" LIKE 'E%' 
            AND "CardCode" <> 'E000254'
            AND "CardCode" <> 'E000624'
            AND "CardCode" <> 'E000010'`
        ;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigosConceptos:', error.message);
        return { message: `Error en obtenerCodigosConceptos: ${error.message || ''}` }
    }
}

const insertLabUsuarios = async (data) => {
    try {
        const {
            usercode,
            username,
            pass,
            codemp,
            confirm_pass,
            superuser,
            etiqueta,
        } = data
        console.log({
            usercode,
            username,
            pass,
            codemp,
            confirm_pass,
            superuser,
            etiqueta,
        })

        if (pass !== confirm_pass) {
            return res.status(400).json({ mensaje: 'las contraseñas son distintas' })
        }
        const salt = bcrypt.genSaltSync()
        const encryptPassword = bcrypt.hashSync(pass, salt)
        const result = await createUser(
            usercode,
            username,
            codemp,
            encryptPassword,
            superuser,
            etiqueta,)
        const response = result[0]

        const value = response["response"]

        if (value == 409) {
            throw new Error(`el usuario con el usercode: ${usercode}, ya existe`)
        }
        console.log(result);
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en creacion de usuarios`)
    }
}

const createUser = async (
    new_usercode,
    new_username,
    new_codemp,
    new_pass,
    new_superuser,
    new_etiqueta,
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_LAPP.LAPP_CREAR_USUARIO('${new_usercode}', '${new_username}','${new_codemp}','${new_pass}',${new_superuser},'${new_etiqueta}')`;
        console.log({ query });
        const result = await executeQuery(query);
        // console.log('hana')
        // console.log({ result })
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: createUser');
    }
}

const obtenerInventarioEntrada = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `SELECT * FROM LAB_IFA_PRD.ifa_cc_inv_input_data`
        ;
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en obtenerCodigosConceptos:', error.message);
        return { message: `Error en obtenerCodigosConceptos: ${error.message || ''}` }
    }
}

const insertInventarioEntrada = async (data) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const {
            TransType,
            TransNum,
            BatchNum,
            ItemCode,
            WhsCode,
            DocDate,
            InQtyL,
            ComlPrice,
        } = data
        console.log({
            TransType,
            TransNum,
            BatchNum,
            ItemCode,
            WhsCode,
            DocDate,
            InQtyL,
            ComlPrice,
        })

        const query = `insert into LAB_IFA_PRD.IFA_CC_INV_ENTRY 
        (TransNum, BatchNum, ItemCode, Warehouse, DocDate, Quantity, ComlPrice, UserSign) 
        values 
        (${TransNum}, '${BatchNum}', '${ItemCode}', '${WhsCode}', '${DocDate}', ${InQtyL}, ${ComlPrice}, ${1})`;
    
        console.log({ query })
        const result = await executeQuery(query)
        console.log(result);
        return result;
    } catch (error) {
        console.log({ error })
        throw new Error(`Error en insercion de inventario`)
    }
}


module.exports = {
  insertDataLabVenCuotasDetalle,
  obtenerCodigoLineas,
  obtenerCodigoAreas,
  obtenerCodigosTipos,
  obtenerCodigosEspecialidades,
  obtenerCodigosClasificacion,
  obtenerCodigosConceptos,
  insertDataIfaConceptosComerciales,
  obtenerEmpleados,
  insertLabUsuarios,
  obtenerInventarioEntrada,
  insertInventarioEntrada
}