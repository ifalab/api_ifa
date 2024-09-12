const express = require('express');
const router = express.Router();
const { exec } = require('child_process'); // Importar el módulo child_process
const path = require('path');


// Importa tus controladores
const sldController = require('../controllers/sldController.js');
const hanaController = require('../controllers/hanaController.js');

// Importa el middleware de autenticación
const checkToken = require('../middleware/authMiddleware.js');


router.get('/', (req, res) => {
  res.send('Bienvenido a la API. Visita /v1/docs para ver la documentación.');
});



// Servir la documentación en formato HTML
router.get('/docs', (req, res) => {
  const filePath = path.join(__dirname, '../docs/docApi.html');
  res.sendFile(filePath);
});


//hana
router.get('/usuarios', checkToken, hanaController.getUsuarios);
router.post('/get-due-date',checkToken,hanaController.getDocDueDate)


//sld
router.post('/orden', checkToken, sldController.postOrden);
router.post('/entrega', checkToken, sldController.postEntrega);





















//apps
router.post('/migracioncca', (req, res) => {

  const docDate = req.body.DocDate; // Extraer el valor de DocDate del cuerpo de la solicitud

  if (!docDate) {
    return res.status(400).send('Falta el campo "DocDate" en la solicitud');
  }
  const miVariable = docDate; // Define tu variable aquí

  console.log('En curso migracion de asientos => LAB_IFA_CC...');
  
  // Construir el comando con la variable como argumento
  const comando = `python /Users/Administrador.SRVCORE01/Documents/apifa/src/apps/ccMigration/migration.py ${miVariable}`;

  exec(comando, (error, stdout, stderr) => {
    if (error) {
      console.log(2);
      console.error(`Error al ejecutar el script: ${error.message}`);
      return res.status(500).send(`Error al ejecutar el script: ${error.message}`);
    }
    if (stderr) {
      console.log(3);
      console.error(`Error en el script de Python: ${stderr}`);
      return res.status(500).send(`Error en el script de Python: ${stderr}`);
    }
    console.log('Exito');
    console.log(`Salida del script de Python: ${stdout}`);
    res.send(`Proceso ejecutado: ${stdout}`);
  });
});


router.post('/migracioncc', (req, res) => {
  const docDate = req.body.DocDate; // Extraer el valor de DocDate del cuerpo de la solicitud

  if (!docDate) {
    return res.status(400).send('Falta el campo "DocDate" en la solicitud');
  }

  console.log('En curso migracion de asientos => LAB_IFA_CC...');
  
  // Construir el comando con la variable como argumento
  const comando = `python /Users/Administrador.SRVCORE01/Documents/apifa/src/apps/ccMigration/migration.py ${docDate}`;

  exec(comando, (error, stdout, stderr) => {
    // Definir las rutas a los archivos de log
    const errorLogEndpoint = '/migracioncc/errors';
    const successLogEndpoint = '/migracioncc/success';

    if (error) {
      console.error(`Error al ejecutar el script: ${error.message}`);
      return res.status(500).send(`
        <p>Error al ejecutar el script: ${error.message}</p>
        <a href="${errorLogPath}" target="_blank">Ver Log de Errores</a>
      `);
    }
    
    if (stderr) {
      console.error(`Error en el script de Python: ${stderr}`);
      return res.status(500).send(`
        <p>Error en el script de Python: ${stderr}</p>
        <a href="${errorLogPath}" target="_blank">Ver Log de Errores</a>
      `);
    }

    console.log('Exito');
    console.log(`Salida del script de Python: ${stdout}`);
    
    res.send(`
      <p>Proceso ejecutado correctamente:</p>
      <p>${stdout}</p>
      <a href="${successLogEndpoint}" target="_blank">Ver Log de Carga Exitosa</a>
      <a href="${errorLogEndpoint}" target="_blank">Ver Log de Errores</a>
    `);
  });
});
// Servir la documentación en formato HTML
router.get('/migracioncc/errors', (req, res) => {
  const filePath = path.join(__dirname, '../apps/ccMigration/error.json');
  res.sendFile(filePath);
});
// Servir la documentación en formato HTML
router.get('/migracioncc/success', (req, res) => {
  const filePath = path.join(__dirname, '../apps/ccMigration/logs.json');
  res.sendFile(filePath);
});
module.exports = router;