const { grabarLog } = require("../../shared/controller/hana.controller")
const { empleadosHana, findEmpleadoByCode, findAllBancos, findAllAccount, dataCierreCaja, tipoDeCambio } = require("./hana.controller")
const { asientoContable, findOneAsientoContable, asientoContableCentroCosto } = require("./sld.controller")

const asientoContableController = async (req, res) => {
    try {
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines, } = req.body


        console.log({
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            JournalEntryLines,
        })
        const tipoCambio = await tipoDeCambio()
        const usd = tipoCambio[0]
        console.log({ usd })
        const journalList = []
        JournalEntryLines.map((item) => {
            const { Credit, Debit, ...restData } = item
            const cambio = +usd.Rate
            if (Credit !== 0 && Debit == 0) {
                const newValue = +Credit / cambio
                const newJournal = {
                    ...restData,
                    Credit,
                    Debit: 0,
                    DebitSys: 0,
                    CreditSys: parseFloat(newValue.toFixed(2))
                }
                journalList.push(newJournal)
            }

            if (Credit == 0 && Debit !== 0) {
                const newValue = +Debit / cambio
                const newJournal = {
                    ...restData,
                    Credit: 0,
                    Debit,
                    DebitSys: parseFloat(newValue.toFixed(2)),
                    CreditSys: 0
                }
                journalList.push(newJournal)
            }
        })

        const data = {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines: journalList,
        }
        // console.log('final data -----------------------------------------------')
        // console.log({data})

        const response = await asientoContable({
            ...data
        })
        console.log({ response })
        const status = response.status
        const orderNumber = response.orderNumber
        if (!status) {
            if (response.value == 'Posting period locked; specify an alternative date') return res.status(400).json({ mensaje: 'El período de contabilizacion está bloqueado; especifique una fecha alternativa' })
            if (response.value == `CServiceData::SetPropertyValueString failed; Value too long in property 'Indicator' of 'JournalEntry'`) return res.status(400).json({ mensaje: 'el valor es demasiado largo en la propiedad Indicador' })
            return res.status(400).json({ mensaje: 'Error no controlado' })
        }
        return res.json({ status, orderNumber })
    } catch (error) {
        return res.status(500).json({ mensaje: 'Error en asientoContableController no controlado' })
    }
}

const findByIdAsientoController = async (req, res) => {
    try {

        const id = req.params.id
        const result = await findOneAsientoContable(id)
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines: journal
        } = result
        // return res.json({ result})
        if (result.lang) return res.status(404).json({ mensaje: result.value })
        const JournalEntryLines = []
        journal.map((item) => {
            const {
                AccountCode,
                ShortName,
                Credit,
                Debit,
                ContraAccount,
                LineMemo,
                Reference1,
                Reference2,
            } = item
            JournalEntryLines.push({
                AccountCode,
                ShortName,
                Credit,
                Debit,
                ContraAccount,
                LineMemo,
                Reference1,
                Reference2,
            })
        })
        return res.json({
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines
        })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en findByIdAsientoController' })
    }
}

const asientoContableCC_Controller = async (req, res) => {
    try {
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference,
            Reference2,
            Reference3,
            Indicator,
            JournalEntryLines,
        } = req.body

        const JournalVoucher = {
            JournalEntry: {
                ReferenceDate,
                DueDate,
                Memo,
                Reference,
                Reference2,
                Reference3,
                Indicator,
                JournalEntryLines,
            },
        }

        const result = await asientoContableCentroCosto(JournalVoucher)
        const status = result.status
        console.log({ result })
        if (result !== 'creado con exito') {
            if (result.value == 'Update the exchange rate ') return res.status(400).json({ mensaje: 'El período de contabilizacion está bloqueado; especifique una fecha alternativa' })
            if (result.value == `CServiceData::SetPropertyValueString failed; Value too long in property 'Indicator' of 'JournalEntry'`) return res.status(400).json({ mensaje: 'el valor es demasiado largo en la propiedad Indicador' })
            return res.status(400).json({ mensaje: 'Error no controlado.' })
        }
        return res.status(200).json({ result })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en asientoContableCC_Controller' })
    }
}

const createAsientoContableController = async (req, res) => {
    try {
        const {
            codEmp,
            date,
            monto,
            banckAccount,
            glosa,
            cheque,
            indicador,
            reference,
            voucher,
            cuenta
        } = req.body
        
        const user = req.usuarioAutorizado
        const idSap = user.ID_SAP || 0
        // return res.json({user})
        const tipoCambio = await tipoDeCambio()
        const usdRate = tipoCambio[0]
        const usd = +usdRate.Rate
        if (monto == 0) return res.status(400).json({ mensaje: 'El monto no puede ser cero' })
        if (usd == 0) return res.status(400).json({ mensaje: 'El tipo de cambio no puede ser cero' })
        const newValue = +monto / usd
        let firstAccount = {
            AccountCode: `${cuenta}`,
            ShortName: `${codEmp}`,
            Credit: 0,
            Debit: monto,
            CreditSys: 0,
            DebitSys: parseFloat(newValue.toFixed(2)),
            ContraAccount: `${banckAccount}`,
            LineMemo: `${glosa}`,
            Reference1: `${reference}`,
            Reference2: ''
        }
        if (voucher || voucher == '') {
            firstAccount.AdditionalReference = voucher
        }
        let contraAccount = {
            AccountCode: `${banckAccount}`,
            ShortName: `${banckAccount}`,
            Credit: monto,
            Debit: 0,
            CreditSys: parseFloat(newValue.toFixed(2)),
            DebitSys: 0,
            ContraAccount: '',
            LineMemo: glosa,
            // Reference1: `${cheque}`,
            Reference1: ``,
            Reference2: '',
        }
        if (voucher || voucher == '') {
            contraAccount.AdditionalReference = voucher
        }

        if (cheque || cheque == '') {
            contraAccount.AdditionalReference = cheque
        }

        let JournalEntryLines = []
        JournalEntryLines.push(firstAccount)
        JournalEntryLines.push(contraAccount)
        let data = {
            U_UserCode:idSap,
            ReferenceDate: date,
            Memo: glosa,
            Indicator: indicador,
            Reference: reference,
            Reference3:cheque,
            JournalEntryLines
        }

        console.log({ ...data })
        // return res.json({data})
        const response = await asientoContable({
            ...data
        })
        if (response.value) {
            return res.status(400).json({ mensaje: `Hubo un error al crear la apertura de caja. Sap Error: ${response.value || 'No definido'}` })
        }
        return res.json({ mensaje: 'Apertura de Caja creado con exito' })



    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en createAsientoContableController' })
    }
}

