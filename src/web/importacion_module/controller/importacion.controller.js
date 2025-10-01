const { grabarLog } = require("../../shared/controller/hana.controller");
const { obtenerimportacionStatus } = require("./hana.controller");

const importacionStatusController = async (req, res) => {
    try {
        const data = await obtenerimportacionStatus()
        return res.json({ data })

    } catch (error) {
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Importaciones Status", `${error.message || 'Error al obtener impotationStatus'}`, `importacion status controller`, "importacion-status", process.env.PRD)
        console.log('error en importacionStatusController')
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el controlador' })
    }
}


module.exports = {
   importacionStatusController
}