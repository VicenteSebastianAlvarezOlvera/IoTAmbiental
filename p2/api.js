const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json()); // Configura body-parser para analizar JSON
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

const Config = require('./models/config');
const Historial = require('./models/historial');
const Suma = require('./models/suma');
const SumaTotal = require('./models/consumoTotal');
const Umbral = require('./models/umbral');

const uri = "mongodb+srv://190300376ucaribe:ucaribe123@cluster0.9dnrf4k.mongodb.net/?retryWrites=true&w=majority"

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + 'public'));
const path = require('path');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'public'));
const fs = require('fs');
const uuid = require('uuid');

async function connect(){
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        //console.log("Connected to MongoDB")
    } catch (error) {
        console.error(error);
    }
}
connect();
// Ruta al archivo donde se guardará la suma
//const rutaArchivoSuma = 'suma.json';
//const rutaArchivoTotal = 'consumoTotal.json';
//const rutaArchivoHistorial = 'historial.json';
//const rutaArchivoConfig = 'config.json';

io.on('connection', (socket) => {
    //console.log('Cliente conectado a través de WebSocket');
  
    // Escucha eventos de p2/api.js y emite eventos a p1 y p3
    socket.on('alerta', (mensaje) => {
      // Emitir la alerta a p1 y p3
      io.to('p1_room').emit('alerta', mensaje);
      io.to('p3_room').emit('alerta', mensaje);
    });
  });

app.get('/', (req, res) => {
    const total = req.query.total;
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/index', async (req, res) => {
    try {
        // Consultar el último registro en la base de datos
        const latestConfig = await Config.findOne().sort({ _id: -1 }).lean();
        const latestSuma = await Suma.findOne().sort({ _id: -1 }).lean();
        // Renderizar la vista con la última configuración
        res.render('index', { config: latestConfig, sumaConsumo: latestSuma });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cargar la configuración.' });
    }
});

//app.get('/results', async (req, res) => {
app.get('/historial', async (req, res) => {
    try {
        const historialData = await Historial.find({}).sort({ fecha: -1 }).limit(20);
        res.json(historialData); // Devuelve los datos como JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el historial.' });
    }
});
//CONSULTAR HISTORIAL POR PERFIL
app.post('/consultarConsumoUsuario', async (req, res) => {
    const usuario = req.body.usuario; // El usuario seleccionado en el formulario
    //console.log("El usuario es: ", usuario);
    try {
      // Consulta los registros de historial en función del usuario
      const historialData = await Historial.find({ usuario })
        .sort({ fecha: -1 })
        .limit(10); // Cambia 2 a 20 si deseas obtener los últimos 20 registros
        //console.log("El usuario es: ", historialData);
      res.status(200).json(historialData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al cargar el historial.' });
    }
  });
  
app.post('/lastConfig', async (req, res) => {
    const usuario = req.body.usuario; // El usuario seleccionado en el formulario
    //console.log("El usuario es: ", usuario);
  /*try {
      //const latestConfig = await Config.findOne().sort({ _id: -1 }).lean();
      const latestConfig = await Config.findOne({ usuario }).sort({ _id: -1 }).lean();
      console.log(latestConfig);
      res.json(latestConfig); // Devuelve los datos como JSON
  }*/ 
  try {
    // Consulta el último registro del historial realizado por el usuario específico
    const latestHistorial = await Historial.findOne({ usuario }).sort({ fecha: -1 }).lean();

    if (latestHistorial) {
        // Ahora latestHistorial contendrá el último registro del historial del usuario
        // Obtén la configuración de ese historial
        //const configuracionDelHistorial = latestHistorial.config;
        const configId = latestHistorial.config;
        // Busca la configuración en la colección Config utilizando el ID
        const configuracionDelHistorial = await Config.findById(configId).lean();
        //console.log(configuracionDelHistorial);
        // Realiza cualquier operación que necesites con configuracionDelHistorial
        res.json(configuracionDelHistorial);
    } else {
        // Si no se encontró ningún historial para el usuario, puedes manejarlo aquí
        res.status(404).json({ error: 'No se encontró historial para el usuario especificado' });
    }}
      catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al consultar el historial.' });
  }
});

app.get('/lastSuma', async (req, res) => {
    try {
        const latestSuma = await Suma.findOne().sort({ _id: -1 }).lean();
        res.json(latestSuma); // Devuelve los datos como JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el historial.' });
    }
  });
