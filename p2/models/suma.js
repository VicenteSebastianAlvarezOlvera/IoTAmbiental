// suma.js
const mongoose = require('mongoose');

// Define el esquema de Mongoose para la suma
const sumaSchema = new mongoose.Schema({
  suma: Number,
});

// Define el modelo de Mongoose para la suma
const Suma = mongoose.model('Suma', sumaSchema);

// Exporta el modelo para su uso en otros lugares
module.exports = Suma;
