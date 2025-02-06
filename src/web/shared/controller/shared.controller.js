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
        return res.status(500).json({ mensaje: `Error en el controlador listaEncuestaController: ${error.message || ''}` })
    }
}

const crearEncuestaController = async (req, res) => {
    try {
        const {
            new_primeraPregunta,
            new_segundaPregunta,
            new_terceraPregunta,
            new_cuartaPregunta,
            new_quintaPregunta,
            new_recomendaciones,
            new_fullname,
            new_rol_user,
            id_user,
            new_puntajePrimerPregunta,
            new_puntajeSegundaPregunta,
            new_puntajeTerceraPregunta,
            new_puntajeCuartaPregunta,
            new_puntajeQuintaPregunta
        } = req.body
        const response = await crearEncuesta(
            new_primeraPregunta,
            new_segundaPregunta,
            new_terceraPregunta,
            new_cuartaPregunta,
            new_quintaPregunta,
            new_recomendaciones,
            new_fullname,
            new_rol_user,
            id_user,
            new_puntajePrimerPregunta,
            new_puntajeSegundaPregunta,
            new_puntajeTerceraPregunta,
            new_puntajeCuartaPregunta,
            new_puntajeQuintaPregunta)

        if(response[0].response == 409){
            return res.status(409).json({mensaje: `Ya se guardo su encuesta`})
        }
        return res.json(...response)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `Error en el controlador crearEncuestaController: ${error.message || ''}` })
    }
}

const resultadosEncuestaController = async (req, res) => {
    try {
        const response = await listaEncuesta()
        
        const datos=[5]
        for(let i=0; i<5; i++){
            // let valor1=Math.round(Math.random()*5)
            // let valor2=Math.round(Math.random()*5)
            // let valor3=Math.round(Math.random()*5)
            // let valor4=Math.round(Math.random()*5)
            let valor1=0
            let valor2=0
            let valor3=0
            let valor4=0
            let valor5=0
            datos[i]={
                puntaje: [],
                series: [],
                labels: []
            }
            for(const user of response){
                let puntaje =0
                switch(i){
                    case 0: 
                        puntaje= user.PUNTAJEPRIMERPREGUNTA
                        break;
                    case 1: 
                        puntaje= user.PUNTAJESEGUNDAPREGUNTA
                        break;
                    case 2: 
                        puntaje= user.PUNTAJETERCERAPREGUNTA
                        break;
                    case 3:
                        puntaje= user.PUNTAJECUARTAPREGUNTA
                        break;
                    case 4:
                        puntaje= user.PUNTAJEQUINTAPREGUNTA
                        break;
                }

                switch(puntaje){
                    case 1:
                        valor1++;
                        break;
                    case 2:
                        valor2++;
                        break;
                    case 3:
                        valor3++;
                        break;
                    case 4:
                        valor4++;
                        break;
                    case 5:
                        valor5++;
                        break;
                }
            }
            datos[i].puntaje.push(valor1)
            datos[i].puntaje.push(valor2)
            datos[i].puntaje.push(valor3)
            datos[i].puntaje.push(valor4)
            datos[i].puntaje.push(valor5)
            
            const sumValores= valor1+valor2+valor3+valor4+valor5
            // console.log({sumValores})
            datos[i].series.push(sumValores==0?0:(Math.round((valor1 / sumValores)*10000)/100))
            datos[i].series.push(sumValores==0?0:(Math.round((valor2 / sumValores)*10000)/100))
            datos[i].series.push(sumValores==0?0:(Math.round((valor3 / sumValores)*10000)/100))
            datos[i].series.push(sumValores==0?0:(Math.round((valor4 / sumValores)*10000)/100))
            datos[i].series.push(sumValores==0?0:(Math.round((valor5 / sumValores)*10000)/100))
            
            datos[i].labels.push('Puntaje 1')
            datos[i].labels.push('Puntaje 2')
            datos[i].labels.push('Puntaje 3')
            datos[i].labels.push('Puntaje 4')
            datos[i].labels.push('Puntaje 5')
        }
        let preguntas=[]
        if(response.length>0){
        preguntas=[response[0].PRIMERAPREGUNTA, 
            response[0].SEGUNDAPREGUNTA,
            response[0].TERCERAPREGUNTA,
            response[0].CUARTAPREGUNTA,
            response[0].QUINTAPREGUNTA
        ]
        }
        const resultados = {
            datos, preguntas
        }

        return res.json(resultados)
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: 'error en el controlador: listaEncuestaController' })
    }
}


module.exports = {
    findClientesByVendedorController,
    listaEncuestaController,
    crearEncuestaController,
    resultadosEncuestaController
}