import {
  Check,
  CircleUserRound,
  Eye,
  EyeOff,
  Lock,
  School,
  X,
} from "lucide-react";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import styles from "./Register.module.css";

function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [schoolName, setSchoolName] = useState<string>("");
  const [submitValidationWarning, setSubmitValidationWarning] =
    useState<boolean>(false);
  const [invalidRegisterWarning, setInvalidRegisterWarning] =
    useState<boolean>(false);
  const [registerErrorWarning, setRegisterErrorWarning] =
    useState<boolean>(false);
  const [registerDone, setRegisterDone] = useState<boolean>(false);
  const navigate = useNavigate();

  const clearWarnings = () => {
    setSubmitValidationWarning(false);
    setSubmitValidationWarning(false);
    setSubmitValidationWarning(false);
  };

  const registerSchool: FormEventHandler = async (event) => {
    event.preventDefault();
    clearWarnings();

    const emailInvalid =
      !email.includes("@") || !email.includes(".") || email.length > 255;

    const passwordInvalid =
      !password ||
      password.length < 8 ||
      password.length > 120 ||
      !/\d/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password);

    const schoolNameInvalid = !schoolName || schoolName.length > 255;

    if (emailInvalid || passwordInvalid || schoolNameInvalid) {
      setSubmitValidationWarning(true);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/register/school`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schoolName,
        email,
        password,
      }),
    }).then((response) => {
      if (response.status === 409) {
        setInvalidRegisterWarning(true);
        return;
      }

      if (!response.ok) {
        setRegisterErrorWarning(true);
        return;
      }
      setRegisterDone(true);
    });
  };

  return (
    <main className={styles.background_school_login}>
      {registerDone ? (
        <div className={styles.login_container}>
          <img
            src={ptit_cahier_logo_original}
            alt="P'tit Cahier"
            className={styles.logo}
          />
          <div className={styles.form}>
            <p className={styles.parent_message}>
              Votre compte école <br />a été bien créé!
            </p>
            <button
              onClick={() => navigate("/login")}
              type="button"
              className="primary-button"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.login_container}>
          <header className={styles.title}>
            <img
              src={ptit_cahier_logo_original}
              alt="P'tit Cahier"
              className={styles.logo_small}
            />
            <h1 className="primary-title">Inscription École</h1>
          </header>

          <form className={styles.form} onSubmit={registerSchool}>
            <div
              className={`${styles.input_wrapper} ${
                submitValidationWarning ? styles.input_error : ""
              }`}
            >
              <label htmlFor="schoolName" className="sr-only">
                Nom de votre école
              </label>
              <School className={styles.icon} />
              <input
                id="schoolName"
                type="text"
                maxLength={120}
                value={schoolName}
                onChange={(event) => {
                  setSchoolName(event.target.value);
                  clearWarnings();
                }}
                placeholder="Nom de votre école"
                className={styles.input_field}
              />
            </div>

            <div
              className={`${styles.input_wrapper} ${
                submitValidationWarning ? styles.input_error : ""
              }`}
            >
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <CircleUserRound className={styles.icon} />
              <input
                id="email"
                type="email"
                value={email}
                maxLength={225}
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearWarnings();
                }}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                  }
                }}
                placeholder="Email"
                className={styles.input_field}
              />
            </div>

            <div
              className={`${styles.input_wrapper} ${
                submitValidationWarning ? styles.input_error : ""
              }`}
            >
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <Lock className={styles.icon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                maxLength={120}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearWarnings();
                }}
                onKeyDown={(event) => {
                  if (event.key === " ") {
                    event.preventDefault();
                  }
                }}
                placeholder="Mot de passe"
                className={styles.input_field}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className={styles.icon_eye} />
                ) : (
                  <EyeOff className={styles.icon_eye} />
                )}
              </button>
            </div>

            <div className={styles.password_rules_container}>
              {[
                {
                  label: "Au moins 8 caractères",
                  valid: password.length >= 8,
                },
                {
                  label: "Au moins un chiffre",
                  valid: /\d/.test(password),
                },
                {
                  label: "Au moins une majuscule",
                  valid: /[A-Z]/.test(password),
                },
                {
                  label: "Au moins un caractère spécial",
                  valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
                },
              ].map((rule) => (
                <div key={rule.label} className={styles.password_rules}>
                  {rule.valid ? (
                    <Check className={styles.icon_check} />
                  ) : (
                    <X className={styles.icon_x} />
                  )}
                  <p className="text">{rule.label}</p>
                </div>
              ))}
            </div>

            <div className={styles.ticket_buttons_container}>
              <button
                type="button"
                className="non-primary-button"
                onClick={() => navigate("/login")}
              >
                Annuler
              </button>

              <button type="submit" className="primary-button">
                S'inscrire
              </button>
            </div>

            {submitValidationWarning && (
              <p className={styles.warning} role="alert" aria-live="polite">
                Veuillez saisir un nom d'école, <br />
                une adresse mail et un mot de passe valides.
              </p>
            )}

            {invalidRegisterWarning && (
              <p className={styles.warning} role="alert" aria-live="polite">
                Un compte existe déjà avec cette adresse mail
              </p>
            )}

            {registerErrorWarning && (
              <p className={styles.warning} role="alert" aria-live="polite">
                Une erreur est survenue. Veuillez renvoyer votre demande.
              </p>
            )}
          </form>
        </div>
      )}
    </main>
  );
}

export default Register;
