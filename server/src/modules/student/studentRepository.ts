import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Student } from "../../types/express/Student";

class StudentRepository {
  async create(newStudent: Student) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO student (first_name, last_name, parent_id, classroom_id) values (?, ?, ?, ?)",
      [
        newStudent.firstName,
        newStudent.lastName,
        newStudent.parentId,
        newStudent.classroomId,
      ],
    );

    const [rows] = await databaseClient.query<Rows>(
      `SELECT
      s.id,
      s.first_name AS firstName,
      s.last_name AS lastName,
      c.id AS classroomId,
      c.name AS classroomName,
      p.id AS parentId,
      p.genre AS parentGenre,
      p.first_name AS parentFirstName,
      p.last_name AS parentLastName
     FROM student s
     JOIN classroom c ON c.id = s.classroom_id
     LEFT JOIN parent p ON p.id = s.parent_id
     WHERE s.id = ?`,
      [result.insertId],
    );

    return rows[0];
  }

  async readAllByParent(parentId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
    s.id,
    s.last_name AS lastName,
    s.first_name AS firstName,
    classroom_id AS classroomId,
    parent_id AS parentId
    FROM student AS s
    JOIN parent AS p ON s.parent_id = p.id
    WHERE p.id = ?`,
      [parentId],
    );

    return rows as Student[];
  }

  async readById(studentId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
      s.id,
      s.last_name AS lastName,
      s.first_name AS firstName,
      s.classroom_id AS classroomId,
      s.parent_id AS parentId
      FROM student AS s
      JOIN classroom AS c ON s.classroom_id = c.id
      WHERE s.id = ?`,
      [studentId],
    );

    return rows[0];
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        s.id,
        s.first_name AS firstName,
        s.last_name AS lastName,
        c.id AS classroomId,
        c.name AS classroomName,
        p.id AS parentId,
        p.genre AS parentGenre,
        p.first_name AS parentFirstName,
        p.last_name AS parentLastName
     FROM student s
     LEFT JOIN classroom c ON c.id = s.classroom_id
     LEFT JOIN parent p ON p.id = s.parent_id
     ORDER BY c.name ASC, s.last_name ASC, s.first_name ASC`,
    );

    return rows;
  }

  async delete(studentId: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM student WHERE id = ?",
      [studentId],
    );

    return result.affectedRows;
  }

  async update(studentId: number, studentData: Partial<Student>) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM student WHERE id = ?",
      [studentId],
    );

    if (!rows.length) return null;

    await databaseClient.query<Result>(
      `UPDATE student
      SET
        first_name = ?,
        last_name = ?,
        classroom_id = ?,
        parent_id = ?
      WHERE id = ?
    `,
      [
        studentData.firstName,
        studentData.lastName,
        studentData.classroomId,
        studentData.parentId,
        studentId,
      ],
    );

    const [updatedRows] = await databaseClient.query<Rows>(
      `SELECT
       s.id,
       s.first_name AS firstName,
       s.last_name AS lastName,
       c.id AS classroomId,
       c.name AS classroomName,
       p.id AS parentId,
       p.genre AS parentGenre,
       p.first_name AS parentFirstName,
       p.last_name AS parentLastName
     FROM student s
     LEFT JOIN classroom c ON c.id = s.classroom_id
     LEFT JOIN parent p ON p.id = s.parent_id
     WHERE s.id = ?`,
      [studentId],
    );

    return (updatedRows[0] as Student) ?? null;
  }
}

export default new StudentRepository();
