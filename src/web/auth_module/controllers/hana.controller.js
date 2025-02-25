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
                reject(new Error(`${err.message || 'Error en la consulta'}`))
            } else {
                console.log('Datos obtenidos con exito');
                resolve(result);
                // console.log({result})
            }
        })
    })
}

const loginUser = async (username, password) => {
    try {
        if (!connection) {
            await connectHANA();
        }

        const query = `call LAB_IFA_PRD.IFA_LAPP_AUTH_USER('${username}', '${password}')`;
        console.log({ query });
        const result = await executeQuery(query);

        if (result.length === 0) {
            return { mensaje: 'error, no se encontraron datos para el usuario' };
        }

        let dimensionUno = [];
        result.forEach((item) => {
            const { DimRole1 } = item;
            if (!dimensionUno.includes(DimRole1)) {
                dimensionUno.push(DimRole1);
            }
        });

        let dimensionDos = [];
        result.forEach((item) => {
            const { DimRole2 } = item;
            if (!dimensionDos.includes(DimRole2)) {
                dimensionDos.push(DimRole2);
            }
        });

        let dimensionTres = [];
        result.forEach((item) => {
            const { DimRole3 } = item;
            if (!dimensionTres.includes(DimRole3)) {
                dimensionTres.push(DimRole3);
            }
        });

        const userData = result[0];
        if (!userData || userData.DimRole1 === undefined || userData.DimRole2 === undefined || userData.DimRole3 === undefined) {
            return { mensaje: 'error, el usuario no tiene dimensiones' };
        }

        const { DimRole1, DimRole2, DimRole3, ...restDataUser } = userData;
        const user = restDataUser;

        return { ...user, dimensionUno, dimensionDos, dimensionTres };
    } catch (error) {
        console.error('Error en getUsuarios:', error.message);
        throw new Error('Error al procesar la solicitud: login user');
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
        console.log({
            new_usercode,
            new_username,
            new_pass,
            new_superuser,
            new_etiqueta,
        })
        const query = `call LAB_IFA_LAPP.LAPP_CREAR_USUARIO('${new_usercode}', '${new_username}','${new_codemp}','${new_pass}',${new_superuser},'${new_etiqueta}')`;
        console.log({ query });
        const result = await executeQuery(query);
        console.log('hana')
        console.log({ result })
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('Error al procesar la solicitud: createUser');
    }
}

const findUserByUsercode = async (usercode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call LAB_IFA_LAPP.LAPP_USER_BY_USERCODE('${usercode}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en login user V2')
    }
}

const findUserById = async (id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log(id)
        const query = `call LAB_IFA_LAPP.LAPP_USER_BY_ID('${id}')`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findUserById')
    }
}

const findAllUser = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('find all user execute')
        const query = `call LAB_IFA_LAPP.LAPP_USUARIO_TODOS()`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllUser')
    }
}

const updateUser = async (
    id_user,
    new_usercode,
    new_username,
    new_codemp,
    new_superuser,
    new_isactive,
    new_etiqueta
) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('update User execute')
        const query = `call LAB_IFA_LAPP.LAPP_ACTUALIZAR_USUARIO(${id_user},'${new_usercode}','${new_username}','${new_codemp}',${new_superuser},${new_isactive},'${new_etiqueta}')`
        const result = await executeQuery(query)
        console.log({query})
        // console.log({result})
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en updateUser')
    }
}

const desactiveUser = async (id_user,) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('desactiveUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_DESACTIVAR_USUARIO(${id_user})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en desactiveUser')
    }
}

const activeUser = async (id_user,) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('activeUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_ACTIVAR_USUARIO(${id_user})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en activeUser')
    }
}

const findDimension = async (dimension) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('findDimension execute')
        let query = ``

        if (dimension == 1) query = `SELECT * FROM LAB_IFA_LAPP.LAPP_DIMENSIONUNO`
        // if (dimension == 2) query = `SELECT * FROM ${process.env.PRD}.IFA_DM_CLIENTES_TIPOS`
        if (dimension == 2) query = `SELECT * FROM LAB_IFA_LAPP.LAPP_DIMENSIONDOS`
        if (dimension == 3) query = `SELECT "LineItemCode" as "ID", "LineItemName" as "DIMROLE" FROM ${process.env.PRD}.IFA_DM_LINEAS`
        // if (dimension == 3) query = `SELECT * FROM LAB_IFA_LAPP.LAPP_DIMENSIONTRES`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en findDimension')
    }
}