/*
  app.get('/historial', async (req, res) => {
    try {
        const historialData = await Historial.find({});
        res.json(historialData); // Devuelve los datos como JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el historial.' });
    }
  });*/


app.post('/processForm', async (req, res) => {
    const formData = req.body;
    const newConfigData = {};
    let sum = 0;
    //console.log(formData)
    const umbral = parseInt(formData.umbral, 10); // Convierte el valor del umbral a un número entero
    /*for (const entry in formData) {
        if (formData.hasOwnProperty(entry)) {
            const value = parseInt(formData[entry], 10); // Convierte el valor a un número entero
            if (!isNaN(value)) {
                sum += value;
            }
        }
    }*/
    let firstNumericValueFound = false; // Variable para rastrear si se ha encontrado el primer valor numérico

    for (const entry in formData) {
        if (formData.hasOwnProperty(entry)) {
            const value = parseInt(formData[entry], 10); // Convierte el valor a un número entero
            if (!isNaN(value) && firstNumericValueFound) {
                sum += value;
            }

            // Marcar que se ha encontrado el primer valor numérico
            if (!isNaN(value) && !firstNumericValueFound) {
                firstNumericValueFound = true;
            }
        }
    }

    console.log(sum)
    for (const entry in formData) {
        if (formData.hasOwnProperty(entry) && entry != 'usuario') {
            //newConfigData[entry] = formData[entry] === 'on';
            newConfigData[entry] = true;
        }
    }
    const newUmbral = new Umbral({
        usuario: formData.usuario, // Obtén el usuario del formulario
        umbralDeWhatts: umbral, // Guarda el umbral en la base de datos
    })
    const newConfig = new Config(newConfigData);
    const newSum = new Suma({ suma: sum }); // Debes pasar un objeto con la propiedad 'suma'

    try {
        await newSum.save();
        await newUmbral.save();
        await newConfig.save();
        const historialData = {
            fecha: new Date(), // Usa el ID del objeto Suma recién guardado
            suma: sum, // Usar la suma correcta
            usuario: req.body.usuario,
            config: newConfig._id,
          };
          
      
          const newHistorial = new Historial(historialData);
          await newHistorial.save();
          res.status(200).json({ message: 'Operación exitosa' });
          //res.render('index', { successMessage: 'Configuración guardada correctamente' });
        //res.redirect('http://localhost:1000/index');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar la configuración.' });
    }
});
/*
app.get('/actualizarConsumoTotal', async (req, res) => {
    const latestSuma = await Suma.findOne().sort({ _id: -1 }).lean();
    const latestSumaTotal = await SumaTotal.findOne().sort({ _id: -1 }).lean();

    if (latestSuma && latestSumaTotal) {
        let nuevaSuma = latestSuma.suma + latestSumaTotal.sumaTotal;
        console.log("Suma Nueva: ", nuevaSuma);

        try {
            // Actualiza el último documento SumaTotal en lugar de crear uno nuevo
            const newNuevaSumaTotal = new SumaTotal({ sumaTotal: nuevaSuma });
            await newNuevaSumaTotal.save();
            //console.log("actualiacion hecha");
            //res.status(200).json({ message: 'Actualización exitosa' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar la suma total.' });
        }
    } else {
        res.status(500).json({ error: 'No se pudieron encontrar los datos necesarios.' });
    }
});*/
app.get('/VerificarUmbrales', async (req, res) => {
    const Usuario1 = "Vicente";
    const Usuario2 = "Axel";
    const Usuario3 = "Oscar";
    const Usuario4 = "Christopher";
    //console.log(Usuario1);
    var Umbral1 = await Umbral.findOne({ usuario:Usuario1 }).sort({ _id: -1 }).lean();
    var umbralValor1 = Umbral1 ? Umbral1.umbralDeWhatts : null;    
    var Umbral2 = await Umbral.findOne({ usuario:Usuario2 }).sort({ _id: -1 }).lean();
    var umbralValor2 = Umbral2 ? Umbral2.umbralDeWhatts : null;
    var Umbral3 = await Umbral.findOne({ usuario:Usuario3 }).sort({ _id: -1 }).lean();
    var umbralValor3 = Umbral3 ? Umbral3.umbralDeWhatts : null;
    var Umbral4 = await Umbral.findOne({ usuario:Usuario4 }).sort({ _id: -1 }).lean();
    var umbralValor4 = Umbral4 ? Umbral4.umbralDeWhatts : null;
    //console.log(umbralValor1);
    var latestHistorial1 = await Historial.find({ usuario: Usuario1 }).sort({ fecha: -1 }).limit(2).lean();
    var sumaUsuario1 = latestHistorial1.reduce((total1, historial) => total1 + historial.suma, 0);
    var latestHistorial2 = await Historial.find({ usuario:Usuario2 }).sort({ fecha: -1 }).limit(2).lean();
    var sumaUsuario2 = latestHistorial2.reduce((total2, historial) => total2 + historial.suma, 0);
    var latestHistorial3 = await Historial.find({ usuario:Usuario3 }).sort({ fecha: -1 }).limit(2).lean();
    var sumaUsuario3 = latestHistorial3.reduce((total3, historial) => total3 + historial.suma, 0);
    var latestHistorial4 = await Historial.find({ usuario:Usuario4 }).sort({ fecha: -1 }).limit(2).lean();
    var sumaUsuario4 = latestHistorial4.reduce((total4, historial) => total4 + historial.suma, 0);
    //console.log(sumaUsuario1);
    var PromedioConsumo1 = sumaUsuario1/2;
    var PromedioConsumo2 = sumaUsuario2/2;
    var PromedioConsumo3 = sumaUsuario3/2;
    var PromedioConsumo4 = sumaUsuario4/2;
    //console.log(PromedioConsumo1);
    if (PromedioConsumo1 > umbralValor1) {
        const mensaje1 = 'Vicente ha tenido un consumo más alto de lo establecido';
        console.log('Vicente ha tenido un consumo más alto de lo establecido');
        // Enviar una alerta a p1 y p3
        //io.to('p1_room').emit('alerta', mensaje);
        //io.to('p3_room').emit('alerta', mensaje);
      }
      if (PromedioConsumo2 > umbralValor2) {
        const mensaje2 = 'Axel ha tenido un consumo más alto de lo establecido';
        // Enviar una alerta a p1 y p3
        //io.to('p1_room').emit('alerta', mensaje);
        //io.to('p3_room').emit('alerta', mensaje);
        console.log(mensaje2);
      }
      if (PromedioConsumo3 > umbralValor3) {
        const mensaje3 = 'Oscar ha tenido un consumo más alto de lo establecido';
        // Enviar una alerta a p1 y p3
        //io.to('p1_room').emit('alerta', mensaje);
        //io.to('p3_room').emit('alerta', mensaje);
        console.log(mensaje3);
      }
      if (PromedioConsumo4 > umbralValor4) {
        const mensaje4 = 'Christopher ha tenido un consumo más alto de lo establecido';
        // Enviar una alerta a p1 y p3
        //io.to('p1_room').emit('alerta', mensaje);
        //io.to('p3_room').emit('alerta', mensaje);
        console.log(mensaje4);
      }

    //const latestSuma = await Suma.findOne().sort({ _id: -1 }).lean();
    //const latestSumaTotal = await SumaTotal.findOne().sort({ _id: -1 }).lean();

//    if (latestSuma && latestSumaTotal) {
//        let nuevaSuma = latestSuma.suma + latestSumaTotal.sumaTotal;
//        console.log("Suma Nueva: ", nuevaSuma);
//
//        try {
//            // Actualiza el último documento SumaTotal en lugar de crear uno nuevo
//            const newNuevaSumaTotal = new SumaTotal({ sumaTotal: nuevaSuma });
//            await newNuevaSumaTotal.save();
//            //console.log("actualiacion hecha");
//            //res.status(200).json({ message: 'Actualización exitosa' });
//        } catch (error) {
//            console.error(error);
//            res.status(500).json({ error: 'Error al actualizar la suma total.' });
//        }
//    } else {
//        res.status(500).json({ error: 'No se pudieron encontrar los datos necesarios.' });
//    }
});
setInterval(() => {
    fetch('http://localhost:2000/VerificarUmbrales')
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(error => {
            console.error('Error al actualizar el consumo total:', error);
        });
}, 2500);




app.listen(2000, () => {
    console.log('La aplicación está corriendo en el puerto 2000.');
});
