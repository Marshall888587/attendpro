import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding ATTENDPRO...");

  await prisma.notification.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.justificatif.deleteMany();
  await prisma.presence.deleteMany();
  await prisma.cours.deleteMany();
  await prisma.affectation.deleteMany();
  await prisma.matiere.deleteMany();
  await prisma.etudiant.deleteMany();
  await prisma.enseignant.deleteMany();
  await prisma.classe.deleteMany();
  await prisma.filiere.deleteMany();
  await prisma.utilisateur.deleteMany();

  const admin = await prisma.utilisateur.create({
    data: {
      nom: "User",
      prenom: "Admin",
      email: "admin@attendpro.edu",
      motDePasse: await hash("admin123"),
      role: "ADMIN",
      fonction: "Directeur des Études",
      departement: "Administration Centrale",
    },
  });

  const filiereInfo = await prisma.filiere.create({ data: { nomFiliere: "Génie Informatique", departement: "Sciences" } });
  const filiereTelecom = await prisma.filiere.create({ data: { nomFiliere: "Télécommunications", departement: "Sciences" } });
  const filiereMarketing = await prisma.filiere.create({ data: { nomFiliere: "Commerce & Marketing", departement: "Gestion" } });

  const teacherDefs = [
    { matriculeEns: "ENS-2024-001", nom: "Dupont", prenom: "Alain", email: "alain.dupont@attendpro.edu", specialite: "Mathématiques Avancées" },
    { matriculeEns: "ENS-2024-002", nom: "Martin", prenom: "Sophie", email: "sophie.martin@attendpro.edu", specialite: "Réseaux & Télécoms" },
    { matriculeEns: "ENS-2024-003", nom: "Leroy", prenom: "Jean", email: "jean.leroy@attendpro.edu", specialite: "Marketing Digital" },
    { matriculeEns: "ENS-2024-004", nom: "Blanc", prenom: "Bernard", email: "bernard.blanc@attendpro.edu", specialite: "Intelligence Artificielle" },
  ];

  const enseignants = [];
  for (const t of teacherDefs) {
    const user = await prisma.utilisateur.create({
      data: { nom: t.nom, prenom: t.prenom, email: t.email, motDePasse: await hash("prof123"), role: "ENSEIGNANT" },
    });
    const enseignant = await prisma.enseignant.create({
      data: { ...t, utilisateurId: user.id },
    });
    enseignants.push(enseignant);
  }

  const classeIG1 = await prisma.classe.create({
    data: { nomClasse: "Ingénierie Logicielle 1A", niveau: "Licence 1", filiereId: filiereInfo.id, effectifMax: 35, enseignantResponsableId: enseignants[0].id },
  });
  const classeRT2 = await prisma.classe.create({
    data: { nomClasse: "Réseaux & Télécoms 2B", niveau: "Licence 2", filiereId: filiereTelecom.id, effectifMax: 35, enseignantResponsableId: enseignants[1].id },
  });
  const classeMK3 = await prisma.classe.create({
    data: { nomClasse: "Marketing Digital 3A", niveau: "Licence 3", filiereId: filiereMarketing.id, effectifMax: 30, enseignantResponsableId: enseignants[2].id },
  });
  const classeIA4 = await prisma.classe.create({
    data: { nomClasse: "Intelligence Artificielle M1", niveau: "Master 1", filiereId: filiereInfo.id, effectifMax: 20, enseignantResponsableId: enseignants[3].id },
  });

  const matAlgo = await prisma.matiere.create({ data: { code: "MAT-301", nomMatiere: "Mathématiques Avancées", coefficient: 4 } });
  const matReseaux = await prisma.matiere.create({ data: { code: "RES-201", nomMatiere: "Réseaux & Télécoms", coefficient: 3 } });
  const matMarketing = await prisma.matiere.create({ data: { code: "MKT-301", nomMatiere: "Marketing Digital", coefficient: 3 } });
  const matIA = await prisma.matiere.create({ data: { code: "INF-205", nomMatiere: "Introduction à l'IA", coefficient: 3 } });

  await prisma.affectation.create({ data: { matiereId: matAlgo.id, enseignantId: enseignants[0].id, classeId: classeIG1.id } });
  await prisma.affectation.create({ data: { matiereId: matReseaux.id, enseignantId: enseignants[1].id, classeId: classeRT2.id } });
  await prisma.affectation.create({ data: { matiereId: matMarketing.id, enseignantId: enseignants[2].id, classeId: classeMK3.id } });
  const affectationIA = await prisma.affectation.create({ data: { matiereId: matIA.id, enseignantId: enseignants[3].id, classeId: classeIA4.id } });

  const studentDefs: { matricule: string; nom: string; prenom: string; classeId: number }[] = [
    { matricule: "ETU-2023-001", nom: "Diallo", prenom: "Amadou", classeId: classeIG1.id },
    { matricule: "ETU-2023-042", nom: "Ndiaye", prenom: "Bintou", classeId: classeIG1.id },
    { matricule: "ETU-2023-118", nom: "Fall", prenom: "Cheikh", classeId: classeIG1.id },
    { matricule: "ETU-2023-075", nom: "Diop", prenom: "Fatou", classeId: classeIG1.id },
    { matricule: "ETU-2023-201", nom: "Sarr", prenom: "Ibrahima", classeId: classeRT2.id },
    { matricule: "ETU-2023-089", nom: "Sow", prenom: "Khady", classeId: classeRT2.id },
    { matricule: "ETU-2023-156", nom: "Ba", prenom: "Mamadou", classeId: classeMK3.id },
    { matricule: "ETU-2023-033", nom: "Sylla", prenom: "Ndeye", classeId: classeMK3.id },
    { matricule: "ETU-2023-112", nom: "Gaye", prenom: "Ousmane", classeId: classeIA4.id },
    { matricule: "ETU-2023-245", nom: "Tall", prenom: "Rokhaya", classeId: classeIA4.id },
  ];

  const etudiants = [];
  for (const s of studentDefs) {
    const email = `${s.prenom.toLowerCase()}.${s.nom.toLowerCase()}@attendpro.edu`;
    const user = await prisma.utilisateur.create({
      data: { nom: s.nom, prenom: s.prenom, email, motDePasse: await hash("etu123"), role: "ETUDIANT" },
    });
    const etudiant = await prisma.etudiant.create({
      data: { matricule: s.matricule, nom: s.nom, prenom: s.prenom, email, classeId: s.classeId, utilisateurId: user.id },
    });
    etudiants.push(etudiant);
  }

  const seance = await prisma.cours.create({
    data: {
      affectationId: affectationIA.id,
      date: new Date(),
      heureDebut: "08:00",
      heureFin: "10:00",
      salle: "Amphi A",
      statut: "REALISE",
    },
  });

  const iaStudents = etudiants.filter((e) => e.classeId === classeIA4.id);
  for (const [i, etu] of iaStudents.entries()) {
    await prisma.presence.create({
      data: {
        etudiantId: etu.id,
        coursId: seance.id,
        statut: i === 0 ? "ABSENT" : "PRESENT",
        enregistreParId: admin.id,
      },
    });
  }

  console.log("Seed terminé.");
  console.log("Compte admin: admin@attendpro.edu / admin123");
  console.log("Compte enseignant: alain.dupont@attendpro.edu / prof123");
  console.log("Compte étudiant: amadou.diallo@attendpro.edu / etu123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
