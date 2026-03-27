import { useCallback, useEffect, useRef, useState } from "react";
import type { Ticket } from "../../types/Ticket";
import TicketIcon, { type TicketIconType } from "../TicketCard/TicketIcon";
import styles from "./TicketModal.module.css";

type TicketModalProps = {
  ticket: Ticket;
  onCloseComplete: () => void;
  processTicket: (ticketId: number, processed: boolean) => Promise<void>;
  canProcess: boolean;
};

const getTicketIconType = (ticketCategoryName: string): TicketIconType => {
  switch (ticketCategoryName) {
    case "Urgence":
      return "urgent";
    case "Autorisation":
      return "notice";
    case "Absence":
      return "events";
    default:
      return "news";
  }
};

function TicketModal({
  ticket,
  onCloseComplete,
  processTicket,
  canProcess = true,
}: TicketModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const requestClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [requestClose]);

  const parentTitle = ticket.genre === "M" ? "M." : "Mme";

  const parentFullName = `${parentTitle} ${ticket.parentFirstName} ${ticket.parentLastName}`;

  const ticketType = getTicketIconType(ticket.ticketCategoryName);

  const createdAtLabel = new Date(ticket.createdAt).toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`}>
      <button
        type="button"
        className={styles.backdrop}
        onClick={requestClose}
        aria-label="Fermer la fenêtre"
      />

      <dialog
        ref={(node) => {
          dialogRef.current = node;
        }}
        className={`${styles.modal} ${isOpen ? styles.modalOpen : ""}`}
        data-type={ticketType}
        open
        aria-label="Détails du ticket"
        onTransitionEnd={(event) => {
          const isDialogTransition = event.target === dialogRef.current;
          if (isDialogTransition && !isOpen) {
            onCloseComplete();
          }
        }}
      >
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.colorBlock} ${styles[ticketType]}`}>
              <div className={styles.iconCircle}>
                <TicketIcon type={ticketType} className={styles.icon} />
              </div>
            </div>

            <div className={styles.headerText}>
              <h2 className={styles.title}>{parentFullName}</h2>
              <time className={styles.subTitle}>{createdAtLabel}</time>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={requestClose}
            aria-label="Fermer la fenêtre"
          >
            ×
          </button>
        </header>

        <div className={styles.body}>
          <div className={styles.infoRow}>
            <div className={`${styles.infoBlock} ${styles.withDivider}`}>
              <div className={styles.kvGrid}>
                <p className={styles.kvLabel}>Enfant(s) concerné(s):</p>

                <ul className={styles.namesList}>
                  {ticket.studentNames
                    .split(",")
                    .map((name) => name.trim())
                    .filter(Boolean)
                    .map((name) => (
                      <li key={name} className={styles.kvValue}>
                        {name}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className={styles.infoBlock}>
              <p className={styles.infoLabel}>Pièce jointe :</p>
              <p className={styles.attachmentPlaceholder}>
                Aucune pièce jointe
              </p>
            </div>
          </div>

          <div className={styles.messageBox} data-type={ticketType}>
            <p className={styles.messageText}>{ticket.content} </p>
          </div>
        </div>

        {canProcess && (
          <div className={styles.actions}>
            <button
              type="button"
              className={"primary-button"}
              onClick={() => processTicket(ticket.id, !ticket.processed)}
            >
              {ticket.processed ? "Non traité" : "Traité"}
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}

export default TicketModal;
