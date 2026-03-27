import { useState } from "react";
import { useNavigate } from "react-router";
import type { Student } from "../../types/Student";
import type { TicketCategory } from "../../types/TicketCategory";
import type { TicketNew } from "../../types/TicketNew";
import CategoryFormButton from "../CategoryFormButton/CategoryFormButton";
import styles from "./TicketForm.module.css";

type TicketFormProps = {
  ticketCategories: TicketCategory[];
  students: Student[];
  onSubmit: (ticket: TicketNew) => void;
};

function TicketForm({ ticketCategories, students, onSubmit }: TicketFormProps) {
  const [messageLength, setMessageLength] = useState<number>(0);
  const [validateWarning, setValidateWarning] = useState<boolean>(false);
  const navigate = useNavigate();

  const clearWarning = () => {
    if (validateWarning) setValidateWarning(false);
  };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const content = (formData.get("content") as string).trim();
        const ticketCategoryId = Number(
          formData.get("ticketCategoryId"),
        ) as number;
        const studentIds = (formData.getAll("studentIds[]") as string[]).map(
          Number,
        );

        const validStudentIds = studentIds.filter(
          (id) => Number.isInteger(id) && id > 0,
        );

        if (
          !content ||
          validStudentIds.length === 0 ||
          !Number.isInteger(ticketCategoryId) ||
          ticketCategoryId <= 0
        ) {
          setValidateWarning(true);
          return;
        }

        onSubmit({
          content,
          ticketCategoryId,
          studentIds,
        });
      }}
    >
      <h1 className="primary-title">Nouvelle Demande</h1>
      <p className={styles.form_instructions}>
        Choisissez un motif, sélectionnez le ou les élèves concernés, puis
        rédigez votre message.
      </p>

      <fieldset className={styles.fieldset_categories}>
        <legend className={styles.form_label}>Motif de la demande* :</legend>
        <ul>
          {ticketCategories.map((category) => (
            <li key={category.id}>
              <CategoryFormButton
                category={category}
                formName="ticketCategoryId"
                onChange={clearWarning}
              />
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className={styles.fieldset_names}>
        <div className={styles.fieldset_names_wrapper}>
          <legend className={styles.form_label}>Élève(s) concerné(s)* :</legend>
          <ul>
            {students.map((student) => (
              <li key={student.id}>
                <input
                  type="checkbox"
                  id={`student-${student.id}`}
                  name="studentIds[]"
                  value={student.id}
                  aria-required="true"
                  className={styles.checkbox}
                  onChange={clearWarning}
                />
                <label
                  htmlFor={`student-${student.id}`}
                  className={styles.checkbox_label}
                >
                  {student.firstName}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </fieldset>

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
          onClick={() => navigate("/parent/tickets")}
          type="button"
          className="non-primary-button"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="primary-button"
          disabled={validateWarning}
        >
          Envoyer
        </button>
      </div>

      {validateWarning && (
        <p className={styles.warning} role="alert" aria-live="polite">
          Veuillez remplir tous les champs obligatoires (indiqués par *).
        </p>
      )}
    </form>
  );
}

export default TicketForm;
