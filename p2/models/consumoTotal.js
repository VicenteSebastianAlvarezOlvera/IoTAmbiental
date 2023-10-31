// suma.js
const mongoose = require('mongoose');

// Define el esquema de Mongoose para la suma
const sumaTotalSchema = new mongoose.Schema({
  sumaTotal: Number,
});

// Define el modelo de Mongoose para la suma
const SumaTotal = mongoose.model('SumaTotal', sumaTotalSchema);

// Exporta el modelo para su uso en otros lugares
module.exports = SumaTotal;
