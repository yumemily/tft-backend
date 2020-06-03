const router = require("express").Router({ mergeParams: true });
const { auth } = require("../controllers/authController")

const { createComp, getComps, getComp, createFavorite, getFavorites, readComps } = require("../controllers/compBuilderController")


//Comps
router.route("/comps/favorites")
    .get(auth, getFavorites)

router.route("/comps/:id")
    .get(getComp)
    .post(auth, createFavorite)

   router.route("/")
    .post(auth, createComp) //User can create new tour

router.route("/comps")
    .get(readComps)

 



module.exports = router;