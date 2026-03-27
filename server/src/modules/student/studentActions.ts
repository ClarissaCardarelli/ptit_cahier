import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import joi from "joi";
import classroomRepository from "../classroom/classroomRepository";
import parentRepository from "../parent/parentRepository";
import studentRepository from "./studentRepository";

const browseByParent: RequestHandler = async (req, res, next) => {
  try {
    const parentId = Number(req.auth.sub);

    const students = await studentRepository.readAllByParent(parentId);
    res.json(students);
  } catch (err) {
    next(err);
  }
};

const browse: RequestHandler = async (req, res, next) => {
  try {
    const students = await studentRepository.readAll();
    res.json(students);
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);

    if (!Number.isInteger(studentId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Identifiant d'étudiant invalide",
      });
      return;
    }

    const affectedRows = await studentRepository.delete(studentId);

    if (affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Étudiant introuvable",
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
    const student = joi.object({
      firstName: joi.string().max(120).required(),
      lastName: joi.string().max(120).required(),
      classroomId: joi.number().integer().positive().required(),
      parentId: joi.number().integer().positive().allow(null),
    });

    const { error, value } = student.validate(req.body);

    if (error) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Les données envoyées sont invalides" });
      return;
    }

    const classroom = await classroomRepository.readById(value.classroomId);

    if (!classroom) {
      res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json({ error: "Classe introuvable" });
      return;
    }

    if (value.parentId !== null && value.parentId !== undefined) {
      const parent = await parentRepository.readById(value.parentId);
      if (!parent) {
        res.status(StatusCodes.NOT_FOUND).json({ error: "Parent introuvable" });
        return;
      }
    }

    req.body = value;

    next();
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const newStudent = req.body;

    const createdStudent = await studentRepository.create(newStudent);

    res.status(StatusCodes.CREATED).json(createdStudent);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);

    const { firstName, lastName, classroomId, parentId } = req.body;

    const updatedStudent = await studentRepository.update(studentId, {
      firstName,
      lastName,
      classroomId,
      parentId,
    });

    if (!updatedStudent) {
      res.status(StatusCodes.NOT_FOUND).json({ error: "Étudiant introuvable" });
      return;
    }

    res.json(updatedStudent);
  } catch (err) {
    next(err);
  }
};

export default {
  add,
  browseByParent,
  browse,
  destroy,
  edit,
  validate,
};
