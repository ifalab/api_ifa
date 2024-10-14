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
router.post('/get-due-date', checkToken, hanaController.getDocDueDate)


//sld

router.post('/orden', checkToken, sldController.postOrden);
router.post('/entrega', checkToken, sldController.postEntrega);

module.exports = router;