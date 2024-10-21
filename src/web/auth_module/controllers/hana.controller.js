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
        const query = `call LAB_IFA_LAPP.LAPP_CREAR_USUARIO('${new_usercode}', '${new_username}','${new_pass}',${new_superuser},'${new_etiqueta}')`;
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

createLoginUserv2 = async (usercode) => {
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

findUserById = async (id) => {
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


module.exports = {
    loginUser,
    createUser,
    createLoginUserv2,
    findUserById,
    findAllUser,
}