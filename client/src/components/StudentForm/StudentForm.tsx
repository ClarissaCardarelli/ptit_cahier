import { useEffect, useState } from "react";
import type { Classroom } from "../../types/Classroom";
import type { Parent } from "../../types/Parent";
import type { Student } from "../../types/Student";
import styles from "./StudentForm.module.css";

type Props = {
  student: Partial<Student>;
  classrooms: Classroom[];
  parents: Parent[];
  onCancel: () => void;
  onSave: (student: Partial<Student>) => void;
  newStudentForm?: boolean;
};

const StudentForm = ({
  student,
  classrooms,
  parents,
  onCancel,
  onSave,
  newStudentForm,
}: Props) => {
  const [firstName, setFirstName] = useState<string>(student.firstName ?? "");
  const [lastName, setLastName] = useState<string>(student.lastName ?? "");
  const [classroomId, setClassroomId] = useState<number>(
    student.classroomId ?? 0,
  );
  const [parentId, setParentId] = useState<number>(student.parentId ?? 0);
  const [validateWarning, setValidateWarning] = useState<boolean>(false);

  const clearWarnings = () => {
    setValidateWarning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const isUnchanged =
    firstName === student.firstName &&
    lastName === student.lastName &&
    classroomId === student.classroomId &&
    parentId === (student.parentId ?? 0);

  const updateStudent = (event: React.FormEvent) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim() || classroomId <= 0) {
      setValidateWarning(true);
      return;
    }

    onSave({
      firstName,
      lastName,
      classroomId,
      parentId: parentId === 0 ? null : parentId,
    });
  };

  const formTitle = newStudentForm ? "Nouvel élève" : "Modifier l'élève";

  return (
    <form
      className={styles.form_container}
      onSubmit={updateStudent}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={styles.close_icon_button}
        onClick={onCancel}
        aria-label="Close"
      >
        ✕
      </button>

      <h2 className={styles.form_title}>{formTitle}</h2>

      <label className={styles.form_label}>
        Nom* :
        <input
          type="text"
          value={lastName}
          maxLength={120}
          onChange={(e) => {
            setLastName(e.target.value);
            clearWarnings();
          }}
          className={styles.form_input}
          required
        />
      </label>

      <label className={styles.form_label}>
        Prénom* :
        <input
          type="text"
          value={firstName}
          maxLength={120}
          onChange={(e) => {
            setFirstName(e.target.value);
            clearWarnings();
          }}
          className={styles.form_input}
          required
        />
      </label>

      <label className={styles.form_label}>
        Classe* :
        <select
          value={classroomId}
          onChange={(e) => {
            setClassroomId(Number(e.target.value));
            clearWarnings();
          }}
          className={styles.form_input}
          required
        >
          <option value={0}>Classe non attribuée</option>
          {classrooms.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.form_label}>
        Parent :
        <select
          value={parentId}
          onChange={(e) => {
            setParentId(Number(e.target.value));
            clearWarnings();
          }}
          className={styles.form_input}
          required
        >
          <option value={0}>Parent non attribué</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.genre === "M" ? "M." : "Mme"} {p.lastName} {p.firstName}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.ticket_buttons_container}>
        <button onClick={onCancel} type="button" className="non-primary-button">
          Annuler
        </button>
        <button type="submit" className="primary-button" disabled={isUnchanged}>
          Enregistrer
        </button>
      </div>

      {validateWarning && (
        <p className={styles.warning} role="alert" aria-live="polite">
          Veuillez remplir tous les champs obligatoires (indiqués par *).
        </p>
      )}
    </form>
  );
};

export default StudentForm;
