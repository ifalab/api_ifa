const path = require('path');
const ejs = require('ejs');
const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const ExcelJS = require('exceljs');
const { postInventoryEntries } = require("./sld.controller")

const sapService = require("../services/cc.service");
const { ObtenerLibroMayor, cuentasCC, getNombreUsuario, getDocFuentes, getPlantillas, getClasificacionGastos, postDocFuente, asientosContablesCCById, getIdReserva, getBeneficiarios, ObtenerLibroMayorFiltrado, getAsientosSAP, ejecutarInsertSAP, updateAsientoContabilizado, asientoContableCC, postAnularAsientoCC, postDescontabilizarAsientoCC, getBalanceGeneralCC, getobtenerAsientoCompletos, saveClasificacionGastosHana, saveAreaCC, saveTipoClienteCC, saveLineaCC, saveClasificacionCC, saveConceptosComCC, saveEspecialidadCC } = require('./hana.controller');
const { estructurarBalanceParaTree } = require('../utils/estructurarBalance');
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

const actualizarAsientoContablePreliminarCCController = async (req, res) => {
    // console.log(req.usuarioAutorizado)
    try {
        const { id } = req.params;
        const user = req.usuarioAutorizado
        const {
            ReferenceDate,
            DueDate,
            Memo,
            Reference1,
            Reference2,
            Reference3,
            TransType,
            details
        } = req.body

        let formattedDate = null;
        let formattedDueDate = null;
        
        if (ReferenceDate && ReferenceDate.trim() !== "") {
            const referenceDate = new Date(ReferenceDate);
            if (!isNaN(referenceDate)) {
                formattedDate = referenceDate.toISOString();
            }
        }
        
        if (DueDate && DueDate.trim() !== "") {
            const dueDate = new Date(DueDate);
            if (!isNaN(dueDate)) {
                formattedDueDate = dueDate.toISOString();
            }
        }           

        // console.log(req.body)

        console.log(user);
        console.log({details});

        const comResponse = await sapService.actualizarAsientoPreliminarCC({
            fechaContabilizacion: formattedDate,
            glosa: Memo,
            referencia1: Reference1,
            referencia2: Reference2,
            referencia3: Reference3,
            transType: Number(TransType),
            fechaDueDate: formattedDueDate,
            userSign: Number(user.ID),
            details
        }, id)
        const { data } = comResponse
        return res.json(data)
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador actualizarAsientoContablePreliminarCCController, ${mensaje}` })
    }
}

const getPDFAsientoContableCC = async (req, res) => {
    const data = req.body;

    let browser;
    try {
        // Sumar Débito y Crédito
        let sumDebit = 0;
        let sumCredit = 0;

        // let libroMayorData = [];
        // let cuentasConsultadas = [];

        for (const line of data.lines) {
            sumDebit += Number(line.Debit) || 0;
            sumCredit += Number(line.Credit) || 0;

            // if (line.Account && !isNaN(Number(line.Account))) {
            //     try {
            //         if(!cuentasConsultadas.includes(line.Account)){
            //             const libro = await ObtenerLibroMayor(line.Account);
            //             libroMayorData.push({
            //                 account: line.Account,
            //                 libro,
            //             });
            //             cuentasConsultadas.push(line.Account);
            //         }
            //     } catch (innerError) {
            //         console.error(`Error al obtener mayor de cuenta ${line.Account}:`, innerError.message);
            //         libroMayorData.push({
            //             account: line.Account,
            //             error: true,
            //             libro: null,
            //         });
            //     }
            // } else {
            //     libroMayorData.push(null);
            // }
        }

        // const libroMayorData = await Promise.all(libroMayorPromises);
        
        // Agregamos a la data principal
        data.sumDebit = sumDebit.toFixed(2);
        data.sumCredit = sumCredit.toFixed(2);
        // data.LibroMayor = libroMayorData; 
        
        const resultUser = await getNombreUsuario(data.UserSign);
        console.log(resultUser);
        data.nombre = resultUser[0].USERNAME;

        console.log(data);

        const filePath = path.join(__dirname, './pdf/template-contable-cc.ejs');
        const html = await ejs.renderFile(filePath, {
            data,
            staticBaseUrl: process.env.STATIC_BASE_URL || '',
        });

        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        await page.evaluate(() => {
            const dateSpan = document.querySelector('.date');
            if (dateSpan) {
                const now = new Date();
                dateSpan.textContent = now.toLocaleString();
            }
        });

        const pdfBufferPortrait = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                bottom: '45px',
                top: '40px',
            },
            headerTemplate: `<div></div>`,
            footerTemplate: `
                <div style="width: 100%; margin-left: 60px; margin-right: 20px; font-size: 10px; color: #555;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="width: 50%; text-align: left;">
                            <p style="margin: 0;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></p>
                        </div>
                        <div style="width: 50%; text-align: right;">
                            <p>Impreso el <span class="date"></span></p>
                        </div>
                    </div>
                </div>`,
        });

        const dataLandscape = JSON.parse(JSON.stringify(data));
        dataLandscape.lines = dataLandscape.lines.filter(line => Number(line.Debit) !== 0);
        const filePath2 = path.join(__dirname, './pdf/template-contable-cc-gastos.ejs');
        const htmlHorizontal = await ejs.renderFile(filePath2, {
            data: dataLandscape,
            staticBaseUrl: process.env.STATIC_BASE_URL || '',
        });

        browser = await puppeteer.launch({ headless: 'new' });
        const page2 = await browser.newPage();
        await page2.setContent(htmlHorizontal, { waitUntil: 'networkidle0' });

        await page2.evaluate(() => {
            const dateSpan = document.querySelector('.date');
            if (dateSpan) {
                const now = new Date();
                dateSpan.textContent = now.toLocaleString();
            }
        });

        const pdfBufferLandscape = await page2.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            displayHeaderFooter: true,
            margin: {
                bottom: '45px',
                top: '40px',
            },
            headerTemplate: `<div></div>`,
            footerTemplate: `
                <div style="width: 100%; margin-left: 60px; margin-right: 20px; font-size: 10px; color: #555;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="width: 50%; text-align: left;">
                            <p style="margin: 0;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></p>
                        </div>
                        <div style="width: 50%; text-align: right;">
                            <p>Impreso el <span class="date"></span></p>
                        </div>
                    </div>
                </div>`,
        });

        const pdfDoc = await PDFDocument.create();
        const portraitDoc = await PDFDocument.load(pdfBufferPortrait);
        const landscapeDoc = await PDFDocument.load(pdfBufferLandscape);
        const portraitPages = await pdfDoc.copyPages(portraitDoc, portraitDoc.getPageIndices());
        const landscapePages = await pdfDoc.copyPages(landscapeDoc, landscapeDoc.getPageIndices());
        portraitPages.forEach(p => pdfDoc.addPage(p));
        landscapePages.forEach(p => pdfDoc.addPage(p));

        const mergedPdf = await pdfDoc.save();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="asiento-contable.pdf"',
        });
        return res.end(mergedPdf);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            mensaje: `Error en el controlador getPDFAsientoContableCC, ${error.message || 'error desconocido'}`,
        });
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (err) {
                console.error("Error al cerrar el navegador:", err.message);
            }
        }
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

const getLibroMayor = async (req, res) => {
    try {
        const {codigo} = req.query;
        
        const data = await ObtenerLibroMayor(codigo);

        return res.status(200).json(data);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en getLibroMayor ${error}` })
    }
}

