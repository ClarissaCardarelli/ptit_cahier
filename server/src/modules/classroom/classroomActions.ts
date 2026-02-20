import type { RequestHandler } from "express";
import classroomRepository from "./classroomRepository";

const browseAll: RequestHandler = async (req, res, next) => {
  try {
    const classrooms = await classroomRepository.readAll();
    res.json(classrooms);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    await classroomRepository.create(req.schoolId);
  } catch (err) {
    next(err);
  }
};

export default { add, browseAll };
