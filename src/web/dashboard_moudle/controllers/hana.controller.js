const { executeQueryWithConnection } = require("../../utils/hana-util-connection");

const getGeneralOverdueClients = async (req, res) => {
  try {
    console.log('getGeneralOverdueClients EXECUTE');
    const query = `SELECT * FROM ${process.env.PRD}.IFA_MD_OVERDUE_CLIENTS_SUMMARY_BY_BRANCH;`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getGeneralOverdueClients: ${error.message || ''}`
    }
  }
}

const getEfectividadVentasNormales = async (req, res) => {
  try {
    console.log('getEfectividadVentasNormales EXECUTE');
    const query = `call ${process.env.PRD}.IFASP_GET_EFECTVITY_NORMALES_BY_SUC();`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getEfectividadVentasNormales: ${error.message || ''}`
    }
  }
}

const getEfectividadVentasNormalesMesAnterior = async (req, res) => {
  try {
    console.log('getEfectividadVentasNormales EXECUTE');
    const query = `call ${process.env.PRD}.IFASP_GET_EFECTVITY_NORMALES_BY_SUC_PREV_MONTH();`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getEfectividadVentasNormalesMesAnterior: ${error.message || ''}`
    }
  }
}


const obtenerVisitasFueraDeRuta = async (id_vendedor) => {
  try {
    console.log('obtenerVisitasFueraDeRuta EXECUTE');
    const query = `call ${process.env.PRD}.IFASP_VERIFICAR_MOTIVO_NO_VISITA('${id_vendedor}');`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en obtenerVisitasFueraDeRuta: ${error.message || ''}`
    }
  }
}

module.exports = {
  getGeneralOverdueClients,
  getEfectividadVentasNormales,
  getEfectividadVentasNormalesMesAnterior,
  obtenerVisitasFueraDeRuta
}