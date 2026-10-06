import type { UserRole } from '@/types';

export type DemoProject = {
  id: string;
  title: string;
  sponsor: string;
  domain: string;
  summary: string;
  status: 'In progress' | 'Recruiting' | 'Planning';
  progress: number;
  deadline: string;
  reward: string;
  members: number;
  tags: string[];
  icon: string;
  color: string;
};

export const demoProjects: DemoProject[] = [
  {
    id: 'medical-image-analysis',
    title: 'AI for Medical Image Analysis',
    sponsor: 'MedScan Labs',
    domain: 'Medical imaging',
    summary: 'Develop interpretable AI models to support early detection of brain tumors using MRI scans.',
    status: 'In progress',
    progress: 60,
    deadline: 'Due in 6 days',
    reward: '2,000 credits',
    members: 8,
    tags: ['Research', 'Implementation', 'Confidential'],
    icon: 'MRI',
    color: 'rose',
  },
  {
    id: 'battery-materials',
    title: 'Sustainable Battery Material Discovery',
    sponsor: 'GreenFuture Inc.',
    domain: 'Materials science',
    summary: 'Identify lower-impact battery materials using an open, reproducible materials dataset.',
    status: 'Recruiting',
    progress: 30,
    deadline: 'Due in 12 days',
    reward: '1,500 credits',
    members: 5,
    tags: ['Research', 'Simulation'],
    icon: 'BAT',
    color: 'blue',
  },
  {
    id: 'climate-data-analysis',
    title: 'Climate Change Data Analysis',
    sponsor: 'Open Climate Institute',
    domain: 'Climate research',
    summary: 'Compare regional climate indicators and identify changes relevant to local planning.',
    status: 'Planning',
    progress: 15,
    deadline: 'Due in 3 weeks',
    reward: '900 credits',
    members: 6,
    tags: ['Data', 'Research'],
    icon: 'CLM',
    color: 'emerald',
  },
  {
    id: 'quantum-materials',
    title: 'Quantum Materials Simulation',
    sponsor: 'Northstar Research',
    domain: 'Quantum materials',
    summary: 'Reproduce and document computational experiments for next-generation materials.',
    status: 'In progress',
    progress: 45,
    deadline: 'Due in 18 days',
    reward: '1,200 credits',
    members: 4,
    tags: ['Simulation', 'Implementation'],
    icon: 'QMS',
    color: 'violet',
  },
  {
    id: 'urban-air-quality',
    title: 'Urban Air Quality Prediction',
    sponsor: 'Civic Futures Lab',
    domain: 'Environmental health',
    summary: 'Explore neighborhood-level air-quality signals to improve public-health planning.',
    status: 'Recruiting',
    progress: 20,
    deadline: 'Due in 2 weeks',
    reward: '750 credits',
    members: 7,
    tags: ['Research', 'Data'],
    icon: 'AIR',
    color: 'amber',
  },
];

export const demoSkills = [
  { name: 'Python', score: 92, status: 'Verified', tone: 'blue', detail: 'Data analysis · verified by skills assessment' },
  { name: 'Machine Learning', score: 88, status: 'Verified', tone: 'rose', detail: 'Model development · mentor confirmed' },
  { name: 'Computer Vision', score: 0, status: 'Pending test', tone: 'indigo', detail: 'Assessment available · 20 minutes' },
  { name: 'Research Writing', score: 85, status: 'Verified', tone: 'violet', detail: 'Scientific communication · reviewed' },
  { name: 'Data Visualization', score: 78, status: 'Mentor review', tone: 'emerald', detail: 'Portfolio submitted for review' },
];

export const demoNotifications = [
  { title: 'Mentor approved your access to Dataset v2', detail: 'AI for Medical Image Analysis', time: '2 min ago', tone: 'rose' },
  { title: 'New assignment in AI for Medical Image Analysis', detail: 'Baseline model and evaluation', time: '1 hr ago', tone: 'amber' },
  { title: 'Skill test result available: Python (92%)', detail: 'Your profile skill list has been updated', time: '3 hr ago', tone: 'emerald' },
  { title: 'AI analysis report for your submission is ready', detail: 'Urban air quality research', time: '5 hr ago', tone: 'blue' },
  { title: 'Message from Dr. Ananya Rao', detail: 'Research Workspace', time: '6 hr ago', tone: 'indigo' },
];

export const demoActivity = [
  { name: 'Submitted experiment results', detail: 'AI for Medical Image Analysis', time: '2 hr ago', initials: 'SS', tone: 'blue' },
  { name: 'Ran AI Agent (Model Analysis)', detail: 'AI Workspace', time: '4 hr ago', initials: 'AI', tone: 'indigo' },
  { name: 'Access request sent for Dataset v3', detail: 'AI for Medical Image Analysis', time: '6 hr ago', initials: 'AC', tone: 'rose' },
  { name: 'Joined Sustainable Battery Material Discovery', detail: 'Research team', time: 'Yesterday', initials: 'SS', tone: 'emerald' },
];