const getLibroMayorFiltrado = async (req, res) => {
    try {
        const {
            cuenta,
            docFuente,
            fechaFin,
            fechaInicio,
            socioNombre,
            agencia,
            dim1,
            dim2,
            dim3
        } = req.body;
        
        const data = await ObtenerLibroMayorFiltrado({
            cuenta,
            fechaInicio,
            fechaFin,
            socioNombre,
            agencia,
            docFuente,
            dim1,
            dim2,
            dim3
        });

        return res.status(200).json(data);
    } catch (error) {
        console.log({ error })
        return res.status(500).json({ mensaje: `error en getLibroMayor ${error}` })
    }
}

const excelLibroMayor = async (req, res) => {
    try {
      const data = req.body;
      console.log(data);

      const fechaActual = new Date();
      const date = new Intl.DateTimeFormat('es-VE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(fechaActual);
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Libro Mayor');

      // Definir columnas
      worksheet.columns = [
        { header: 'Fecha', key: 'RefDate', width: 15 },
        { header: 'Transacción', key: 'TransId', width: 10 },
        { header: 'Glosa', key: 'Memo', width: 30 },
        { header: 'Referencia 1', key: 'Ref1', width: 20, style: { numFmt: '0' } },
        { header: 'Referencia 2', key: 'Ref2', width: 15, style: { numFmt: '0' } },
        { header: 'Referencia 3', key: 'Ref3', width: 15, style: { numFmt: '0' } },
        { header: 'Línea', key: 'Line_ID', width: 10 },
        { header: 'Agencia', key: 'Indicator', width: 10 },
        { header: 'Cuenta', key: 'Account', width: 20 },
        { header: 'Nombre Cuenta', key: 'AcctName', width: 40 },
        { header: 'Código Cuenta Asociada', key: 'ShortName', width: 20 },
        { header: 'Nombre Cuenta Asociada', key: 'CardName', width: 30 },
        { header: 'Documento Origen', key: 'DocFuenteCod', width: 20 },
        { header: 'Débito', key: 'Debit', width: 15 },
        { header: 'Crédito', key: 'Credit', width: 15 },
      ];

      // Insertar filas antes del encabezado
      worksheet.insertRow(1, []);
      worksheet.insertRow(1, []);
      worksheet.insertRow(1, []);  
      // Agregar contenido a las filas de cabecera
      worksheet.getCell('A1').value = `Libro Mayor de la cuenta | ${data[1].Account} | ${data[1].AcctName}`;
      worksheet.getCell('A2').value = `Fecha de Impresión: ${date}`;  
      // Fusionar celdas para que el texto se centre sobre varias columnas (A a M en este caso)
      worksheet.mergeCells('A1:O1');
      worksheet.mergeCells('A2:O2');  
      // Estilizar cabecera
      ['A1', 'A2'].forEach(cellAddress => {
        const cell = worksheet.getCell(cellAddress);
        cell.font = { bold: true, size: 14 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF' },
        };
        if(cellAddress === 'A1') {
            const cell = worksheet.getCell(cellAddress); 
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };  
        }else{
            const cell = worksheet.getCell(cellAddress); 
            cell.border = {
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };  
        }
      });
      data.forEach((row, index) => {
        const newRow = worksheet.addRow({
            RefDate: new Date(row.RefDate),
            TransId: row.TransId,
            Memo: row.Memo,
            Ref1: row.Ref1 ? parseInt(row.Ref1) : '',
            Ref2: row.Ref2 ? parseInt(row.Ref2) : '',
            Ref3: row.Ref3 ? parseInt(row.Ref3) : '',
            Line_ID: row.Line_ID,
            Indicator: row.Indicator,
            Account: row.Account ? parseInt(row.Account) : '',
            AcctName: row.AcctName,
            ShortName: String(row.ShortName),
            CardName: row.CardName ?? '',
            DocFuenteCod: row.DocFuenteCod,
            Debit: parseFloat(row.Debit),
            Credit: parseFloat(row.Credit),
          });
          
          // Si deseas asegurar formato con 2 decimales para Débito y Crédito:
          newRow.getCell('Debit').numFmt = '"Bs"#,##0.00';
          newRow.getCell('Credit').numFmt = '"Bs"#,##0.00';
          newRow.eachCell(cell => {
            cell.border = {
                left: {style: 'thin'},
                right: {style: 'thin'},
                bottom: index === data.length - 1 ? { style: 'thin' } : undefined,
            }
          })
      });

      const totalDebit = data.reduce((sum, row) => sum + parseFloat(row.Debit || 0), 0);
      const totalCredit = data.reduce((sum, row) => sum + parseFloat(row.Credit || 0), 0);

      const totalRow = worksheet.addRow({
        RefDate: '',
        TransId: '',
        Memo: 'TOTAL',
        Ref1: '',
        Ref2: '',
        Ref3: '',
        Line_ID: '',
        Indicator: '',
        Account: '',
        AcctName: '',
        ShortName: '',
        CardName: '',
        DocFuenteCod: '',
        Debit: totalDebit,
        Credit: totalCredit,
      });

      // Aplicar formato a la fila total
      totalRow.getCell('Debit').numFmt = '"Bs"#,##0.00';
      totalRow.getCell('Credit').numFmt = '"Bs"#,##0.00';
  
      totalRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'double' },
            left: { style: 'thin' },
            right: { style: 'thin' },
        };
      });
  
      // Estilizar encabezado
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
            bottom: {style: 'thin'},
            left: { style: 'thin' },
            right: { style: 'thin' },
        }
      })
  
      // Crear el archivo Excel en memoria
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=libro_mayor.xlsx');
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error({ error });
      return res.status(500).json({ mensaje: `Error generando el Excel del libro mayor ${error}` });
    }
};

