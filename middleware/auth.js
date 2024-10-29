const jwt = require('jsonwebtoken');
const prisma = require("../config/prisma");
const createHttpError = require('http-errors');

const authenticate = async (req, res, next) => {
    try {
      const bearer = req.header('Authorization')
      const token = bearer.split('Bearer ')[1];
      console.log("Token from Header:", token); // Log token untuk pengecekan
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded); // Log hasil decoding
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        throw new Error();
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("JWT Verification Error:", error); // Log error JWTs
      return next(createHttpError(401, 'Please authenticate.'));
    }
  };

// // buat ngecek kalo udah logput ga bisa masuk 
// let isTokenLoggedOut = [];  


//   const authenticate = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token provided" });
//     if (isTokenLoggedOut(token)) {
//       return res.status(401).json({ message: "Token is logged out" });
//     }
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Invalid token" });
//     }
//   };
  

module.exports = authenticate;