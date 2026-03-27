import { ArrowUpNarrowWide } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import ptit_cahier_logo_original from "../../assets/images/ptit_cahier_logo_original.png";
import TicketCard from "../../components/TicketCard/TicketCard";
import TicketModal from "../../components/TicketModal/TicketModal";
import type { OutletAuthContext } from "../../types/OutletAuthContext";
import type { Ticket } from "../../types/Ticket";
import styles from "./Tickets.module.css";

type StatusFilter = "all" | "processed" | "unprocessed";
type SortDirection = "desc" | "asc";

function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingError, setLoadingError] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const navigate = useNavigate();
  const { auth } = useOutletContext<OutletAuthContext>();

  const userRole = auth?.role;
  const backgroundClass =
    userRole === "school" ? "school-background" : "parent-background";

  const titleText =
    userRole === "school" ? "Gestion des tickets" : "Mes demandes";

  useEffect(() => {
    const headers = { Authorization: `Bearer ${auth?.token}` };

    const endpoint =
      userRole === "school"
        ? `${import.meta.env.VITE_API_URL}/api/schools/me/tickets`
        : `${import.meta.env.VITE_API_URL}/api/parents/me/tickets`;

    fetch(endpoint, { headers })
      .then((response) => {
        if (!response.ok) {
          setLoadingError(true);
          return;
        }
        return response.json();
      })
      .then((tickets: Ticket[] | undefined) => {
        if (!tickets) return;
        setTickets(tickets);
      });
  }, [userRole, auth]);

  const processTicket = async (ticketId: number, processed: boolean) => {
    const updateProcessedStatus = (lastStatus: boolean) => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, processed: lastStatus }
            : ticket,
        ),
      );

      setSelectedTicket((prevTicket) =>
        prevTicket && prevTicket.id === ticketId
          ? { ...prevTicket, processed: lastStatus }
          : prevTicket,
      );
    };

    fetch(
      `${import.meta.env.VITE_API_URL}/api/schools/tickets/${ticketId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: JSON.stringify({ processed }),
      },
    )
      .then(
        (response) =>
          response.json() as Promise<{ id: number; processed: boolean }>,
      )
      .then((ticket) => {
        updateProcessedStatus(ticket.processed);
      });
  };

  const categories = Array.from(
    new Set(tickets.map((ticket) => ticket.ticketCategoryName)),
  );

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((category) => category !== categoryName)
        : [...prev, categoryName],
    );
  };

  const categoryFilteredTickets =
    selectedCategories.length === 0
      ? tickets
      : tickets.filter((ticket) =>
          selectedCategories.includes(ticket.ticketCategoryName),
        );

  const statusCounts = categoryFilteredTickets.reduce(
    (counts, ticket) => {
      if (ticket.processed) {
        counts.processed += 1;
      } else {
        counts.unprocessed += 1;
      }

      counts.total += 1;
      return counts;
    },
    { total: 0, processed: 0, unprocessed: 0 },
  );

  const statusFilteredTickets = categoryFilteredTickets.filter((ticket) => {
    if (selectedStatus === "processed") {
      return ticket.processed;
    }

    if (selectedStatus === "unprocessed") {
      return !ticket.processed;
    }

    return true;
  });

  const filteredTickets = [...statusFilteredTickets].sort((first, second) => {
    const firstDate = new Date(first.createdAt).getTime();
    const secondDate = new Date(second.createdAt).getTime();

    return sortDirection === "desc"
      ? secondDate - firstDate
      : firstDate - secondDate;
  });

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <main className={`${styles.page} ${backgroundClass}`}>
      <div className={styles.container}>
        <header className={styles.header}>
          <img
            src={ptit_cahier_logo_original}
            alt="P'tit Cahier"
            className={styles.logo}
          />
          <h1 className="primary-title">{titleText}</h1>
        </header>

        {userRole === "parent" && (
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/parent/tickets/new")}
          >
            + Nouvelle demande
          </button>
        )}

        {userRole === "school" && (
          <div className={styles.filters}>
            <div className={styles.filtersHeader}>
              <fieldset className={styles.statusFilters}>
                <legend className="sr-only">
                  Filtrer les tickets par statut
                </legend>
                <button
                  type="button"
                  className={`${styles.statusButton} ${
                    selectedStatus === "all" ? styles.statusButton_active : ""
                  }`}
                  onClick={() => setSelectedStatus("all")}
                  aria-pressed={selectedStatus === "all"}
                >
                  <span className={styles.statusLabel}>Total</span>
                  <span className={styles.statusDivider} aria-hidden="true" />
                  <span className={styles.statusCount}>
                    {statusCounts.total}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.statusButton} ${
                    selectedStatus === "processed"
                      ? styles.statusButton_active
                      : ""
                  }`}
                  onClick={() => setSelectedStatus("processed")}
                  aria-pressed={selectedStatus === "processed"}
                >
                  <span className={styles.statusLabel}>Traité</span>
                  <span className={styles.statusDivider} aria-hidden="true" />
                  <span className={styles.statusCount}>
                    {statusCounts.processed}
                  </span>
                </button>
                <button
                  type="button"
                  className={`${styles.statusButton} ${
                    selectedStatus === "unprocessed"
                      ? styles.statusButton_active
                      : ""
                  }`}
                  onClick={() => setSelectedStatus("unprocessed")}
                  aria-pressed={selectedStatus === "unprocessed"}
                >
                  <span className={styles.statusLabel}>Non traité</span>
                  <span className={styles.statusDivider} aria-hidden="true" />
                  <span className={styles.statusCount}>
                    {statusCounts.unprocessed}
                  </span>
                </button>
              </fieldset>
            </div>

            <div className={styles.categoryRow}>
              {categories.length > 0 ? (
                <fieldset className={styles.categoryFilters}>
                  <legend className="sr-only">
                    Filtrer les tickets par catégorie
                  </legend>
                  {categories.map((category) => {
                    const isActive = selectedCategories.includes(category);

                    return (
                      <button
                        type="button"
                        key={category}
                        className={`${styles.categoryButton} ${
                          isActive ? styles.categoryButton_active : ""
                        }`}
                        onClick={() => toggleCategory(category)}
                        aria-pressed={isActive}
                      >
                        {category}
                      </button>
                    );
                  })}
                </fieldset>
              ) : (
                <div
                  className={styles.categoryPlaceholder}
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                className={styles.sortButton}
                onClick={toggleSortDirection}
                data-direction={sortDirection}
                aria-label={`Trier par date (${
                  sortDirection === "desc"
                    ? "du plus récent au plus ancien"
                    : "du plus ancien au plus récent"
                })`}
              >
                <ArrowUpNarrowWide
                  className={styles.sortIcon}
                  aria-hidden="true"
                />
                <span className={styles.sortLabel}>Trier par date</span>
              </button>
            </div>
          </div>
        )}

        {loadingError ? (
          <p className="general_error_message">
            Échec de la récupération de vos tickets
          </p>
        ) : tickets.length === 0 ? (
          <p className="general_error_message">Aucun ticket précédent</p>
        ) : (
          <section
            className={styles.contentArea}
            aria-label="Liste des tickets"
          >
            <ul className={styles.list}>
              {filteredTickets.map((ticket) => (
                <li key={ticket.id} className={styles.listItem}>
                  <TicketCard
                    ticket={ticket}
                    onClick={setSelectedTicket}
                    showStatusBadge
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onCloseComplete={() => setSelectedTicket(null)}
          processTicket={processTicket}
          canProcess={userRole === "school"}
        />
      )}
    </main>
  );
}

export default Tickets;