const docFuentes = async (req, res) => {
    try {
        const data = await getDocFuentes();
        return res.status(200).json(data);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error obtiendo los documentos fuentes. ${error}` });
    }
}

const saveDocFuentes = async (req, res) => {
    try {
        const user = req.usuarioAutorizado
        const idSap = user.ID || 0

        const {codigo, descripcion, etiqueta} = req.body;
        const data = await postDocFuente(codigo, descripcion, idSap,etiqueta);
        return res.status(200).json(data);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error obtiendo los documentos fuentes. ${error}` });
    }
}

const cargarPlantillaDimensiones = async (req, res) => {
    try {
        const user = req.usuarioAutorizado
        const userId = Number(user.ID)
        const data = req.body;
        console.log(data);
        const result = await sapService.crearPlantilla(data, userId);

        const response = result
        return res.status(200).json(response)
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error obtiendo la plantilla para estas dimensiones.${error.message.message}` });
    }
} 

const cargarPlantillaMasivaDimensiones = async (req, res) => {
  try {
    const user = req.usuarioAutorizado;
    const userId = Number(user.ID);
    const data = req.body.body;
    console.log(data);
    const result = await sapService.crearPlantillaMasiva(data, userId);

    return res.status(200).json(result);
    // return res.status(200).json(data);
  } catch (error) {
    console.error({ error });
    return res.status(500).json({ mensaje: `Error obteniendo la plantilla masiva para estas dimensiones. ${error}` });
  }
};

const recuperarPlantillaDimensiones = async (req, res) => {
    try {
        const {id} = req.query;
        console.log(id);
        const result = await getPlantillas(id);

        return res.status(200).json(result)
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error obtiendo la plantilla para este asiento. ${error}` });
    }
}

