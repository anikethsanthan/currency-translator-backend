const userRouter = require("./userRouter");
const transactionRouter = require("./transactionRouter");

const router = require("express").Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/transaction",
    route: transactionRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
