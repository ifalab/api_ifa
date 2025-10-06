const { getGeneralOverdueClients,getVendedoresSuc, getClientesVendidos, getEfectividadVentasNormales, getEfectividadVentasNormalesMesAnterior, obtenerVisitasFueraDeRuta } = require("./hana.controller");

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

const efectividadVentasNormales = async (req, res) => {
  try {
    const data = await getEfectividadVentasNormales();
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en efectividadVentasNormales ${error.message || 'No definido'}` });
  }
}

const getVendedoresSucController = async (req, res) => {
  try {

    const {SucCode} = req.query;
    console.log('console',req.query);
    const data = await getVendedoresSuc(SucCode);
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en efectividadVentasNormales ${error.message || 'No definido'}` });
  }
}

const getClientesPorVendedor = async (req, res) => {
  try {

    const {SucCode, VendedorName} = req.query;
    console.log('console',req.query);
    const data = await getClientesVendidos(SucCode,VendedorName);
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en getClientesPorVendedor ${error.message || 'No definido'}` });
  }
}

const efectividadVentasNormalesMesAnterior = async (req, res) => {
  try {
    const data = await getEfectividadVentasNormalesMesAnterior();
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en efectividadVentasNormalesMesAnterior ${error.message || 'No definido'}` });
  }
}

const obtenerVisitasFueraDeRutaController = async (req, res) => {
  try {

    const user = req.usuarioAutorizado;

    const data = await obtenerVisitasFueraDeRuta(user.ID_VENDEDOR_SAP);

    
    
    return res.status(200).json(data);

  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en obtenerVisitasFueraDeRutaController ${error.message || 'No definido'}` });
  }
}



module.exports = {
    overdueClientsByBranch,
    efectividadVentasNormales,
    efectividadVentasNormalesMesAnterior,
    obtenerVisitasFueraDeRutaController,
    getVendedoresSucController,
    getClientesPorVendedor
}