CREATE TABLE user (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('parent', 'school') NOT NULL
);

CREATE TABLE announcement_category (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(120),
    color VARCHAR(6) NOT NULL,
    icon VARCHAR(20) NOT NULL
);

CREATE TABLE ticket_category (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(120),
    color VARCHAR(6) NOT NULL,
    icon VARCHAR(20) NOT NULL
);

CREATE TABLE school (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    photo_url VARCHAR(255) NULL,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE parent (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    last_name VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    genre ENUM('M', 'F') NOT NULL,
    photo_url VARCHAR(255) NULL,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE classroom (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL
);

CREATE TABLE announcement (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(120) NOT NULL,
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        
    announcement_category_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (announcement_category_id) REFERENCES announcement_category(id)
);

CREATE TABLE student (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    last_name VARCHAR(120) NOT NULL,
    first_name VARCHAR(120) NOT NULL,
    classroom_id INT unsigned NOT NULL,
    parent_id INT unsigned NULL,
    FOREIGN KEY (classroom_id) REFERENCES classroom(id),
    FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE SET NULL
);

CREATE TABLE announcement_student (
    announcement_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (announcement_id, student_id),
    FOREIGN KEY (announcement_id) REFERENCES announcement(id),
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

CREATE TABLE ticket (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(1000) NOT NULL,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed TINYINT(1) NOT NULL DEFAULT 0,
    parent_id INT UNSIGNED NULL,
    ticket_category_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE SET NULL,
    FOREIGN KEY (ticket_category_id) REFERENCES ticket_category(id)
);

CREATE TABLE ticket_student ( 
    ticket_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (ticket_id, student_id),
    FOREIGN KEY (ticket_id) REFERENCES ticket(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE
);

INSERT INTO user (email, hashed_password, role)
VALUES
("example@school1.com", "$argon2id$v=19$m=19456,t=2,p=1$xsYzDUDCSLYdyxW34L88bw$kfEBBkMtmsHPuN7RVZYJ8tNfG6jj1an6aUB5Tiobf+c", "school"),
("example@parent1.com", "$argon2id$v=19$m=19456,t=2,p=1$xsYzDUDCSLYdyxW34L88bw$kfEBBkMtmsHPuN7RVZYJ8tNfG6jj1an6aUB5Tiobf+c", "parent"),
("example@parent2.com", "$argon2id$v=19$m=19456,t=2,p=1$xsYzDUDCSLYdyxW34L88bw$kfEBBkMtmsHPuN7RVZYJ8tNfG6jj1an6aUB5Tiobf+c", "parent");

INSERT INTO announcement_category (id, name, description, color, icon)
VALUES
(1, "Vie de l'école", 
 "Actualités et moments de vie de l'école (Projets, activités, sorties...)", 
 "6d5bd0", "School"),

(2, "Administratif", 
 "Communications administratives (Bulletins, absences, rappels…)", 
 "16a249", "ClipboardList"),

(3, "Evénement", 
 "Événements et temps forts à venir (Fêtes, spectacles…)", 
 "0da2e7", "CalendarDays");

INSERT INTO ticket_category (id, name, description, color, icon)
VALUES
(1, "Urgence", "Informer d'une situation nécessitant une action rapide (Changement de personne, incident…)", "e5484d", "OctagonAlert"),
(2, "Absence", "Signaler une absence prévue ou imprévue (Maladie, rendez-vous médical, retard…)", "f97015", "CalendarCheck"),
(3, "Divers", "Poser une question ou obtenir un renseignement (Cantine, horaires, documents…)", "16a249", "NotebookPen"),
(4, "Autorisation", "Demander une permission ou un accord spécifique (Sortie anticipée, droit à l'image…)", "0da2e7", "ShieldUser");

INSERT INTO school (name, photo_url, user_id)
VALUES
("École Primaire Émile Zola", "/images/schools/school_profile_1_zola.png", 1);

INSERT INTO parent (last_name, first_name, genre, photo_url, user_id)
VALUES
("Dupont", "Jean", "M", "/images/parents/parent_profile_male.png", 2),
("Martin", "Marie", "F", "/images/parents/parent_profile_female.png", 3);

INSERT INTO classroom (name)
VALUES
("CP"),
("CE1"),
("CE2"),
("CM1"),
("CM2");

INSERT INTO student (last_name, first_name, classroom_id, parent_id)
VALUES
("Dupont", "Lucas", 1, 1),
("Martin", "Léa", 1, 2),
("Bernard", "Léo", 1, NULL),
("Thomas", "Chloé", 1, NULL),
("Petit", "Louis", 1, NULL),
("Robert", "Emma", 1, NULL),
("Richard", "Gabriel", 1, NULL),
("Durand", "Jade", 1, NULL),
("Dubois", "Arthur", 1, NULL),
("Moreau", "Manon", 1, NULL),

("Dupont", "Rose", 2, 1),
("Laurent", "Jules", 2, NULL),
("Simon", "Louise", 2, NULL),
("Michel", "Raphaël", 2, NULL),
("Lefebvre", "Alice", 2, NULL),
("Leroy", "Adam", 2, NULL),
("Roux", "Lina", 2, NULL),
("David", "Maël", 2, NULL),
("Bertrand", "Mila", 2, NULL),
("Morel", "Liam", 2, NULL),

("Girard", "Noah", 3, NULL),
("Bonnet", "Anna", 3, NULL),
("Dupuis", "Paul", 3, NULL),
("Lambert", "Inès", 3, NULL),
("Faure", "Ethan", 3, NULL),
("Rousseau", "Sarah", 3, NULL),
("Blanc", "Sacha", 3, NULL),
("Guerin", "Julia", 3, NULL),
("Muller", "Gabin", 3, NULL),
("Henry", "Ambre", 3, NULL),

("Roussel", "Nathan", 4, NULL),
("Nicolas", "Zoé", 4, NULL),
("Perrin", "Mohamed", 4, NULL),
("Morin", "Juliette", 4, NULL),
("Mathieu", "Aaron", 4, NULL),
("Clement", "Léna", 4, NULL),
("Gauthier", "Tom", 4, NULL),
("Dumont", "Agathe", 4, NULL),
("Lopez", "Théo", 4, NULL),
("Fontaine", "Mia", 4, NULL),

("Chevalier", "Léon", 5, NULL),
("Masson", "Isaac", 5, NULL),
("Sanchez", "Charlotte", 5, NULL),
("Gerard", "Noé", 5, NULL),
("Nguyen", "Eva", 5, NULL),
("Boyer", "Marius", 5, NULL),
("Denis", "Jeanne", 5, NULL),
("Lemaire", "Victor", 5, NULL),
("Duval", "Nina", 5, NULL),
("Joly", "Mathis", 5, NULL);
