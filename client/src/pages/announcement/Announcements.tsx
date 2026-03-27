import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import AnnouncementCard from "../../components/AnnouncementCard/AnnouncementCard";
import type { Announcement } from "../../types/Announcement";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { Student } from "../../types/Student";
import styles from "./Announcements.module.css";

function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const navigate = useNavigate();
  const { auth } = useOutletContext<OutletAuthContext>();

  const userRole = auth?.role;

  const backgroundClass =
    userRole === "school" ? "school-background" : "parent-background";

  useEffect(() => {
    if (userRole === "parent") {
      fetch(`${import.meta.env.VITE_API_URL}/api/parents/me/students`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      })
        .then((response) => {
          if (!response.ok) {
            setLoadingError(true);
            return;
          }
          return response.json();
        })
        .then((students: Student[] | undefined) => {
          if (!students) return;
          setStudents(students);
        });
    }
  }, [auth, userRole]);

  const categories = [
    { id: 0, label: "Toutes les catégories" },
    { id: 1, label: "Vie de l'école" },
    { id: 2, label: "Administratif" },
    { id: 3, label: "Événement" },
  ];

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };
    let endpoint = "";

    if (userRole === "school") {
      endpoint = `${import.meta.env.VITE_API_URL}/api/schools/me/announcements`;
    } else {
      endpoint = `${import.meta.env.VITE_API_URL}/api/parents/me/announcements`;
    }

    const url = new URL(endpoint);

    if (selectedCategory !== 0)
      url.searchParams.append("category", String(selectedCategory));
    if (selectedStudent !== null)
      url.searchParams.append("student", String(selectedStudent));

    fetch(url.toString(), { headers })
      .then((response) => response.json())
      .then((announcements) => setAnnouncements(announcements));
  }, [auth, selectedCategory, selectedStudent, userRole]);

  const checkBoxFilter = (student: number) => {
    if (selectedStudent === student) {
      setSelectedStudent(null);
    } else {
      setSelectedStudent(student);
    }
  };

  const deleteAnnouncement = (announcementId: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette annonce ?"))
      return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/me/announcements/${announcementId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
      },
    ).then(() => {
      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement.id !== announcementId),
      );
    });
  };

  const editAnnouncement = (
    announcementId: number,
    content: string,
  ): Promise<boolean> => {
    return fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/me/announcements/${announcementId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ content }),
      },
    ).then(() => {
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === announcementId
            ? { ...announcement, content }
            : announcement,
        ),
      );
      return true;
    });
  };

  return (
    <main className={backgroundClass}>
      <div className={styles.container}>
        <header className={styles.header}>
          <img
            src={ptit_cahier_logo_original}
            alt="Le P'tit Cahier"
            className={styles.logo}
          />
          <h1 className="primary-title">Fil d'actualité</h1>
        </header>

        {userRole === "school" && (
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/school/announcements/new")}
          >
            + Nouvelle annonce
          </button>
        )}

        <div className={styles.filters_container}>
          {students.length > 1 && (
            <div
              className={styles.filter_individual}
              aria-label="Filtrer par enfant"
            >
              <span className={styles.filter_label}>Enfants : </span>
              {students.map((student) => (
                <label key={student.id} className={styles.checkbox_label}>
                  <input
                    type="checkbox"
                    className={styles.filter_checkbox}
                    checked={selectedStudent === student.id}
                    onChange={() => checkBoxFilter(student.id)}
                  />
                  <span className={styles.checkbox_name}>
                    {student.firstName}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div
            className={styles.filter_individual}
            aria-label="Filtrer par catégorie"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${styles.filter_button} ${
                  selectedCategory === category.id ? styles.active : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {loadingError ? (
          <p className="general_error_message">
            Échec de la récupération de vos annonces
          </p>
        ) : announcements.length === 0 ? (
          <p className="general_error_message">Aucune annonce trouvée</p>
        ) : (
          <section aria-label="Liste des annonces">
            <ul className={styles.list}>
              {announcements.map((announcement) => (
                <li key={announcement.id}>
                  <AnnouncementCard
                    announcement={announcement}
                    onDelete={
                      userRole === "school" ? deleteAnnouncement : undefined
                    }
                    onEdit={
                      userRole === "school" ? editAnnouncement : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

export default Announcements;
