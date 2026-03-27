import type { LucideIcon } from "lucide-react";
import { BookUser, Home, LogOut, Mail, Newspaper, School } from "lucide-react";
import type { OutletAuthContext } from "../../types/OutletAuthContext";

export type NavItem = {
  to?: string;
  label: string;
  Icon: LucideIcon;
  onClick?: () => void;
  kind: "link" | "action";
  tone?: "default" | "muted";
};

export const getNavItems = (auth: OutletAuthContext["auth"]): NavItem[] => [
  {
    to: `/${auth?.role}/home`,
    label: "Accueil",
    Icon: Home,
    kind: "link",
  },
  {
    to: `/${auth?.role}/announcements`,
    label: "Fil d'actualité",
    Icon: Newspaper,
    kind: "link",
  },
  {
    to: `/${auth?.role}/tickets`,
    label:
      auth?.role === "parent" ? "Demande à l'école" : "Gestion des tickets",
    Icon: Mail,
    kind: "link",
  },
  ...(auth?.role === "school"
    ? [
        {
          to: "/school/students",
          label: "Gestion des élèves",
          Icon: School,
          kind: "link" as const,
        },
        {
          to: "/school/parents",
          label: "Gestion des parents",
          Icon: BookUser,
          kind: "link" as const,
        },
      ]
    : []),
  {
    label: "Déconnexion",
    Icon: LogOut,
    kind: "action",
    tone: "muted",
  },
];
