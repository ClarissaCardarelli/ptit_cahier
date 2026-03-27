import AbstractSeeder from "./AbstractSeeder";
import AnnouncementSeeder from "./AnnouncementSeeder";

class AnnouncementStudentSeeder extends AbstractSeeder {
  constructor() {
    super({
      table: "announcement_student",
      truncate: true,
      dependencies: [AnnouncementSeeder],
    });
  }

  run() {
    const allStudents1to50 = Array.from({ length: 50 }, (_, i) => i + 1);
    const students1to10 = Array.from({ length: 10 }, (_, i) => i + 1);
    const students31to50 = Array.from({ length: 20 }, (_, i) => i + 31);

    for (let i = 0; i < 2; i++) {
      const announcementRef = this.getRef(`announcement_${i}`);
      if (!announcementRef) continue;

      for (const studentId of allStudents1to50) {
        this.insert({
          announcement_id: announcementRef.insertId,
          student_id: studentId,
        });
      }
    }

    for (let i = 2; i < 4; i++) {
      const announcementRef = this.getRef(`announcement_${i}`);
      if (!announcementRef) continue;

      for (const studentId of students1to10) {
        this.insert({
          announcement_id: announcementRef.insertId,
          student_id: studentId,
        });
      }
    }

    for (let i = 4; i < 6; i++) {
      const announcementRef = this.getRef(`announcement_${i}`);
      if (!announcementRef) continue;

      for (const studentId of students31to50) {
        this.insert({
          announcement_id: announcementRef.insertId,
          student_id: studentId,
        });
      }
    }

    for (let i = 6; i < 11; i++) {
      const announcementRef = this.getRef(`announcement_${i}`);
      if (!announcementRef) continue;

      const randomStudents = this.faker.helpers.arrayElements(
        allStudents1to50 as number[],
        { min: 1, max: 4 },
      );

      for (const studentId of randomStudents) {
        this.insert({
          announcement_id: announcementRef.insertId,
          student_id: studentId,
        });
      }
    }
  }
}

export default AnnouncementStudentSeeder;
