import { LogOut } from "lucide-react";
import { useState } from "react";
import { NavLink, useOutletContext } from "react-router-dom";
import siteLogo from "../../assets/images/logo_site.png";
import type { Parent } from "../../types/Auth";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { School } from "../../types/School";
import LogoutButton from "../LogoutButton/LogoutButton";
import parentStyles from "./NavBarParent.module.css";
import schoolStyles from "./NavBarSchool.module.css";
import { getNavItems } from "./navItems";

function NavBar() {
  const { auth, setAuth } = useOutletContext<OutletAuthContext>();

  const logoutUser = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  const isSchool = auth?.role === "school";
  const styles = isSchool ? schoolStyles : parentStyles;

  const allItems = getNavItems(auth);
  const menuItems = allItems.filter((item) => item.label !== "Déconnexion");

  const displayName =
    auth?.role === "parent"
      ? (auth?.profile as Parent).firstName
      : (auth?.profile as School).name;

  const avatarSrc = auth?.profile.photoUrl;

  const mobileContainerClass = isSchool
    ? schoolStyles.mobileNav
    : parentStyles.mobileNavParent;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const togglePinned = () => {
    setIsCollapsed((prev) => {
      const nextCollapsed = !prev;
      setIsPinned(!nextCollapsed);
      return nextCollapsed;
    });
  };

  const handleMouseEnter = () => {
    if (!isPinned) setIsCollapsed(false);
  };

  const handleMouseLeave = () => {
    if (!isPinned) setIsCollapsed(true);
  };

  return (
    <>
      <aside
        id="sidebar"
        className={`${styles.sidebar} ${
          isCollapsed ? styles.collapsed : styles.expanded
        }`}
        aria-label="Navigation principale"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          className={styles.toggleButton}
          onClick={togglePinned}
          aria-pressed={isPinned}
          aria-expanded={!isCollapsed}
          aria-label={isPinned ? "Désépingler" : "Épingler"}
        >
          <span aria-hidden="true" className={styles.toggleIcon}>
            {isCollapsed ? "❯❯" : "❮❮"}
          </span>
        </button>

        <div className={styles.profile}>
          <img
            src={avatarSrc || "/images/default_avatar.png"}
            alt={displayName}
            className={styles.avatar}
          />
          {!isCollapsed && (
            <span className={styles.displayName}>{displayName}</span>
          )}
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {menuItems.map(({ to, label, Icon }) => (
              <li key={to} className={styles.navItem}>
                <NavLink
                  to={to || "#"}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ""}`
                  }
                  aria-label={label}
                >
                  <Icon className={styles.icon} aria-hidden="true" />
                  {!isCollapsed && (
                    <span className={styles.linkLabel}>{label}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          {!isCollapsed ? (
            <LogoutButton />
          ) : (
            <button
              type="button"
              onClick={logoutUser}
              className={styles.collapsedLogout}
              aria-label="Déconnexion"
            >
              <LogOut className={styles.icon} aria-hidden="true" />
            </button>
          )}

          <NavLink
            to={auth?.role ? `/${auth.role}/home` : "/"}
            className={styles.footerLogoLink}
            aria-label="Accueil"
          >
            <img
              src={siteLogo}
              alt="P'tit Cahier"
              className={styles.footerLogo}
            />
          </NavLink>

          {!isCollapsed && (
            <p className={styles.footerText}>P'tit Cahier © 2026</p>
          )}
        </div>
      </aside>

      <nav className={mobileContainerClass} aria-label="Navigation mobile">
        <div className={styles.mobileRow}>
          <NavLink
            to={auth?.role ? `/${auth.role}/home` : "/"}
            className={styles.mobileHome}
            aria-label="Accueil"
          >
            <img src={siteLogo} alt="Logo" className={styles.mobileLogo} />
          </NavLink>

          {menuItems.map(({ to, label, Icon }) => (
            <NavLink
              key={`mobile-${to}`}
              to={to || "#"}
              className={({ isActive }) =>
                `${styles.mobileLink} ${isActive ? styles.active : ""}`
              }
              aria-label={label}
            >
              <Icon className={styles.icon} aria-hidden="true" />
            </NavLink>
          ))}

          <button
            type="button"
            onClick={logoutUser}
            className={styles.mobileLogoutButton}
            aria-label="Déconnexion"
          >
            <LogOut className={styles.icon} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