const clasificacionGastos = async(req, res) => {
    try {
        const result = await getClasificacionGastos();

        return res.status(200).json(result)
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `Error obtiendo la clasificacion de gastos. ${error}` });
    }
}

const getAsientoContableCCById = async (req, res) => {
    try {
        const {id} = req.query;
        const data = await asientosContablesCCById(id);

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
                    Indicator: current.IndicatorCabecera,
                    UserSign: current.UserSign,
                    lines: [lineData]
                };
            }
            return acc;
        }, {});

        const formattedData = Object.values(groupedData)[0];

        return res.json(formattedData);
    } catch (error) {
        console.log({ error })
        let mensaje = ''
        if (error.statusCode >= 400) {
            mensaje += error.message.message || 'No definido'
        }
        return res.status(500).json({ mensaje: `error en el controlador [getAsientoContableCCById], ${error}` })
    }
}

const reservarAsientoId = async (req, res) => {
    try {
        const result = await getIdReserva();

        return res.status(200).json(result[0])
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `[reservarAsientoId] Error reservando id para el asiento. ${error}` });
    }
}

const beneficiarios = async(req, res) => {
    try {
        const result = await getBeneficiarios();

        return res.status(200).json(result);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `[beneficiarios] Error obteniendo los beneficiarios. ${error}` });
    }
}

