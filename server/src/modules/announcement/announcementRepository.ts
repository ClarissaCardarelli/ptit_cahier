import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Announcement } from "../../types/express/Announcement";
import type { AnnouncementNew } from "../../types/express/AnnouncementNew";

class AnnouncementRepository {
  async create(newAnnouncement: AnnouncementNew) {
    const { title, content, announcementCategoryId, studentIds } =
      newAnnouncement;

    const [result] = await databaseClient.query<Result>(
      `INSERT INTO announcement (title, content, announcement_category_id)
			VALUES (?, ?, ?)`,
      [title, content, announcementCategoryId],
    );

    const newAnnouncementId = result.insertId;

    const announcementStudentValues = studentIds.map((studentId) => [
      newAnnouncementId,
      studentId,
    ]);

    await databaseClient.query<Result>(
      "INSERT INTO announcement_student (announcement_id, student_id) VALUES ?",
      [announcementStudentValues],
    );

    return newAnnouncementId;
  }

  async delete(announcementId: number) {
    await databaseClient.query<Result>(
      "DELETE FROM announcement_student WHERE announcement_id = ?",
      [announcementId],
    );

    const [result] = await databaseClient.query<Result>(
      "DELETE FROM announcement WHERE id = ?",
      [announcementId],
    );

    return result.affectedRows;
  }

  async readAllByParent(
    parentId: number,
    categoryId?: number,
    studentId?: number,
    limit?: number,
  ) {
    let sql = `
    SELECT 
      a.id,
      a.title,
      a.content,
      a.created_at AS createdAt,
      ac.name AS announcementCategoryName,
      GROUP_CONCAT(s.first_name SEPARATOR ', ') AS studentNames
    FROM announcement AS a
    JOIN announcement_category AS ac ON a.announcement_category_id = ac.id
    JOIN announcement_student AS ann_stu ON a.id = ann_stu.announcement_id
    JOIN student AS s ON ann_stu.student_id = s.id
    WHERE s.parent_id = ?
  `;

    const sqlParams: (number | string)[] = [parentId];

    if (categoryId) {
      sql += " AND a.announcement_category_id = ? ";
      sqlParams.push(categoryId);
    }

    if (studentId) {
      sql += " AND s.id = ? ";
      sqlParams.push(studentId);
    }

    sql += `
    GROUP BY a.id, ac.name, a.created_at
    ORDER BY a.created_at DESC
  `;

    if (limit) {
      sql += " LIMIT ?";
      sqlParams.push(limit);
    }

    const [rows] = await databaseClient.query<Rows>(sql, sqlParams);
    return rows as Announcement[];
  }

  async readAll(categoryId?: number) {
    let sql = `
    SELECT 
      a.id, 
      a.title, 
      a.content, 
      a.created_at AS createdAt,
      ac.name AS announcementCategoryName,
      COUNT(DISTINCT s.id) AS studentCount,
      (
        SELECT COUNT(*) 
        FROM student s2 
        JOIN classroom c2 ON s2.classroom_id = c2.id 
      ) AS totalStudents,
      GROUP_CONCAT(DISTINCT CONCAT(s.first_name, ' ', s.last_name) SEPARATOR ', ') AS studentNames,
      GROUP_CONCAT( c.name SEPARATOR ',') AS classroomNames
    FROM announcement AS a
    JOIN announcement_category AS ac ON a.announcement_category_id = ac.id
    JOIN announcement_student AS ans ON ans.announcement_id = a.id
    JOIN student AS s ON ans.student_id = s.id
    JOIN classroom AS c ON s.classroom_id = c.id`;

    const queryParams = [];

    if (categoryId !== undefined && categoryId !== null) {
      sql += " AND a.announcement_category_id = ?";
      queryParams.push(categoryId);
    }

    sql += `
    GROUP BY a.id, ac.name, a.created_at
    ORDER BY a.created_at DESC`;

    const [rows] = await databaseClient.query<Rows>(sql, queryParams);
    return rows as Announcement[];
  }
}

export default new AnnouncementRepository();
