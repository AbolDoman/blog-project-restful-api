const { Router } = require('express');
const { authorization } = require('../middlewares/auth');
const { registerHandler, resetPasswordHandle, handleLogin, logout, forgetPasswordHandle } = require('../controller/userController');
const usersRouter = new Router();


//@desc login handle
//@route POST /users/login
usersRouter.post("/login", handleLogin)

//@desc register handle
//@route POST /users/register
usersRouter.post("/register", registerHandler)

//@desc logout handle
//@route GET /users/logout
usersRouter.get("/logout", authorization, logout)

//@desc forgetPassword handle
//@route POST /users/forgetPassword
usersRouter.post("/forgetPassword", forgetPasswordHandle)


//@desc resetPasswordHandle handle
//@route POST /users/resetPassword
usersRouter.post("/resetPassword/:token", resetPasswordHandle)






module.exports = { usersRouter }