import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import joi from "joi";
import announcementCategoryRepository from "../announcementCategory/announcementCategoryRepository";
import studentRepository from "../student/studentRepository";
import announcementRepository from "./announcementRepository";

const add: RequestHandler = async (req, res, next) => {
  try {
    const newAnnouncement = {
      title: req.body.title,
      content: req.body.content,
      announcementCategoryId: req.body.announcementCategoryId,
      studentIds: req.body.studentIds,
    };

    const newInsertedAnnouncementId =
      await announcementRepository.create(newAnnouncement);

    res.status(StatusCodes.CREATED).json({
      newInsertedAnnouncementId,
    });
  } catch (err) {
    next(err);
  }
};

const browseByParent: RequestHandler = async (req, res, next) => {
  try {
    const parentId = Number(req.auth.sub);
    const categoryId = req.query.category
      ? Number(req.query.category)
      : undefined;
    const studentId = req.query.student ? Number(req.query.student) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const announcements = await announcementRepository.readAllByParent(
      parentId,
      categoryId,
      studentId,
      limit,
    );

    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

const browseAll: RequestHandler = async (req, res, next) => {
  try {
    const categoryId = req.query.category
      ? Number(req.query.category)
      : undefined;

    const announcements = await announcementRepository.readAll(categoryId);

    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

const destroy: RequestHandler = async (req, res, next) => {
  try {
    const announcementId = Number(req.params.id);

    if (!Number.isInteger(announcementId)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: "Identifiant d'annonce invalide",
      });
      return;
    }

    const affectedRows = await announcementRepository.delete(announcementId);

    if (affectedRows === 0) {
      res.status(StatusCodes.NOT_FOUND).json({
        error: "Annonce introuvable",
      });
      return;
    }

    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

// const update: RequestHandler = async (req, res, next) => {
//   try {
//     const announcementId = Number(req.params.id);

//     if (!Number.isInteger(announcementId)) {
//       res
//         .status(StatusCodes.BAD_REQUEST)
//         .json({ error: "Identifiant d'annonce invalide" });
//       return;
//     }

//     const schoolId = Number(req.auth.sub);

//     const updatedAnnouncement = await announcementRepository.updateContent(
//       announcementId,
//       req.body.content,
//       schoolId,
//     );

//     if (updatedAnnouncement === 0) {
//       res.status(StatusCodes.NOT_FOUND).json({ error: "Annonce introuvable" });
//       return;
//     }

//     res.sendStatus(StatusCodes.NO_CONTENT);
//   } catch (err) {
//     next(err);
//   }
// };

const validate: RequestHandler = async (req, res, next) => {
  try {
    const newAnnouncement = joi.object({
      title: joi.string().max(120).required(),
      content: joi.string().max(1000).required(),
      announcementCategoryId: joi.number().integer().positive().required(),
      studentIds: joi
        .array()
        .items(joi.number().integer().positive())
        .min(1)
        .required(),
    });

    const { error, value } = newAnnouncement.validate(req.body);

    if (error) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Les données envoyées sont invalides" });
      return;
    }

    const currentAnnouncementCategory =
      await announcementCategoryRepository.readById(
        value.announcementCategoryId,
      );

    if (!currentAnnouncementCategory) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Categorie introuvable" });
      return;
    }

    const studentIds = value.studentIds;

    for (const studentId of studentIds) {
      const currentStudent = await studentRepository.readById(studentId);

      if (!currentStudent) {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: "Étudiant introuvable" });
        return;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default {
  add,
  browseByParent,
  browseAll,
  destroy,
  validate,
};
