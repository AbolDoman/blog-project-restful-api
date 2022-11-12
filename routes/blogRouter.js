const { Router } = require('express');
const { authorization } = require('../middlewares/auth');
const { getIndex, getSinglePage, getSearchResults, getCaptcha, getContact, contactHandle } = require('../controller/blogController');
const blogRouter = new Router();

//@desc main page
//@route GET /
blogRouter.get("/", authorization, getIndex)

//@desc single page
//@route GET /post/:id
blogRouter.get("/post/:id", authorization, getSinglePage)


//@desc contact page Handle
//@route POST /contact
blogRouter.post("/contact", authorization, contactHandle)

module.exports = { blogRouter };