const addUsuarioDimensionUno = async (id_user, id_dimension) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('addUsuarioDimensionUno execute')
        const query = `call LAB_IFA_LAPP.LAPP_ADD_USUARIO_DIMENSION_UNO(${id_user},${id_dimension})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en addUsuarioDimensionUno')
    }
}

const addUsuarioDimensionDos = async (id_user, id_dimension) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('addUsuarioDimensionDos execute')
        const query = `call LAB_IFA_LAPP.LAPP_ADD_USUARIO_DIMENSION_DOS(${id_user},${id_dimension})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en addUsuarioDimensionDos')
    }
}

const addUsuarioDimensionTres = async (id_user, id_dimension) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('addUsuarioDimensionTres execute')
        const query = `call LAB_IFA_LAPP.LAPP_ADD_USUARIO_DIMENSION_TRES(${id_user},${id_dimension})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en addUsuarioDimensionTres')
    }
}

const rollBackDimensionUnoByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rollBackDimensionUnoByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_ROLLBACK_DIMENSION_UNO_BY_USER(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rollBackDimensionUnoByUser')
    }
}

const rollBackDimensionDosByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rollBackDimensionDosByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_ROLLBACK_DIMENSION_DOS_BY_USER(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rollBackDimensionDosByUser')
    }
}

const rollBackDimensionTresByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('rollBackDimensionTresByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_ROLLBACK_DIMENSION_TRES_BY_USER(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en rollBackDimensionTresByUser')
    }
}

const dimensionUnoByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('dimensionUnoByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_DIMENSION_UNO_X_USUARIO(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en dimensionUnoByUser')
    }
}

const dimensionDosByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('dimensionDosByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_DIMENSION_DOS_X_USUARIO(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en dimensionDosByUser')
    }
}

const dimensionTresByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('dimensionTresByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_DIMENSION_TRES_X_USUARIO(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en dimensionTresByUser')
    }
}

const roleByUser = async (id_user) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('roleByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_ROL_X_USUARIO(${id_user})`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en roleByUser')
    }
}

const updatePasswordByUser = async (id_user,pass) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('updatePasswordByUser execute')
        const query = `call LAB_IFA_LAPP.LAPP_ACTUALIZAR_PASS(${id_user},'${pass}')`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en updatePasswordByUser')
    }
}

const addRolUser = async (id_user, id_rol) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('addRolUser execute')
        const query = `CALL "LAB_IFA_LAPP".LAPP_ADD_USUARIO_ROL(${id_user},${id_rol});`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en addRolUser')
    }
}

const userVendedor = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('userVendedor execute')
        const query = `SELECT ID FROM "LAB_IFA_LAPP"."LAPP_USUARIO" WHERE USERCODE LIKE '%123%'`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en userVendedor')
    }
}
const deleteRolUser = async(id_user)=>{
    try {
        
        if (!connection) {
            await connectHANA();
        }

        console.log('deleteRolUser execute')
        const query = `CALL "LAB_IFA_LAPP".LAPP_DELETE_USUARIO_ROL(${id_user});`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en deleteRolUser')
    }
}

const deleteOneRolUser = async(id_user,id_rol)=>{
    try {
        
        if (!connection) {
            await connectHANA();
        }

        console.log('deleteOneRolUser execute')
        const query = `CALL "LAB_IFA_LAPP".LAPP_DELETE_UN_ROL_USUARIO(${id_user},${id_rol});`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en deleteOneRolUser')
    }
}