const asientosContadoSAP = async (req, res) => {
    try {
        const codigo = req.query.codigo;

        if (!codigo) {
            return res.status(400).json({ mensaje: 'Código requerido en query param (?codigo=)' });
        }

        const result = await getAsientosSAP(codigo);
        console.log(result)

        return res.status(200).json(result);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: `[asientosContadoSAP] Error al recuperar el asiento. ${error}` });
    }
};

const cargarAsientoSAP = async (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({
                status: false,
                mensaje: 'Código requerido en query param (?codigo=)',
                data: []
            });
        }

        await ejecutarInsertSAP(codigo); // Solo ejecutamos, sin esperar retorno

        return res.status(200).json({
            status: true,
            mensaje: 'Asiento cargado correctamente en SAP',
            data: []
        });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[cargarAsientoSAP] Error al cargar el asiento en SAP: ${error.message}`,
            data: []
        });
    }
};

const actualizarAsientoContabilizado = async (req, res) => {
    try {
        const { TransId, Memo, Ref3 } = req.body;

        if (!TransId || Memo == null || Ref3 == null) {
            return res.status(400).json({
                status: false,
                mensaje: '[actualizarAsientoContabilizado] Datos incompletos en la petición',
                data: []
            });
        }

        await updateAsientoContabilizado(TransId, Memo, Ref3)

        return res.status(200).json({
            status: true,
            mensaje: 'Asiento actualizado correctamente',
            data: []
        });

    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[actualizarAsientoContabilizado] Error al actualizar el asiento de CC: ${error.message}`,
            data: []
        });
    }
}

const getAsientoContableCC = async (req, res) => {
    try {
        const {id} = req.query;
        console.log(id);
        const data = await asientoContableCC(id);

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
       console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[getAsientoContableCC] Error al obtener el asiento CC: ${error.message}`,
            data: []
        });
    }
}

const anularAsientoCC = async(req, res) => {
    const {id} = req.body;
    try {
        await postAnularAsientoCC(id);
        
        return res.status(200).json({
            status: true,
            mensaje: 'Asiento anulado correctamente',
            data: []
        });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[anularAsientoCC] Error al anualar el asiento en CC: ${error.message}`,
            data: []
        });
    }
}

const descontabilizarAsientoCC = async(req, res) => {
    const {id} = req.body;
    try {
        await postDescontabilizarAsientoCC(id);
        
        return res.status(200).json({
            status: true,
            mensaje: 'Asiento descontabilizado correctamente',
            data: []
        });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[descontabilizarAsientoCC] Error al descontabilizar el asiento en CC: ${error.message}`,
            data: []
        });
    }
}

const obtenerBalanceGeneral = async(req, res) => {
    try {
        const rawData = await getBalanceGeneralCC();

        // Mapeamos las propiedades con tildes a propiedades sin tildes
        const data = rawData.map(item => ({
            ...item,
            Debito: item['Débito'],
            Credito: item['Crédito'],
        }));

        const dataEstructurada = estructurarBalanceParaTree(data);
        return res.status(200).json({
            status: true,
            mensaje: 'Balance obtenido correctamente',
            data: dataEstructurada
        });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[obtenerBalanceGeneral] Error al obtener el balance geenral CC: ${error.message}`,
            data: []
        });
    }
}

const obtenerAsientoCompletos = async(req, res) => {
    const {ini, fin} = req.query;
    try {
        const data =await getobtenerAsientoCompletos(ini, fin);
        
        return res.status(200).json({
            status: true,
            mensaje: 'Asientos Recuperados',
            data: data
        });
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            status: false,
            mensaje: `[obtenerAsientoCompletos] Error al obtener los asientos CC: ${error.message}`,
            data: []
        });
    }
}

