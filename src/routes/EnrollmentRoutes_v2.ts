import { Router, type Request, type Response } from "express";
import { zStudentId, zCourseId } from "../libs/zodValidators.js";
import type { Enrollment } from "../libs/types.js";
import { enrollments } from "../db/db.js";

const router = Router();

router.delete("/", (req: Request, res: Response) => {
  try {
    const body = req.body as { studentId?: string; courseId?: string };

    const studentIdResult = zStudentId.safeParse(body.studentId);
    if (!studentIdResult.success) {
      return res.status(400).json({
        ok: false,
        message: studentIdResult.error.issues[0]?.message,
      });
    }

    const courseIdResult = zCourseId.safeParse(body.courseId);
    if (!courseIdResult.success) {
      return res.status(400).json({
        ok: false,
        message: courseIdResult.error.issues[0]?.message,
      });
    }

    const foundIndex = enrollments.findIndex(
      (e: Enrollment) =>
        e.studentId === body.studentId && e.courseId === body.courseId,
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Enrollment does not exist",
      });
    }

    enrollments.splice(foundIndex, 1);

    return res.status(200).json({
      ok: true,
      message: "Enrollment has been deleted",
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
