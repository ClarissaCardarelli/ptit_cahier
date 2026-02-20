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

// router.post(
//   "/register/school",
//   schoolActions.validate,
//   authActions.hashPassword,
//   userActions.add,
//   schoolActions.add,
//   classroomActions.add,
// );

router.use(authActions.verifyToken);

router.get("/ticket-categories", ticketCategoryActions.browseAll);
router.get("/announcement-categories", announcementCategoryActions.browseAll);

const parentRouter = express.Router();
parentRouter.use(authActions.verifyRole("parent"));

const schoolRouter = express.Router();
schoolRouter.use(authActions.verifyRole("school"));

// parentRouter.get("/me/school", schoolActions.browseByParent); need on parent side ?
parentRouter.get("/me/announcements", announcementActions.browseByParent);
parentRouter.get("/me/students", studentActions.browseByParent);
parentRouter.get("/me/tickets", ticketActions.browseByParent);
parentRouter.post("/tickets", ticketActions.validate, ticketActions.add);

schoolRouter.get("/me", schoolActions.getDashboardData);
schoolRouter.get("/me/tickets", ticketActions.browseAll);
schoolRouter.get("/me/announcements", announcementActions.browseAll);
schoolRouter.get("/me/students", studentActions.browseAll);
schoolRouter.get("/me/parents", parentActions.browseAll);
schoolRouter.get("/me/classrooms", classroomActions.browseAll);
schoolRouter.post(
  "/announcements",
  announcementActions.validate,
  announcementActions.add,
);
schoolRouter.delete("/me/announcements/:id", announcementActions.destroy);
// schoolRouter.put(
//   "/me/announcements/:id",
//   announcementActions.validateUpdate,
//   announcementActions.update,
// );
schoolRouter.patch("/tickets/:id/status", ticketActions.editStatus);
schoolRouter.post("/me/students", studentActions.validate, studentActions.add);
schoolRouter.delete("/me/students/:id", studentActions.destroy);
schoolRouter.put(
  "/me/students/:id",
  studentActions.validate,
  studentActions.update,
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
schoolRouter.put("/me/parents/:id", parentActions.update);

router.use("/parents", parentRouter);
router.use("/schools", schoolRouter);

export default router;
