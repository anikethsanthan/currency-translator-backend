const mongoose = require("mongoose");

const CastSchema = new mongoose.Schema({
  tmdb_id: { type: Number, unique: true },
  name: String,
  character: String,
  profile_path: String,
});

module.exports = mongoose.model("Cast", CastSchema);
