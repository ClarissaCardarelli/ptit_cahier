import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";
import type { Ticket } from "../../types/express/Ticket";
import type { TicketNew } from "../../types/express/TicketNew";

class TicketRepository {
  async create(newTicket: TicketNew, parentId: number) {
    const { content, ticketCategoryId, studentIds } = newTicket;

    const [result] = await databaseClient.query<Result>(
      "INSERT INTO ticket (content, parent_id, ticket_category_id) VALUES (?, ?, ?)",
      [content, parentId, ticketCategoryId],
    );

    const newTicketId = result.insertId;

    const ticketStudentValues = studentIds.map((studentId) => [
      newTicketId,
      studentId,
    ]);

    await databaseClient.query(
      "INSERT INTO ticket_student (ticket_id, student_id) VALUES ?",
      [ticketStudentValues],
    );

    return newTicketId;
  }

  async readAll(limit?: number) {
    let sql = `
    SELECT
      t.id,
      t.content,
      t.created_at AS createdAt,        
      t.processed AS processed,
      tc.name AS ticketCategoryName,
      p.genre,
      p.first_name AS parentFirstName,
      p.last_name AS parentLastName,
      GROUP_CONCAT(
          CONCAT(s.first_name, ' ', s.last_name)
          ORDER BY s.first_name
          SEPARATOR ', '
      ) AS studentNames
    FROM ticket AS t    
    JOIN ticket_category AS tc ON t.ticket_category_id = tc.id    
    JOIN parent AS p ON t.parent_id = p.id   
    JOIN ticket_student AS tic_stu ON tic_stu.ticket_id = t.id     
    JOIN student AS s ON tic_stu.student_id = s.id
    JOIN classroom AS c ON s.classroom_id = c.id    
    GROUP BY t.id
    ORDER BY t.created_at DESC`;

    const sqlParams = [];

    if (limit) {
      sql += " LIMIT ?";
      sqlParams.push(limit);
    }

    const [rows] = await databaseClient.query<Rows>(sql, sqlParams);
    return rows as Ticket[];
  }

  async readAllByParent(parentId: number, limit?: number) {
    let sql = `
    SELECT
      t.id,
      t.content,
      t.created_at AS createdAt,
      t.processed AS processed,       
      tc.name AS ticketCategoryName,
      p.genre,
      p.first_name AS parentFirstName,
      p.last_name AS parentLastName,
      GROUP_CONCAT(s.first_name SEPARATOR ', ') AS studentNames
    FROM ticket AS t    
    JOIN ticket_category AS tc ON t.ticket_category_id = tc.id
    JOIN parent AS p ON t.parent_id = p.id
    JOIN ticket_student AS ts ON ts.ticket_id = t.id
    JOIN student AS s ON ts.student_id = s.id
    WHERE t.parent_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

    const sqlParams: number[] = [parentId];

    if (limit) {
      sql += " LIMIT ?";
      sqlParams.push(limit);
    }

    const [rows] = await databaseClient.query<Rows>(sql, sqlParams);
    return rows as Ticket[];
  }

  async updateStatus(ticketId: number, processed: boolean) {
    const [result] = await databaseClient.query<Result>(
      "UPDATE ticket SET processed = ? WHERE id = ?",
      [processed ? 1 : 0, ticketId],
    );

    return result.affectedRows > 0;
  }
}
export default new TicketRepository();
