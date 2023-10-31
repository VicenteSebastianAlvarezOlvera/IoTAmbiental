const express = require('express');
const app = express();
//const socket = io('localhost:2000'); // Asegúrate de que coincida con la URL de tu servidor socket en p2
//socket.emit('join_room', 'p1_room');
//
//// Escuchar eventos de alerta
//socket.on('alerta', (mensaje) => {
//  // Procesa la alerta y muestra un mensaje al usuario en tu página
//  alert(mensaje);
//});

import('node-fetch')
  .then((nodeFetch) => {
    // Ahora puedes usar nodeFetch para hacer solicitudes HTTP
    const fetch = nodeFetch.default;

    // Resto de tu código aquí
  })
  .catch((error) => {
    console.error('Error al cargar node-fetch:', error);
  });
  const bodyParser = require('body-parser'); // Importa body-parser
  // Agrega el middleware body-parser para analizar los datos del formulario
  app.use(express.urlencoded({ extended: true })); 
  
  // Resto de tu código aquí
  
//const fetch = require('node-fetch'); // Asegúrate de importar node-fetch
app.use(express.static(__dirname + 'views'));
const path = require('path');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/index', async (req, res) => {
  res.render('index');
  /*
  try {
    // Realiza una solicitud a la API para obtener la última configuración
    const configResponse = await fetch('http://localhost:2000/lastConfig');
    const latestConfig = await configResponse.json();

    // Realiza una solicitud a la API para obtener la última suma de consumo
    const sumaResponse = await fetch('http://localhost:2000/lastSuma');
    const latestSuma = await sumaResponse.json();

    // Renderiza la vista con los datos obtenidos de la API
    res.render('index', { config: latestConfig, sumaConsumo: latestSuma });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar la configuración.' });
  }*/
});

app.post('/consultarHistorial', async (req, res) => {
  const usuario = req.body.usuario; // El usuario seleccionado en el formulario
  console.log("El usuario es: ", usuario);
  try {
    // Envía una solicitud a p2/api.js para obtener los registros del historial en función del usuario
    const response = await fetch('http://localhost:2000/lastConfig', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario }),
    });

    if (response.ok) {
      const historialData = await response.json();
      console.log(historialData);
      // Renderiza la vista results.pug con los registros del historial
      res.render('datosUsuario', { historial: historialData , usuario: usuario });
    } else {
      res.status(500).json({ error: 'Error al cargar el historial.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar el historial.' });
  }
});

// Ajusta el manejo del formulario para enviarlo a la API
app.post('/processForm', async (req, res) => {
  const formData = req.body;
  console.log("Esto es lo que se envia: ")
  console.log(formData)
  
  try {
    // Envia el formulario a la API en el puerto 2000
    const response = await fetch('http://localhost:2000/processForm', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      res.redirect('http://localhost:1000/index');
      //res.render('index', { successMessage: 'Configuración guardada correctamente' });
      //alert("Configuración guardada correctamente");
      //window.location.href = 'http://localhost:1000/index';
    } else {
      res.status(500).json({ error: 'Error al guardar la configuración.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la configuración.' });
  }
});

app.listen(1000, () => {
  console.log('La aplicación de front está corriendo en el puerto 1000.');
});
