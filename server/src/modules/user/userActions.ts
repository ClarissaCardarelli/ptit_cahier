import type { RequestHandler } from "express";
import userRepository from "./userRepository";

const add: RequestHandler = async (req, res, next) => {
  try {
    const newUser = {
      email: req.body.email,
      hashed_password: req.body.hashed_password,
      role: req.body.role,
    };

    req.body.userId = await userRepository.create(newUser);

    next();
  } catch (err) {
    next(err);
  }
};

export default { add };
