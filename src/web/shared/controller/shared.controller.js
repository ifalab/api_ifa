const { response } = require("express")
const ExcelJS = require('exceljs');
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

const excelReporte = async (req, res) => {
    const user = req.usuarioAutorizado || { USERCODE: 'Desconocido', USERNAME: 'Desconocido' }
    try {
        const { data, displayedColumns, headerColumns, titulo } = req.body;
        console.log('headerColumns', headerColumns);
        const fechaActual = new Date();
        const date = new Intl.DateTimeFormat('es-VE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(fechaActual);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(titulo);

        worksheet.columns = displayedColumns.map((column) => ({
            header: headerColumns[column],
            key: column,
            width: 10
        }));

        console.log({columns: worksheet.columns})

        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.insertRow(1, []);
        worksheet.getCell('A1').value = titulo;
        worksheet.getCell('A2').value = `Fecha de Impresión: ${date}`;
        const letra = String.fromCharCode('A'.charCodeAt(0) + (displayedColumns.length - 1));
        console.log({ letra })
        worksheet.mergeCells(`A1:${letra}1`);
        worksheet.mergeCells(`A2:${letra}2`);

        // Estilizar cabecera
        const cellA = worksheet.getCell('A1');
        cellA.alignment = { vertical: 'middle', horizontal: 'center' };
        cellA.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
        };
        cellA.font = { bold: true, size: 14 };
        cellA.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };

        ['A2', 'A3'].forEach(cellAddress => {
            const cell = worksheet.getCell(cellAddress);
            cell.font = { bold: true, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'start' };
        });

        data.map(row =>
            worksheet.addRow(
                displayedColumns.reduce((acc, column) => ({
                    ...acc,
                    [column]: row[column] ?
                        (column.includes('Date') ? new Date(row[column]) : 
                        (column.includes('Num') || column.includes('Total') ? parseFloat(row[column]) : row[column]))
                        : ''
                }), {})
            )
        );
        
        worksheet.columns.forEach(column => {
            const header = column.header.toString()
            let maxLength = header.length;
            
            column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
              if(rowNumber >3){
                let cellValue = cell.value ? cell.value.toString() : '';
                if((header.includes('Fecha') || header.includes('Date')) && cell.value instanceof Date){
                    console.log({fecha: cell.value.toString()})
                    const dateValue = new Date(cell.value.toString())
                    cellValue = dateValue.toISOString().split('T')[0]
                }
                if(header.includes('CUM')){
                    cell.numFmt = '0.00%'
                    cellValue = (+cellValue).toFixed(2)+'%'
                    console.log('porcentaje: ', cellValue);
                }
                maxLength = Math.max(maxLength, cellValue.length);
                cell.border = {
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                };
              }
            });
            column.width = maxLength + 3;
        });

        worksheet.getRow(4).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' },
            };
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        worksheet.lastRow.eachCell(cell => {
            cell.border = {
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            }
        })

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=devoluciones.xlsx');

        await workbook.xlsx.write(res);
        grabarLog(user.USERCODE, user.USERNAME,`Inventario Excel Reporte Devolucion`, `Exito en el reporte de devoluciones`,
            '', 'inventario/excel-reporte', process.env.PRD
        );
        res.end();
    } catch (error) {
        console.error({ error });
        grabarLog(user.USERCODE, user.USERNAME,`Inventario Excel Reporte Devolucion`, `Error generando el Excel del reporte de devoluciones ${error}`,
        'catch de excelReporte', 'inventario/excel-reporte', process.env.PRD
        );
        return res.status(500).json({ mensaje: `Error generando el Excel de reporte de devolucion ${error}` });
    }
};

module.exports = {
    findClientesByVendedorController,
    listaEncuestaController,
    crearEncuestaController,
    resultadosEncuestaController,
    excelReporte
}