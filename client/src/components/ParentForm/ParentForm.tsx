import { useEffect, useState } from "react";
import type { Parent } from "../../types/Parent";
import styles from "./ParentForm.module.css";

type Props = {
  parent: Partial<Parent>;
  onCancel: () => void;
  onSave: (updatedParent: Partial<Parent>) => void;
  newParentForm?: boolean;
};

const ParentForm = ({ parent, onCancel, onSave, newParentForm }: Props) => {
  const [firstName, setFirstName] = useState<string>(parent.firstName ?? "");
  const [lastName, setLastName] = useState<string>(parent.lastName ?? "");
  const [email, setEmail] = useState<string>(parent.email ?? "");
  const [genre, setGenre] = useState<"M" | "F">(parent.genre ?? "M");
  const [validateWarning, setValidateWarning] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const isUnchanged =
    firstName === parent.firstName &&
    lastName === parent.lastName &&
    email === parent.email &&
    genre === parent.genre;

  const updateParent = (event: React.FormEvent) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !genre) {
      setValidateWarning(true);
      return;
    }
    onSave({
      firstName,
      lastName,
      email,
      genre,
    });
  };

  const formTitle = newParentForm ? "Nouveau parent" : "Modifier le parent";

  return (
    <form
      className={styles.form_container}
      onSubmit={updateParent}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
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

      <fieldset className={styles.form_label_radio}>
        <legend>Civilité* :</legend>
        <label className={styles.radio_label_title}>
          <input
            type="radio"
            name="genre"
            value="M"
            checked={genre === "M"}
            onChange={() => setGenre("M")}
          />
          M.
        </label>
        <label className={styles.radio_label_title}>
          <input
            type="radio"
            name="genre"
            value="F"
            checked={genre === "F"}
            onChange={() => setGenre("F")}
          />
          Mme
        </label>
      </fieldset>

      <label className={styles.form_label}>
        Nom* :
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className={styles.form_input}
          required
        />
      </label>

      <label className={styles.form_label}>
        Prénom* :
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className={styles.form_input}
          required
        />
      </label>

      <label className={styles.form_label}>
        Email* :
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.form_input}
          required
        />
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

export default ParentForm;
