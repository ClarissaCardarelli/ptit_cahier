import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterStudent from "../../components/FilterStudents/FilterStudent";
import type { AnnouncementCategory } from "../../types/AnnouncementCategory";
import type { AnnouncementNew } from "../../types/AnnouncementNew";
import type { Classroom } from "../../types/Classroom";
import type { Student } from "../../types/Student";
import CategoryFormButton from "../CategoryFormButton/CategoryFormButton";
import styles from "./AnnouncementForm.module.css";

type AnnouncementFormProps = {
  announcementCategories: AnnouncementCategory[];
  classrooms: Classroom[];
  students: Student[];
  onSubmit: (announcement: AnnouncementNew) => void;
  isSubmitting: boolean;
};

function AnnouncementForm({
  announcementCategories,
  classrooms,
  students,
  onSubmit,
  isSubmitting = false,
}: AnnouncementFormProps) {
  const [messageLength, setMessageLength] = useState<number>(0);
  const [selectedClassroom, setSelectedClassroom] = useState<number[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number[]>([]);
  const [filterSelectedClassroom, setFilterSelectedClassroom] = useState<
    number[]
  >([]);
  const [filterSelectedStudent, setFilterSelectedStudent] = useState<number[]>(
    [],
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [isStudentSearchOpen, setIsStudentSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [validateWarning, setValidateWarning] = useState(false);
  const navigate = useNavigate();

  const getStudentsByClassroom = useMemo(() => {
    const map: Record<number, Student[]> = {};

    for (const student of students) {
      if (!map[student.classroomId]) {
        map[student.classroomId] = [];
      }
      map[student.classroomId].push(student);
    }

    return (classroomId: number) => map[classroomId] ?? [];
  }, [students]);

  const clearWarning = () => {
    if (validateWarning) {
      setValidateWarning(false);
    }
  };

  const getClassroomName = (classroomId: number) => {
    const classroom = classrooms.find(
      (classroom) => classroom.id === classroomId,
    );
    return classroom?.name ?? "Classe inconnue";
  };

  const getStudent = (studentId: number) => {
    return students.find((student) => student.id === studentId);
  };

  const addUniqueStudent = (currentIds: number[], idsToAdd: number[]) => {
    const nextIds = [...currentIds];

    for (const id of idsToAdd) {
      if (!nextIds.includes(id)) {
        nextIds.push(id);
      }
    }

    return nextIds;
  };

  const removeStudents = (
    currentStudents: number[],
    studentsToRemove: number[],
  ) => {
    if (studentsToRemove.length === 0) {
      return currentStudents;
    }

    return currentStudents.filter((id) => !studentsToRemove.includes(id));
  };

  const openFilterModal = () => {
    setFilterSelectedClassroom(selectedClassroom);
    setFilterSelectedStudent(selectedStudent);
    setStudentSearch("");
    setIsStudentSearchOpen(false);
    setIsFilterOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterOpen(false);
    setStudentSearch("");
    setIsStudentSearchOpen(false);
  };

  const applyFilterModal = () => {
    setSelectedClassroom(filterSelectedClassroom);
    setSelectedStudent(filterSelectedStudent);
    closeFilterModal();
    clearWarning();
  };

  const toggleFilterClassroom = (classroomId: number) => {
    const isSelected = filterSelectedClassroom.includes(classroomId);
    const classroomStudentIds = getStudentsByClassroom(classroomId).map(
      (student) => student.id,
    );

    if (isSelected) {
      setFilterSelectedClassroom((prev) =>
        prev.filter((id) => id !== classroomId),
      );
      setFilterSelectedStudent((prev) =>
        removeStudents(prev, classroomStudentIds),
      );
      return;
    }

    setFilterSelectedClassroom((prev) => [...prev, classroomId]);
    setFilterSelectedStudent((prev) =>
      addUniqueStudent(prev, classroomStudentIds),
    );
  };

  const toggleFilterStudent = (studentId: number) => {
    setFilterSelectedStudent((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }

      return [...prev, studentId];
    });
  };

  const removeClassroomSelection = (classroomId: number) => {
    setSelectedClassroom((prev) => prev.filter((id) => id !== classroomId));

    const classroomStudentIds = getStudentsByClassroom(classroomId).map(
      (student) => student.id,
    );
    setSelectedStudent((prev) => removeStudents(prev, classroomStudentIds));
  };

  const removeStudentSelection = (studentId: number) => {
    setSelectedStudent((prev) => prev.filter((id) => id !== studentId));
  };

  const normalize = (value: string) => {
    return value.toLowerCase().trim().replace(/\s+/g, " ");
  };

  const matchesStudent = (student: Student, searchValue: string) => {
    const classroomName =
      student.classroomName ?? getClassroomName(student.classroomId);
    const fullName = `${student.firstName} ${student.lastName}`;
    const searchTarget = [fullName, classroomName]
      .map((item) => normalize(item))
      .join(" ");

    return searchTarget.includes(searchValue);
  };

  const normalizedStudentSearch = normalize(studentSearch);
  const studentSearchResults =
    normalizedStudentSearch.length === 0
      ? []
      : students.filter((student) =>
          matchesStudent(student, normalizedStudentSearch),
        );

  const selectStudentFromSearch = (studentId: number) => {
    setFilterSelectedStudent((prev) => {
      if (prev.includes(studentId)) {
        return prev;
      }
      return [...prev, studentId];
    });
    setStudentSearch("");
    setIsStudentSearchOpen(false);
  };

  const fullySelectedClassroom = selectedClassroom.filter((classroomId) => {
    const classroomStudents = getStudentsByClassroom(classroomId);
    if (classroomStudents.length === 0) {
      return false;
    }

    return classroomStudents.every((student) =>
      selectedStudent.includes(student.id),
    );
  });

  const individualStudents = (
    selectedStudent.map((student) => getStudent(student)) as Student[]
  ).filter((student) => !fullySelectedClassroom.includes(student.classroomId));

  const filterSelectedStudents = filterSelectedStudent
    .map((student) => getStudent(student))
    .filter((student): student is Student => student !== undefined);

  return (
    <>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          if (isSubmitting) {
            return;
          }

          const formData = new FormData(event.currentTarget);
          const title = (formData.get("title") as string).trim();
          const content = (formData.get("content") as string).trim();
          const announcementCategoryId = Number(
            formData.get("announcementCategoryId"),
          ) as number;

          if (
            !title ||
            !content ||
            !Number.isInteger(announcementCategoryId) ||
            announcementCategoryId <= 0 ||
            selectedStudent.length === 0
          ) {
            setValidateWarning(true);
            return;
          }

          onSubmit({
            title,
            content,
            announcementCategoryId,
            studentIds: selectedStudent,
          });
        }}
      >
        <h1 className="primary-title">Nouvelle Annonce</h1>
        <p className={styles.form_instructions}>
          Choisissez un motif, sélectionnez les élèves concernés, puis rédigez
          votre annonce.
        </p>

        <div className={styles.fieldset_title}>
          <label htmlFor="title" className={styles.form_label}>
            Titre* :
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={styles.text_input}
            onChange={clearWarning}
            aria-required="true"
          />
        </div>

        <fieldset className={styles.fieldset_categories}>
          <legend className={styles.form_label}>Motif de l'annonce* :</legend>
          <ul>
            {announcementCategories.map((category) => (
              <li key={category.id}>
                <CategoryFormButton
                  category={category}
                  formName="announcementCategoryId"
                  onChange={clearWarning}
                />
              </li>
            ))}
          </ul>
        </fieldset>

        <div className={styles.filter_section}>
          <div className={styles.filter_row}>
            <span className={styles.form_label}>Élèves concernés* :</span>
            <button
              type="button"
              className="primary-button"
              onClick={openFilterModal}
            >
              Sélectionner les élèves
            </button>
          </div>

          <div
            className={styles.selection_summary}
            aria-label="Élèves sélectionnés"
          >
            <div className={styles.chip_row}>
              {fullySelectedClassroom.map((classroomId) => (
                <span key={classroomId} className={styles.summary_chip}>
                  {getClassroomName(classroomId)}
                  <button
                    type="button"
                    className={styles.chip_remove}
                    aria-label={`Retirer la classe ${getClassroomName(
                      classroomId,
                    )}`}
                    onClick={() => removeClassroomSelection(classroomId)}
                  >
                    {"\u00d7"}
                  </button>
                </span>
              ))}

              {individualStudents.map((student) => (
                <span key={student.id} className={styles.summary_chip}>
                  {student.firstName} {student.lastName} (
                  {getClassroomName(student.classroomId)})
                  <button
                    type="button"
                    className={styles.chip_remove}
                    aria-label={`Retirer ${student.firstName} ${student.lastName}`}
                    onClick={() => removeStudentSelection(student.id)}
                  >
                    {"\u00d7"}
                  </button>
                </span>
              ))}

              {fullySelectedClassroom.length === 0 &&
                individualStudents.length === 0 && (
                  <span className={styles.summary_empty}>
                    Sélectionnez au moins un élève.
                  </span>
                )}
            </div>
          </div>
        </div>

        <fieldset className={styles.fieldset_message}>
          <legend className={styles.form_label}>Message* :</legend>
          <div className={styles.textarea_wrapper}>
            <textarea
              id="content"
              name="content"
              aria-required="true"
              className={styles.textarea}
              maxLength={1000}
              placeholder="Expliquez votre demande (contexte, date, détails utiles...)"
              onChange={(e) => {
                setMessageLength(e.target.value.length);
                clearWarning();
              }}
            />
            <p className={styles.charcter_counter}>{messageLength} / 1000</p>
          </div>
        </fieldset>

        <div className={styles.ticket_buttons_container}>
          <button
            onClick={() => navigate("/school/announcements")}
            type="button"
            className="non-primary-button"
          >
            Retourner aux annonces
          </button>
          <button
            type="submit"
            className="primary-button"
            disabled={validateWarning || isSubmitting}
          >
            Publier
          </button>
        </div>

        {validateWarning && (
          <p className={styles.warning} role="alert" aria-live="polite">
            Veuillez remplir tous les champs obligatoires (indiqués par *).
          </p>
        )}
      </form>

      <FilterStudent
        isFilterOpen={isFilterOpen}
        classrooms={classrooms}
        filterSelectedClassroom={filterSelectedClassroom}
        togglefilterClassroom={toggleFilterClassroom}
        studentSearch={studentSearch}
        setStudentSearch={setStudentSearch}
        setIsStudentSearchOpen={setIsStudentSearchOpen}
        isStudentSearchOpen={isStudentSearchOpen}
        studentSearchResults={studentSearchResults}
        filterSelectedStudent={filterSelectedStudent}
        selectStudentFromSearch={selectStudentFromSearch}
        getClassroomName={getClassroomName}
        filterSelectedStudents={filterSelectedStudents}
        togglefilterStudent={toggleFilterStudent}
        closeFilterModal={closeFilterModal}
        applyFilterModal={applyFilterModal}
      />
    </>
  );
}

export default AnnouncementForm;
