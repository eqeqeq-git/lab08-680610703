import { Router, type Request, type Response } from "express";
import { zStudentId, zCourseId } from "../libs/zodValidators.js";
import type { Student, Course, Enrollment } from "../libs/types.js";
import { students, courses, enrollments } from "../db/db.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.query;

    const hasStudentId = studentId !== undefined;
    const hasCourseId = courseId !== undefined;

    if ((!hasStudentId && !hasCourseId) || (hasStudentId && hasCourseId)) {
      return res.status(400).json({
        ok: false,
        message: "Please provide either studentId or courseId and not both!",
      });
    }

    if (hasCourseId) {
      const parseResult = zCourseId.safeParse(courseId);
      if (!parseResult.success) {
        return res.status(400).json({
          ok: false,
          message: parseResult.error.issues[0]?.message,
        });
      }

      const studentIds = enrollments
        .filter((e: Enrollment) => e.courseId === courseId)
        .map((e: Enrollment) => e.studentId);

      const enrolledStudents = students
        .filter((s: Student) => studentIds.includes(s.studentId))
        .map((s: Student) => ({
          studentId: s.studentId,
          firstName: s.firstName,
          lastName: s.lastName,
          program: s.program,
        }));

      return res.status(200).json({
        ok: true,
        students: enrolledStudents,
      });
    }

    const parseResult = zStudentId.safeParse(studentId);
    if (!parseResult.success) {
      return res.status(400).json({
        ok: false,
        message: parseResult.error.issues[0]?.message,
      });
    }

    const courseIds = enrollments
      .filter((e: Enrollment) => e.studentId === studentId)
      .map((e: Enrollment) => e.courseId);

    const enrolledCourses = courses
      .filter((c: Course) => courseIds.includes(c.courseId))
      .map((c: Course) => ({
        courseId: c.courseId,
        title: c.courseTitle,
      }));

    return res.status(200).json({
      ok: true,
      courses: enrolledCourses,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
