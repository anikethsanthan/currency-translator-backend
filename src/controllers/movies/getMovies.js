const Movie = require("../../models/movie");
const Genre = require("../../models/genre");
const Cast = require("../../models/cast");

/**
 * Get movies with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - year: Filter by release year (e.g., 2023)
 * - genres: Comma-separated genre names to include (e.g., "Action,Comedy")
 * - without_genres: Comma-separated genre names to exclude (e.g., "Horror,Thriller")
 * - sort_by: Sort field - popularity, vote_average, vote_count, release_date, revenue, title (default: release_date)
 * - order: Sort order - asc or desc (default: desc)
 * - search: Search in movie title and cast names (case-insensitive)
 *
 * Example: GET /api/movies/getMovies?page=1&limit=20&year=2023&genres=Action,Comedy&sort_by=vote_average&order=desc&search=marvel
 */

const getMovies = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      year,
      genres,
      without_genres,
      sort_by = "release_date",
      order = "desc",
      search,
    } = req.query;

    // Validating and sanitizing inputs
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 items per page

    const skip = (page - 1) * limit;

    const filter = {};

    // Year filter
    if (year) {
      const yearNum = parseInt(year);
      if (
        yearNum &&
        yearNum >= 1900 &&
        yearNum <= new Date().getFullYear() + 5
      ) {
        filter.release_date = { $regex: `^${yearNum}` };
      }
    }

    // Genres filter (include)
    if (genres) {
      const genreNames = genres
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0);
      if (genreNames.length > 0) {
        const genreObjects = await Genre.find({
          name: { $in: genreNames.map((name) => new RegExp(name, "i")) },
        });
        const genreIds = genreObjects.map((g) => g._id);

        if (genreIds.length > 0) {
          filter.genres = { $in: genreIds };
        }
      }
    }

    // Without genres filter (exclude)
    if (without_genres) {
      const excludeGenreNames = without_genres
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0);
      if (excludeGenreNames.length > 0) {
        const excludeGenreObjects = await Genre.find({
          name: { $in: excludeGenreNames.map((name) => new RegExp(name, "i")) },
        });
        const excludeGenreIds = excludeGenreObjects.map((g) => g._id);

        if (excludeGenreIds.length > 0) {
          filter.genres = { ...filter.genres, $nin: excludeGenreIds };
        }
      }
    }

    // Search filter (title and cast)
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      const searchRegex = { $regex: searchTerm, $options: "i" };

      // Find cast members matching the search term
      const matchingCast = await Cast.find({ name: searchRegex });
      const castIds = matchingCast.map((c) => c._id);

      filter.$or = [{ title: searchRegex }, { cast: { $in: castIds } }];
    }

    // Build sort object
    const sortOptions = {};
    const validSortFields = [
      "popularity",
      "vote_average",
      "vote_count",
      "release_date",
      "revenue",
      "title",
    ];

    if (validSortFields.includes(sort_by)) {
      sortOptions[sort_by] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.release_date = -1; // Default sort
    }

    // Executed query with pagination
    const movies = await Movie.find(filter)
      .populate("genres", "name")
      .populate("cast", "name character")
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions);

    const totalMovies = await Movie.countDocuments(filter);
    const totalPages = Math.ceil(totalMovies / limit);

    res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalMovies,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        year,
        genres,
        without_genres,
        sort_by,
        order,
        search,
      },
    });
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = getMovies;
