const captcha = require('captchapng');

const { Post } = require('../model/postsSchema');
const { contactValidationSchema } = require('../model/contactValidationSchema');
const { sendMailForClient } = require('../utils/mailer');
let CAPTCHA_NUM;

exports.getIndex = async(req, res) => {
    try {
        const numberOfPosts = await Post.find({ status: "public" }).countDocuments();
        const posts = await Post.find({ status: "public" }).sort({ createAt: "desc" });
        res.status(200).json({
            posts,
            numberOfPosts
        })
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error })
    }
}

exports.getSinglePage = async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id }).populate("user");
        if (!post) {
            const err = new Error();
            err.message = "پستی با این شناسه وجود ندارد"
            throw err
            return
        }
        res.status(200).json({
            post
        })
    } catch (error) {
        res.status(400).json({ error: error })
    }
}
exports.contactHandle = async(req, res) => {
    try {
        await contactValidationSchema.validate(req.body, { abortEarly: false });
        const subject = `شما پیامی از طرف شخص ${req.body.name} دارید`
        const text = `پیام مربوطه:${req.body.message}واز طرف ${req.body.email} میباشد`
        sendMailForClient("mfuofike@hi2.in", subject, text);
        res.status(200).json({
            message: "پیام با موفقیت ارسال گشت"
        });
    } catch (error) {
        const errorArr = [];
        if (error) {
            error.inner.forEach(e => {
                errorArr.push({ name: e.path, message: e.message })
            })
        }
        return res.status(422).json({
            error: errorArr
        })
    }
}