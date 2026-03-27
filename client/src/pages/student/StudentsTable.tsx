import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import StudentForm from "../../components/StudentForm/StudentForm";
import type { Classroom } from "../../types/Classroom";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { Parent } from "../../types/Parent";
import type { Student } from "../../types/Student";
import styles from "./StudentsTable.module.css";

const StudentsTable = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [newStudentForm, setNewStudentForm] = useState<boolean>(false);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [formError, setFormError] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { auth } = useOutletContext<OutletAuthContext>();

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${auth?.token}`,
    };

    const endpoints = [
      `${import.meta.env.VITE_API_URL}/api/schools/me/students`,
      `${import.meta.env.VITE_API_URL}/api/schools/me/classrooms`,
      `${import.meta.env.VITE_API_URL}/api/schools/me/parents`,
    ];

    Promise.all(
      endpoints.map((endpoint) =>
        fetch(endpoint, { headers }).then((response) => {
          if (!response.ok) {
            throw new Error("Échec lors de la récupération des données");
          }
          return response.json();
        }),
      ),
    )
      .then(([students, classrooms, parents]) => {
        const sortedStudents = (students as Student[]).sort(
          (a, b) => a.classroomId - b.classroomId,
        );
        setStudents(sortedStudents);
        setClassrooms(classrooms as Classroom[]);
        setParents(parents as Parent[]);
      })
      .catch(() => {
        setLoadingError(true);
      });
  }, [auth]);

  const deleteStudent = (studentId: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élève ?")) return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/me/students/${studentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
      },
    ).then(() => {
      setStudents((prev) => prev.filter((student) => student.id !== studentId));
    });
  };

  const saveUpdatedStudent = (updatedStudent: Partial<Student>) => {
    if (!selectedStudent) return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/me/students/${selectedStudent.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(updatedStudent),
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la mise à jour");
        return res.json();
      })
      .then((fullUpdatedStudent: Student) => {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === fullUpdatedStudent.id ? fullUpdatedStudent : s,
          ),
        );
        setSelectedStudent(null);
      })
      .catch(() => {
        setFormError(true);
      });
  };

  const newStudent: Partial<Student> = {
    firstName: "",
    lastName: "",
    classroomId: undefined,
    parentId: null,
  };

  const createNewStudent = (newStudent: Partial<Student>) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/schools/me/students/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify(newStudent),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la création de l'élève");
        return res.json();
      })
      .then((createdStudent: Student) => {
        setStudents((prev) => [...prev, createdStudent]);
        setNewStudentForm(false);
      })
      .catch(() => {
        setFormError(true);
      });
  };

  return (
    <main>
      <div className="school-background">
        <div className={styles.container}>
          <header className={styles.header}>
            <img
              src={ptit_cahier_logo_original}
              alt="P'tit Cahier"
              className={styles.logo}
            />
            <h1 className="primary-title">Gestion des élèves</h1>
          </header>

          <button
            type="button"
            className={`primary-button ${styles.addButton}`}
            onClick={() => setNewStudentForm(true)}
          >
            + Nouvel élève
          </button>

          {loadingError ? (
            <p className="general_error_message">
              Échec de la récupération de vos données
            </p>
          ) : (
            <table className={styles["students-table_table"]}>
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Parent</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {students.map((student: Student) => (
                  <tr key={student.id} className={styles["students-table_row"]}>
                    <td className={styles.classroomColumn}>
                      <span className={styles.classroomBadge}>
                        {student.classroomName}
                      </span>
                    </td>
                    <td>{student.lastName}</td>
                    <td>{student.firstName}</td>
                    <td>
                      {student.parentLastName && student.parentFirstName
                        ? `${student.parentGenre === "M" ? "M." : "Mme"} ${student.parentFirstName} ${student.parentLastName}`
                        : ""}
                    </td>
                    <td>
                      <div className={styles.row_actions}>
                        <button
                          type="button"
                          className={styles.edit_button}
                          onClick={() => setSelectedStudent(student)}
                          title="Modifier"
                          aria-label="Modifier"
                        >
                          <Pencil className={styles.edit_icon} />
                        </button>

                        <button
                          type="button"
                          className={styles.delete_button}
                          onClick={() => deleteStudent(student.id)}
                          title="Supprimer"
                          aria-label="Supprimer"
                        >
                          <Trash2 className={styles.delete_icon} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedStudent && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <StudentForm
              student={selectedStudent}
              classrooms={classrooms}
              parents={parents}
              onCancel={() => {
                setSelectedStudent(null);
                setFormError(false);
              }}
              onSave={saveUpdatedStudent}
            />
            {formError && (
              <p className={styles.warning} role="alert" aria-live="polite">
                Une erreur est survenue. Veuillez renvoyer votre demande.
              </p>
            )}
          </div>
        </div>
      )}

      {newStudentForm && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <StudentForm
              student={newStudent}
              classrooms={classrooms}
              parents={parents}
              onCancel={() => setNewStudentForm(false)}
              onSave={createNewStudent}
              newStudentForm
            />
            {formError && (
              <p className={styles.warning} role="alert" aria-live="polite">
                Une erreur est survenue. Veuillez renvoyer votre demande.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default StudentsTable;
