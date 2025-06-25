const { getGeneralOverdueClients } = require("./hana.controller");

const overdueClientsByBranch = async (req, res) => {
  try {
    const data = await getGeneralOverdueClients();
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en overdueClientsByBranch ${error.message || 'No definido'}` });
  }
}

module.exports = {
    overdueClientsByBranch,
}