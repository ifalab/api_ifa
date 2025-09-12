const { executeQueryWithConnection } = require("../../utils/hana-util-connection");


const getPersonas = async (req, res) => {
  try {
    console.log('getPersonas EXECUTE');
    const query = `SELECT * FROM ${process.env.PRD}.IFA_DM_PERSONAS;`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getPersonas: ${error.message || ''}`
    }
  }
}


const getAsistenciaVisitadores = async (start,end,shift,sucname) => {
  try {
    console.log('getAsistenciaVisitadores EXECUTE');
    const query = `call ${process.env.PRD}.VIS_OBTENER_ASISTENCIAS_FILTRADAS_FOR_RRHH('${start}','${end}',${shift},${sucname});`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getAsistenciaVisitadores: ${error.message || ''}`
    }
  }
}

const getAsistenciaVendedores = async (start,end,shift,sucname) => {
  try {
    console.log('getAsistenciaVendedores EXECUTE');
    const query = `call ${process.env.PRD}.VIS_OBTENER_ASISTENCIAS_VENDEDORES_FILTRADAS('${start}','${end}',${shift},${sucname});`;
    console.log({ query });
    return await executeQueryWithConnection(query);
  } catch (error) {
    throw {
      message: `Error en getAsistenciaVendedores: ${error.message || ''}`
    }
  }
}


module.exports = {
  getPersonas,
  getAsistenciaVisitadores,
  getAsistenciaVendedores
}