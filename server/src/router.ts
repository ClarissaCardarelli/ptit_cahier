import express from "express";
import announcementActions from "./modules/announcement/announcementActions";
import announcementCategoryActions from "./modules/announcementCategory/announcementCategoryActions";
import authActions from "./modules/auth/authActions";
import classroomActions from "./modules/classroom/classroomActions";
import parentActions from "./modules/parent/parentActions";
import schoolActions from "./modules/school/schoolActions";
import studentActions from "./modules/student/studentActions";
import ticketActions from "./modules/ticket/ticketActions";
import ticketCategoryActions from "./modules/ticketCategory/ticketCategoryActions";
import userActions from "./modules/user/userActions";

const router = express.Router();

router.post("/login", authActions.login);

router.use(authActions.verifyToken);

router.get("/ticket-categories", ticketCategoryActions.browse);
router.get("/announcement-categories", announcementCategoryActions.browse);

const parentRouter = express.Router();
parentRouter.use(authActions.verifyRole("parent"));

const schoolRouter = express.Router();
schoolRouter.use(authActions.verifyRole("school"));

parentRouter.get("/me/announcements", announcementActions.browseByParent);
parentRouter.get("/me/students", studentActions.browseByParent);
parentRouter.get("/me/tickets", ticketActions.browseByParent);
parentRouter.post("/tickets", ticketActions.validate, ticketActions.add);

schoolRouter.get("/me", schoolActions.readDashboardData);
schoolRouter.get("/me/tickets", ticketActions.browse);
schoolRouter.get("/me/announcements", announcementActions.browse);
schoolRouter.get("/me/students", studentActions.browse);
schoolRouter.get("/me/parents", parentActions.browse);
schoolRouter.get("/me/classrooms", classroomActions.browse);
schoolRouter.post(
  "/announcements",
  announcementActions.validate,
  announcementActions.add,
);
schoolRouter.delete("/me/announcements/:id", announcementActions.destroy);
schoolRouter.patch("/tickets/:id/status", ticketActions.editStatus);
schoolRouter.post("/me/students", studentActions.validate, studentActions.add);
schoolRouter.delete("/me/students/:id", studentActions.destroy);
schoolRouter.put(
  "/me/students/:id",
  studentActions.validate,
  studentActions.edit,
);
schoolRouter.post(
  "/me/parents",
  parentActions.validate,
  authActions.generateTemporaryPassword,
  authActions.hashPassword,
  userActions.add,
  parentActions.add,
);
schoolRouter.delete("/me/parents/:id", parentActions.destroy);
schoolRouter.put("/me/parents/:id", parentActions.edit);

router.use("/parents", parentRouter);
router.use("/schools", schoolRouter);

export default router;
