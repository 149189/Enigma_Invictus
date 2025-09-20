import { sendResponse } from "../utils/apiResonse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { statusType } from "../utils/statusType.js"; // Make sure this is correctly imported
import User from "../models/user.js";
import Admin from "../models/admin.js";


export const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // Get admin from token
      req.admin = await Admin.findById(decoded.id);

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: "Not authorized as admin",
        });
      }

      next();
    } else {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    console.error("Error in admin protection middleware:", error);
    res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

   
  if (!token) {
    return sendResponse(
      res,
      false,
      null,
      "Unauthorized request: Token missing",
      statusType.UNAUTHORIZED
    );
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?.user_id).select(
      "-password -refreshToken"
    );
    // const user = await User.findById(decodedToken?._id).select(
    //   "-pin"
    // );
  
    if (!user) {
      return sendResponse(
        res,
        false,
        null,
        "Unauthorized request: Invalid access token",
        statusType.UNAUTHORIZED
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(
      res,
      false,
      null,
      error?.message || "Unauthorized request: Token verification failed",
      statusType.UNAUTHORIZED
    );
  }
});
