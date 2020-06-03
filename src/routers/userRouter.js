
const router = require("express").Router( {mergeParams: true} );
const { createUser, readUser, resetPassword, changePassword, updateUser } = require("../controllers/userController");
const { auth } = require("../controllers/authController");

// router.route("/me")
// .put(auth, updateUser) //update logged in user's profile
// .get(auth, readUser) //get logged in user's profile

router.route("/")
.post(createUser) //Register new user
.get(auth, readUser) //get logged in user's profile

router.route("/forget-password/:email").get(resetPassword)
router.route("/change-password/:token").post(changePassword)

router.route("/me")
.put(auth, updateUser) //update logged in user's profile
router.route("/me")
.get(auth, (req,res)=>{
    res.status(200).json({"data": req.user})
}) //update logged in user's profile

module.exports = router;