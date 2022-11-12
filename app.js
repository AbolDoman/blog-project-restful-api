const express = require('express');
const dotEnv = require('dotenv');
const fileUpload = require('express-fileupload');
const { path } = require('app-root-path');
const join = require('path');

const { connectDb } = require('./utils/database');
const { dashRouter } = require('./routes/dashRoutes');
const { blogRouter } = require('./routes/blogRouter');
const { usersRouter } = require('./routes/usersRouter');
const { handleError } = require('./middlewares/errors');
const { setHeader } = require('./middlewares/setHeaders');

const app = express();

//initialize envirement varialbles
dotEnv.config({ path: "./config/config.env" })
    //initialize envirement varialbles

//connect to database
connectDb()
    //connect to database

//MiddleWares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(fileUpload());
app.use(setHeader);

app.use(handleError)

//set statics
app.use(express.static(join.join(path, "public")))
    //set statics


//routes
app.use("/dashboard", dashRouter);
app.use("/users", usersRouter);
app.use("/", blogRouter);

//end of routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`app is runnig in ${process.env.NODE_ENV} mode on port ${PORT}`))