const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const { insertDataLabVenCuotasDetalle, obtenerCodigoLineas, obtenerCodigoAreas, obtenerCodigosTipos, obtenerCodigosEspecialidades, obtenerCodigosClasificacion, obtenerCodigosConceptos, insertDataIfaConceptosComerciales, obtenerEmpleados, insertLabUsuarios, obtenerInventarioEntrada, insertInventarioEntrada } = require('./hana.controller');

// Función para procesar el archivo Excel y hacer los inserts
const processExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningún archivo' });
        }

        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Tomar la primera hoja
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return res.status(400).json({ error: 'El archivo está vacío' });
        }
        console.log(data);

        // Construir los inserts
        for (const row of data) {
          if (row.Cuota_Cantidad !== 0 || row.Cuota_Venta_Bs !== 0) {
            await insertDataLabVenCuotasDetalle(row);
            // await insertDataIfaConceptosComerciales(row);
            // await insertLabUsuarios(row);
            // await insertInventarioEntrada(row);
          }else{
            console.log(row);
          }
        }
      
        // // Borrar el archivo después de procesarlo
        fs.unlinkSync(filePath);

        res.status(200).json({data: data});
    } catch (error) {
        console.error('Error procesando el archivo:', error);
        res.status(500).json({ error: 'Error al procesar el archivo' });
    }
};

const leerExcel = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
};

const existeEnTabla = (fila, tabla) => {
    return tabla.some(row => 
        Object.keys(fila)
            .filter(key => key !== "id")
            .every(key => fila[key] === row[key])
    );
};


const compareExcel = async (req, res) => {
    try {
        if (!req.files || !req.files.excel1 || !req.files.excel2) {
            return res.status(400).json({ error: "Se requieren dos archivos Excel." });
        }

        // Obtener rutas de los archivos subidos
        const filePath1 = req.files.excel1[0].path;
        const filePath2 = req.files.excel2[0].path;

        const datos1 = leerExcel(filePath1);
        const datos2 = leerExcel(filePath2);

        // res.status(200).json({datos1, datos2});

        if (datos1.length === 0 || datos2.length === 0) {
            return res.status(400).json({ error: 'El archivo está vacío' });
        }

        // Construir los inserts
        const filasUnicas = datos1.filter(fila => !existeEnTabla(fila, datos2));
      
        const newWorkbook = XLSX.utils.book_new();
        const newSheet = XLSX.utils.json_to_sheet(filasUnicas);
        XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Diferencias");

        // res.status(200).json(filasUnicas);

        // Guardar el nuevo archivo en una ruta temporal
        const outputFilePath = path.join(__dirname, "diferencias.xlsx");
        XLSX.writeFile(newWorkbook, outputFilePath);

        // Eliminar los archivos subidos después de procesarlos
        fs.unlinkSync(filePath1);
        fs.unlinkSync(filePath2);

        // Enviar el archivo generado como respuesta para descargarlo
        res.download(outputFilePath, "diferencias.xlsx", (err) => {
            if (err) {
                console.error("Error al enviar el archivo:", err);
                res.status(500).json({ error: "Error al generar el archivo Excel." });
            }
            // Eliminar el archivo generado después de la descarga
            fs.unlinkSync(outputFilePath);
        });
    } catch (error) {
        console.error('Error procesando el archivo:', error);
        res.status(500).json({ error: 'Error al procesar los archivos' });
    }
};

