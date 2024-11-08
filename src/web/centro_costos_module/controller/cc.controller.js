const { postInventoryEntries } = require("./sld.controller")

const postInventoryEntriesController = async (req, res) => {
    try {
        const { data } = req.body
        const sapRespone = await postInventoryEntries(data)
        console.log({ sapRespone })
        if (sapRespone.value) {
            return res.status(400).json({ messageSap: `${sapRespone.value}` })
        }
        return res.json({ status: sapRespone.status, statusText: sapRespone.statusText })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'erro en post inventory entries' })
    }
}

module.exports = {
    postInventoryEntriesController,
}