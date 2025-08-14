const userRouter = require("./userRouter");
const movieRouter = require("./movieRouter");

const router = require("express").Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/movie",
    route: movieRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