const findAllRoles = async()=>{
    try {
        
        if (!connection) {
            await connectHANA();
        }

        console.log('findAllRoles execute')
        const query = `SELECT * FROM "LAB_IFA_LAPP".LAPP_ROL;`
        console.log({ query })
        const result = await executeQuery(query)
        return result

    } catch (error) {
        console.log({ error })
        throw new Error('error en findAllRoles')
    }
}

const getDmUsers = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_USUARIOS`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en getDmUsers')
    }
}

const getAllAlmacenes = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.IFA_DM_ALMACENES`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en getAllAlmacenes')
    }
}
const getAlmacenesByUser = async (id_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_obtener_almacenes_auth_por_usuario(${id_sap})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en getAlmacenesByUser')
    }
}
const addAlmacenUsuario = async (id_sap, cod_alm) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_agregar_almacen_auth_por_usuario(${id_sap},'${cod_alm}');`

        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result,
            query: query
        }
    } catch (error) {
        console.log({ error })
        return {
            statusCode: 400,
            message: `Error en addAlmacenUsuario: ${error.message || ''}`,
            query: 'ifa_dm_agregar_almacen_auth_por_usuario'
        }
    }
}

const deleteAlmacenUsuario = async (id_sap, cod_alm) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_eliminar_almacen_auth_por_usuario(${id_sap},'${cod_alm}');`

        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result,
            query: query
        }
    } catch (error) {
        console.log({ error })
        return {
            statusCode: 400,
            message: `Error en deleteAlmacenUsuario: ${error.message || ''}`,
            query: 'ifa_dm_eliminar_almacen_auth_por_usuario'
        }
    }
}

const getDespachadores = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.PRD}.ifa_dm_despachadores`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getDespachadores: ${error.message || ''}`)
    }
}

const getRutasLibresPorDespachador = async (id_vendedor_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_rutas_libres_por_despachador(${id_vendedor_sap})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error(`error en getRutasLibresPorDespachador: ${error.message || ''}`)
    }
}

const getRutasAsignadasPorDespachador = async (id_vendedor_sap) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_rutas_asignadas_por_despachador(${id_vendedor_sap})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en getRutasAsignadasPorDespachador')
    }
}
const addRutasDespachadores = async (id_vendedor_sap, id_ruta) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_agregar_rutas_a_despachadores(${id_vendedor_sap},${id_ruta});`

        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result,
            query: query
        }
    } catch (error) {
        console.log({ error })
        return {
            statusCode: 400,
            message: `Error en addRutasDespachadores: ${error.message || ''}`,
            query: 'ifa_dm_agregar_rutas_a_despachadores'
        }
    }
}
const deleteRutasDespachadores = async (id_vendedor_sap, id_ruta) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `call ${process.env.PRD}.ifa_dm_eliminar_rutas_a_despachadores(${id_vendedor_sap},${id_ruta});`

        const result = await executeQuery(query)
        return {
            statusCode: 200,
            data: result,
            query: query
        }
    } catch (error) {
        console.log({ error })
        return {
            statusCode: 400,
            message: `Error en deleteRutasDespachadores: ${error.message || ''}`,
            query: 'ifa_dm_eliminar_rutas_a_despachadores'
        }
    }
}

module.exports = {
    loginUser,
    createUser,
    findUserByUsercode,
    findUserById,
    findAllUser,
    updateUser,
    desactiveUser,
    findDimension,
    addUsuarioDimensionUno,
    addUsuarioDimensionDos,
    addUsuarioDimensionTres,
    rollBackDimensionUnoByUser,
    rollBackDimensionDosByUser,
    rollBackDimensionTresByUser,
    dimensionUnoByUser,
    dimensionDosByUser,
    dimensionTresByUser,
    updatePasswordByUser,
    activeUser,
    roleByUser,
    addRolUser,
    deleteRolUser,
    deleteOneRolUser,
    findAllRoles,
    userVendedor,
    getDmUsers,
    getAllAlmacenes,
    getAlmacenesByUser,
    addAlmacenUsuario,
    deleteAlmacenUsuario,
    getRutasLibresPorDespachador,
    getRutasAsignadasPorDespachador,
    addRutasDespachadores,
    getDespachadores,
    deleteRutasDespachadores
}