const empleadosController = async (req, res) => {
    try {
        const response = await empleadosHana()
        return res.json({ response })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en emplados controller' })
    }
}

const empleadosByCodeController = async (req, res) => {
    try {
        const code = req.params.code
        const response = await findEmpleadoByCode(code)
        if (response.length == 0) return res.status(404).json({ mensaje: 'El empleado no fue encontrado' })
        return res.json({ ...response[0] })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en emplados controller' })
    }
}

const findAllBancoController = async (req, res) => {
    try {
        const listBank = await findAllBancos()
        return res.json({ listBank })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el find all bank controlador' })
    }
}

const findAllAccountController = async (req, res) => {
    try {
        const response = await findAllAccount()
        res.json(response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'Error en el findAllAccountController' })
    }
}

const cerrarCajaChicaController = async (req, res) => {
    try {
        const { id, glosa } = req.body
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ id, glosa })
        const data = await dataCierreCaja(id)
        if (data.length !== 2) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Hubo un error en traer los datos necesarios para el cierre de caja`, `call ${process.env.PRD}.ifa_lapp_rw_obtener_caja_para_cerrar(${id})`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: 'Hubo un problemas en traer los datos necesarios para el cierre de caja', data })
        }
        const dataAccount = data[0]
        const dataBankAccount = data[1]
        const tipoCambio = await tipoDeCambio()
        const usdRate = tipoCambio[0]
        const usd = +usdRate.Rate
        const montoBank = Number(dataBankAccount.Debit)
        const montoAccount = Number(dataAccount.Credit)
        if (montoBank == 0 || montoAccount == 0) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Error: El montoBank no puede ser cero: ${montoBank || 'no definido'} o el montoAccount no puede ser cero: ${montoAccount || 'no definido'}`, `call ${process.env.PRD}.ifa_lapp_rw_obtener_caja_para_cerrar(${id})`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: 'El Monto de las cuentas no puede ser cero', data })
        }
        if (usd == 0) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Error: El tipo de cambio no puede ser cero : ${usd || 'no definido'}`, `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS();`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: 'El tipo de cambio no puede ser cero' })
        }
        const newMontoBank = +montoBank / usd
        const newMontoAccount = +montoAccount / usd
        let account = {
            AccountCode: `${dataBankAccount.Account}`,
            ShortName: `${dataBankAccount.ShortName}`,
            Credit: 0,
            Debit: parseFloat(montoBank.toFixed(2)),
            CreditSys: 0,
            DebitSys: parseFloat(newMontoBank.toFixed(2)),
            ContraAccount: `${dataBankAccount.ContraAct}`,
            LineMemo: `${glosa}`,
            Reference1: ``,
            Reference2: ''
        }
        let contraAccount = {
            AccountCode: `${dataAccount.Account}`,
            ShortName: `${dataAccount.ShortName}`,
            Credit: parseFloat(montoAccount.toFixed(2)),
            Debit: 0,
            CreditSys: parseFloat(newMontoAccount.toFixed(2)),
            DebitSys: 0,
            ContraAccount: `${dataAccount.ContraAct}`,
            LineMemo: `${glosa}`,
            Reference1: ``,
            Reference2: '',
        }
        let JournalEntryLines = []
        JournalEntryLines.push(account)
        JournalEntryLines.push(contraAccount)
        const postJournalEntry = {
            ReferenceDate: '',
            Memo: glosa,
            Indicator: '11',
            Reference: `${id}`,
            JournalEntryLines
        }

        const response = await asientoContable({
            ...postJournalEntry
        })
        if (response.value) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Hubo un error al cerrar la apertura de caja. SAP: ${response.value || 'no definido'}`, `${response.lang || ''}`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: `Hubo un error al crear la apertura de caja. SAP: ${response.value || 'no definido'}` })
        }
        grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Cierre de Caja realizado con exito`, `${''}`, "contabilidad/cierre-caja-chica", process.env.PRD)
        return res.json({ mensaje: 'Cierre de Caja realizado con exito', postJournalEntry, data })
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador' })
    }
}

module.exports = {
    asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
    createAsientoContableController,
    empleadosController,
    empleadosByCodeController,
    findAllBancoController,
    findAllAccountController,
    cerrarCajaChicaController
}