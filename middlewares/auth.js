const jwt = require('jsonwebtoken');
const authorization = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        res.status(401).json({
            error: "مجوز کافی ندارید"
        })
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
        res.status(401).json({
            error: "مجوز کافی ندارید"
        })
    }

    req.userId = decodedToken.userId;
    next();
}

module.exports = {
    authorization
}