const userRouter = require("./userRouter");

const router = require("express").Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
