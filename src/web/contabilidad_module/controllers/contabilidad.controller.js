const { grabarLog } = require("../../shared/controller/hana.controller")
const { empleadosHana, findEmpleadoByCode, findAllBancos, findAllAccount, dataCierreCaja, tipoDeCambio, cuentasCC, asientosContablesCC, subLineaCC, lineaCC, tipoClienteCC, sucursalesCC, rendicionesPorCaja, asientosPreliminaresCC, asientosPreliminaresCCIds, sociosNegocio } = require("./hana.controller")
const { asientoContable, findOneAsientoContable, asientoContableCentroCosto } = require("./sld.controller")
const sapService = require("../services/contabilidad.service")
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
            cuenta,
            rendiciones
        } = req.body

        const user = req.usuarioAutorizado
        const idSap = user.ID_SAP || 0
        const tipoCambio = await tipoDeCambio()
        const usdRate = tipoCambio[0]
        let data = {}
        const usd = +usdRate.Rate
        if (monto == 0) return res.status(400).json({ mensaje: 'El monto no puede ser cero' })
        if (usd == 0) return res.status(400).json({ mensaje: 'El tipo de cambio no puede ser cero' })
        const newValue = +monto / usd
        if (!rendiciones) {
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
            data = {
                U_UserCode: idSap,
                ReferenceDate: date,
                Memo: glosa,
                Indicator: indicador,
                Reference: reference,
                Reference3: cheque,
                JournalEntryLines
            }
            console.log('sin rendicion')
            console.log({ ...data })

        } else {
            //?
            let JournalEntryLines = []
            rendiciones.map((item) => {
                const newValueRend = +item.Amount / usd
                let firstAccount = {
                    AccountCode: `${cuenta}`,
                    ShortName: `${codEmp}`,
                    Credit: 0,
                    Debit: +item.Amount,
                    CreditSys: 0,
                    DebitSys: parseFloat(newValueRend.toFixed(2)),
                    ContraAccount: `${banckAccount}`,
                    LineMemo: `${glosa}`,
                    Reference1: `${reference}`,
                    Reference2: `${item.RendicionTransId}`
                }

                if (voucher || voucher !== '') {
                    firstAccount.AdditionalReference = voucher
                } else {
                    if (cheque || cheque !== '') {
                        firstAccount.AdditionalReference = cheque
                    }
                }
                JournalEntryLines.push(firstAccount)
            })

            let contraAccount = {
                AccountCode: `${banckAccount}`,
                ShortName: `${banckAccount}`,
                Credit: +monto,
                Debit: 0,
                CreditSys: parseFloat(newValue.toFixed(2)),
                DebitSys: 0,
                ContraAccount: ``,
                LineMemo: glosa,
                Reference1: `${reference}`,
                Reference2: ``,
            }

            if (voucher || voucher !== '') {
                contraAccount.AdditionalReference = voucher
            } else {
                if (cheque || cheque !== '') {
                    contraAccount.AdditionalReference = cheque
                }
            }

            JournalEntryLines.push(contraAccount)

            const sumaDebitsSys = JournalEntryLines.reduce((sum, line) => sum + line.DebitSys, 0);
            const sumaCreditsSys = JournalEntryLines.reduce((sum, line) => sum + line.CreditSys, 0);
            const diferenciaSys = parseFloat((sumaDebitsSys - sumaCreditsSys).toFixed(2));
            if (Math.abs(diferenciaSys) > 0) {
                let ultimaLinea = JournalEntryLines[JournalEntryLines.length - 2];
                // if (diferenciaSys > 0) {
                // ultimaLinea.CreditSys += diferenciaSys;
                // } else {
                ultimaLinea.DebitSys += Math.abs(diferenciaSys);
                // }
            }
            data = {
                U_UserCode: idSap,
                ReferenceDate: date,
                Memo: glosa,
                Indicator: indicador,
                Reference: reference,
                Reference3: cheque,
                JournalEntryLines
            }

            console.log('con rendicion')
            console.log({ ...data })

        }
        const response = await asientoContable({
            ...data
        })
        if (response.value) {
            return res.status(400).json({ mensaje: `Hubo un error al crear la apertura de caja. Sap Error: ${response.value || 'No definido'}`, data })
        }
        console.log('respuesta: ')
        console.log({ response })
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
        const { id, glosa, montoBank, dataBankAccount,nroDeposito } = req.body
        const usuario = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
        console.log({ id, glosa })
        const data = await dataCierreCaja(id)
        const dataRendiciones = await rendicionesPorCaja(+id)
        console.log({ data })
        if (data.length !== 2) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Hubo un error en traer los datos necesarios para el cierre de caja`, `call ${process.env.PRD}.ifa_lapp_rw_obtener_caja_para_cerrar(${id})`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: 'Hubo un problemas en traer los datos necesarios para el cierre de caja', data })
        }
        const dataAccount = data[0]
        const tipoCambio = await tipoDeCambio()
        const usdRate = tipoCambio[0]
        const usd = +usdRate.Rate
        const montoAccount = Number(dataAccount.FondoFijo)
        let JournalEntryLines = []
        if (montoAccount == 0) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Error: El montoBank no puede ser cero: ${montoBank || 'no definido'} o el montoAccount no puede ser cero: ${montoAccount || 'no definido'}`, `call ${process.env.PRD}.ifa_lapp_rw_obtener_caja_para_cerrar(${id})`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: 'El Monto de las cuentas no puede ser cero', data })
        }
        if (usd == 0) {
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `Error: El tipo de cambio no puede ser cero : ${usd || 'no definido'}`, `CALL "${process.env.PRD}".IFA_CON_MONEDAS_TIPOS();`, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({ mensaje: 'El tipo de cambio no puede ser cero' })
        }
        const newMontoBank = +montoBank / usd
        const newMontoAccount = +montoAccount / usd

        if (dataRendiciones.length > 0) {
            dataRendiciones.map((item) => {
                console.log({ item })
                const monto = +item.Amount
                const newMontoRendcion = +item.Amount / usd
                console.log({ newMontoRendcion })
                let accountPaid = {
                    AccountCode: `2110401`,
                    ShortName: `${dataAccount.AsociateCardCode}`,
                    Credit: 0,
                    Debit: parseFloat(monto.toFixed(2)),
                    CreditSys: 0,
                    DebitSys: parseFloat(newMontoRendcion.toFixed(2)),
                    ContraAccount: `${dataAccount.AsociateCardCode}`,
                    LineMemo: `${glosa}`,
                    Reference1: ``,
                    Reference2: ''
                }

                JournalEntryLines.push(accountPaid)
            })
        }

        if (montoBank > 0) {
            // if (parseFloat(montoAccount.toFixed(2)) !== parseFloat(montoBank.toFixed(2))) {
            //     grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `El monto de la Cuenta (${parseFloat(montoAccount.toFixed(2))}) no puede ser diferente que el Monto del Banco (${parseFloat(montoBank.toFixed(2))})`, ``, "contabilidad/cierre-caja-chica", process.env.PRD)
            //     return res.status(400).json({
            //         mensaje: `El monto de la Cuenta (${parseFloat(montoAccount.toFixed(2))}) no puede ser diferente que el Monto del Banco (${parseFloat(montoBank.toFixed(2))})`,
            //         montoBanco: parseFloat(montoBank.toFixed(2)),
            //         montoCuenta: parseFloat(montoAccount.toFixed(2))
            //     })
            // }

            let account = {
                AccountCode: `${dataBankAccount}`,
                ShortName: `${dataBankAccount}`,
                Credit: 0,
                Debit: parseFloat(montoBank.toFixed(2)),
                CreditSys: 0,
                DebitSys: parseFloat(newMontoBank.toFixed(2)),
                ContraAccount: `${dataAccount.AsociateCardCode}`,
                LineMemo: `${glosa}`,
                Reference1: ``,
                Reference2: '',
                Reference3: `${nroDeposito}`,
            }
            JournalEntryLines.push(account)
        }

        let contraAccount = {
            AccountCode: `${dataAccount.AcctCode}`,
            ShortName: `${dataAccount.AsociateCardCode}`,
            Credit: parseFloat(montoAccount.toFixed(2)),
            Debit: 0,
            CreditSys: parseFloat(newMontoAccount.toFixed(2)),
            DebitSys: 0,
            ContraAccount: ``,
            LineMemo: `${glosa}`,
            Reference1: ``,
            Reference2: '',
        }


        JournalEntryLines.push(contraAccount)
        const postJournalEntry = {
            ReferenceDate: '',
            Memo: glosa,
            Indicator: '11',
            Reference: `${id}`,
            Reference3: `${nroDeposito}`,
            JournalEntryLines
        }
        const totalDebe = JournalEntryLines.reduce((acc, item) => {
            const debe = Number(item.Debit)
            return acc + debe
        }, 0)

        const totalHaber = JournalEntryLines.reduce((acc, item) => {
            const haber = Number(item.Credit)
            return acc + haber
        }, 0)
        if (totalDebe !== totalHaber) {
            const diferencia = totalHaber - totalDebe
            grabarLog(usuario.USERCODE, usuario.USERNAME, "Cerrar Caja Chica", `El Total Debe (${totalDebe}) no puede ser diferente que al total haber (${totalHaber}), hay una diferencia de ${diferencia}`, ``, "contabilidad/cierre-caja-chica", process.env.PRD)
            return res.status(400).json({
                mensaje: `El Total Debe (${totalDebe}) no puede ser diferente que al total haber (${totalHaber}), hay una diferencia de ${diferencia}`,
                postJournalEntry,
                dataAccount,
                dataBankAccount,
                dataRendiciones,
                totalDebe,
                totalHaber,
            })
        }
        // return res.json({ postJournalEntry, dataAccount, dataBankAccount, dataRendiciones, totalDebe, totalHaber })
        console.log('data asiento cierre:')
        console.log({postJournalEntry})
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

