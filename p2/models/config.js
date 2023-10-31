const mongoose = require('mongoose');

// Define el esquema de Mongoose para el archivo config.json
const configSchema = new mongoose.Schema({
  // Define los campos que deseas en tu tabla
  Refrigerador: Boolean,
  Cafetera: Boolean,
  Estufa: Boolean,
  Microondas: Boolean,
  Cargador: Boolean,
  Lampara: Boolean,
  VentiladorCuarto: Boolean,
  Computadora: Boolean,
  Television: Boolean,
  VentiladorSala: Boolean,
  Bocina: Boolean,
  LucesSala: Boolean,
  Ventilacion: Boolean,
  LucesBano: Boolean
});

// Define el modelo de Mongoose para el archivo config.json
const Config = mongoose.model('Config', configSchema);

// Exporta el modelo para su uso en otros lugares
module.exports = Config;
