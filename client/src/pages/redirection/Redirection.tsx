import { useNavigate, useOutletContext } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import styles from "./Redirection.module.css";

const Redirection = () => {
  const navigate = useNavigate();
  const { auth } = useOutletContext<OutletAuthContext>();

  return (
    <main className="parent-background">
      <div className={styles.login_container}>
        <img
          src={ptit_cahier_logo_original}
          alt="Le P'tit Cahier"
          className={styles.logo}
        />
        <div className={styles.form}>
          <p className={styles.message}>Une erreur est survenue.</p>
          <button
            type="button"
            onClick={() => {
              auth ? navigate(`/${auth?.role}/home`) : navigate("/login");
            }}
            className="primary-button"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </main>
  );
};

export default Redirection;
