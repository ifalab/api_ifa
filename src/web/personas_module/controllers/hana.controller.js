const { executeQueryWithConnection } = require("../../utils/hana-util-connection");


const getPersonas = async (req, res) => {
  try {
    console.log('getPersonas EXECUTE');
    const query = `SELECT * FROM LAB_IFA_DEV1.IFA_DM_PERSONAS;`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getEfectividadVentasNormalesMesAnterior: ${error.message || ''}`
    }
  }
}


module.exports = {
  getPersonas
}