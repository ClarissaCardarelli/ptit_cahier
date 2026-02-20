import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import joi from "joi";
import userRepository from "../user/userRepository";
import parentRepository from "./parentRepository";

const browseAll: RequestHandler = async (req, res, next) => {
  try {
    const parents = await parentRepository.readAll();
    res.json(parents);
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const parentId = Number(req.params.id);

    if (!Number.isInteger(parentId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Identifiant de parent invalide",
      });
      return;
    }

    const parent = await parentRepository.readById(parentId);

    if (!parent) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Parent introuvable",
      });
      return;
    }

    const affectedRows = await userRepository.delete(parent.userId);

    if (affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Utilisateur introuvable",
      });
      return;
    }

    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

const validate: RequestHandler = async (req, res, next) => {
  try {
    const newParent = joi.object({
      firstName: joi.string().max(120).required(),
      lastName: joi.string().max(120).required(),
      email: joi.string().email().max(255).lowercase().required(),
      genre: joi.string().valid("M", "F").required(),
    });

    const { error, value } = newParent.validate(req.body);

    if (error) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Les données envoyées sont invalides" });
      return;
    }

    const currentEmail = await userRepository.readByEmail(value.email);

    if (currentEmail) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ error: "Adresse mail déjà enregistrée" });
      return;
    }

    value.role = "parent";
    req.body = value;

    next();
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const newParent = req.body;
    const createdParent = await parentRepository.create(newParent);
    res.status(StatusCodes.CREATED).json(createdParent);
  } catch (err) {
    next(err);
  }
};

const update: RequestHandler = async (req, res, next) => {
  try {
    const parentId = Number(req.params.id);
    const { firstName, lastName, genre } = req.body;

    const updatedParent = await parentRepository.update(parentId, {
      firstName,
      lastName,
      genre,
    });

    if (!updatedParent) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Parent introuvable" });
      return;
    }

    res.json(updatedParent);
  } catch (err) {
    next(err);
  }
};

export default { add, browseAll, destroy, validate, update };
