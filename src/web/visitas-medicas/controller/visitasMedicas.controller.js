const { todasLasRegiones, medicosPorRegion } = require("./hanna.controller")

const todasLasRegionesController = async (req, res) => {
    try {
        const result = await todasLasRegiones()
        return res.status(200).json(result)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'error en todasLasRegionesController',
            error
        })
    }

}

const medicosPorRegionController = async (req, res) => {
    try {
        const {region} = req.body
        const result = await medicosPorRegion()
        let listMedicos = []
        result.map((item)=>{
            if(item.SucName == region){
                listMedicos.push(item)
            }
        })
        return res.status(200).json(listMedicos)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({
            mensaje: 'hubo un error en medicosPorRegionController'
        })
    }

}

module.exports = {
    todasLasRegionesController,
    medicosPorRegionController,
}