const obtenerExcelAsientos = async (req, res) => {
  const asientos = req.body;

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asientos');

    // Definir columnas
    worksheet.columns = [
      { header: 'TransId', key: 'TransId', width: 10 },
      { header: 'TransType', key: 'TransType', width: 10 },
      { header: 'RefDate', key: 'RefDate', width: 15 },
      { header: 'DueDate', key: 'DueDate', width: 15 },
      { header: 'Memo', key: 'Memo', width: 40 },
      { header: 'Ref1', key: 'Ref1', width: 15 },
      { header: 'Ref2', key: 'Ref2', width: 15 },
      { header: 'Ref3', key: 'Ref3', width: 15 },
      { header: 'Number', key: 'Number', width: 10 },
      { header: 'Indicator', key: 'Indicator', width: 15 },
      { header: 'UserSign', key: 'UserSign', width: 10 },
      { header: 'Username', key: 'Username', width: 25 },
      { header: 'Line_ID', key: 'Line_ID', width: 10 },
      { header: 'DocFuenteCod', key: 'DocFuenteCod', width: 20 },
      { header: 'Account', key: 'Account', width: 20 },
      { header: 'AcctName', key: 'AcctName', width: 30 },
      { header: 'Debit', key: 'Debit', width: 15 },
      { header: 'Credit', key: 'Credit', width: 15 },
      { header: 'LineMemo', key: 'LineMemo', width: 40 },
      { header: 'MIEntry', key: 'MIEntry', width: 10 },
      { header: 'ShortName', key: 'ShortName', width: 20 },
      { header: 'CardName', key: 'CardName', width: 30 },
      { header: 'ContraAct', key: 'ContraAct', width: 15 },
      { header: 'Ref1Detail', key: 'Ref1Detail', width: 15 },
      { header: 'Ref2Detail', key: 'Ref2Detail', width: 15 },
      { header: 'Ref3Deatil', key: 'Ref3Deatil', width: 15 },
      { header: 'U_Clasif_Gastos', key: 'U_Clasif_Gastos', width: 15 },
      { header: 'SourceID', key: 'SourceID', width: 10 },
      { header: 'Area', key: 'Area', width: 20 },
      { header: 'Tipo_Cliente', key: 'Tipo_Cliente', width: 20 },
      { header: 'Linea', key: 'Linea', width: 20 },
      { header: 'Especialidad', key: 'Especialidad', width: 25 },
      { header: 'Clasificacion_Gastos', key: 'Clasificacion_Gastos', width: 25 },
      { header: 'Conceptos_Comerciales', key: 'Conceptos_Comerciales', width: 30 },
      { header: 'Cuenta_Contable', key: 'Cuenta_Contable', width: 20 },
    ];

    // Agregar filas
    asientos.forEach(item => {
      worksheet.addRow(item);
    });

    // Establecer headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Asientos.xlsx');

    // Escribir el archivo en el stream de respuesta
    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    console.error('Error al generar Excel:', error);
    res.status(500).json({
      status: false,
      mensaje: 'Error al generar el Excel',
      error: error.message,
    });
  }
};

