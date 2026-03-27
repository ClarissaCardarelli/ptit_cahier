import type { RequestHandler } from "express";
import ticketCategoryRepository from "./ticketCategoryRepository";

const browse: RequestHandler = async (req, res, next) => {
  try {
    const ticketCategories = await ticketCategoryRepository.readAll();

    res.json(ticketCategories);
  } catch (err) {
    next(err);
  }
};

export default { browse };
