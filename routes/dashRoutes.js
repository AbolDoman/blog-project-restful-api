const { Router } = require('express');
const {
    editPostHandle,
    handleAddPost,
    editPost,
    deletePost
} = require('../controller/adminController');
const { authorization } = require('../middlewares/auth');
const dashRouter = new Router();

//@desc dashboard Handle
//@route POST /dashboard/add-post
dashRouter.post("/add-post", authorization, handleAddPost)

//@desc edit post
//@route GET /dashboard/edit-post/:id
dashRouter.get("/edit-post/:id", authorization, editPost)

//@desc delete post
//@route DELETE /dashboard/delete-post/:id
dashRouter.delete("/delete-post/:id", authorization, deletePost)
    //@desc edit post
    //@route PUT /dashboard/edit-post/:id
dashRouter.put("/edit-post/:id", authorization, editPostHandle)





module.exports = { dashRouter }