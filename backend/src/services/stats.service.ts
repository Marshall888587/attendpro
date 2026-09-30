import { prisma } from "../config/db";

export async function getDashboardStats() {
  const [totalEtudiants, totalEnseignants, totalClasses, presences] = await Promise.all([
    prisma.etudiant.count({ where: { statut: "ACTIF" } }),
    prisma.enseignant.count({ where: { statut: "ACTIF" } }),
    prisma.classe.count(),
    prisma.presence.findMany({ select: { statut: true } }),
  ]);

  const tauxPresence = presences.length
    ? Math.round((presences.filter((p) => p.statut === "PRESENT").length / presences.length) * 1000) / 10
    : 0;

  const classes = await prisma.classe.findMany({
    include: { etudiants: { include: { presences: true } } },
    take: 5,
  });

  const presenceParClasse = classes
    .map((c) => {
      const all = c.etudiants.flatMap((e) => e.presences);
      const taux = all.length ? Math.round((all.filter((p) => p.statut === "PRESENT").length / all.length) * 100) : 0;
      return { classe: c.nomClasse, taux };
    })
    .sort((a, b) => b.taux - a.taux)
    .slice(0, 5);

  return { totalEtudiants, totalEnseignants, totalClasses, tauxPresence, presenceParClasse };
}

export async function getReportStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [allPresences, absencesCeMois] = await Promise.all([
    prisma.presence.findMany({ select: { statut: true, etudiant: { select: { classeId: true } } } }),
    prisma.presence.count({ where: { statut: "ABSENT", cours: { date: { gte: startOfMonth } } } }),
  ]);

  const tauxPresenceGlobal = allPresences.length
    ? Math.round((allPresences.filter((p) => p.statut === "PRESENT").length / allPresences.length) * 1000) / 10
    : 0;

  const parClasse = new Map<number, { present: number; total: number }>();
  for (const p of allPresences) {
    const entry = parClasse.get(p.etudiant.classeId) ?? { present: 0, total: 0 };
    entry.total += 1;
    if (p.statut === "PRESENT") entry.present += 1;
    parClasse.set(p.etudiant.classeId, entry);
  }
  const moyennes = [...parClasse.values()].map((v) => (v.total ? (v.present / v.total) * 100 : 0));
  const moyenneParClasse = moyennes.length
    ? Math.round((moyennes.reduce((a, b) => a + b, 0) / moyennes.length) * 10) / 10
    : 0;

  const matieres = await prisma.matiere.findMany({
    include: { affectations: { include: { cours: { include: { presences: true } } } } },
  });
  const presenceParMatiere = matieres.map((m) => {
    const presences = m.affectations.flatMap((a) => a.cours.flatMap((c) => c.presences));
    const taux = presences.length
      ? Math.round((presences.filter((p) => p.statut === "PRESENT").length / presences.length) * 100)
      : 0;
    return { matiere: m.nomMatiere, taux };
  });

  const enseignants = await prisma.enseignant.findMany({
    include: { affectations: { include: { cours: { include: { presences: true } } } } },
  });
  const presenceParEnseignant = enseignants
    .map((ens) => {
      const presences = ens.affectations.flatMap((a) => a.cours.flatMap((c) => c.presences));
      const taux = presences.length
        ? Math.round((presences.filter((p) => p.statut === "PRESENT").length / presences.length) * 100)
        : 0;
      return { enseignant: `${ens.prenom} ${ens.nom}`, taux, seances: presences.length };
    })
    .filter((e) => e.seances > 0);

  const etudiants = await prisma.etudiant.findMany({
    include: { classe: true, presences: { where: { statut: "ABSENT" }, orderBy: { heureEnregistrement: "desc" } } },
  });
  const topAbsences = etudiants
    .map((e) => ({
      id: e.id,
      nom: `${e.prenom} ${e.nom}`,
      classe: e.classe.nomClasse,
      absencesInjustifiees: e.presences.length,
      derniereAbsence: e.presences[0]?.heureEnregistrement ?? null,
    }))
    .filter((e) => e.absencesInjustifiees > 0)
    .sort((a, b) => b.absencesInjustifiees - a.absencesInjustifiees)
    .slice(0, 10);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const recentAbsences = await prisma.presence.findMany({
    where: { statut: "ABSENT", cours: { date: { gte: sixMonthsAgo } } },
    select: { cours: { select: { date: true } } },
  });

  const monthBuckets: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    monthBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      count: 0,
    });
  }
  for (const a of recentAbsences) {
    const d = a.cours.date;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.count += 1;
  }
  const evolutionAbsences = monthBuckets.map((b) => ({ mois: b.label, count: b.count }));

  return {
    tauxPresenceGlobal,
    absencesCeMois,
    moyenneParClasse,
    presenceParMatiere,
    presenceParEnseignant,
    topAbsences,
    evolutionAbsences,
  };
}

export async function getStudentStats(etudiantId: number) {
  const presences = await prisma.presence.findMany({
    where: { etudiantId },
    include: { cours: { include: { affectation: { include: { matiere: true } } } } },
    orderBy: { cours: { date: "desc" } },
  });

  const total = presences.length;
  const presents = presences.filter((p) => p.statut === "PRESENT").length;
  const absents = presences.filter((p) => p.statut === "ABSENT").length;
  const retards = presences.filter((p) => p.statut === "RETARD").length;
  const justifiees = presences.filter((p) => p.statut === "ABSENCE_JUSTIFIEE").length;
  const taux = total ? Math.round((presents / total) * 1000) / 10 : 0;

  return { totalSeances: total, presents, absents, retards, justifiees, taux, presences };
}
