import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Parent } from "../../types/express/Parent";

class ParentRepository {
  async readByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT 
        p.id,
        p.genre,
        p.first_name AS firstName,
        p.last_name AS lastName,
        photo_url AS photoUrl
        FROM parent AS p
        WHERE user_id = ?
        LIMIT 1`,
      [userId],
    );
    return (rows[0] as Parent) ?? null;
  }

  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT DISTINCT
        p.id,
        p.genre,
        p.first_name AS firstName,
        p.last_name AS lastName,
        u.email
     FROM parent AS p
     JOIN user AS u ON u.id = p.user_id`,
    );

    return rows as Parent[];
  }

  async readById(parentId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT 
        p.id,
        p.user_id AS userId
        FROM parent AS p
        WHERE id = ?`,
      [parentId],
    );

    return (rows[0] as Parent) ?? null;
  }

  async create(newParent: Parent) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO parent (first_name, last_name, genre, user_id) values (?, ?, ?, ?)",
      [
        newParent.firstName,
        newParent.lastName,
        newParent.genre,
        newParent.userId,
      ],
    );

    const [rows] = await databaseClient.query<Rows>(
      `SELECT 
        p.id,
        p.genre,
        p.first_name AS firstName,
        p.last_name AS lastName,
        u.email
      FROM parent AS p
      JOIN user AS u ON u.id = p.user_id
      WHERE p.id = ?`,
      [result.insertId],
    );

    return rows[0];
  }

  async update(parentId: number, parentData: Partial<Parent>) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM parent WHERE id = ?",
      [parentId],
    );

    if (!rows.length) return null;

    await databaseClient.query<Result>(
      `UPDATE parent
        SET
        first_name = ?,
        last_name = ?,
        genre = ?
        WHERE id = ?`,
      [parentData.firstName, parentData.lastName, parentData.genre, parentId],
    );

    const [updatedRows] = await databaseClient.query<Rows>(
      `SELECT
        p.id,
        p.genre,
        p.first_name AS firstName,
        p.last_name AS lastName,
        u.email
      FROM parent AS p
      JOIN user AS u ON u.id = p.user_id
      WHERE p.id = ?`,
      [parentId],
    );

    return (updatedRows[0] as Parent) ?? null;
  }
}

export default new ParentRepository();
