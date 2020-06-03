const router = require("express").Router({ mergeParams: true });

const { login, auth, logout, logoutAll } = require("../controllers/authController")

//LOGIN USER
router.post("/login", login)

//LOGOUT USER
router.get("/logout", auth, logout)
router.get("/logoutAll", auth, logoutAll)

module.exports = router;