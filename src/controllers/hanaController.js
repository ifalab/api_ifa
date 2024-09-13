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
        console.log('Datos obtenidos:', result);
        resolve(result);
      }
    })
  })
}
// Controlador para manejar la solicitud GET para obtener usuarios
exports.getUsuarios = async (req, res) => {
  try {
    // Verifica si la conexión a HANA está activa
    if (!connection) {
      await connectHANA();
    }

    // Construye la consulta SQL para obtener los grupos de clientes
    const query = `SELECT * FROM lab_ifa_qas.ifa_dm_usuarios`;

    // Ejecuta la consulta SQL
    connection.exec(query, (err, result) => {
      if (err) {
        console.error('Error en la consulta de grupos de clientes:', err.message);
        res.status(500).json({ message: 'Error al obtener los datos de grupos de clientes' });
      } else {
        // Envía una respuesta exitosa con los resultados en formato JSON
        res.status(200).json(result);
        console.log('Datos de grupos de clientes:', result);
      }
    });
  } catch (error) {
    console.error('Error en getUsuarios:', error.message);
    res.status(500).json({ message: 'Error al procesar la solicitud' });
  }
};
/////////////////////////////////////////////////////////////////////
// OBTENER LOTES
//////////////////////////////////////////////////////////////////////////
exports.getLotes = async (itemCode, warehouseCode, quantity) => {
  try {
    // Verifica si la conexión a HANA está activa
    if (!connection) {
      await connectHANA();
    }
    console.log(itemCode, warehouseCode, quantity)
    // Construye la consulta SQL para obtener los batchs basados en itemCode, warehouseCode y quantity
    const query = `CALL "LAB_IFA_QAS"."IFA_VM_SELECTION_BATCH_FEFO"('${itemCode}', '${warehouseCode}', ${quantity})`;

    // Ejecuta la consulta SQL
    return new Promise((resolve, reject) => {
      connection.exec(query, (err, result) => {
        if (err) {
          console.error('Error en la consulta batch:', err.message);
          reject(new Error('Error al obtener los datos de batch'));
        } else {
          console.log('Datos obtenidos:', result);
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error('Error en getBatchData:', error.message);
    throw new Error('Error al procesar la solicitud de batch');
  }
};

exports.getDocDueDate = async (docDate, paymentGroupCode) => {
  try {
    if (!connection) {
      await connectHANA();
    }
    console.log('request: ')

    const query = `CALL "LAB_IFA_QAS"."IFA_VM_GET_DUEDATE"('${docDate}',${paymentGroupCode})`

    return await executeQuery(query)

  } catch (error) {
    console.log(error)
    throw new Error('Error al obtener Doc Due Date')
  }
}

exports.getAbastecimiento = async () => {
  try {
    if (!connection) {
      await connectHANA();
    }
    const query = `select * from lab_ifa_prd.ifa_com_inv_kardex_valorado`
    return await executeQuery(query)
  } catch (error) {
    console.log(error)
    throw new Error('Error en la consulta: ', error)
  }
}



