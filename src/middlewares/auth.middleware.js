const jwt = require("jsonwebtoken");

const User = require("../models/User");

const ApiError = require("../utils/ApiError");

const jwtConfig = require("../config/jwt");

const asyncHandler = require("../utils/asyncHandler");

const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Cookie Support (Future)
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, "Access token is required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, jwtConfig.accessTokenSecret);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  // Future Ready
  if (user.isBlocked) {
    throw new ApiError(403, "Your account has been blocked");
  }

  // Future Ready
  if (
    user.passwordChangedAt &&
    decoded.iat * 1000 < user.passwordChangedAt.getTime()
  ) {
    throw new ApiError(401, "Password has been changed. Please login again.");
  }

  req.user = user;

  next();
});

module.exports = auth;