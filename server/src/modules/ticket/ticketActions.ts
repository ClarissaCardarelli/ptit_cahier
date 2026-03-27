import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import joi from "joi";
import type { TicketNew } from "../../types/express/TicketNew";
import studentRepository from "../student/studentRepository";
import ticketCategoryRepository from "../ticketCategory/ticketCategoryRepository";
import ticketRepository from "./ticketRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const tickets = await ticketRepository.readAll(limit);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

const browseByParent: RequestHandler = async (req, res, next) => {
  try {
    const parentId = Number(req.auth.sub);
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const tickets = await ticketRepository.readAllByParent(parentId, limit);
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

const validate: RequestHandler = async (req, res, next) => {
  try {
    const newTicket = joi.object({
      content: joi.string().max(1000).required(),
      ticketCategoryId: joi.number().integer().positive().required(),
      studentIds: joi
        .array()
        .items(joi.number().integer().positive())
        .min(1)
        .required(),
    });

    const { error, value } = newTicket.validate(req.body);

    if (error) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Les données envoyées sont invalides" });
      return;
    }

    const currentTicketCategory = await ticketCategoryRepository.readById(
      value.ticketCategoryId,
    );

    if (!currentTicketCategory) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Categorie introuvable" });
      return;
    }

    const parentId = Number(req.auth.sub);

    const studentIds = value.studentIds;

    for (const studentId of studentIds) {
      const currentStudent = await studentRepository.readById(studentId);

      if (!currentStudent) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Étudiant introuvable" });
        return;
      }

      if (currentStudent.parentId !== parentId) {
        res
          .status(StatusCodes.UNPROCESSABLE_ENTITY)
          .json({ error: "L'étudiant n'appartient pas à ce parent" });
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
    const newTicket: TicketNew = {
      content: req.body.content,
      ticketCategoryId: req.body.ticketCategoryId,
      studentIds: req.body.studentIds,
    };

    const parentId = Number(req.auth.sub);

    const newInsertedTicketId = await ticketRepository.create(
      newTicket,
      parentId,
    );

    res.status(StatusCodes.CREATED).json({ newInsertedTicketId });
  } catch (err) {
    next(err);
  }
};

const editStatus: RequestHandler = async (req, res, next) => {
  try {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Identifiant de ticket invalide",
      });
      return;
    }

    if (typeof req.body.processed !== "boolean") {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "processed doit être un boolean" });
      return;
    }
    const processed = req.body.processed;

    const wasUpdated = await ticketRepository.updateStatus(ticketId, processed);

    if (!wasUpdated) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Ticket introuvable",
      });
      return;
    }

    res.status(StatusCodes.OK).json({ id: ticketId, processed });
  } catch (err) {
    next(err);
  }
};

export default {
  browse,
  browseByParent,
  add,
  validate,
  editStatus,
};
