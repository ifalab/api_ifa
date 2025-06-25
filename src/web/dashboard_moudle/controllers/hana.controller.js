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

module.exports = {
  getGeneralOverdueClients,
}