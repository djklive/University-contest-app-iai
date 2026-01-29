export interface Candidate {
  id: string;
  name: string;
  category: 'miss' | 'master';
  photo: string;
  votes: number;
  biography: string;
  badges: ('jury' | 'popular')[];
  gallery: string[];
  videoUrl?: string;
}

export const candidates: Candidate[] = [
  {
    id: '1',
    name: 'Amina Ngom',
    category: 'miss',
    photo: 'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 2847,
    badges: ['popular', 'jury'],
    biography: 'Étudiante en Génie Logiciel, passionnée par l\'innovation technologique et l\'entrepreneuriat. Ambassadrice de l\'excellence académique et de l\'engagement communautaire.',
    gallery: [
      'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1560461723-0fa849b3e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc2OTAxMjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '2',
    name: 'Fatoumata Diallo',
    category: 'miss',
    photo: 'https://images.unsplash.com/photo-1560461723-0fa849b3e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc2OTAxMjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 2134,
    badges: ['jury'],
    biography: 'Étudiante en Réseaux et Télécommunications. Passionnée par la cybersécurité et les nouvelles technologies. Membre active du club informatique de l\'IAI.',
    gallery: [
      'https://images.unsplash.com/photo-1560461723-0fa849b3e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwd29tYW4lMjBlbGVnYW50fGVufDF8fHx8MTc2OTAxMjQ5OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: '3',
    name: 'Grace Kameni',
    category: 'miss',
    photo: 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 1956,
    badges: [],
    biography: 'Étudiante en Systèmes d\'Information et Management. Aspirante développeuse web et designer UI/UX. Passionnée par l\'art digital et le design thinking.',
    gallery: [
      'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: '4',
    name: 'Stephanie Mballa',
    category: 'miss',
    photo: 'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 1782,
    badges: ['popular'],
    biography: 'Étudiante en Ingénierie des Systèmes d\'Information. Grande oratrice et leader étudiante. Militante pour l\'éducation des jeunes filles dans les STEM.',
    gallery: [
      'https://images.unsplash.com/photo-1657446969468-3953de8a053b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2OTEwMjExMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: '5',
    name: 'Kofi Mensah',
    category: 'master',
    photo: 'https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 3124,
    badges: ['popular', 'jury'],
    biography: 'Étudiant en Intelligence Artificielle et Big Data. Développeur Full-Stack et entrepreneur en herbe. Président du club de robotique de l\'IAI.',
    gallery: [
      'https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZSUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: '6',
    name: 'Ibrahim Touré',
    category: 'master',
    photo: 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 2567,
    badges: ['jury'],
    biography: 'Étudiant en Sécurité Informatique et Cybersécurité. Expert en ethical hacking et passionné par la protection des données. Leader et mentor.',
    gallery: [
      'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: '7',
    name: 'Samuel Nkomo',
    category: 'master',
    photo: 'https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 2341,
    badges: ['popular'],
    biography: 'Étudiant en Cloud Computing et DevOps. Passionné par l\'automatisation et les infrastructures cloud. Contributeur open source actif.',
    gallery: [
      'https://images.unsplash.com/photo-1681011297636-bcb4d50e5073?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMGFmcmljYW4lMjBtYW4lMjBmb3JtYWx8ZW58MXx8fHwxNzY5MTAyMTEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
  {
    id: '8',
    name: 'David Amougou',
    category: 'master',
    photo: 'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    votes: 1923,
    badges: [],
    biography: 'Étudiant en Data Science et Analytics. Passionné par le machine learning et la visualisation de données. Athlète et sportif accompli.',
    gallery: [
      'https://images.unsplash.com/photo-1624574337423-7ea725c5540c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwc3R1ZGVudCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NjkxMDIxMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    ],
  },
];

export interface VotePack {
  id: string;
  votes: number;
  price: number;
  popular?: boolean;
}

export const votePacks: VotePack[] = [
  { id: 'single', votes: 1, price: 100 },
  { id: 'pack5', votes: 5, price: 500, popular: true },
  { id: 'pack12', votes: 12, price: 1000 },
];
