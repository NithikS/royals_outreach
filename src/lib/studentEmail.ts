export const STUDENT_EMAIL_DOMAIN = "hsestudents.org";

// True for a school student address, case-insensitive, e.g.:
//   isStudentEmail("Aang.Smith@HSEStudents.org") -> true
//   isStudentEmail("aang@gmail.com")             -> false
export function isStudentEmail(email: string): boolean {
  return new RegExp(`^[^\\s@]+@${STUDENT_EMAIL_DOMAIN.replace(".", "\\.")}$`, "i").test(email.trim());
}
