const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    jwtConfig.accessTokenSecret,
    {
      expiresIn: jwtConfig.accessTokenExpiry,
    }
  );
};

module.exports = generateAccessToken;