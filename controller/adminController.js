const multer = require('multer');
const shortId = require('shortid');
const sharp = require('sharp');
const appRoot = require('app-root-path');
const fs = require('fs');

const { Post } = require("../model/postsSchema");

const handleAddPost = async(req, res) => {
    try {
        const thumbnail = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnail.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnail/${fileName}`;
        req.body = {...req.body, thumbnail };
        await Post.postValidation(req.body);

        await sharp(thumbnail.data).jpeg({ quality: 50 }).toFile(uploadPath).catch(
            err => {
                res.status(404).json({
                    error: err,
                    message: "مشکلی در تغییر حجم سایز بوجود آمده است"
                })
            });
        await Post.create({...req.body, user: req.userId, thumbnail: fileName })
        res.status(200).json({
            message: "پست شما با موفقیت اضافه شد"
        })
    } catch (error) {
        const errors = [];
        if (error.inner) {
            error.inner.forEach(e => {
                errors.push({ name: e.path, message: e.message })
            })
        } else {
            errors.push(error)
        }
        res.status(422).json({
            error: errors,
            message: "مشکلی در اعتبارسنجی و یا ایجاد پست بوجود آمده است"
        })
    }
}

const editPost = async(req, res) => {
    try {
        const posts = await Post.find({ _id: req.params.id });
        const post = posts[0];
        res.status(200).json({
            post
        })
    } catch (error) {
        res.status(404).json({
            error: "post is not Founded"
        })
    }
}

const deletePost = async(req, res) => {
    try {
        const post = await Post.findByIdAndRemove({ _id: req.params.id });
        if (!post) {
            res.status(404).json({
                error: "پستی با این آیدی وجود ندارد"
            })
        }
        res.status(200).json({
            message: "پست با موفقیت حذف شد"
        })
    } catch (error) {
        res.status(404).json({
            error: "مشکلی بوجود آمده"
        })
    }
}

const editPostHandle = async(req, res) => {
    let post;
    try {
        const thumbnail = req.files ? req.files.thumbnail : {};
        const fileName = `${shortId.generate()}_${thumbnail.name}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnail/${fileName}`;
        post = await Post.findOne({ _id: req.params.id });
        if (!post) {
            return res.status(404).json({
                message: "پست مربوطه یافت نشد"
            })
        }
        console.log(post.user.toString(), req.userId);
        if (post.user.toString() !== req.userId) {
            return res.status(404).json({
                message: "شما کاربری نیستید که اجازه ادیت کردن داشته باشد"
            });
        }

        if (!thumbnail.name) {
            console.log(1);
            await Post.postValidation({...req.body, thumbnail: { name: "placeHolder", size: 0, mimetype: "image/jpeg" } });
        } else {
            console.log(2);
            await Post.postValidation({...req.body, thumbnail });
        }


        if (thumbnail.name) {
            fs.unlink(`${appRoot}/public/uploads/thumbnail/${post.thumbnail}`, async(err) => {
                if (err) {
                    console.log(err);
                } else {
                    await sharp(thumbnail.data).jpeg({ quality: 50 }).toFile(uploadPath).catch(err => console.log(err));
                }
            })
        }
        const { title, text, status } = req.body;
        post.title = title;
        post.text = text;
        post.status = status;
        post.thumbnail = thumbnail.name ? fileName : post.thumbnail;
        await post.save();
        res.status(200).json({
            message: "پست شما با موفقیت ویرایش شد"
        })


    } catch (error) {
        const errors = [];
        if (error.inner) {
            error.inner.forEach(e => {
                errors.push({ name: e.path, message: e.message })
            })
        } else {
            errors.push(error)
        }
        res.status(422).json({
            message: "مشکلی در اعتبار سنجی بوجود آمده است",
            error: errors
        })
    }
}

module.exports = {
    handleAddPost,
    editPost,
    deletePost,
    editPostHandle,
}