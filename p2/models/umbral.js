const mongoose = require('mongoose');

// Define el esquema de Mongoose para el archivo config.json
const umbralAlerta = new mongoose.Schema({
  // Define los campos que deseas en tu tabla
  usuario: String,
  umbralDeWhatts: Number
});

// Define el modelo de Mongoose para el archivo config.json
const Umbral = mongoose.model('Umbral', umbralAlerta);

// Exporta el modelo para su uso en otros lugares
module.exports = Umbral;
