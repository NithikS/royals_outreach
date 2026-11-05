"use server";

import { db } from "@/db";
import { studentUserData } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CURRENT_STUDENT_ID } from "@/lib/currentStudent";

export type CurrentStudent = {
  studentId: number;
  fName: string;
  lName: string;
};

//--------------------------------------------------------------------------------------//
//                                         Read                                         //
//--------------------------------------------------------------------------------------//

export const getCurrentStudent = async (): Promise<CurrentStudent | null> => {
  const [student] = await db
    .select()
    .from(studentUserData)
    .where(eq(studentUserData.studentId, CURRENT_STUDENT_ID));
  if (!student) return null;

  return {
    studentId: student.studentId,
    fName: student.fName ?? "",
    lName: student.lName ?? "",
  };
};
