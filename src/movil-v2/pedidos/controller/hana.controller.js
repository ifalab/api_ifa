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
        throw new Error('Error al obtener Doc Due Date')
    }
}

module.exports = { getDocDueDate }