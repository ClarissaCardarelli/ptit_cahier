import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { School, SchoolDashboard } from "../../types/express/School";

class SchoolRepository {
  // async create(schoolName: string, newUserId: number) {
  //   const [result] = await databaseClient.query<Result>(
  //     "INSERT INTO school (name, user_id) values (?, ?)",
  //     [schoolName, newUserId],
  //   );

  //   return result.insertId;
  // }

  async readByUserId(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT
        id,
        name,
        photo_url AS photoUrl
        FROM school
        WHERE user_id = ?
        LIMIT 1`,
      [userId],
    );
    return (rows[0] as School) ?? null;
  }

  // async readByParent(parentId: number) {
  //   const [rows] = await databaseClient.query<Rows>(
  //     `SELECT DISTINCT sc.id, sc.name
  //      FROM parent AS p
  //      JOIN student AS s ON s.parent_id = p.id
  //      JOIN classroom AS c ON s.classroom_id = c.id
  //      JOIN school AS sc ON c.school_id = sc.id
  //      WHERE p.id = ?
  //      LIMIT 1`,
  //     [parentId],
  //   );
  //   return (rows[0] as School) ?? null;
  // }

  async getDashboardData() {
    const sql = `
      SELECT 
      (SELECT COUNT(*) FROM announcement) AS totalAnnouncements,
      (SELECT COUNT(*) FROM classroom) AS totalClassrooms,
      (SELECT COUNT(*) FROM student) AS totalStudents,
      (SELECT COUNT(DISTINCT p.id) 
       FROM parent p 
       JOIN student st2 ON st2.parent_id = p.id) AS totalParents`;

    const [rows] = await databaseClient.query<Rows>(sql);

    return (rows[0] as SchoolDashboard) ?? null;
  }
}

export default new SchoolRepository();
