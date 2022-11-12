const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const { sendMailForClient } = require('../utils/mailer');
const { User } = require('../model/usersSchema');

const registerHandler = async(req, res) => {
    const errors = [];
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            errors.push({
                name: "duplicationErr",
                message: "این ایمیل قبلا در پایگاه داده موجود بوده است"
            })
            return res.status(422).json({ errors: errors })
        } else {
            await User.userValidation(req.body);
            await User.create(req.body);
            res.status(200).json({ "message": "شما با موفقیت ثبت نام شدید" })
        }
    } catch (error) {
        if (error) {
            error.inner.forEach(e => {
                errors.push({ name: e.path, message: e.message })
            })
        }
        return res.status(422).json({ error: errors })
    }
}

const handleLogin = async(req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: "کاربری با این ایمیل و پسورد وجود ندارد" });
    }
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
        return res.status(404).json({ error: "کاربری با این ایمیل و پسورد وجود ندارد" });
    }
    const token = jwt.sign({
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName
    }, process.env.JWT_SECRET);
    res.status(200).json({
        userId: user._id.toString(),
        token
    })
}

const logout = (req, res, next) => {
    req.session = null;
    req.logout();
    res.redirect("/users/login")
}


const forgetPasswordHandle = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.forgetEmail });
        if (!user) {
            return res.status(404).json({ "error": "کاربری با این ایمیل یافت نشد" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        const resetLink = `http://localhost:3000/users/resetPassword/${token}`;
        text = `
        برای بازیابی کلمه عبور روی لینک زیر کلیک کنید
        <br/>
        <a href="${resetLink}">لینک تغییر رمز عبور</a>
        `
        sendMailForClient(req.body.forgetEmail, "بازیابی رمز عبور", text);

        res.status(200).json({
            message: "ایمیل با موفقیت ارسال شد"
        })

    } catch (error) {
        res.status(422).json({
            error: "کاربری با این ایمیل در پایگاه داده یافت نمیشود"
        })
    }
}

const resetPasswordHandle = async(req, res) => {
    let decodedToken;
    const token = req.params.token;
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    try {
        const userId = decodedToken.userId;
        if (req.body.pass !== req.body.confirmPass) {
            return res.status(422).json({
                error: "کلمه عبور و تکرار کلمه عبور یکسان نیستند",
            })
        }
        if (req.body.pass.length < 5) {
            return res.status(422).json({
                error: "طول کلمه عبور حداقل باید پنج باشد",
            })
        }
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                error: "کاربری با این ایمیل یافت نشد",
            })
        }
        user.password = req.body.pass;
        user.save();
        return res.status(200).json({
            message: "رمز عبور با موفقیت تغییر یافت",
            userId
        })

    } catch (error) {
        return res.status(422).json({
            error: "مشکلی در یافتن کاربر مورد نظر پیدا شده است",
        })
    }
}
module.exports = {
    registerHandler,
    handleLogin,
    logout,
    forgetPasswordHandle,
    resetPasswordHandle
}