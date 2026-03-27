import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type User = {
  id: number;
  email: string;
  hashed_password: string;
  role: "parent" | "school";
};

class UserRepository {
  async create(user: Omit<User, "id">) {
    const [result] = await databaseClient.query<Result>(
      "INSERT INTO user (email, hashed_password, role) values (?, ?, ?)",
      [user.email, user.hashed_password, user.role],
    );

    return result.insertId;
  }

  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT * 
        FROM user 
        WHERE email = ?
        LIMIT 1`,
      [email],
    );
    return (rows[0] as User) ?? null;
  }

  async delete(userId: number) {
    const [result] = await databaseClient.query<Result>(
      "DELETE FROM user WHERE id = ?",
      [userId],
    );

    return result.affectedRows;
  }
}
export default new UserRepository();