const obtenerCodigos = async (req, res) => {
    try {

        const responseLinea = await obtenerCodigoLineas();
        const responseArea = await obtenerCodigoAreas();
        const responseTipos = await obtenerCodigosTipos() ;
        const responseEspecialidades = await obtenerCodigosEspecialidades();
        const responseClasificacion = await obtenerCodigosClasificacion();
        const responseConceptos = await obtenerCodigosConceptos();

        const workbook = XLSX.utils.book_new();

        // Función auxiliar para agregar hojas al Excel
        const agregarHoja = (data, sheetName) => {
            if (data.length > 0) {
                const worksheet = XLSX.utils.json_to_sheet(data);
                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            }
        };

        // Agregar cada conjunto de datos como una hoja en el Excel
        agregarHoja(responseLinea, "Lineas");
        agregarHoja(responseArea, "Areas");
        agregarHoja(responseTipos, "Tipos");
        agregarHoja(responseEspecialidades, "Especialidades");
        agregarHoja(responseClasificacion, "Clasificacion");
        agregarHoja(responseConceptos, "Conceptos");

        // Definir la ruta donde se guardará temporalmente el archivo
        const filePath = path.resolve("./uploads/codigos.xlsx");
        XLSX.writeFile(workbook, filePath);

        // Enviar el archivo Excel para descarga
        res.download(filePath, "codigos.xlsx", (err) => {
            if (err) {
                console.error("Error al enviar el archivo:", err);
                res.status(500).json({ error: "Error al descargar el archivo" });
            }

            // Eliminar el archivo temporal después de la descarga
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error procesando la consulta:', error);
        res.status(500).json({ error: 'Error al procesar la consulta' });
    }
};

const generarUserCode = (nombreCompleto) => {
    if (!nombreCompleto) return "";

    // Eliminar dobles espacios
    const limpio = nombreCompleto.replace(/\s+/g, " ").trim();
    const partes = limpio.split(" ");

    let userCode = "";
    if (partes.length === 3) {
        userCode = partes[0].trim() + partes[1][0].trim() + partes[2][0].trim();
    } else if (partes.length === 4) {
        userCode = partes[0].trim() + partes[2][0].trim() + partes[3][0].trim();
    } else {
        userCode = partes[0];
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    userCode = (userCode + "IFA" + randomNum).toLowerCase();

    return { userCode, etiqueta: userCode.toUpperCase() };
};

const leerEmpleados = async (req, res) => {
    try {

        const responseEmpleados = await obtenerEmpleados();

        // console.log(responseEmpleados);

        const empleadosProcesados = responseEmpleados.map(emp => {
            console.log(emp);
            const { userCode, etiqueta } = generarUserCode(emp.CardName);
            return {
                CardName: emp.CardName,
                codemp: emp.CardCode,
                userCode,
                pass: 'Empleado123',
                confirm_pass: 'Empleado123',
                superuser: false,
                etiqueta
            };
        });

        // res.status(200).json(empleadosProcesados);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(empleadosProcesados);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");

        // Definir la ruta donde se guardará temporalmente el archivo
        const filePath = path.resolve("./uploads/empleados.xlsx");
        XLSX.writeFile(workbook, filePath);

        // Enviar el archivo Excel para descarga
        res.download(filePath, "empleados.xlsx", (err) => {
            if (err) {
                console.error("Error al enviar el archivo:", err);
                res.status(500).json({ error: "Error al descargar el archivo" });
            }

            // Eliminar el archivo temporal después de la descarga
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error procesando la consulta:', error);
        res.status(500).json({ error: 'Error al procesar la consulta' });
    }
};

const leerInventarioEntrada = async (req, res) => {
    try {

        const responseInventarios = await obtenerInventarioEntrada();

        // res.status(200).json(empleadosProcesados);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(responseInventarios);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");

        // Definir la ruta donde se guardará temporalmente el archivo
        const filePath = path.resolve("./uploads/inventario.xlsx");
        XLSX.writeFile(workbook, filePath);

        // Enviar el archivo Excel para descarga
        res.download(filePath, "empleados.xlsx", (err) => {
            if (err) {
                console.error("Error al enviar el archivo:", err);
                res.status(500).json({ error: "Error al descargar el archivo" });
            }

            // Eliminar el archivo temporal después de la descarga
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Error procesando la consulta:', error);
        res.status(500).json({ error: 'Error al procesar la consulta' });
    }
};

module.exports = { processExcel, compareExcel, obtenerCodigos, leerEmpleados, leerInventarioEntrada };
