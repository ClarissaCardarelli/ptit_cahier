import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import ParentForm from "../../components/ParentForm/ParentForm";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { Parent } from "../../types/Parent";
import styles from "./ParentsTable.module.css";

const ParentsTable = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [newParentForm, setNewParentForm] = useState<boolean>(false);
  const [formError, setFormError] = useState<boolean>(false);
  const { auth } = useOutletContext<OutletAuthContext>();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/schools/me/parents`, {
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Échec lors de la récupération des données");
        }
        return response.json();
      })
      .then((parents: Parent[]) => {
        setParents(
          parents.sort((a, b) => a.lastName.localeCompare(b.lastName)),
        );
      })
      .catch(() => {
        setLoadingError(true);
      });
  }, [auth]);

  const deleteParent = (parentId: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce parent ?")) return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/me/parents/${parentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
      },
    ).then(() => {
      setParents((prev) => prev.filter((parent) => parent.id !== parentId));
    });
  };

  const saveUpdatedParent = (updatedParent: Partial<Parent>) => {
    if (!selectedParent) return;

    fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/me/parents/${selectedParent.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify(updatedParent),
      },
    )
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la mise à jour");
        return res.json();
      })
      .then((fullUpdatedParent: Parent) => {
        setParents((prev) =>
          prev.map((p) =>
            p.id === fullUpdatedParent.id ? fullUpdatedParent : p,
          ),
        );
        setSelectedParent(null);
      })
      .catch(() => {
        alert("Impossible de mettre à jour le parent. Réessayez.");
      });
  };

  const newParent: Partial<Parent> = {
    email: "",
    firstName: "",
    lastName: "",
    genre: "M",
  };

  const createNewParent = (newParent: Partial<Parent>) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/schools/me/parents/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
      body: JSON.stringify(newParent),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la création du parent");
        return res.json();
      })
      .then((createdParent: Parent) => {
        setParents((prev) => [...prev, createdParent]);
        setNewParentForm(false);
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
            <h1 className="primary-title">Gestion des parents</h1>
          </header>

          <button
            type="button"
            className={`primary-button ${styles.addParentButton}`}
            onClick={() => setNewParentForm(true)}
          >
            + Nouveau parent
          </button>

          {loadingError ? (
            <p className="general_error_message">
              Échec de la récupération de vos données
            </p>
          ) : (
            <table className={styles["students-table_table"]}>
              <thead>
                <tr>
                  <th>Mail</th>
                  <th>Civilité </th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {parents.map((parent) => (
                  <tr key={parent.id} className={styles["students-table_row"]}>
                    <td>{parent.email}</td>
                    <td>{parent.genre === "M" ? "M." : "Mme"}</td>
                    <td>{parent.lastName}</td>
                    <td>{parent.firstName}</td>
                    <td>
                      <div className={styles.row_actions}>
                        <button
                          type="button"
                          className={styles.edit_button}
                          onClick={() => setSelectedParent(parent)}
                          aria-label="Modifier le parent"
                        >
                          <Pencil
                            className={styles.edit_icon}
                            aria-hidden="true"
                          />
                        </button>

                        <button
                          type="button"
                          className={styles.delete_button}
                          onClick={() => deleteParent(parent.id)}
                          aria-label="Supprimer le parent"
                        >
                          <Trash2
                            className={styles.delete_icon}
                            aria-hidden="true"
                          />
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

      {selectedParent && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <ParentForm
              parent={selectedParent}
              onCancel={() => setSelectedParent(null)}
              onSave={saveUpdatedParent}
            />
          </div>
        </div>
      )}

      {newParentForm && (
        <div className={styles.modal_overlay}>
          <div className={styles.modal_content}>
            <ParentForm
              parent={newParent}
              onCancel={() => setNewParentForm(false)}
              onSave={createNewParent}
              newParentForm
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

export default ParentsTable;