const createAsientoContableSAPController = async (req, res) => {
    try {
        const {
            fechaContabilizacion,
            glosa,
            referencia1,
            referencia2,
            referencia3,
            details
        } = req.body
        let totalDebe = 0
        let totalHaber = 0

        details.map((item) => {
            totalDebe += item.debe
            totalHaber += item.haber
        })

        if (totalDebe != totalHaber) {
            return res.status(400).json({
                mensaje: `La sumatoria del Debe y Haber son diferentes. Total Debe: ${totalDebe}, Total Haber: ${totalHaber}`
            })
        }

        const sapResponse = await sapService.createAsiento({
            fechaContabilizacion,
            glosa,
            referencia1,
            referencia2,
            referencia3,
            details
        })
        const { data } = sapResponse
        const { TransacId } = data
        return res.json({ transacId: TransacId })

    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador, ${mensaje}` })
    }
}

const createAsientoContableCCController = async (req, res) => {
    // console.log(req.usuarioAutorizado)
    try {
        const user = req.usuarioAutorizado
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference1,
            Reference2,
            Reference3,
            Indicator,
            TransType,
            TransId,
            details
        } = req.body
        let totalDebe = 0;
        let totalHaber = 0;

        let formattedDate;
        let formattedDueDate;
        if (ReferenceDate) {
            const referenceDate = new Date(ReferenceDate);
            const referenceDueDate = new Date(DueDate);

            if (isNaN(referenceDate) || isNaN(referenceDueDate)) {
                return res.status(400).json({
                    mensaje: 'La fecha de contabilización o de vencimiento no es válida.'
                });
            }

            formattedDate = referenceDate.toISOString();
            formattedDueDate = referenceDueDate.toISOString();
        } else {
            return res.status(400).json({
                mensaje: 'La fecha de contabilización o de vencimiento es obligatoria.'
            });
        }

        console.log(req.body)

        details.map((item) => {
            // console.log(item);
            totalDebe += Number(item.Credit)
            totalHaber += Number(item.Debit)
        })

        totalDebe = Number(totalDebe.toFixed(6));
        totalHaber = Number(totalHaber.toFixed(6));
        console.log({ totalDebe, totalHaber })
        if (totalDebe != totalHaber) {
            return res.status(400).json({
                mensaje: `La sumatoria del Debe y Haber son diferentes. Total Debe: ${totalDebe}, Total Haber: ${totalHaber}`
            })
        }

        console.log(user);
        console.log(details);
        const comResponse = await sapService.createAsientoCC({
            TransId: TransId,
            fechaContabilizacion: formattedDate,
            glosa: Memo,
            referencia1: Reference1,
            referencia2: Reference2,
            referencia3: Reference3,
            transType: Number(TransType),
            fechaDueDate: formattedDueDate,
            indicator: Indicator,
            userSign: Number(user.ID),
            details
        })
        const { message, statusCode, id } = comResponse
        console.log(message, statusCode, id);
        return res.json({message, statusCode, id})
    } catch (error) {
        console.log(JSON.stringify(error.message, null, 2));

        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador, ${mensaje}` })
    }
}

