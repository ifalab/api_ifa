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
                // console.log('Datos obtenidos:', result);
                resolve(result);
            }
        })
    })
}

const getUsuarios = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `SELECT * FROM ${process.env.DBSAPPRD}.ifa_dm_usuarios`;
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getUsuarios:', error.message);
        return error
    }
};

const getLotes = async (itemCode, warehouseCode, quantity) => {
    try {

        if (!connection) {
            await connectHANA();
        }
        console.log(itemCode, warehouseCode, quantity)
        const query = `CALL "${process.env.DBSAPPRD}"."IFA_VM_SELECTION_BATCH_FEFO"('${itemCode}', '${warehouseCode}', ${quantity})`;

        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.error('Error en getBatchData:', error.message);
        return error
    }
};

const getDocDueDate = async (docDate, paymentGroupCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('request: ')
        const query = `CALL "${process.env.DBSAPPRD}"."IFA_VM_GET_DUEDATE"('${docDate}',${paymentGroupCode})`
        return await executeQuery(query)
    } catch (error) {
        console.log(error)
        throw new Error('Error en la consulta: ', error)
    }
}

const getAbastecimiento = async () => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `select * from ${process.env.DBSAPPRD}.ifa_com_inv_kardex_valorado`
        return await executeQuery(query)
    } catch (error) {
        console.log(error)
        throw new Error('Error en la consulta: ', error)
    }
}

const userById = async (userCode) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const query = `CALL lab_ifa_prd.IFA_LAPP_USER_BY_ID('${userCode}')`
        const result = await executeQuery(query);

        if (result.length === 0) {
            return undefined;
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
        console.log(error)
        return error
    }
}

module.exports = {
    getDocDueDate,
    getUsuarios,
    getLotes,
    getAbastecimiento,
    userById,
}

