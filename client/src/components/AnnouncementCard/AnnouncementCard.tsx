import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Announcement } from "../../types/Announcement";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import styles from "./AnnouncementCard.module.css";

type AnnouncementCardProps = {
  announcement: Announcement;
  variant?: "default" | "dashboard";
  onDelete?: (announcementId: number) => void | Promise<void>;
  onEdit?: (
    announcementId: number,
    nextContent: string,
  ) => boolean | Promise<boolean>;
};

function AnnouncementCard({
  announcement,
  variant = "default",
  onDelete,
  onEdit,
}: AnnouncementCardProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isEditing] = useState(false);
  const [content, setContent] = useState(announcement.content);
  const dialogReference = useRef<HTMLDialogElement>(null);

  const { auth } = useOutletContext<OutletAuthContext>();

  const userRole = auth?.role;

  useEffect(() => {
    const dialogElement = dialogReference.current;
    if (!dialogElement) return;

    if (isImageOpen) {
      dialogElement.showModal();
    } else {
      dialogElement.close();
    }
  }, [isImageOpen]);

  const closeDialogOnBackdrop = (event: React.MouseEvent) => {
    if (event.target === dialogReference.current) {
      setIsImageOpen(false);
    }
  };

  const checkEscapeKey = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsImageOpen(false);
    }
  };

  useEffect(() => {
    if (!isEditing) {
      setContent(announcement.content);
    }
  }, [announcement.content, isEditing]);

  const formattedDate = new Date(announcement.createdAt).toLocaleString(
    "fr-FR",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const studentList = announcement.studentNames
    ? announcement.studentNames.split(",").map((name) => name.trim())
    : [];

  const rowsClassrooms = announcement.classroomNames
    ? announcement.classroomNames.split(",").map((c) => c.trim())
    : [];

  const counts: Record<string, number> = {};
  for (const name of rowsClassrooms) {
    counts[name] = (counts[name] || 0) + 1;
  }

  const classroomsWithCounts = Object.keys(counts).map((name) => ({
    name: name,
    count: counts[name],
  }));

  const getCategoryStyle = (categoryName: string) => {
    switch (categoryName) {
      case "Vie de l'école":
        return styles.an_badge_school_life;
      case "Administratif":
        return styles.an_badge_admin;
      case "Evénement":
        return styles.an_badge_event;
      case "Classe":
        return styles.an_badge_class;
      default:
        return styles.an_badge_default;
    }
  };

  const canDelete = userRole === "school" && typeof onDelete === "function";
  const canEdit = userRole === "school" && typeof onEdit === "function";

  // const startEditing = () => {
  //   setContent(announcement.content);
  //   setIsEditing(true);
  // };

  // const cancelEditing = () => {
  //   setIsEditing(false);
  //   setContent(announcement.content);
  // };

  // const saveEditing = async () => {
  //   if (!onEdit) return;

  //   const trimmedContent = content.trim();
  //   if (trimmedContent.length === 0) {
  //     return;
  //   }

  //   if (trimmedContent === announcement.content.trim()) {
  //     setIsEditing(false);
  //     return;
  //   }

  //   const result = await onEdit(announcement.id, trimmedContent);

  //   if (result !== false) {
  //     setIsEditing(false);
  //   }
  // };

  return (
    <article
      className={`${styles.ann_card} ${variant === "dashboard" ? styles.card_dashboard : ""}`}
    >
      <section className={styles.content_card}>
        <div className={styles.media_block}>
          <header>
            <h2 className={styles.title}>{announcement.title}</h2>
          </header>

          <button
            type="button"
            className={styles.imageTrigger}
            onClick={() => setIsImageOpen(true)}
          >
            <img
              src={`https://picsum.photos/seed/${announcement.id}/800/600`}
              alt="Illustration"
              className={styles.mainImage}
            />
          </button>
        </div>

        {isEditing ? (
          <div className={styles.edit_block}>
            <div className={styles.edit_actions}>
              <button
                type="button"
                className="non-primary-button"
                // onClick={cancelEditing}
              >
                Annuler
              </button>
              <button
                type="button"
                className="primary-button"
                // onClick={saveEditing}
                disabled={content.trim().length === 0}
              >
                Enregistrer
              </button>
            </div>
          </div>
        ) : (
          <p className={styles.text}>{announcement.content}</p>
        )}

        <footer className={styles.footerInfo}>
          {(canEdit || canDelete) && !isEditing && (
            <div className={styles.footer_actions}>
              {canEdit && (
                <button
                  type="button"
                  className={styles.edit_button}
                  // onClick={startEditing}
                >
                  <Pencil className={styles.edit_icon} aria-hidden="true" />
                  <span className={styles.edit_label}>Modifier</span>
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className={styles.delete_button}
                  onClick={() => onDelete(announcement.id)}
                >
                  <Trash2 className={styles.delete_icon} aria-hidden="true" />
                  <span className={styles.delete_label}>Supprimer</span>
                </button>
              )}
            </div>
          )}
          <time className={styles.dateLabel}>Publié le {formattedDate}</time>
        </footer>
      </section>
      {variant !== "dashboard" && (
        <aside className={styles.badgeSidebar}>
          <span
            className={getCategoryStyle(announcement.announcementCategoryName)}
          >
            {announcement.announcementCategoryName}
          </span>

          {userRole === "school" && (
            <ul className={styles.tagList}>
              {(announcement.totalStudents || 0) > 0 &&
              (announcement.studentCount || 0) >=
                (announcement.totalStudents || 0) - 2 ? (
                <li className={styles.an_badge_all_school}>
                  Toutes les classes
                </li>
              ) : (announcement.studentCount || 0) > 5 ? (
                <>
                  {classroomsWithCounts.map((item) => (
                    <li key={item.name} className={styles.an_badge_class}>
                      {item.name} ({item.count})
                    </li>
                  ))}
                  <li className={styles.an_count_tag}>
                    Total élèves: {announcement.studentCount}
                  </li>
                </>
              ) : (
                studentList.map((studentName) => (
                  <li key={studentName} className={styles.an_student_tag}>
                    {studentName}
                  </li>
                ))
              )}
            </ul>
          )}

          {userRole === "parent" && studentList.length > 0 && (
            <ul className={styles.tagList}>
              {studentList.map((studentName) => (
                <li key={studentName} className={styles.an_student_tag}>
                  {studentName}
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
      <dialog
        ref={dialogReference}
        className={styles.imageModal}
        onClick={closeDialogOnBackdrop}
        onKeyDown={checkEscapeKey}
      >
        <div className={styles.modalWrapper}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setIsImageOpen(false)}
          >
            &times;
          </button>
          <img
            src={`https://picsum.photos/seed/${announcement.id}/1200/800`}
            alt="Zoom"
            className={styles.fullSizeImage}
          />
        </div>
      </dialog>
    </article>
  );
}

export default AnnouncementCard;
