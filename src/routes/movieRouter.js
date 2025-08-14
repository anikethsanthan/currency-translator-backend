const getMoviesFromTMDB = require("../controllers/movies/getMoviesFromTMDB");
const getMovies = require("../controllers/movies/getMovies");

// const { authenticate } = require("../middleware/authenticate");

const movieRouter = require("express").Router();

movieRouter.get("/getMoviesFromTMDB", getMoviesFromTMDB);
movieRouter.get("/getMovies", getMovies);

module.exports = movieRouter;