const getCuentasCC = async (req, res) => {
    try {
        const data = await cuentasCC();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getCuentasCC], ${mensaje}` })
    }
}

const getAsientosContablesCC = async (req, res) => {
    try {
        const data = await asientosContablesCC();

        const groupedData = data.reduce((acc, current) => {
            const lineData = {
                Line_ID: current.Line_ID,
                Account: current.Account,
                ContraAct: current.ContraAct,
                Debit: current.Debit,
                Credit: current.Credit,
                LineMemo: current.LineMemo,
                ShortName: current.ShortName,
                U_IdComlConcept: current.U_IdComlConcept,
                AcctName: current.AcctName,
                CardName: current.CardName,
                Ref1Detail: current.Ref1Detail,
                Ref2Detail: current.Ref2Detail,
                Ref3Deatil: current.Ref3Deatil,
                U_Clasif_Gastos: current.U_Clasif_Gastos,
                Area: current.Area,
                Tipo_Cliente: current.Tipo_Cliente,
                Linea: current.Linea,
                Especialidad: current.Especialidad,
                Clasificacion_Gastos: current.Clasificacion_Gastos,
                Conceptos_Comerciales: current.Conceptos_Comerciales,
                Cuenta_Contable: current.Cuenta_Contable,
                Indicator: current.Indicator
            };

            if (acc[current.TransId]) {
                acc[current.TransId].lines.push(lineData);
            } else {
                acc[current.TransId] = {
                    TransId: current.TransId,
                    TransType: current.TransType,
                    RefDate: current.RefDate,
                    Memo: current.Memo,
                    Ref1: current.Ref1,
                    Ref2: current.Ref2,
                    Ref3: current.Ref3,
                    Number: current.Number,
                    Indicator: current.Indicator,
                    UserSign: current.UserSign,
                    lines: [lineData]
                };
            }
            return acc;
        }, {});

        const formattedData = Object.values(groupedData);

        return res.json(formattedData);
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getAsientosContablesCC], ${mensaje}` })
    }
}

