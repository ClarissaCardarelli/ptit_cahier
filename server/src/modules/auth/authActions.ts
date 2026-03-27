import crypto from "node:crypto";
import argon2 from "argon2";
import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import joi from "joi";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import parentRepository from "../parent/parentRepository";
import schoolRepository from "../school/schoolRepository";
import userRepository from "../user/userRepository";

interface MyPayload extends JwtPayload {
  sub: string;
  role: "parent" | "school";
}

const generateTemporaryPassword: RequestHandler = async (req, res, next) => {
  try {
    req.body.password = crypto.randomBytes(8).toString("base64url");
    next();
  } catch (err) {
    next(err);
  }
};

const hashPassword: RequestHandler = async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19 * 2 ** 10,
      timeCost: 2,
      parallelism: 1,
    });
    req.body.hashed_password = hashedPassword;
    req.body.password = undefined;
    next();
  } catch (err) {
    next(err);
  }
};

const login: RequestHandler = async (req, res, next) => {
  try {
    const newLogin = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
      role: joi.string().valid("parent", "school").required(),
    });

    const { error, value } = newLogin.validate(req.body);

    if (error) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Les données envoyées sont invalides" });
      return;
    }

    const user = await userRepository.readByEmail(value.email);

    if (!user || user.role !== value.role) {
      res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
      return;
    }

    const verified = await argon2.verify(user.hashed_password, value.password);

    if (!verified) {
      res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
      return;
    }

    const profile =
      user.role === "parent"
        ? await parentRepository.readByUserId(user.id)
        : await schoolRepository.readByUserId(user.id);

    if (!profile) {
      res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
      return;
    }

    const myPayload: MyPayload = {
      sub: profile.id.toString(),
      role: user.role,
    };

    const token = await jwt.sign(myPayload, process.env.APP_SECRET as string, {
      expiresIn: "72h",
    });

    res.json({
      token,
      profile,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
};

const verifyToken: RequestHandler = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer" || !token) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    req.auth = jwt.verify(token, process.env.APP_SECRET as string) as MyPayload;

    next();
  } catch (err) {
    next(err);
  }
};

const verifyRole = (role: "parent" | "school"): RequestHandler => {
  return (req, res, next) => {
    if (!req.auth) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    if (req.auth.role !== role) {
      res.sendStatus(StatusCodes.FORBIDDEN);
      return;
    }

    next();
  };
};

export default {
  hashPassword,
  login,
  verifyToken,
  verifyRole,
  generateTemporaryPassword,
};
