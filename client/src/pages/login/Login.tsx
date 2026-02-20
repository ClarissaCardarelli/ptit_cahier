import { CircleUserRound, Eye, EyeOff, Lock } from "lucide-react";
import type { FormEventHandler } from "react";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import type { Auth } from "../../types/Auth";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("parent");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [parentMessage, setParentMessage] = useState<boolean>(false);
  const [submitValidationWarning, setSubmitValidationWarning] =
    useState<boolean>(false);
  const [invalidLoginWarning, setInvalidLoginWarning] =
    useState<boolean>(false);
  const [loginErrorWarning, setLoginErrorWarning] = useState<boolean>(false);
  const navigate = useNavigate();

  const { setAuth } = useOutletContext<OutletAuthContext>();

  const clearWarnings = () => {
    if (submitValidationWarning) setSubmitValidationWarning(false);
    if (invalidLoginWarning) setInvalidLoginWarning(false);
    if (loginErrorWarning) setLoginErrorWarning(false);
  };

  const onRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clearWarnings();
    const newRole = event.target.value as "parent" | "school";
    setRole(newRole);
    setEmail("");
    setPassword("");
  };

  const fillDemoCredentials = () => {
    clearWarnings();
    setEmail(`example@${role}1.com`);
    setPassword("Password123");
  };

  const loginUser: FormEventHandler = async (event) => {
    event.preventDefault();

    const emailInvalid = !email.includes("@") || !email.includes(".");
    const passwordInvalid = !password;

    if (emailInvalid || passwordInvalid) {
      setSubmitValidationWarning(true);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    })
      .then((response) => {
        if (response.status === 422) {
          setInvalidLoginWarning(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Échec lors de la connexion");
        }

        return response.json();
      })
      .then((auth: Auth | undefined) => {
        if (!auth) return;
        setAuth(auth);
        localStorage.setItem("auth", JSON.stringify(auth));
        navigate(`/${auth.role}/home`);
      })
      .catch(() => {
        setLoginErrorWarning(true);
      });
  };

  return (
    <main className={styles[`background_${role}_login`]}>
      <div className={styles.login_container}>
        <img
          src={ptit_cahier_logo_original}
          alt="P'tit Cahier"
          className={styles.logo}
        />

        {parentMessage ? (
          <div className={styles.form}>
            <p className={styles.parent_message}>
              Pour obtenir vos identifiants
              <br /> de connexion, <br />
              veuillez vous adresser au représentant de l'école de votre élève.
            </p>
            <button
              onClick={() => {
                setParentMessage(false);
              }}
              type="button"
              className="primary-button"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <>
            <form className={styles.form} onSubmit={loginUser}>
              <fieldset className={styles.fieldset_user}>
                <legend className="sr-only">User type</legend>

                <input
                  type="radio"
                  id="parent"
                  value="parent"
                  checked={role === "parent"}
                  onChange={onRoleChange}
                  className={styles.radio_button}
                />
                <label
                  htmlFor="parent"
                  className={`${styles.radio_button_label} ${
                    role === "parent" ? styles.label_checked_parent : ""
                  }`}
                >
                  Parent
                </label>

                <input
                  type="radio"
                  id="school"
                  value="school"
                  checked={role === "school"}
                  onChange={onRoleChange}
                  className={styles.radio_button}
                />
                <label
                  htmlFor="school"
                  className={`${styles.radio_button_label} ${
                    role === "school" ? styles.label_checked_school : ""
                  }`}
                >
                  École
                </label>
              </fieldset>

              <div
                className={`${styles.input_wrapper} ${
                  submitValidationWarning ||
                  invalidLoginWarning ||
                  loginErrorWarning
                    ? styles.input_error
                    : ""
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
                  maxLength={255}
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
                  submitValidationWarning ||
                  invalidLoginWarning ||
                  loginErrorWarning
                    ? styles.input_error
                    : ""
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

              <div className={styles.ticket_buttons_container}>
                {role === "parent" && (
                  <button
                    type="button"
                    className="non-primary-button"
                    onClick={() => {
                      setParentMessage(true);
                      clearWarnings();
                    }}
                  >
                    Pas de compte ?
                  </button>
                )}

                {role === "school" && (
                  <button
                    type="button"
                    className="non-primary-button"
                    onClick={() => navigate("/register")}
                  >
                    Créer un compte
                  </button>
                )}
                <button
                  type="submit"
                  className={`primary-button ${
                    role === "parent" ? styles.btn_connect_parent : ""
                  }`}
                >
                  Se connecter
                </button>
              </div>

              {submitValidationWarning && (
                <p className={styles.warning} role="alert" aria-live="polite">
                  Veuillez saisir une adresse mail et un mot de passe valides.
                </p>
              )}

              {invalidLoginWarning && (
                <p className={styles.warning} role="alert" aria-live="polite">
                  Adresse mail ou mot de passe invalide.
                </p>
              )}

              {loginErrorWarning && (
                <p className={styles.warning} role="alert" aria-live="polite">
                  Une erreur est survenue. Veuillez renvoyer votre demande.
                </p>
              )}
            </form>

            <button
              type="button"
              onClick={fillDemoCredentials}
              className={styles.demo}
            >
              {role === "parent"
                ? "Connexion en démo Parent"
                : "Connexion en démo École"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default Login;
