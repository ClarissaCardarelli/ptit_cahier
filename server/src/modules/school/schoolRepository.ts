import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { School, SchoolDashboard } from "../../types/express/School";

class SchoolRepository {
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

  async readDashboardData() {
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
