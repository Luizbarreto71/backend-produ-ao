// models/Child.js
const mongoose = require('mongoose');

const childSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    age: { type: Number, min: 0, max: 18 },
  },
  { timestamps: true }
);

// índice único por usuário + nome
childSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Child', childSchema);
