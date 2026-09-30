import { prisma } from "../config/db";

async function nextInSequence(prefixLetters: string, existing: string[]): Promise<string> {
  const year = new Date().getFullYear();
  const yearPrefix = `${prefixLetters}-${year}-`;
  const maxNum = existing.reduce((max, value) => {
    const num = parseInt(value.slice(yearPrefix.length), 10);
    return Number.isFinite(num) && num > max ? num : max;
  }, 0);
  return `${yearPrefix}${String(maxNum + 1).padStart(3, "0")}`;
}

export async function generateStudentMatricule(): Promise<string> {
  const year = new Date().getFullYear();
  const yearPrefix = `ETU-${year}-`;
  const rows = await prisma.etudiant.findMany({
    where: { matricule: { startsWith: yearPrefix } },
    select: { matricule: true },
  });
  return nextInSequence("ETU", rows.map((r) => r.matricule));
}

export async function generateTeacherMatricule(): Promise<string> {
  const year = new Date().getFullYear();
  const yearPrefix = `ENS-${year}-`;
  const rows = await prisma.enseignant.findMany({
    where: { matriculeEns: { startsWith: yearPrefix } },
    select: { matriculeEns: true },
  });
  return nextInSequence("ENS", rows.map((r) => r.matriculeEns));
}