const getSucursalesCC = async (req, res) => {
    try {
        const data = await sucursalesCC();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getSucursalesCC], ${mensaje}` })
    }
}

const getTipoClienteCC = async (req, res) => {
    try {
        const data = await tipoClienteCC();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getTipoClienteCC], ${error}` })
    }
}

const getLineasCC = async (req, res) => {
    try {
        const data = await lineaCC();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getLineasCC], ${error}` })
    }
}

const getSublineasCC = async (req, res) => {
    try {
        const data = await subLineaCC();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getSublineasCC], ${error}` })
    }
}

const getJournalPreliminarCC = async (req, res) => {
    try {
        const { id } = req.query;
        const data = await asientosPreliminaresCC(id);
        console.log(data);
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getJournalPreliminarCC], ${mensaje}` })
    }
}

const getJournalPreliminarCCIds = async (req, res) => {
    try {
        const data = await asientosPreliminaresCCIds();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getJournalPreliminarCCIds], ${mensaje}` })
    }
}

const rendicionesPorCajaController = async (req, res) => {
    try {

        const idCaja = req.query.idCaja
        if (!idCaja || isNaN(idCaja)) {
            return res.status(500).json({ mensaje: `No existe un ID valido : ${idCaja || 'No Definido'}` })
        }
        const data = await rendicionesPorCaja(+idCaja)
        data.map((item) => {
            item.Amount = +item.Amount
        })
        return res.json(data)

    } catch (error) {

        console.log({ error })
        let mensaje = ''

        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }

        return res.status(500).json({ mensaje: `error en el controlador [rendicionesPorCajaController], ${mensaje}` })

    }
}

const getSociosNegocio = async (req, res) => {
    try {
        const data = await sociosNegocio();
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getSociosNegocio], ${error}` })
    }
}

const actualizarEstadoCCController = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        console.log(id);
        console.log(estado);
        // Validación simple
        if (!['nc', 'c', 'm'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({ message: 'ID inválido o no numérico' });
        }

        // Lógica para actualizar en la BD
        await sapService.actualizarAsientoCC({
            estado
        }, id.toString())

        res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [actualizarEstadoCCController], ${mensaje}` })
    }

};

module.exports = {
    asientoContableController,
    findByIdAsientoController,
    asientoContableCC_Controller,
    createAsientoContableController,
    empleadosController,
    empleadosByCodeController,
    findAllBancoController,
    findAllAccountController,
    cerrarCajaChicaController,
    createAsientoContableSAPController,
    createAsientoContableCCController,
    getCuentasCC,
    getAsientosContablesCC,
    getSucursalesCC,
    getTipoClienteCC,
    getLineasCC,
    getSublineasCC,
    rendicionesPorCajaController,
    getJournalPreliminarCC,
    getJournalPreliminarCCIds,
    getSociosNegocio,
    actualizarEstadoCCController,
}