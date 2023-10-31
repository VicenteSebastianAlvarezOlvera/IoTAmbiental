const express = require('express');
const app = express();
const port = 3000;
app.use(express.static(__dirname + 'views'));
//const socket = io('localhost:2000'); // Asegúrate de que coincida con la URL de tu servidor socket en p2
//
//// Configura una sala para p3
//socket.emit('join_room', 'p3_room');
//
//// Escuchar eventos de alerta
//socket.on('alerta', (mensaje) => {
//  // Procesa la alerta en p3, si es necesario
//});

const bodyParser = require('body-parser'); // Importa body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/historial', (req, res) => {
  res.render('results');
  // Realiza una solicitud a la API (puerto 2000) para obtener los datos del historial
  /*fetch('http://localhost:2000/historial')
  
      .then(response => response.json())
      .then(data => {
          res.render('results', { historial: data });
      })
      .catch(error => {
          console.error('Error al obtener el historial:', error);
          res.status(500).json({ error: 'Error al obtener el historial' });
      });*/
});

/*app.get('/consultarConsumoUsuario', (req, res) => {
  fetch('http://localhost:2000/consultarConsumoUsuario')
    .then(response => response.json())
      .then(data => {
          res.render('results', { historial: data });
      })
      .catch(error => {
          console.error('Error al obtener el historial:', error);
          res.status(500).json({ error: 'Error al obtener el historial' });
      });
});
app.get('/consultarConsumoUsuario', async (req, res) => {
  const usuarioSeleccionado = req.query.usuario;

  try {
    const historialData = await Historial.find({ usuario: usuarioSeleccionado }).sort({ fecha: -1 }).limit(10);
    res.json(historialData); // Devuelve los datos como JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al consultar el historial.' });
  }
});
app.get('/consultarConsumoUsuario', async (req, res) => {
  const usuarioSeleccionado = req.body.usuario;
  console.log(usuarioSeleccionado);
  try {
    // Realiza una solicitud a la API en p2 para obtener los resultados
    const response = await fetch(`http://localhost:2000/consultarConsumoUsuario?usuario=${usuarioSeleccionado}`);
    const historialData = await response.json();

    // Renderiza los resultados en la página de resultados
    res.render('results', { historial: historialData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los resultados.' });
  }
});*/
app.post('/consultarHistorial', async (req, res) => {
  const usuario = req.body.usuario; // El usuario seleccionado en el formulario
  console.log("El usuario es: ", usuario);
  try {
    // Envía una solicitud a p2/api.js para obtener los registros del historial en función del usuario
    const response = await fetch('http://localhost:2000/consultarConsumoUsuario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usuario }),
    });

    if (response.ok) {
      const historialData = await response.json();

      // Renderiza la vista results.pug con los registros del historial
      res.render('results', { historial: historialData });
    } else {
      res.status(500).json({ error: 'Error al cargar el historial.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cargar el historial.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor de visualización en el puerto ${port}`);
});
