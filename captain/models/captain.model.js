const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },

  isAvailable: {
    type: Boolean,
    default: false
  }
})

const Captain = mongoose.model('Captain', userSchema);

module.exports = Captain;