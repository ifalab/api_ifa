const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const ExcelJS = require('exceljs');
const { postInventoryEntries } = require("./sld.controller")

const sapService = require("../services/cc.service");
const { ObtenerLibroMayor, cuentasCC, getNombreUsuario, getDocFuentes } = require('./hana.controller');
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

        console.log(req.body)

        console.log(user);

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
        if (browser) await browser.close();
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
        return res.status(500).json({ mensaje: 'error en getLibroMayor' })
    }
}

const excelLibroMayor = async (req, res) => {
    try {
      const data = req.body;
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Libro Mayor');
  
      // Definir columnas
      worksheet.columns = [
        { header: 'Fecha', key: 'RefDate', width: 15 },
        { header: 'Transacción', key: 'TransId', width: 15 },
        { header: 'Glosa', key: 'Memo', width: 30 },
        { header: 'Referencia 1', key: 'Ref1', width: 20, style: { numFmt: '0' } },
        { header: 'Referencia 2', key: 'Ref2', width: 15, style: { numFmt: '0' } },
        { header: 'Referencia 3', key: 'Ref3', width: 15, style: { numFmt: '0' } },
        { header: 'Línea', key: 'Line_ID', width: 10 },
        { header: 'Cuenta', key: 'Account', width: 20 },
        { header: 'Nombre Cuenta', key: 'AcctName', width: 40 },
        { header: 'Código Cuenta Asociada', key: 'ShortName', width: 20 },
        { header: 'Nombre Cuenta Asociada', key: 'CardName', width: 30 },
        { header: 'Débito', key: 'Debit', width: 15 },
        { header: 'Crédito', key: 'Credit', width: 15 },
      ];
  
      data.forEach(row => {
        const newRow = worksheet.addRow({
            RefDate: new Date(row.RefDate),
            TransId: row.TransId,
            Memo: row.Memo,
            Ref1: parseInt(row.Ref1),
            Ref2: parseInt(row.Ref2),
            Ref3: row.Ref3 ?? parseInt(row.Ref3),
            Line_ID: row.Line_ID,
            Account: parseInt(row.Account),
            AcctName: row.AcctName,
            ShortName: String(row.ShortName),
            CardName: row.CardName,
            Debit: parseFloat(row.Debit),
            Credit: parseFloat(row.Credit),
          });
          
          // Si deseas asegurar formato con 2 decimales para Débito y Crédito:
          newRow.getCell('Debit').numFmt = '"Bs"#,##0.00';
          newRow.getCell('Credit').numFmt = '"Bs"#,##0.00';
      });
  
      // Estilizar encabezado
      worksheet.getRow(1).eachCell(cell => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFCCE5FF' },
        };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
  
      // Crear el archivo Excel en memoria
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=libro_mayor.xlsx');
  
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error({ error });
      return res.status(500).json({ mensaje: 'Error generando el Excel del libro mayor' });
    }
};

const docFuentes = async (req, res) => {
    try {
        const data = await getDocFuentes();
        return res.status(200).json(data);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({ mensaje: 'Error obtiendo los documentos fuentes.' });
    }
}

module.exports = {
    postInventoryEntriesController,
    actualizarAsientoContablePreliminarCCController,
    getPDFAsientoContableCC,
    getCuentasCC,
    getLibroMayor,
    excelLibroMayor,
    docFuentes
}