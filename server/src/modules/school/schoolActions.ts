import type { RequestHandler } from "express";
import schoolRepository from "./schoolRepository";

const readDashboardData: RequestHandler = async (req, res, next) => {
  try {
    const dashboardData = await schoolRepository.readDashboardData();
    res.json(dashboardData);
  } catch (err) {
    next(err);
  }
};

export default { readDashboardData };
