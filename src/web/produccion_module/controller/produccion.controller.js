const { 
    getLotes, cambiarEstadoLote, searchLotes,
} = require("./hana.controller")

const getLotesController = async (req, res) => {
    try {
        const status = req.query.status
        let response = await getLotes(status)
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

const searchLotesController = async (req, res) => {
    try {
        const { cadena, status } = req.body
        let response = await searchLotes(cadena, status)
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
        return res.status(500).json({ mensaje: `Error en el controlador searchLotesController: ${error.message}` })
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
    cambiarEstadoLoteController,
    searchLotesController
}