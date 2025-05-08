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


const ObtenerLibroMayor = async (cuenta) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        const number_cuenta = Number(cuenta);
        if (!number_cuenta || isNaN(number_cuenta)) {
          throw new Error(`Cuenta inválida: ${cuenta}`);
      }

        console.log('ObtenerLibroMayor EXECUTE')
        const query = `CALL LAB_IFA_COM.FIN_OBTENER_MAYOR_POR_CUENTA(${number_cuenta})`
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en ObtenerLibroMayor')
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

const getNombreUsuario = async(id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('getNombreUsuario EXECUTE')
        const query = `SELECT id, username FROM lab_ifa_lapp.lapp_usuario WHERE id = ${id}`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en getNombreUsuario')
    }
}

const getDocFuentes = async(id) => {
    try {
        if (!connection) {
            await connectHANA();
        }
        console.log('getNombreUsuario EXECUTE')
        const query = `SELECT * FROM LAB_IFA_COM.IFA_CC_DOCUMENTOS_FUENTES`
        console.log({ query })
        const result = await executeQuery(query)
        return result
    } catch (error) {
        console.log({ error })
        throw new Error('error en getNombreUsuario')
    }
}
module.exports = {
  ObtenerLibroMayor,
  cuentasCC,
  getNombreUsuario,
  getDocFuentes
}