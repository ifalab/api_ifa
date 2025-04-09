const { response } = require("express")
const { getLotes, cambiarEstadoLote } = require("./hana.controller")

const getLotesController = async (req, res) => {
    try {
        let response = await getLotes()
        const groupedByBatch = response.reduce((acc, item) => {
                    if (!acc[item.BatchNum]) {
                        acc[item.BatchNum] = {
                            BatchNum: item.BatchNum,
                            Status: item.Status,
                            StatusDescr: item.StatusDescr,
                            CreateDate: item.CreateDateStatus,
                            Detalle: []
                        };
                    }
                    acc[item.BatchNum].Detalle.push({
                        UserCode: item.UserCode,
                        UserName: item.UserName,
                        ItemCode: item.ItemCode,
                        ItemName: item.ItemName,
                        ExpDate: item.ExpDate,
                        CreateDate: item.CreateDate,
                    });
        
                    return acc;
                }, {});
        
        response = Object.values(groupedByBatch).sort((a, b) => new Date(b.CreateDate) - new Date(a.CreateDate));

        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador getLotesController: ${error.message}` })
    }
}
const cambiarEstadoLoteController = async (req, res) => {
    try {
        const { lote, estado, usuario, comentario } = req.body
        let response = await cambiarEstadoLote(lote, estado, usuario, comentario)
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador cambiarEstadoLoteController: ${error.message}` })
    }
}

module.exports = {
    getLotesController,
    cambiarEstadoLoteController
}