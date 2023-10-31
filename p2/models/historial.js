// historial.js
const mongoose = require('mongoose');
const Config = require('./config'); // Importa el modelo Config
const Suma = require('./suma');


const historialSchema = new mongoose.Schema({
    fecha: Date,
    suma: Number,
    usuario: String,
    config: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Config', // Cambia 'Config' al nombre correcto de tu modelo Config
    },
  });

const Historial = mongoose.model('Historial', historialSchema);

module.exports = Historial;
