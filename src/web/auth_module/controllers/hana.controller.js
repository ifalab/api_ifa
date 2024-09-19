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
        res.status(500).json({ message: 'Error al procesar la solicitud: login user' });
    }
}


module.exports = {
    loginUser,
}