import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const candidates = [
  { id: '1', name: 'Amina Ngom', category: 'miss', photo: 'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiante en Génie Logiciel, passionnée par l'innovation technologique et l'entrepreneuriat. Ambassadrice de l'excellence académique et de l'engagement communautaire.", badges: ['popular', 'jury'], gallery: ['https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1560461723-0fa849b3e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc2OTAxMjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: '2', name: 'Fatoumata Diallo', category: 'miss', photo: 'https://images.unsplash.com/photo-1560461723-0fa849b3e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc2OTAxMjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiante en Réseaux et Télécommunications. Passionnée par la cybersécurité et les nouvelles technologies. Membre active du club informatique de l'IAI.", badges: ['jury'], gallery: ['https://images.unsplash.com/photo-1560461723-0fa849b3e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc2OTAxMjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: null },
  { id: '3', name: 'Grace Kameni', category: 'miss', photo: 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiante en Systèmes d'Information et Management. Aspirante développeuse web et designer UI/UX. Passionnée par l'art digital et le design thinking.", badges: [], gallery: ['https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: null },
  { id: '4', name: 'Stephanie Mballa', category: 'miss', photo: 'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiante en Ingénierie des Systèmes d'Information. Grande oratrice et leader étudiante. Militante pour l'éducation des jeunes filles dans les STEM.", badges: ['popular'], gallery: ['https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: null },
  { id: '5', name: 'Kofi Mensah', category: 'master', photo: 'https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiant en Intelligence Artificielle et Big Data. Développeur Full-Stack et entrepreneur en herbe. Président du club de robotique de l'IAI.", badges: ['popular', 'jury'], gallery: ['https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZSUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080', 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: '6', name: 'Ibrahim Touré', category: 'master', photo: 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiant en Sécurité Informatique et Cybersécurité. Expert en ethical hacking et passionné par la protection des données. Leader et mentor.", badges: ['jury'], gallery: ['https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: null },
  { id: '7', name: 'Samuel Nkomo', category: 'master', photo: 'https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiant en Cloud Computing et DevOps. Passionné par l'automatisation et les infrastructures cloud. Contributeur open source actif.", badges: ['popular'], gallery: ['https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: null },
  { id: '8', name: 'David Amougou', category: 'master', photo: 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', biography: "Étudiant en Data Science et Analytics. Passionné par le machine learning et la visualisation de données. Athlète et sportif accompli.", badges: [], gallery: ['https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'], videoUrl: null },
];

const votePacks = [
  { id: 'single', votes: 1, price: 100, popular: false },
  { id: 'pack5', votes: 5, price: 500, popular: true },
  { id: 'pack12', votes: 12, price: 1000, popular: false },
];

async function main() {
  for (const c of candidates) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      create: c,
      update: { name: c.name, category: c.category, photo: c.photo, biography: c.biography, badges: c.badges, gallery: c.gallery, videoUrl: c.videoUrl },
    });
  }
  for (const p of votePacks) {
    await prisma.votePack.upsert({
      where: { id: p.id },
      create: p,
      update: { votes: p.votes, price: p.price, popular: p.popular },
    });
  }
  console.log('Seed OK');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
