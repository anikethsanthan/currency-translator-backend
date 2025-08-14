const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  tmdb_id: { type: Number, unique: true },
  title: String,
  overview: String,
  release_date: String,
  popularity: Number,
  vote_average: Number,
  vote_count: Number,
  revenue: Number,
  genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
  cast: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cast" }],
});

module.exports = mongoose.model("Movie", MovieSchema);
