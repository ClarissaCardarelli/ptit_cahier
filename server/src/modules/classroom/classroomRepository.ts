import databaseClient from "../../../database/client";
import type { Rows } from "../../../database/client";
import type { Classroom } from "../../types/express/Classroom";

class ClassroomRepository {
  async readAll() {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT DISTINCT
        c.id,
        c.name 
     FROM classroom AS c`,
    );

    return rows as Classroom[];
  }

  async readById(classroomId: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT * FROM classroom WHERE id = ?",
      [classroomId],
    );

    return (rows[0] as Classroom) ?? null;
  }

  async create(schoolId: number) {
    const classNames = ["CP", "CE1", "CE2", "CM1", "CM2"];

    const classroomValues = classNames.map((className) => [
      className,
      schoolId,
    ]);

    await databaseClient.query(
      "INSERT INTO classroom (name, school_id) VALUES ?",
      [classroomValues],
    );
  }
}
export default new ClassroomRepository();
