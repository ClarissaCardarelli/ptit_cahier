import type { RequestHandler } from "express";
import classroomRepository from "./classroomRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const classrooms = await classroomRepository.readAll();
    res.json(classrooms);
  } catch (err) {
    next(err);
  }
};

export default { browse };
