const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { postInventoryEntries } = require("./sld.controller")

const sapService = require("../services/cc.service");
const { ObtenerLibroMayor } = require('./hana.controller');
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

        let libroMayorData = [];
        for (const line of data.lines) {
            sumDebit += Number(line.Debit) || 0;
            sumCredit += Number(line.Credit) || 0;
            if (line.Account && !isNaN(Number(line.Account))) {
                try {
                    const libro = await ObtenerLibroMayor(line.Account);
                    libroMayorData.push({
                        account: line.Account,
                        libro,
                    });
                } catch (innerError) {
                    console.error(`Error al obtener mayor de cuenta ${line.Account}:`, innerError.message);
                    libroMayorData.push({
                        account: line.Account,
                        error: true,
                        libro: null,
                    });
                }
            } else {
                libroMayorData.push(null);
            }
        }

        // const libroMayorData = await Promise.all(libroMayorPromises);
        
        // Agregamos a la data principal
        data.sumDebit = sumDebit.toFixed(2);
        data.sumCredit = sumCredit.toFixed(2);
        data.LibroMayor = libroMayorData; 
        
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

        const pdfBuffer = await page.pdf({
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

        // 3. Enviar el PDF como respuesta
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="asiento-contable.pdf"',
        });
        res.end(pdfBuffer);
    } catch (error) {
        console.error({ error });
        return res.status(500).json({
            mensaje: `Error en el controlador getPDFAsientoContableCC, ${error.message || 'error desconocido'}`,
        });
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = {
    postInventoryEntriesController,
    actualizarAsientoContablePreliminarCCController,
    getPDFAsientoContableCC
}