const saveClasificacionGastos = async (req, res) => {
    try {
        if (!req.file) {
        return res.status(400).json({ status: false, mensaje: 'No se recibió ningún archivo' });
        }

        const buffer = req.file.buffer;

        // Leer el Excel con xlsx
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const datos = xlsx.utils.sheet_to_json(hoja);

        console.log('Datos del Excel:', datos);

        // Aquí puedes guardar `datos` en tu base de datos o procesarlos como necesites

        for (const fila of datos) {
            // const idArea = await saveAreaCC(fila.area);
            // const idTipo = await saveTipoClienteCC(fila.tipo_cliente);
            // const idLinea = await saveLineaCC(fila.linea);
            // const idClasificacion = await saveClasificacionCC(fila.clasificacion_gastos);
            // const idConceptos = await saveConceptosComCC(fila.conceptos_comerciales);
            // const idEspecialidad = await saveEspecialidadCC(fila.especialidad);

            await saveClasificacionGastosHana(fila);
            // console.log(idArea, idTipo, idLinea, idClasificacion, idConceptos, idEspecialidad);
        }

        res.status(200).json({
            status: true,
            mensaje: 'Clasificación de gastos insertada correctamente',
            total: datos.length
        });

    } catch (error) {
        console.error('Error al guardar la clasificación de gastos:', error);
        res.status(500).json({
            status: 500,
            mensaje: 'Error al guardar la clasificación de gastos',
            error: error.message,
        });
    }
}
const cargarExcelMasivo = async (req, res) => {
    try {
        const buffer = req.file.buffer;
        const workbook = xlsx.read(buffer, { type: 'buffer' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const filas = xlsx.utils.sheet_to_json(hoja);

        // Obtener fechas y glosa desde el cuerpo del request
        const { fechaContabilizacion, fechaCreacion, glosa } = req.body;

        console.log(fechaContabilizacion, fechaCreacion, glosa)
        // Validación opcional de fechas (si deseas)
        if (!fechaContabilizacion || !fechaCreacion || !glosa) {
            return res.status(400).json({
                status: false,
                mensaje: 'Se requiere fechaInicio, fechaFin y glosa en el cuerpo de la solicitud.',
            });
        }

        // Mapear columnas del Excel a la estructura del backend Nest
        const detalles = filas.map((fila) => ({
            U_DocFuenteCod: fila['Documento_Fuente'] ?? '',
            AccountName: fila['Cuenta_Nombre'] ?? '',
            AccountCode: String(fila['Cuenta'] ?? ''),
            ShortName: fila['Codigo_Socio'] ?? '',
            CardName: fila['Socio'] ?? '',
            Credit: parseFloat(fila['Credito']) || 0,
            Debit: parseFloat(fila['Debito']) || 0,
            LineMemo: fila['Glosa'] ?? '',
            Ref1: fila['Referencia_1'] ?? '',
            Ref2: fila['Referencia_2'] ?? '',
            Ref3: fila['Referencia_3'] ?? '',
            U_BenefCode: fila['Codigo_Beneficiario'] ?? '',
            SourceID: parseInt(fila['Id_Concepto_Comercial']) || 0,
            U_Area: fila['Area'] ?? '',
            U_Tipo: fila['Tipo'] ?? '',
            U_Linea: fila['Linea'] ?? '',
            U_Especialidad: fila['Especialidad'] ?? '',
            U_Clasif_Gastos: fila['Clasificacion_Gastos'] ?? '',
            U_ConcepComercial: fila['Conceptos_Comerciales'] ?? '',
        }));

        console.log('Detalles:', detalles);

        const fechaContabilizacionISO = fixToISODate(fechaContabilizacion);
        const fechaCreacionISO = fixToISODate(fechaCreacion);

        // Enviar también fechas y glosa al servicio
        const result = await sapService.cargarExcelCC({
        detalles,
        fechaContabilizacion: fechaContabilizacionISO,
        fechaCreacion: fechaCreacionISO,
        glosa
        });


        res.status(200).json({
            status: true,
            mensaje: 'Excel cargado correctamente',
            data: result
        });
    } catch (error) {
        console.error('Error al cargar el excel masivo:', error);
        res.status(500).json({
            status: 500,
            mensaje: 'Error al cargar el excel masivo',
            error: error.message,
        });
    }
};

function fixToISODate(dateStr) {
  if (!dateStr) return null;
  
  // Asumiendo que dateStr viene como '2025-5-21' o similar
  const parts = dateStr.split('-'); // ['2025', '5', '21']
  if(parts.length !== 3) return null;

  const year = parts[0];
  // Asegurarse de que mes y día tengan 2 dígitos:
  const month = parts[1].padStart(2, '0');
  const day = parts[2].padStart(2, '0');

  return `${year}-${month}-${day}`;
}


module.exports = {
    postInventoryEntriesController,
    actualizarAsientoContablePreliminarCCController,
    getPDFAsientoContableCC,
    getCuentasCC,
    getLibroMayor,
    excelLibroMayor,
    docFuentes,
    cargarPlantillaDimensiones,
    recuperarPlantillaDimensiones,
    clasificacionGastos,
    saveDocFuentes,
    getAsientoContableCCById,
    cargarPlantillaMasivaDimensiones,
    reservarAsientoId,
    beneficiarios,
    getLibroMayorFiltrado,
    asientosContadoSAP,
    cargarAsientoSAP,
    actualizarAsientoContabilizado,
    getAsientoContableCC,
    anularAsientoCC,
    descontabilizarAsientoCC,
    obtenerBalanceGeneral,
    obtenerAsientoCompletos,
    obtenerExcelAsientos,
    saveClasificacionGastos,
    cargarExcelMasivo
}