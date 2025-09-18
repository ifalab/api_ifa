const { getPersonas, getAsistenciaVisitadores, getAsistenciaVendedores } = require("./hana.controller");
const { patchPersons } = require("./sld.controller");

const getPersonasController = async (req, res) => {
  try {
    const data = await getPersonas();

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en getPersonasController ${error.message || 'No definido'}` });
  }
}

const getAsistenciaVisitadoresController = async (req, res) => {
  try {
    const {start,end,shift,sucname} = req.query;
    let turno = null;
    let sucursal = null;
    if (shift != ''){
      turno = `'${shift}'`;
    }
    if (sucname != ''){
      sucursal = `'${sucname}'`;
    }
    console.log('turnosucursal',turno,sucursal)
    const data = await getAsistenciaVisitadores(start,end,turno,sucursal);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en getAsistenciaVisitadoresController ${error.message || 'No definido'}` });
  }
}

const getAsistenciaVendedoresController = async (req, res) => {
  try {
    const {start,end,shift,sucname} = req.query;


    let turno = null;
    let sucursal = null;
    if (shift != ''){
      turno = `'${shift}'`;
    }
    if (sucname != ''){
      sucursal = `'${sucname}'`;
    }
    console.log('turnosucursal',turno,sucursal)

    const data = await getAsistenciaVendedores(start,end,turno,sucursal);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en getAsistenciaVendedoresController ${error.message || 'No definido'}` });
  }
}

const patchPersonController = async (req, res) => {
  try {

    // return res.json(req.body);
    const personData = req.body;

    let genderSapFormat;
    if (personData.Gender === "M") {
      genderSapFormat = "gt_Male";
    } else if (personData.Gender === "F") {
      genderSapFormat = "gt_Female";
    }
    const responseJson = {
      IdNumber: parseInt(personData.CI, 10),
      Gender: genderSapFormat,
    };
    const code = personData.EmpCode;
    console.log('code',code)
    const data = await patchPersons(code, responseJson);
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error({ error })
    return res.status(500).json({ mensaje: `Error en patchPersonController ${error.message || 'No definido'}` });
  }
}



module.exports = {
    getPersonasController,
    patchPersonController,
    getAsistenciaVisitadoresController,
    getAsistenciaVendedoresController
}