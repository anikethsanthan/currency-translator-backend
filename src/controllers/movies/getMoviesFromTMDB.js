const axios = require("axios");
const Movie = require("../../models/movie");
const Genre = require("../../models/genre");
const Cast = require("../../models/cast");

const ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const headers = {
  Authorization: `Bearer ${ACCESS_TOKEN}`,
  accept: "application/json",
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getMovies = async (req, res) => {
  try {
    let allMovies = [];

    for (let page = 1; page <= 25; page++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?page=${page}`,
        {
          headers,
        }
      );
      allMovies.push(...response.data.results);
      await delay(300); // Added small delay to avoid rate limit
    }

    for (const movie of allMovies) {
      const exists = await Movie.findOne({ tmdb_id: movie.id });
      if (exists) continue;

      // Movie details
      const detailRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie.id}`,
        {
          headers,
        }
      );
      const details = detailRes.data;

      // Credits (top 5 cast)
      const creditRes = await axios.get(
        `https://api.themoviedb.org/3/movie/${movie.id}/credits`,
        {
          headers,
        }
      );
      const castList = creditRes.data.cast.slice(0, 5);

      // Save genres
      const genreIds = [];
      for (const g of details.genres) {
        let genre = await Genre.findOne({ tmdb_id: g.id });
        if (!genre) genre = await Genre.create({ tmdb_id: g.id, name: g.name });
        genreIds.push(genre._id);
      }

      // Save cast
      const castIds = [];
      for (const c of castList) {
        let cast = await Cast.findOne({ tmdb_id: c.id });
        if (!cast) {
          cast = await Cast.create({
            tmdb_id: c.id,
            name: c.name,
            character: c.character,
            profile_path: c.profile_path,
          });
        }
        castIds.push(cast._id);
      }

      // Save movie
      await Movie.create({
        tmdb_id: details.id,
        title: details.title,
        overview: details.overview,
        release_date: details.release_date,
        popularity: details.popularity,
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        revenue: details.revenue,
        genres: genreIds,
        cast: castIds,
      });

      console.log(`✅ Saved: ${details.title}`);
    }

    res.json({ message: " Movies seeded successfully" });
  } catch (err) {
    console.error(" Error during seeding:", err);
    res.status(500).json({ message: "Seeding failed", error: err.message });
  }
};

module.exports = getMovies;
