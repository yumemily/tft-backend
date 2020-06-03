const User = require("../models/user")

const catchAsync = require("../utils/catchAsync")
const jwt = require("jsonwebtoken")
const { updateOne } = require("./factories")

exports.createUser = catchAsync(async function (req, res) {
    const { name, email, password, summonerName } = req.body;
    const user = await User.create({ name, email, password, summonerName })
    return res.status(201).json({ status: "ok", data: user })
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //check user's email input
    const { email } = req.params;
    if (!email) return next(new AppError(400, "need to provide an email"))

    //check if there is a user assoc with the email
    const user = await User.findOne({ email: email })
    if (!user) return res.status(200).json({ status: "success", data: null })

    const token = jwt.sign({ email: user.email }, process.env.SECRET) // ?? object

    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID);
    if (!user)
        return res.status(200).json({
            status: "success",
            data: "A confirmation will be sent to your email address"
        });

    const msg = {
        to: user.email,
        from: "emilyyum@gmail.com",
        subject: 'Reset password request',
        html: `Click <a href="https://localhost:3000/emails/${token}">here</a> to reset your password.`,
    };

    sgMail.send(msg);
    return res.status(200).json({
        status: "success",
        data: "A confirmation will be sent to your email address"
    })
})

exports.changePassword = catchAsync(async function (req, res, next) {
    const { token } = req.body
    const { password } = req.body
    console.log(req.body)
    const decoded = jwt.verify(token, process.env.SECRET);
    // decoded = {email: "damanhkhoa@gmail.com"}
    const user = await User.findOne({ email: decoded.email });
    user.password = password;
    console.log(user)
    await user.save()

    res.status(200).json({ status: 'success', data: user })
})

exports.readUser = catchAsync(async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        //method to fetch from api

        console.log("USER=============", user)

        return res.status(200).json({ status: "success", data: user })
    } catch (err) {
        return res.status(400).json({ status: "fail", message: err.message })
    }
});


exports.updateUser = updateOne(User)