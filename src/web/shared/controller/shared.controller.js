const { response } = require("express")
const { findClientesByVendedor,
    grabarLog,
    listaEncuesta,
    crearEncuesta
} = require("./hana.controller")

const findClientesByVendedorController = async (req, res) => {
    try {
        const idVendedorSap = req.query.idVendedorSap
        const response = await findClientesByVendedor(idVendedorSap)
        let clientes = [];
        for (const item of response) {
            const { HvMora, CreditLine, AmountDue, ...restCliente } = item;
            const saldoDisponible = (+CreditLine) - (+AmountDue);
            const newData = {
                ...restCliente,
                CreditLine,
                AmountDue,
                mora: HvMora,
                saldoDisponible,
            };
            clientes.push({ ...newData });
        }
        return res.json({ clientes })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: findClientesByVendedorController' })
    }
}

const listaEncuestaController = async (req, res) => {
    try {
        const response = await listaEncuesta()
        return res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: listaEncuestaController' })
    }
}

const crearEncuestaController = async (req, res) => {
    try {

        const {
            new_primeraPregunta,
            new_segundaPregunta,
            new_terceraPregunta,
            new_recomendaciones,
            new_fullname,
            new_rol_user,
            new_id_sap,
            new_puntajePrimerPregunta,
            new_puntajeSegundaPregunta,
            new_puntajeTerceraPregunta,
        } = req.body
        const response = await crearEncuesta(new_primeraPregunta,
            new_segundaPregunta,
            new_terceraPregunta,
            new_recomendaciones,
            new_fullname,
            new_rol_user,
            new_id_sap,
            new_puntajePrimerPregunta,
            new_puntajeSegundaPregunta,
            new_puntajeTerceraPregunta,)
        return res.json(...response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

module.exports = {
    findClientesByVendedorController,
    listaEncuestaController,
    crearEncuestaController
}