export const demoPeople = [
  { name: 'Dr. Ananya Rao', role: 'Research lead', skills: ['Medical imaging', 'Python'], status: 'Available', initials: 'AR' },
  { name: 'Prof. Sharma', role: 'Mentor', skills: ['Machine learning', 'Research review'], status: 'Available', initials: 'PS' },
  { name: 'Priya Nair', role: 'Student researcher', skills: ['Computer vision', 'Python'], status: 'Matched', initials: 'PN' },
  { name: 'Karan Patel', role: 'Researcher', skills: ['Materials science', 'Simulation'], status: 'In project', initials: 'KP' },
];

export const demoStudentTasks = [
  { id: 'task-baseline', title: 'Implement baseline model', project: 'AI for Medical Image Analysis', due: '2 days', status: 'In Progress', priority: 'High', icon: 'ML' },
  { id: 'task-augmentation', title: 'Dataset cleaning and augmentation', project: 'AI for Medical Image Analysis', due: '4 days', status: 'Not Started', priority: 'Medium', icon: 'DS' },
  { id: 'task-literature', title: 'Literature review — MRI detection', project: 'AI for Medical Image Analysis', due: '5 days', status: 'Completed', priority: 'Low', icon: 'LR' },
  { id: 'task-experiment', title: 'Run experiment results analysis', project: 'AI for Medical Image Analysis', due: '6 days', status: 'In Progress', priority: 'High', icon: 'EX' },
  { id: 'task-summary', title: 'Write research summary', project: 'Sustainable Battery Material Discovery', due: '8 days', status: 'Not Started', priority: 'Medium', icon: 'WR' },
];

export const demoContributions = [
  { id: 'contribution-baseline', title: 'Baseline model evaluation', project: 'AI for Medical Image Analysis', type: 'Implementation', submitted: 'Sep 28, 2026', status: 'Verified', credits: 80, suggestedCredits: 80, reviewer: 'Prof. Sharma' },
  { id: 'contribution-dataset', title: 'MRI dataset documentation', project: 'AI for Medical Image Analysis', type: 'Research', submitted: 'Sep 25, 2026', status: 'Under Review', credits: null, suggestedCredits: 60, reviewer: 'Dr. Ananya Rao' },
  { id: 'contribution-literature', title: 'Literature review notes', project: 'AI for Medical Image Analysis', type: 'Research', submitted: 'Sep 21, 2026', status: 'Verified', credits: 45, suggestedCredits: 45, reviewer: 'Prof. Sharma' },
  { id: 'contribution-material', title: 'Battery chemistry comparison', project: 'Sustainable Battery Material Discovery', type: 'Research', submitted: 'Sep 18, 2026', status: 'Draft', credits: null, suggestedCredits: null, reviewer: 'Not submitted' },
];

export const demoAccessRequests = [
  { id: 'access-dataset-v2', name: 'Dataset v2', project: 'AI for Medical Image Analysis', resource: 'Dataset', status: 'Approved', updated: 'Sep 30, 2026', reviewer: 'Prof. Sharma' },
  { id: 'access-code', name: 'Model repository', project: 'AI for Medical Image Analysis', resource: 'Code', status: 'Pending', updated: 'Oct 2, 2026', reviewer: 'MedScan Labs' },
  { id: 'access-charter', name: 'Research charter', project: 'Climate Change Data Analysis', resource: 'Document', status: 'Approved', updated: 'Sep 26, 2026', reviewer: 'Dr. Ananya Rao' },
  { id: 'access-experiment', name: 'Experiment results v1', project: 'Sustainable Battery Material Discovery', resource: 'Dataset', status: 'Pending', updated: 'Oct 3, 2026', reviewer: 'Prof. Sharma' },
];

export const roleLabels: Record<UserRole, string> = {
  STUDENT: 'Student / Contributor',
  RESEARCHER: 'Researcher',
  MENTOR: 'Mentor',
  SPONSOR: 'Sponsor',
  ADMIN: 'Administrator',
};

export const roleName = (role: UserRole) => roleLabels[role];

export const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  'my-work': 'My Work',
  'ai-workspace': 'AI Workspace',
  skills: 'Skills & Matching',
  contributions: 'Contributions',
  access: 'Access',
  'access-requests': 'Access Requests',
  messages: 'Messages',
  'research-workspace': 'Research Workspace',
  applications: 'Applications',
  team: 'Team',
  reviews: 'Reviews',
  credits: 'Credits',
  rewards: 'Rewards',
  reports: 'Reports',
  'research-problems': 'Research Problems',
  users: 'Users',
  verification: 'Verification',
  governance: 'Governance',
  audit: 'Audit',
  security: 'Security',
};
