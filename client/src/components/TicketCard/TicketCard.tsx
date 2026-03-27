import { useOutletContext } from "react-router-dom";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { Ticket } from "../../types/Ticket";
import styles from "./TicketCard.module.css";
import TicketIcon, { type TicketIconType } from "./TicketIcon";

type TicketCardProps = {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  variant?: "default" | "dashboard";
  showStatusBadge: boolean;
};

const getTicketIconType = (categoryName: string): TicketIconType => {
  switch (categoryName) {
    case "Urgence":
      return "urgent";
    case "Absence":
      return "events";
    case "Autorisation":
      return "notice";
    default:
      return "news";
  }
};

function TicketCard({
  ticket,
  onClick,
  variant = "default",
  showStatusBadge = false,
}: TicketCardProps) {
  const { auth } = useOutletContext<OutletAuthContext>();

  const userRole = auth?.role;

  const parentTitle = ticket.genre === "M" ? "M." : "Mme";

  const parentFullName = `${parentTitle} ${ticket.parentFirstName} ${ticket.parentLastName}`;

  const nameTitle =
    userRole === "parent"
      ? `Demande pour ${ticket.studentNames}`
      : parentFullName;

  const isProcessed = Boolean(ticket.processed);

  const statusLabel = isProcessed ? "traité" : "non traité";

  const createdAtLabel = new Date(ticket.createdAt).toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const iconType = getTicketIconType(ticket.ticketCategoryName);

  return (
    <article
      className={`${styles.card} ${
        variant === "dashboard" ? styles.card_dashboard : ""
      }`}
      data-type={iconType}
      data-has-badge={showStatusBadge ? "true" : "false"}
    >
      {showStatusBadge ? (
        <span
          className={styles.statusBadge}
          data-status={isProcessed ? "processed" : "pending"}
        >
          {statusLabel}
        </span>
      ) : null}
      <div className={styles.leftPanel} aria-hidden="true">
        <div className={styles.iconCircle}>
          <TicketIcon type={iconType} className={styles.icon} />
        </div>
      </div>

      <div className={styles.body}>
        <header className={styles.header}>
          {variant !== "dashboard" && (
            <h2 className={styles.nameTitle}>{nameTitle}</h2>
          )}
        </header>
        <p className={styles.content}>{ticket.content}</p>

        <time className={styles.date} dateTime={ticket.createdAt}>
          {createdAtLabel}
        </time>
      </div>

      <button
        type="button"
        className={styles.overlayButton}
        onClick={() => onClick(ticket)}
        aria-label={
          userRole === "parent"
            ? `Demande pour ${ticket.studentNames}`
            : `Ouvrir le ticket de ${parentFullName}`
        }
      />
    </article>
  );
}

export default TicketCard;
