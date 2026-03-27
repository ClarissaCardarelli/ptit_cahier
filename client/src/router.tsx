import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import ParentLayout from "./layouts/ParentLayout";
import SchoolLayout from "./layouts/SchoolLayout";
import AnnouncementNew from "./pages/announcement/AnnouncementNew";
import Announcements from "./pages/announcement/Announcements";
import Home from "./pages/home/Home";
import PublicHome from "./pages/home/PublicHome";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ParentsTable from "./pages/parent/ParentsTable";
import Redirection from "./pages/redirection/Redirection";
import StudentsTable from "./pages/student/StudentsTable";
import TicketNew from "./pages/ticket/TicketNew";
import Tickets from "./pages/ticket/Tickets";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicHome />,
  },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/redirection", element: <Redirection /> },

      {
        path: "/parent",
        element: <ParentLayout />,
        children: [
          { path: "home", element: <Home /> },
          {
            path: "announcements",
            element: <Announcements />,
          },
          { path: "tickets", element: <Tickets /> },
          { path: "tickets/new", element: <TicketNew /> },
        ],
      },
      {
        path: "/school",
        element: <SchoolLayout />,
        children: [
          { path: "home", element: <Home /> },
          {
            path: "announcements",
            element: <Announcements />,
          },
          {
            path: "announcements/new",
            element: <AnnouncementNew />,
          },
          { path: "tickets", element: <Tickets /> },
          {
            path: "students",
            element: <StudentsTable />,
          },
          {
            path: "parents",
            element: <ParentsTable />,
          },
        ],
      },
    ],
  },
]);

export default router;
