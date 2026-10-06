'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Award,
  BellRing,
  BookOpen,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCheck,
  ClipboardCheck,
  Coins,
  Database,
  FileCheck2,
  FileClock,
  FileText,
  FlaskConical,
  FolderKanban,
  HeartHandshake,
  Microscope,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole } from '@/types';
import { useRole } from '@/context/RoleContext';
import {
  ActivityFeed,
  DocumentCard,
  EmptyState,
  MockAction,
  NotificationPanel,
  Panel,
  ProgressBar,
  ProjectCard,
  SkillCard,
  StatCard,
  StatusBadge,
  TextLink,
  UserAvatar,
} from '@/components/ui/Gardenia';
import {
  demoActivity,
  demoAccessRequests,
  demoContributions,
  demoNotifications,
  demoPeople,
  demoProjects,
  demoSkills,
  demoStudentTasks,
  pageTitles,
  roleName,
} from '@/lib/mock-data';
import { cn } from '@/lib/cn';

const knownRoles = new Set(['student', 'researcher', 'mentor', 'sponsor', 'admin']);
const roleBySlug: Record<string, UserRole> = {
  student: 'STUDENT',
  researcher: 'RESEARCHER',
  mentor: 'MENTOR',
  sponsor: 'SPONSOR',
  admin: 'ADMIN',
};

const projectSections = [
  ['Overview', 'overview'],
  ['Charter', 'charter'],
  ['Team', 'team'],
  ['Research', 'research'],
  ['Implementation', 'implementation'],
  ['Experiments', 'experiments'],
  ['AI Workspace', 'ai-workspace'],
  ['Evidence', 'evidence'],
  ['Access', 'access'],
  ['Milestones', 'milestones'],
  ['Contributions', 'contributions'],
  ['Activity', 'activity'],
] as const;

const titleCase = (value: string) => pageTitles[value] ?? value.split('-').map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ');
const projectPath = (id: string, section = 'overview') => `/projects/${id}/${section}`;

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-700">{eyebrow}</p>
        <h1 className="text-balance mt-1 text-2xl font-extrabold text-slate-950">{title}</h1>
        <p className="text-pretty mt-1 max-w-2xl text-xs leading-5 text-slate-600">{description}</p>
      </div>
      {action}
    </header>
  );
}

function Dashboard({ role }: { role: UserRole }) {
  const student = role === 'STUDENT';
  const researcher = role === 'RESEARCHER';
  const mentor = role === 'MENTOR';
  const sponsor = role === 'SPONSOR';
  const admin = role === 'ADMIN';
  const person = role === 'SPONSOR' ? 'MedScan Labs' : role === 'ADMIN' ? 'Gardenia' : role === 'MENTOR' ? 'Prof. Sharma' : role === 'RESEARCHER' ? 'Dr. Ananya' : 'Sharath';
  const [applications, setApplications] = useState(12);
  const stats = student
    ? [
        { label: 'Active Projects', value: '2', detail: 'You are collaborating on', icon: FolderKanban, tone: 'violet' },
        { label: 'Pending Tasks', value: '3', detail: 'Across your projects', icon: ClipboardCheck, tone: 'blue' },
        { label: 'Access Request', value: '1', detail: 'Waiting for a decision', icon: BriefcaseBusiness, tone: 'amber' },
        { label: 'Skill Verifications', value: '5', detail: '3 verified skills', icon: ShieldCheck, tone: 'emerald' },
      ]
    : researcher
      ? [
          { label: 'Active Projects', value: '4', detail: 'Across 3 domains', icon: FolderKanban, tone: 'blue' },
          { label: 'Applications', value: '2', detail: 'Awaiting a response', icon: FileClock, tone: 'violet' },
          { label: 'Publications', value: '6', detail: 'Research outputs', icon: BookOpen, tone: 'emerald' },
          { label: 'Access Requests', value: '1', detail: 'Pending review', icon: BriefcaseBusiness, tone: 'amber' },
        ]
      : mentor
        ? [
            { label: 'Active Projects', value: '5', detail: 'Mentoring 3 teams', icon: FolderKanban, tone: 'blue' },
            { label: 'Pending Approvals', value: '18', detail: '4 reviews · 9 applicants', icon: ClipboardCheck, tone: 'amber' },
            { label: 'Contributors', value: '24', detail: 'Across your teams', icon: Users, tone: 'emerald' },
            { label: 'Credits Earned', value: '420', detail: 'This research cycle', icon: Coins, tone: 'violet' },
          ]
        : sponsor
          ? [
              { label: 'Sponsored Projects', value: '3', detail: 'Across 2 research areas', icon: FolderKanban, tone: 'amber' },
              { label: 'Research Problems', value: '12', detail: 'Published opportunities', icon: Microscope, tone: 'blue' },
              { label: 'Pending Requests', value: '2', detail: 'Researcher applications', icon: Users, tone: 'violet' },
              { label: 'Active Teams', value: '5', detail: 'Researchers and mentors', icon: HeartHandshake, tone: 'emerald' },
            ]
          : [
              { label: 'Total Users', value: '128', detail: '+12 this month', icon: Users, tone: 'blue' },
              { label: 'Active Projects', value: '15', detail: 'Across all research areas', icon: FolderKanban, tone: 'emerald' },
              { label: 'Pending Verifications', value: '12', detail: 'Need admin review', icon: ShieldCheck, tone: 'amber' },
              { label: 'Organizations', value: '8', detail: 'Verified partners', icon: BriefcaseBusiness, tone: 'violet' },
            ];

  const leftPanel = student || researcher ? 'Active Projects' : sponsor ? 'Sponsored Projects' : mentor ? 'Pending Approvals' : 'Verification Queue';

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageIntro
        eyebrow={roleName(role)}
        title={`${student ? 'Good morning' : researcher ? 'Welcome back' : sponsor ? 'Welcome' : admin ? 'System Overview' : 'Welcome back'}, ${person} ${student ? '👋' : ''}`}
        description={admin ? 'Monitor platform health, verification, and research governance.' : sponsor ? 'Track your research projects and real-world impact.' : mentor ? 'Guide teams and help great research move forward.' : researcher ? 'Continue your research journey and collaborative work.' : 'Continue making an impact in real research.'}
        action={student ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm"><p className="text-[10px] text-slate-500">Current Credits</p><p className="text-lg font-extrabold tabular-nums text-slate-900">420 <span className="text-[9px] font-semibold text-emerald-700">↑ 12%</span></p></div> : sponsor ? <MockAction onClick={() => window.location.assign('/sponsor/research-problems')}><Plus className="mr-1 inline size-3" /> Publish a research problem</MockAction> : undefined}
      />

      <section aria-label={`${roleName(role)} summary`} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => <StatCard key={stat.label} {...stat} href={student && index === 0 ? '/student/projects' : undefined} />)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.95fr)]">
        <Panel title={leftPanel} action={<TextLink href={role === 'ADMIN' ? '/admin/verification' : role === 'SPONSOR' ? '/sponsor/projects' : `/${role.toLowerCase()}/projects`}>View all</TextLink>}>
          {(student || researcher || sponsor) ? (
            <div className="grid gap-3 md:grid-cols-2">
              {demoProjects.slice(0, 2).map((project) => (
                <ProjectCard key={project.id} project={project} href={projectPath(project.id)} />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {demoPeople.slice(0, 3).map((personItem, index) => (
                <li key={personItem.name} className="flex items-center gap-2.5 py-2.5">
                  <UserAvatar name={personItem.name} tone={['rose', 'blue', 'amber'][index]} />
                  <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-800">{admin ? ['MedScan Labs (Company)', 'Northstar Research', 'Dr. K. Mehta'][index] : personItem.name}</p><p className="truncate text-[9px] text-slate-500">{admin ? 'Organization verification' : personItem.role}</p></div>
                  {admin ? <StatusBadge tone="amber">Review</StatusBadge> : <div className="flex gap-1"><MockAction onClick={() => setApplications((count) => Math.max(0, count - 1))}>View</MockAction><MockAction onClick={() => setApplications((count) => Math.max(0, count - 1))}>Approve</MockAction></div>}
                </li>
              ))}
            </ul>
          )}
          {mentor && <div className="mt-3 text-right"><StatusBadge tone="amber">{applications} pending approvals</StatusBadge></div>}
        </Panel>
        <Panel title={student ? 'Notifications' : admin ? 'Recent Audit Activity' : mentor ? 'Recent Reviews' : sponsor ? 'Recent Applications' : 'Recent Research Activity'} action={<TextLink href={student ? '/student/messages' : `/${role.toLowerCase()}/messages`}>View all</TextLink>}>
          <NotificationPanel items={demoNotifications.slice(0, 4)} />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Panel title={student ? 'My Skills' : researcher ? 'Research Activity' : mentor ? 'Recommended Contributors · Skill matching' : sponsor ? 'Project Progress' : 'Platform Activity'} action={<TextLink href={student ? '/student/skills' : mentor ? '/mentor/skills' : sponsor ? '/sponsor/projects' : '/admin/audit'}>View all</TextLink>} className="xl:col-span-1">
          {student ? (
            <div className="grid grid-cols-2 gap-2">{demoSkills.slice(0, 4).map((skill) => <SkillCard key={skill.name} {...skill} />)}</div>
          ) : sponsor ? (
            <div className="space-y-3">{demoProjects.slice(0, 3).map((project) => <div key={project.id}><div className="mb-1 flex justify-between gap-2 text-[10px]"><span className="truncate font-semibold text-slate-800">{project.title}</span><span className="shrink-0 tabular-nums text-slate-500">{project.progress}%</span></div><ProgressBar value={project.progress} /></div>)}</div>
          ) : mentor ? (
            <ul className="divide-y divide-slate-100">{demoPeople.slice(0, 3).map((personItem) => <li key={personItem.name} className="flex items-center gap-2 py-2"><UserAvatar name={personItem.name} tone="blue" size="size-7" /><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-800">{personItem.name}</p><p className="truncate text-[9px] text-slate-500">{personItem.skills.join(' · ')}</p></div><StatusBadge tone="emerald">Matched</StatusBadge></li>)}</ul>
          ) : (
            <ActivityFeed items={demoActivity.slice(0, 3)} />
          )}
        </Panel>
        <Panel title={researcher ? 'AI Research Activity' : mentor ? 'Skill Matching' : sponsor ? 'Rewards & Credits' : student ? 'Recent Activity' : 'Recent Audit Activity'} action={<TextLink href={researcher ? '/researcher/ai-workspace' : mentor ? '/mentor/skills' : sponsor ? '/sponsor/rewards' : student ? '/student/my-work' : '/admin/audit'}>View all</TextLink>} className="xl:col-span-1">
          {sponsor ? <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3"><Wallet className="size-5 text-amber-700" aria-hidden="true" /><div><p className="text-sm font-bold tabular-nums text-slate-900">12,400 credits</p><p className="text-[10px] text-slate-600">Reward pool across sponsored projects</p></div></div> : <ActivityFeed items={demoActivity.slice(0, 3)} />}
        </Panel>
        <Panel title={student ? 'Recent Activity' : researcher ? 'My Research Projects' : mentor ? 'Credits' : sponsor ? 'Active Teams' : 'System Health'} action={<TextLink href={student ? '/student/contributions' : researcher ? '/researcher/projects' : mentor ? '/mentor/credits' : sponsor ? '/sponsor/reports' : '/admin/security'}>View all</TextLink>} className="xl:col-span-1">
          {student || researcher ? <ActivityFeed items={demoActivity.slice(0, 3)} /> : sponsor ? <ActivityFeed items={demoActivity.slice(1, 4)} /> : admin ? <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3"><CheckCheck className="size-5 text-emerald-700" aria-hidden="true" /><div><p className="text-sm font-bold text-slate-900">All systems operational</p><p className="text-[10px] text-slate-600">Last checked a few minutes ago</p></div></div> : <div className="flex items-center justify-between rounded-lg bg-violet-50 p-3"><div><p className="text-lg font-bold tabular-nums text-slate-900">420</p><p className="text-[10px] text-slate-600">Credits earned this cycle</p></div><Coins className="size-5 text-violet-700" aria-hidden="true" /></div>}
        </Panel>
      </section>

      <p className="text-center text-[9px] text-slate-400">GARDENIA preview · Dashboard numbers and activity are realistic sample data.</p>
    </div>
  );
}

function StudentDashboard() {
  const projects = demoProjects.slice(0, 2);
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-700">Student / Contributor</p>
          <h1 className="text-balance mt-1 text-xl font-extrabold text-slate-950 sm:text-2xl">Good morning, Sharath 👋</h1>
          <p className="text-pretty mt-1 text-[11px] text-slate-600">Continue making an impact in real research.</p>
        </div>
        <Link href="/student/credits" className="min-w-32 rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-sm">
          <span className="block text-[9px] text-slate-500">Current Credits</span>
          <span className="text-base font-extrabold tabular-nums text-slate-950">420</span>
          <span className="ml-2 text-[9px] font-semibold text-emerald-700">Top 12% ↑</span>
        </Link>
      </header>

      <section aria-label="Student dashboard summary" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Projects" value="2" detail="You're part of 2 research teams" icon={FolderKanban} tone="violet" href="/student/projects" />
        <StatCard label="Pending Tasks" value="3" detail="1 due within 48 hours" icon={ClipboardCheck} tone="blue" href="/student/my-work" />
        <StatCard label="Access Requests" value="1" detail="Waiting for project approval" icon={BriefcaseBusiness} tone="amber" href="/student/access" />
        <StatCard label="Skill Verifications" value="5" detail="3 skills verified" icon={ShieldCheck} tone="emerald" href="/student/skills" />
      </section>

      <section className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <Panel title="Active Projects" action={<TextLink href="/student/projects">View all</TextLink>}>
          <div className="grid gap-2 md:grid-cols-2">
            {projects.map((project) => <ProjectCard key={project.id} project={project} href={projectPath(project.id)} />)}
          </div>
        </Panel>
        <Panel title="Recent Notifications" action={<TextLink href="/student/messages">View all</TextLink>}>
          <NotificationPanel items={demoNotifications.slice(0, 4)} />
        </Panel>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Panel title="My Skills" action={<TextLink href="/student/skills">View all</TextLink>}>
          <div className="grid gap-2 sm:grid-cols-2">
            {demoSkills.slice(0, 4).map((skill) => <SkillCard key={skill.name} {...skill} />)}
          </div>
        </Panel>
        <Panel title="Recent Activity" action={<TextLink href="/student/my-work">View all</TextLink>}>
          <ActivityFeed items={demoActivity} />
        </Panel>
      </section>
      <p className="text-center text-[9px] text-slate-400">Student workspace preview · dashboard counts and activity are sample data.</p>
    </div>
  );
}

function ProjectListing({ role }: { role: UserRole }) {
  const [query, setQuery] = useState('');
  const [published, setPublished] = useState(false);
  const projects = demoProjects.filter((project) => `${project.title} ${project.domain} ${project.sponsor}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageIntro eyebrow={roleName(role)} title={role === 'SPONSOR' ? 'Your research projects' : 'Explore research projects'} description="Discover collaborative research with clear goals, shared evidence, and teams built to make an impact." action={role === 'SPONSOR' && <MockAction onClick={() => setPublished(true)}><Plus className="mr-1 inline size-3" /> Publish research problem</MockAction>} />
      {published && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">Your research problem draft is ready. In this frontend demo it has not been sent to a server.</div>}
      <label className="flex max-w-lg items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm"><Search className="size-4 text-slate-400" aria-hidden="true" /><span className="sr-only">Search projects</span><input className="w-full text-xs outline-none placeholder:text-slate-400" placeholder="Search projects, research areas, sponsors..." value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => <ProjectCard key={project.id} project={project} href={projectPath(project.id)} />)}
      </div>
      {projects.length === 0 && <EmptyState title="No matching projects" description="Try a broader term such as climate, medical imaging, or materials." action={<MockAction tone="neutral" onClick={() => setQuery('')}>Clear search</MockAction>} />}
    </div>
  );
}

function AIWorkspace() {
  const agents = [
    ['Research Agent', 'Finds relevant literature and evidence', 'Ready', Microscope],
    ['Analysis Agent', 'Summarizes datasets and research patterns', 'Ready', BrainCircuit],
    ['Integrity Agent', 'Checks research methodology and evidence quality', 'Ready', ShieldCheck],
    ['Contribution Agent', 'Reviews contribution detail and evidence', 'Ready', FileCheck2],
    ['Reporting Agent', 'Drafts project summaries and progress reports', 'Ready', FileText],
  ] as const;
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageIntro eyebrow="AI Mesh · UI preview" title="AI Workspace" description="A project-aware AI mesh concept for research support. Agent cards and reports are illustrative only; no AI runtime is connected." />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Activity className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-bold text-slate-900">AI Mesh status</p><p className="text-[10px] text-slate-500">Concept preview · execution disabled</p></div></div>
        <StatusBadge tone="amber">UI only · No agents running</StatusBadge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map(([name, detail, status, Icon]) => <article key={name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"><Icon className="size-4" aria-hidden="true" /></span><StatusBadge tone="emerald">{status}</StatusBadge></div><h2 className="mt-3 text-xs font-bold text-slate-900">{name}</h2><p className="text-pretty mt-1 text-[10px] leading-4 text-slate-500">{detail}</p><MockAction tone="neutral">View capabilities</MockAction></article>)}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Recent AI reports"><ActivityFeed items={[
          { name: 'Brain MRI model analysis', detail: 'AI for Medical Image Analysis · sample report', time: '2 hr ago', initials: 'AN', tone: 'violet' },
          { name: 'Battery dataset summary', detail: 'Sustainable Battery Material Discovery', time: 'Yesterday', initials: 'RS', tone: 'blue' },
          { name: 'Research integrity checklist', detail: 'Climate Change Data Analysis', time: '2 days ago', initials: 'IN', tone: 'emerald' },
        ]} /></Panel>
        <Panel title="AI analysis · sample">
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4"><div className="flex items-center gap-2"><Sparkles className="size-4 text-indigo-700" aria-hidden="true" /><p className="text-xs font-bold text-slate-900">Medical image model analysis</p></div><p className="text-pretty mt-2 text-[10px] leading-5 text-slate-600">The sample review highlights dataset representativeness, evaluation consistency, and the need to report sensitivity alongside accuracy. This illustrative analysis is not a generated model output.</p><div className="mt-3 flex gap-2"><StatusBadge tone="blue">Quality review</StatusBadge><StatusBadge tone="amber">Mentor review pending</StatusBadge></div></div>
        </Panel>
      </div>
    </div>
  );
}

function SkillsPage({ role = 'STUDENT' }: { role?: UserRole }) {
  const [testStarted, setTestStarted] = useState(false);
  const matching = role === 'MENTOR';
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageIntro eyebrow="Skills & growth" title={matching ? 'Skills & Matching' : 'My Skills'} description={matching ? 'Compare researcher skill profiles with active project needs. Matching suggestions are illustrative and do not run through an AI service.' : 'A transparent view of skills, self-assessments, and mentor review. Verification shown here is sample data only.'} action={!matching && <MockAction onClick={() => setTestStarted(true)}><Plus className="mr-1 inline size-3" /> Start a skill test</MockAction>} />
      {testStarted && <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">Sample skill test started: Computer Vision · 20 minutes. No assessment is being scored.</div>}
      {matching ? <div className="grid gap-3 md:grid-cols-2">{demoPeople.map((person) => <article key={person.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><UserAvatar name={person.name} tone="blue" size="size-10" /><div><h2 className="text-xs font-bold text-slate-900">{person.name}</h2><p className="text-[10px] text-slate-500">{person.role}</p></div><StatusBadge tone="emerald">{person.status}</StatusBadge></div><div className="mt-3 flex flex-wrap gap-1.5">{person.skills.map((skill) => <StatusBadge key={skill} tone="blue">{skill}</StatusBadge>)}</div><p className="mt-3 text-[9px] text-slate-500">Suggested for AI for Medical Image Analysis · sample match</p></article>)}</div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{demoSkills.map((skill) => <article key={skill.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-2"><h2 className="text-xs font-bold text-slate-900">{skill.name}</h2><StatusBadge tone={skill.status === 'Verified' ? 'emerald' : 'amber'}>{skill.status}</StatusBadge></div><p className="mt-2 text-[10px] text-slate-500">{skill.detail}</p>{skill.score > 0 && <div className="mt-3"><ProgressBar value={skill.score} label="Assessment score" /></div>}<div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[9px] text-slate-500">AI Mesh analysis · illustrative</span><span className="text-[10px] font-semibold tabular-nums text-slate-700">{skill.score ? `${skill.score}%` : 'Not tested'}</span></div></article>)}</div>}
    </div>
  );
}

function StudentProjects() {
  const [filter, setFilter] = useState('All Projects');
  const [query, setQuery] = useState('');
  const tabs = ['All Projects', 'Active', 'Recruiting', 'Planning'];
  const filtered = demoProjects.filter((project) => {
    const textMatch = `${project.title} ${project.sponsor} ${project.domain}`.toLowerCase().includes(query.toLowerCase());
    const statusMatch = filter === 'All Projects'
      || (filter === 'Active' && project.status === 'In progress')
      || (filter === 'Recruiting' && project.status === 'Recruiting')
      || (filter === 'Planning' && project.status === 'Planning');
    return textMatch && statusMatch;
  });
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <PageIntro eyebrow="Student workspace" title="Projects" description="Discover research projects and opportunities that match your interests." action={<Link href="/student/my-work" className="rounded-lg bg-indigo-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-indigo-700"><Plus className="mr-1 inline size-3" /> Find a Project</Link>} />
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter projects">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={filter === tab} onClick={() => setFilter(tab)} className={cn('shrink-0 rounded-lg px-3 py-2 text-[10px] font-semibold', filter === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>{tab}</button>)}</div>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:w-64"><Search className="size-3.5 text-slate-400" aria-hidden="true" /><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full text-[10px] outline-none" placeholder="Search projects..." /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <ProjectCard key={project.id} project={project} href={projectPath(project.id)} />)}</div>
      {filtered.length === 0 && <EmptyState title="No projects match this view" description="Change the filter or search for another research area." action={<MockAction tone="neutral" onClick={() => { setFilter('All Projects'); setQuery(''); }}>Show all projects</MockAction>} />}
    </div>
  );
}

function StudentMyWork() {
  const [filter, setFilter] = useState('All Tasks');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const tabs = ['All Tasks', 'In Progress', 'Completed', 'Drafts'];
  const tasks = demoStudentTasks.filter((task) => {
    const status = statuses[task.id] ?? task.status;
    const statusMatch = filter === 'All Tasks'
      || (filter === 'In Progress' && status === 'In Progress')
      || (filter === 'Completed' && status === 'Completed')
      || (filter === 'Drafts' && status === 'Not Started');
    return statusMatch && (projectFilter === 'All Projects' || task.project === projectFilter);
  });
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <PageIntro eyebrow="Student workspace" title="My Work" description="Track assigned tasks, deadlines, and submissions across your projects." action={<Link href="/student/contributions" className="rounded-lg bg-indigo-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-indigo-700"><Plus className="mr-1 inline size-3" /> Submit Work</Link>} />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filter tasks">{tabs.map((tab) => <button type="button" role="tab" aria-selected={filter === tab} key={tab} onClick={() => setFilter(tab)} className={cn('shrink-0 rounded-lg px-3 py-2 text-[10px] font-semibold', filter === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>{tab}</button>)}</div>
        <label className="text-[10px] text-slate-500">Project <select aria-label="Filter tasks by project" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[10px] text-slate-700"><option>All Projects</option>{[...new Set(demoStudentTasks.map((task) => task.project))].map((project) => <option key={project}>{project}</option>)}</select></label>
      </div>
      <Panel title="Assigned Tasks" action={<span className="text-[9px] text-slate-500">{tasks.length} tasks</span>}>
        <div className="hidden grid-cols-[minmax(0,2fr)_1.2fr_0.7fr_0.8fr_0.6fr_0.7fr] gap-3 border-b border-slate-100 pb-2 text-[9px] font-semibold uppercase text-slate-500 md:grid"><span>Task</span><span>Project</span><span>Deadline</span><span>Status</span><span>Priority</span><span>Action</span></div>
        <ul className="divide-y divide-slate-100">{tasks.map((task) => {
          const status = statuses[task.id] ?? task.status;
          return <li key={task.id} className="grid gap-2 py-3 md:grid-cols-[minmax(0,2fr)_1.2fr_0.7fr_0.8fr_0.6fr_0.7fr] md:items-center md:gap-3"><div className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-[9px] font-bold text-indigo-700">{task.icon}</span><span className="min-w-0"><span className="block truncate text-[10px] font-semibold text-slate-900">{task.title}</span><span className="block truncate text-[9px] text-slate-500 md:hidden">{task.project}</span></span></div><span className="hidden truncate text-[9px] text-slate-600 md:block">{task.project}</span><span className="text-[9px] text-slate-600">Due in {task.due}</span><StatusBadge tone={status === 'Completed' ? 'emerald' : status === 'In Progress' ? 'blue' : 'slate'}>{status}</StatusBadge><StatusBadge tone={task.priority === 'High' ? 'rose' : task.priority === 'Medium' ? 'amber' : 'slate'}>{task.priority}</StatusBadge><button type="button" disabled={status === 'Completed'} onClick={() => setStatuses((current) => ({ ...current, [task.id]: 'Completed' }))} className="w-fit rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] font-semibold text-slate-700 hover:bg-slate-50 disabled:text-emerald-700">{status === 'Completed' ? 'Done' : 'Mark done'}</button></li>;
        })}</ul>
      </Panel>
      {tasks.length === 0 && <EmptyState title="No tasks in this filter" description="Choose another task status to see your assigned work." action={<MockAction tone="neutral" onClick={() => setFilter('All Tasks')}>View all tasks</MockAction>} />}
    </div>
  );
}

function StudentAIWorkspace() {
  const [activeTab, setActiveTab] = useState('Research Agent');
  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const agents = ['Research Agent', 'Analysis Agent', 'Literature Agent', 'Code Agent'];
  const sessions = [
    ['MRI detection preliminary analysis', 'AI for Medical Image Analysis', '2 hours ago'],
    ['Dataset coverage review', 'AI for Medical Image Analysis', 'Yesterday'],
    ['Battery research notes', 'Sustainable Battery Material Discovery', '2 days ago'],
  ];
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <PageIntro eyebrow="AI Mesh · UI preview" title="AI Workspace" description="Research assistants to organize research thoughts. Agent cards are visual concepts only; no AI service is connected." />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.7fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-3" role="tablist" aria-label="Select AI assistant">{agents.map((agent) => <button type="button" role="tab" aria-selected={activeTab === agent} key={agent} onClick={() => setActiveTab(agent)} className={cn('shrink-0 rounded-lg px-3 py-2 text-[10px] font-semibold', activeTab === agent ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}>{agent}</button>)}</div>
          <div className="p-4">
            <div className="mb-4 flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Sparkles className="size-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-slate-900">{activeTab}</p><p className="text-[9px] text-slate-500">AI Mesh concept · sample session</p></div><StatusBadge tone="emerald">Available</StatusBadge></div>
            <div className="space-y-2 rounded-lg bg-slate-50 p-3"><p className="text-pretty rounded-lg border border-slate-200 bg-white p-3 text-[10px] leading-4 text-slate-700">How should we compare MRI model performance across the evaluation cohort?</p><p className="text-pretty ml-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-[10px] leading-4 text-slate-700">Consider reporting sensitivity and specificity alongside overall accuracy. Keep the data split fixed and document cohort composition so results remain interpretable and reproducible.</p>{notice && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[9px] text-amber-900">{notice}</p>}</div>
            <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (prompt.trim()) { setNotice('Prompt saved in this local preview. No AI service was contacted.'); setPrompt(''); } }}><label className="sr-only" htmlFor="student-ai-prompt">Type your research prompt</label><input id="student-ai-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-[10px]" placeholder="Type your research prompt..." /><button type="submit" aria-label="Submit prompt to local preview" className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"><Send className="size-4" aria-hidden="true" /></button></form>
          </div>
        </section>
        <div className="space-y-3">
          <Panel title="Recent Sessions" action={<StatusBadge tone="slate">3 sessions</StatusBadge>}><ul className="divide-y divide-slate-100">{sessions.map(([title, project, time]) => <li key={title} className="flex items-start gap-2.5 py-3 first:pt-1"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700"><BrainCircuit className="size-3.5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-800">{title}</p><p className="truncate text-[9px] text-slate-500">{project}</p></div><span className="shrink-0 text-[9px] text-slate-400">{time}</span></li>)}</ul></Panel>
          <Panel title="Suggested Actions"><ul className="space-y-2">{['Compare model architectures', 'Summarize research literature', 'Generate experiment plan'].map((action) => <li key={action}><button type="button" onClick={() => { setActiveTab(action.includes('literature') ? 'Literature Agent' : action.includes('experiment') ? 'Analysis Agent' : 'Research Agent'); setNotice(`${action} selected. Add context above to continue.`); }} className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-2 text-left text-[9px] font-medium text-slate-700 hover:bg-slate-50">{action}<ArrowRight className="size-3 text-slate-400" aria-hidden="true" /></button></li>)}</ul></Panel>
        </div>
      </div>
      <p className="text-center text-[9px] text-slate-400">Research prompts and AI responses are examples only.</p>
    </div>
  );
}

function StudentContributions() {
  const [period, setPeriod] = useState('This Year');
  const [detail, setDetail] = useState('');
  const chart = [
    { month: 'Jan', verified: 2, pending: 1 }, { month: 'Feb', verified: 3, pending: 1 },
    { month: 'Mar', verified: 4, pending: 2 }, { month: 'Apr', verified: 3, pending: 1 },
    { month: 'May', verified: 5, pending: 2 }, { month: 'Jun', verified: 4, pending: 1 },
  ];
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <PageIntro eyebrow="Student workspace" title="Contributions" description="Track your research contributions, submissions, and verified impact." action={<MockAction onClick={() => setDetail('New contribution draft opened in this local preview.')}><Plus className="mr-1 inline size-3" /> New Contribution</MockAction>} />
      {detail && <div role="status" className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] text-indigo-800">{detail}</div>}
      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total Contributions" value="18" detail="Across 2 projects" icon={FileCheck2} tone="blue" /><StatCard label="Verified" value="12" detail="Reviewed by mentors" icon={CheckCheck} tone="emerald" /><StatCard label="Pending Review" value="3" detail="Awaiting mentor feedback" icon={FileClock} tone="amber" /><StatCard label="Credits Earned" value="420" detail="Recognized contributions" icon={Coins} tone="violet" /></section>
      <Panel title="Contribution Overview" action={<select aria-label="Contribution period" value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px]"><option>This Year</option><option>Last 6 Months</option><option>All Time</option></select>}>
        <div className="flex h-36 items-end justify-around gap-3 border-b border-slate-100 px-2 pt-4" role="img" aria-label={`Monthly contribution activity, ${period}`}>{chart.map((month) => <div key={month.month} className="flex h-full min-w-7 flex-1 flex-col items-center justify-end gap-1"><div className="flex h-24 items-end gap-1"><span className="w-3 rounded-t bg-indigo-500" style={{ height: `${month.verified * 16}px` }} /><span className="w-3 rounded-t bg-teal-300" style={{ height: `${month.pending * 16}px` }} /></div><span className="text-[9px] text-slate-500">{month.month}</span></div>)}</div>
        <div className="mt-2 flex gap-4 text-[9px] text-slate-500"><span><i className="mr-1 inline-block size-2 rounded-sm bg-indigo-500" />Verified</span><span><i className="mr-1 inline-block size-2 rounded-sm bg-teal-300" />Pending review</span></div>
      </Panel>
      <Panel title="My Contributions" action={<span className="text-[9px] text-slate-500">4 records</span>}><ul className="divide-y divide-slate-100">{demoContributions.map((contribution) => <li key={contribution.id} className="grid gap-2 py-3 md:grid-cols-[minmax(0,1.8fr)_0.8fr_0.9fr_0.7fr_0.7fr_0.6fr] md:items-center md:gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText className="size-4" aria-hidden="true" /></span><span className="min-w-0"><span className="block truncate text-[10px] font-semibold text-slate-900">{contribution.title}</span><span className="block truncate text-[9px] text-slate-500">{contribution.project}</span></span></div><StatusBadge tone="blue">{contribution.type}</StatusBadge><span className="text-[9px] text-slate-500">{contribution.submitted}</span><StatusBadge tone={contribution.status === 'Verified' ? 'emerald' : contribution.status === 'Under Review' ? 'amber' : 'slate'}>{contribution.status}</StatusBadge><span className="text-[9px] text-slate-600">{contribution.credits ? `+${contribution.credits} credits` : `Suggested ${contribution.suggestedCredits ?? '—'}`}</span><button type="button" onClick={() => setDetail(`${contribution.title}: sample AI suggests ${contribution.suggestedCredits ?? 'no'} credits; mentor review is ${contribution.status === 'Verified' ? 'complete' : 'pending'}.`)} className="w-fit rounded-lg border border-slate-200 px-2 py-1.5 text-[9px] font-semibold text-indigo-700 hover:bg-indigo-50">View</button></li>)}</ul></Panel>
      <p className="text-center text-[9px] text-slate-400">AI analysis and credit suggestions are illustrative. Final decisions require human review.</p>
    </div>
  );
}

function StudentAccess() {
  const [filter, setFilter] = useState('My Access');
  const [requests, setRequests] = useState(demoAccessRequests);
  const [notice, setNotice] = useState('');
  const tabs = ['My Access', 'Pending (2)', 'Approved (2)', 'Rejected'];
  const visible = requests.filter((request) => filter === 'My Access'
    || (filter.startsWith('Pending') && request.status === 'Pending')
    || (filter.startsWith('Approved') && request.status === 'Approved')
    || (filter === 'Rejected' && request.status === 'Rejected'));
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <PageIntro eyebrow="Student workspace" title="Access Requests" description="Manage access to project resources and datasets." action={<MockAction onClick={() => setNotice('Choose a project resource below to make an access request.')}><Plus className="mr-1 inline size-3" /> Request Access</MockAction>} />
      {notice && <div role="status" className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] text-indigo-800">{notice}</div>}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm" role="tablist" aria-label="Filter access requests">{tabs.map((tab) => <button key={tab} role="tab" aria-selected={filter === tab} type="button" onClick={() => setFilter(tab)} className={cn('shrink-0 rounded-lg px-3 py-2 text-[10px] font-semibold', filter === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>{tab}</button>)}</div>
      <Panel title="Project Resource Access" action={<span className="text-[9px] text-slate-500">{visible.length} requests</span>}>      <ul className="divide-y divide-slate-100">{visible.map((request) => <li key={request.id} className="grid gap-2 py-3 md:grid-cols-[minmax(0,1.6fr)_0.65fr_0.7fr_0.75fr_0.8fr_0.55fr] md:items-center md:gap-3"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-slate-900">{request.name}</p><p className="truncate text-[9px] text-slate-500">{request.project}</p></div><span className="text-[9px] text-slate-600">{request.resource}</span><StatusBadge tone={request.status === 'Approved' ? 'emerald' : request.status === 'Rejected' ? 'rose' : 'amber'}>{request.status}</StatusBadge><span className="text-[9px] text-slate-500">{request.updated}</span><span className="truncate text-[9px] text-slate-500">Reviewed by {request.reviewer}</span>{request.status === 'Pending' ? <button type="button" onClick={() => { setRequests((current) => current.map((item) => item.id === request.id ? { ...item, status: 'Cancelled' } : item)); setNotice(`${request.name} cancelled in local preview state.`); }} className="w-fit rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-slate-700">Cancel</button> : <button type="button" onClick={() => setNotice(`${request.name}: sample resource details are ready to view.`)} className="w-fit rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-slate-700">View</button>}</li>)}</ul></Panel>
      <Panel title="Available Project Resources"><div className="grid gap-2 sm:grid-cols-2">{demoProjects.slice(0, 3).map((project) => <article key={project.id} className="rounded-lg border border-slate-100 p-3"><p className="text-[10px] font-semibold text-slate-900">{project.title}</p><p className="mt-1 text-[9px] text-slate-500">{project.domain} · {project.sponsor}</p><button type="button" onClick={() => setNotice(`Access request for ${project.title} saved in local preview state.`)} className="mt-2 text-[9px] font-semibold text-indigo-700 hover:underline">Request project access</button></article>)}</div></Panel>
    </div>
  );
}

function StudentMessages() {
  const [active, setActive] = useState('Prof. Sharma');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const conversations = [
    { name: 'Prof. Sharma', role: 'Mentor', preview: 'I reviewed your latest experiment results.', time: '2 min', tone: 'violet' },
    { name: 'AI for Medical Image Analysis', role: 'Project team', preview: 'Dataset v2 is now available.', time: '1 hr', tone: 'blue' },
    { name: 'Dr. Ananya Rao', role: 'Research lead', preview: 'Please add the cohort summary.', time: '3 hr', tone: 'emerald' },
    { name: 'Sustainable Battery Team', role: 'Project team', preview: 'Great, the update is ready.', time: 'Yesterday', tone: 'amber' },
  ];
  return (
    <div className="mx-auto max-w-[1500px] space-y-4 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
      <PageIntro eyebrow="Student workspace" title="Messages" description="Communicate with your project teams and mentors." />
      <section className="grid min-h-[32rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="border-b border-slate-100 p-3 md:border-b-0 md:border-r"><label className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><Search className="size-3.5 text-slate-400" aria-hidden="true" /><span className="sr-only">Search conversations</span><input className="w-full bg-transparent text-[10px] outline-none" placeholder="Search conversations..." /></label><ul className="mt-3 flex gap-2 overflow-x-auto md:flex-col">{conversations.map((conversation) => <li key={conversation.name} className="min-w-48 md:min-w-0"><button type="button" onClick={() => setActive(conversation.name)} className={cn('flex w-full items-center gap-2 rounded-lg p-2 text-left', active === conversation.name ? 'bg-indigo-50' : 'hover:bg-slate-50')}><UserAvatar name={conversation.name} tone={conversation.tone} /><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-slate-900">{conversation.name}</span><span className="block truncate text-[9px] text-slate-500">{conversation.preview}</span></span><span className="text-[8px] text-slate-400">{conversation.time}</span></button></li>)}</ul></aside>
        <div className="flex min-h-[26rem] min-w-0 flex-col"><header className="border-b border-slate-100 px-4 py-3"><p className="text-[10px] font-bold text-slate-900">{active}</p><p className="text-[9px] text-slate-500">{conversations.find((conversation) => conversation.name === active)?.role} · AI for Medical Image Analysis</p></header><div className="flex-1 space-y-3 overflow-y-auto p-4"><p className="max-w-[82%] rounded-xl bg-slate-100 p-3 text-[10px] leading-4 text-slate-700">Hi Sharath, I reviewed your latest experiment results. Could you add a short note about the evaluation cohort before our next check-in?</p><p className="text-pretty ml-auto max-w-[82%] rounded-xl bg-indigo-600 p-3 text-[10px] leading-4 text-white">Absolutely. I’ll add the cohort summary to the research workspace and share reproducibility notes.</p>{sent.map((sentMessage, index) => <p key={`${index}-${sentMessage}`} className="ml-auto max-w-[82%] rounded-xl bg-indigo-600 p-3 text-[10px] leading-4 text-white">{sentMessage}</p>)}</div><form className="flex gap-2 border-t border-slate-100 p-3" onSubmit={(event) => { event.preventDefault(); if (message.trim()) { setSent((current) => [...current, message.trim()]); setMessage(''); } }}><label htmlFor="student-message" className="sr-only">Write a message</label><input id="student-message" value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px]" placeholder="Type a message..." /><button type="submit" aria-label="Send demo message" className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><Send className="size-4" aria-hidden="true" /></button></form></div>
      </section>
      <p className="text-center text-[9px] text-slate-400">Messages are sample content; replies stay in local page state.</p>
    </div>
  );
}

function DataTable({ rows, headers }: { rows: { title: string; subtitle: string; status: string; meta: string }[]; headers?: string[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[9px] font-semibold uppercase text-slate-500 sm:grid">{(headers ?? ['Item', 'Status', 'Updated', 'Details']).map((header) => <span key={header}>{header}</span>)}</div>
      <ul className="divide-y divide-slate-100">
        {rows.map((row) => <li key={row.title} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] sm:items-center sm:gap-3"><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-900">{row.title}</p><p className="truncate text-[9px] text-slate-500">{row.subtitle}</p></div><div><StatusBadge tone={row.status.toLowerCase().includes('pending') ? 'amber' : row.status.toLowerCase().includes('approved') || row.status.toLowerCase().includes('verified') ? 'emerald' : 'blue'}>{row.status}</StatusBadge></div><span className="text-[10px] text-slate-500">{row.meta}</span><span className="text-[10px] text-slate-500 sm:truncate">{row.subtitle}</span></li>)}
      </ul>
    </div>
  );
}

function GenericRolePage({ role, section }: { role: UserRole; section: string }) {
  const [decision, setDecision] = useState<string | null>(null);
  const title = titleCase(section);
  const projectRows = demoProjects.map((project) => ({ title: project.title, subtitle: `${project.domain} · ${project.sponsor}`, status: project.status, meta: `${project.progress}% complete` }));
  const peopleRows = demoPeople.map((person) => ({ title: person.name, subtitle: person.role, status: person.status, meta: person.skills.join(', ') }));
  const accessRows = [
    { title: 'Dataset v2 · AI for Medical Image Analysis', subtitle: 'Requested by Sharath Swaroop', status: 'Pending review', meta: '2 hours ago' },
    { title: 'Research workspace · Climate Change Data Analysis', subtitle: 'Requested by Dr. Ananya Rao', status: 'Approved', meta: 'Yesterday' },
    { title: 'Mentor access · Sustainable Battery Materials', subtitle: 'Requested by Priya Nair', status: 'Pending review', meta: 'Yesterday' },
  ];
  const isAccess = section === 'access' || section === 'access-requests';
  const isProjects = section === 'projects' || section === 'research-workspace';
  const isApplication = section === 'applications' || section === 'research-problems';
  const isSkills = section === 'skills' || section === 'team';
  const rows = isProjects ? projectRows : isSkills ? peopleRows : isAccess ? accessRows : section === 'users' ? peopleRows : section === 'audit' || section === 'security' || section === 'governance' ? demoActivity.map((item) => ({ title: item.name, subtitle: item.detail, status: 'Recorded', meta: item.time })) : [
    { title: 'Baseline model methodology', subtitle: 'AI for Medical Image Analysis', status: 'Under review', meta: '2 hours ago' },
    { title: 'MRI dataset documentation', subtitle: 'Research evidence · Dr. Ananya Rao', status: 'Approved', meta: 'Yesterday' },
    { title: 'Battery chemistry comparison', subtitle: 'Sustainable Battery Material Discovery', status: 'Pending review', meta: '2 days ago' },
  ];

  if (section === 'ai-workspace') return <AIWorkspace />;
  if (section === 'skills') return <SkillsPage role={role} />;

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageIntro eyebrow={roleName(role)} title={title} description={pageDescription(role, section)} action={section === 'research-problems' || section === 'applications' ? <MockAction onClick={() => setDecision('Draft created in the local preview only.')}> <Plus className="mr-1 inline size-3" /> {role === 'SPONSOR' ? 'Publish research problem' : 'Apply to a project'}</MockAction> : undefined} />
      {decision && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">{decision}</div>}
      {section === 'messages' ? (
        <div className="grid min-h-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="border-b border-slate-100 p-3 md:border-b-0 md:border-r"><label className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"><Search className="size-3.5 text-slate-400" aria-hidden="true" /><input aria-label="Search messages" className="w-full bg-transparent text-[10px] outline-none" placeholder="Search conversations" /></label><ul className="mt-3 space-y-1">{demoPeople.slice(0, 3).map((person) => <li key={person.name}><button type="button" onClick={() => setDecision(`Showing the sample conversation with ${person.name}.`)} className="flex w-full items-center gap-2 rounded-lg bg-slate-50 p-2 text-left"><UserAvatar name={person.name} /><span className="min-w-0"><span className="block truncate text-[10px] font-semibold text-slate-800">{person.name}</span><span className="block truncate text-[9px] text-slate-500">Project update · Yesterday</span></span></button></li>)}</ul></aside>
          <section className="flex min-h-72 flex-col p-4"><div className="border-b border-slate-100 pb-3"><p className="text-xs font-bold text-slate-900">Dr. Ananya Rao</p><p className="text-[9px] text-slate-500">Research lead · AI for Medical Image Analysis</p></div><div className="flex-1 space-y-3 py-4"><p className="max-w-[80%] rounded-xl bg-slate-100 p-3 text-[10px] leading-4 text-slate-700">I’ve reviewed the dataset notes. Could you add a short summary of the baseline model results before our next check-in?</p><p className="ml-auto max-w-[80%] rounded-xl bg-indigo-50 p-3 text-[10px] leading-4 text-indigo-900">Absolutely. I’ll prepare the evaluation summary and attach it to the project workspace.</p></div><form className="flex gap-2 border-t border-slate-100 pt-3" onSubmit={(event) => { event.preventDefault(); setDecision('Message saved in the local preview only.'); }}><input aria-label="Write a message" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs" placeholder="Write a message..." /><button type="submit" aria-label="Send message in preview" className="flex size-9 items-center justify-center rounded-lg bg-indigo-700 text-white"><Send className="size-4" aria-hidden="true" /></button></form></section>
        </div>
      ) : section === 'ai-workspace' ? <AIWorkspace /> : section === 'skills' ? <SkillsPage /> : (
        <>
          {isApplication && role === 'SPONSOR' && <div className="grid gap-3 md:grid-cols-2">{demoProjects.slice(0, 4).map((project) => <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-2"><StatusBadge tone="blue">{project.domain}</StatusBadge><StatusBadge tone="emerald">Published</StatusBadge></div><h2 className="text-balance mt-3 text-sm font-bold text-slate-900">{project.title}</h2><p className="text-pretty mt-1 text-[10px] leading-4 text-slate-600">{project.summary}</p><div className="mt-3 flex items-center justify-between text-[10px] text-slate-500"><span>{project.members} applicants</span><span>Reward: {project.reward}</span></div><MockAction onClick={() => setDecision(`Application panel opened for ${project.title}.`)}>Review applications</MockAction></article>)}</div>}
          {section === 'credits' || section === 'rewards' ? <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Available balance" value="420" detail="Sample credits" icon={Wallet} tone="violet" /><StatCard label="Pending review" value="180" detail="Awaiting mentor review" icon={FileClock} tone="amber" /><StatCard label="Awarded this cycle" value="1,260" detail="Across 4 contributions" icon={Award} tone="emerald" /></div> : null}
          {section === 'contributions' && <Panel title="AI Mesh Contribution Analysis"><div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 p-3"><div className="flex items-center gap-2"><BrainCircuit className="size-4 text-indigo-700" aria-hidden="true" /><p className="text-[10px] font-bold text-slate-900">Contribution analysis · sample</p></div><p className="text-pretty mt-1 text-[10px] leading-4 text-slate-600">AI analysis suggests a preliminary award of 80 credits based on reproducibility and documentation. Mentor review remains the final decision.</p><div className="mt-2 flex gap-2"><StatusBadge tone="violet">Suggested: 80 credits</StatusBadge><StatusBadge tone="amber">Mentor review pending</StatusBadge></div></div><DataTable rows={rows} headers={['Contribution', 'Review status', 'Suggested credits', 'Project']} /></Panel>}
          {section === 'verification' && <Panel title="Organization and skill verification queue"><DataTable rows={[{ title: 'MedScan Labs', subtitle: 'Organization verification · submitted Oct 4', status: 'Pending review', meta: 'Private documents' }, { title: 'Python · Sharath Swaroop', subtitle: 'Skill test · score 92%', status: 'Verified', meta: 'AI analysis + mentor review' }, { title: 'Computer Vision · Priya Nair', subtitle: 'Skill test · assessment completed', status: 'Pending review', meta: 'Mentor review' }]} /></Panel>}
          {isAccess && <Panel title="Requests and approvals"><div className="space-y-3">{accessRows.map((row) => <article key={row.title} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"><div className="min-w-0"><p className="text-[10px] font-semibold text-slate-900">{row.title}</p><p className="mt-1 text-[9px] text-slate-500">{row.subtitle} · {row.meta}</p><StatusBadge tone={row.status === 'Approved' ? 'emerald' : 'amber'}>{decision && row.status === 'Pending review' ? 'Approved' : row.status}</StatusBadge></div>{row.status === 'Pending review' && <div className="flex gap-2"><MockAction tone="neutral" onClick={() => setDecision('Request rejected in local preview state.')}>Reject</MockAction><MockAction onClick={() => setDecision('Request approved in local preview state.')}>Approve</MockAction></div>}</article>)}</div><p className="mt-3 text-[9px] text-slate-500">Demo workflow: sponsor reviews researcher applications; mentors review access and contributor requests. Decisions are local UI state only.</p></Panel>}
          {!isApplication && section !== 'credits' && section !== 'rewards' && section !== 'contributions' && section !== 'verification' && !isAccess && (
            <Panel title={section === 'team' ? 'Project collaborators' : section === 'skills' ? 'Skills and matching' : section === 'reports' ? 'Research reports' : section === 'audit' ? 'Recent audit activity' : title}>
              <DataTable rows={rows} />
            </Panel>
          )}
          {role === 'RESEARCHER' && (section === 'applications' || section === 'research-workspace') && <Panel title="Available research opportunities"><DataTable rows={demoProjects.slice(0, 3).map((project) => ({ title: project.title, subtitle: `${project.domain} · ${project.sponsor}`, status: 'Open', meta: project.reward }))} /><div className="mt-3 flex gap-2"><MockAction onClick={() => setDecision('Application submitted in local preview state.')}>Submit application</MockAction><MockAction tone="neutral" onClick={() => setDecision('Access request saved in local preview state.')}>Request access</MockAction></div></Panel>}
        </>
      )}
      <p className="text-center text-[9px] text-slate-400">Sample data only · Actions on this screen do not contact a server.</p>
    </div>
  );
}

function pageDescription(role: UserRole, section: string) {
  if (section === 'projects') return 'Explore collaborative projects, research areas, milestones, and team opportunities.';
  if (section === 'access' || section === 'access-requests') return role === 'SPONSOR' ? 'Review researcher applications and manage project access requests.' : 'Follow project access requests and review decisions in one place.';
  if (section === 'applications') return 'Track submitted applications and find research opportunities aligned with your work.';
  if (section === 'research-problems') return 'Publish meaningful research questions and connect with the right collaborators.';
  if (section === 'messages') return 'Coordinate with research leads, mentors, sponsors, and project teammates.';
  if (section === 'team') return 'Meet the collaborators and contributors working across your research teams.';
  if (section === 'reports') return 'Track project progress, contributions, milestones, and research outcomes.';
  if (section === 'contributions') return 'Review shared contributions with transparent evidence and human review.';
  if (section === 'my-work') return 'Your assigned tasks, upcoming milestones, and work across projects.';
  if (section === 'governance') return 'Explore project charters, platform standards, and research governance reviews.';
  if (section === 'audit') return 'A readable sample history of platform and project activity.';
  if (section === 'security') return 'Review security posture and platform-level access signals.';
  return `A shared ${titleCase(section).toLowerCase()} workspace for ${roleName(role).toLowerCase()}s. Explore sample project data and common research workflows.`;
}

function ProjectWorkspace({ id, section }: { id: string; section: string }) {
  const [accessRequested, setAccessRequested] = useState(false);
  const project = demoProjects.find((item) => item.id === id) ?? demoProjects[0];
  const activeSection = projectSections.some(([, path]) => path === section) ? section : 'overview';
  const title = project.title;
  const navLinks = projectSections;
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 lg:flex">
      <aside className="flex w-full flex-col border-b border-slate-800 bg-slate-950 px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
        <Link href="/student/projects" className="mb-5 inline-flex items-center gap-2 text-[10px] text-slate-400 hover:text-white"><ArrowDownRight className="size-3" aria-hidden="true" />Back to Projects</Link>
        <p className="mb-1 truncate text-[9px] text-slate-500">Projects&nbsp; › &nbsp;{project.domain}</p>
        <p className="line-clamp-2 text-xs font-bold leading-5 text-white">{title}</p>
        <nav aria-label="Project workspace sections" className="mt-4 flex gap-1 overflow-x-auto lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {navLinks.map(([label, path]) => <Link key={path} href={projectPath(project.id, path)} aria-current={activeSection === path ? 'page' : undefined} className={cn('shrink-0 rounded-lg px-3 py-2 text-[10px] font-medium', activeSection === path ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white')}>{label}</Link>)}
        </nav>
        <div className="mt-4 hidden items-center gap-2 border-t border-slate-800 pt-4 text-[9px] text-slate-400 lg:flex"><UserAvatar name="Sharath Swaroop" tone="violet" size="size-7" /><span>Sharath Swaroop<br />Contributor</span></div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0"><p className="truncate text-[9px] text-slate-500">{project.domain} · project workspace</p><h1 className="text-balance mt-1 truncate text-lg font-bold text-white">{title}</h1></div>
          <div className="flex flex-wrap items-center gap-2"><StatusBadge tone="emerald">{project.tags[0]}</StatusBadge><StatusBadge tone="blue">{project.tags[1]}</StatusBadge><StatusBadge tone="rose">{project.tags[2] ?? project.status}</StatusBadge><StatusBadge tone="amber">Due in 6 days</StatusBadge></div>
        </header>
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          <nav aria-label="Project subsection navigation" className="hidden gap-1 overflow-x-auto border-b border-slate-800 pb-2 lg:flex">{[['Overview', 'overview'], ['Team', 'team'], ['Milestones', 'milestones'], ['Resources', 'evidence']].map(([label, path]) => <Link key={label} href={projectPath(project.id, path)} className={cn('shrink-0 rounded px-3 py-2 text-[10px]', activeSection === path ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white')}>{label}</Link>)}</nav>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <ProjectSectionContent project={project} section={activeSection} accessRequested={accessRequested} onRequestAccess={() => setAccessRequested(true)} />
            <aside className="space-y-4">
              {activeSection === 'overview' && <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h2 className="text-xs font-bold text-white">Quick Actions</h2><div className="mt-3 grid gap-2">{[['View Charter', 'charter'], ['Request Access', 'access'], ['Open AI Workspace', 'ai-workspace'], ['Submit Deliverable', 'contributions']].map(([label, path]) => <Link key={path} href={projectPath(project.id, path)} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2.5 text-[10px] font-semibold text-slate-100 hover:bg-indigo-700">{label}<ArrowRight className="size-3" aria-hidden="true" /></Link>)}</div></section>}
              <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-bold text-white">Project Team</h2><Link href={projectPath(project.id, 'team')} className="text-[9px] text-indigo-300">View all</Link></div><ul className="mt-3 space-y-3">{demoPeople.slice(0, 3).map((person) => <li key={person.name} className="flex items-center gap-2"><UserAvatar name={person.name} tone="indigo" /><div><p className="text-[10px] font-semibold text-slate-200">{person.name}</p><p className="text-[9px] text-slate-500">{person.role}</p></div></li>)}</ul></section>
              <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h2 className="text-xs font-bold text-white">Next Milestone</h2><p className="mt-2 text-[10px] font-medium text-slate-300">Baseline model + report</p><p className="mt-1 text-[9px] text-rose-300">Due in 6 days</p><div className="mt-3"><ProgressBar value={60} tone="violet" /></div></section>
            </aside>
          </div>
          <p className="text-center text-[9px] text-slate-500">Project workspace preview · all people, documents, progress, and activity are sample data.</p>
        </div>
      </main>
    </div>
  );
}

function ProjectSectionContent({
  project,
  section,
  accessRequested,
  onRequestAccess,
}: {
  project: (typeof demoProjects)[number];
  section: string;
  accessRequested: boolean;
  onRequestAccess: () => void;
}) {
  const shellClass = 'rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm';
  if (section === 'ai-workspace') return <AIWorkspace />;
  if (section === 'access') return <section className="rounded-xl border border-indigo-900 bg-indigo-950/60 p-4"><p className="text-xs font-bold text-white">Request project access</p><p className="text-pretty mt-1 text-[10px] text-slate-300">Choose a resource scope and explain how it supports your research work.</p><label className="mt-3 block text-[10px] font-medium text-slate-300">Resource scope<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"><option>Research dataset v2</option><option>Implementation workspace</option><option>Project charter</option></select></label><label className="mt-3 block text-[10px] font-medium text-slate-300">Reason<textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" placeholder="Describe how access supports your work." /></label><MockAction onClick={onRequestAccess}>{accessRequested ? 'Access request sent' : 'Submit access request'}</MockAction>{accessRequested && <p className="mt-2 text-[10px] text-emerald-300" role="status">Your sample request is waiting for a sponsor or mentor decision.</p>}</section>;
  if (section === 'overview') return <div className="space-y-4"><section className={shellClass}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-white">Problem Statement</h2><p className="text-pretty mt-2 max-w-3xl text-[10px] leading-5 text-slate-300">{project.summary}</p></div><span className="flex size-24 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-2xl" aria-label="Research lab illustration">🔬</span></div><div className="mt-4 grid gap-2 sm:grid-cols-4">{[['Domain', project.domain], ['Type', 'Research + Implementation'], ['Timeline', '3 months'], ['Reward', project.reward]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-800 bg-slate-950 p-2"><p className="text-[8px] text-slate-500">{label}</p><p className="mt-1 text-[9px] font-semibold text-slate-200">{value}</p></div>)}</div><div className="mt-4"><ProgressBar value={project.progress} label="Project progress" tone="violet" /></div></section><DocumentsPanel /><ActivityPanel /></div>;
  if (section === 'charter') return <section className={shellClass}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Project Charter · Version 2</h2><StatusBadge tone="emerald">Approved</StatusBadge></div><p className="text-pretty mt-3 text-xs leading-5 text-slate-300">Establish a reproducible research workflow to evaluate {project.domain.toLowerCase()} methods, document limitations, and share evidence with the project team.</p><dl className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-950 p-3"><dt className="text-[9px] text-slate-500">Research objectives</dt><dd className="mt-1 text-[10px] text-slate-200">Replicable methods, transparent evaluation, accessible findings.</dd></div><div className="rounded-lg bg-slate-950 p-3"><dt className="text-[9px] text-slate-500">Contribution policy</dt><dd className="mt-1 text-[10px] text-slate-200">Human-reviewed evidence and documented author contributions.</dd></div><div className="rounded-lg bg-slate-950 p-3"><dt className="text-[9px] text-slate-500">Data governance</dt><dd className="mt-1 text-[10px] text-slate-200">Approved project resources only; no sensitive data in public reports.</dd></div><div className="rounded-lg bg-slate-950 p-3"><dt className="text-[9px] text-slate-500">Last review</dt><dd className="mt-1 text-[10px] text-slate-200">Oct 3 · Dr. Ananya Rao</dd></div></dl><div className="mt-4"><DocumentCard title="Project Charter v2.pdf" kind="Approved · 420 KB" access="Team" /></div></section>;
  if (section === 'team') return <section className={shellClass}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Project Team</h2><StatusBadge tone="blue">{project.members} collaborators</StatusBadge></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{demoPeople.map((person) => <article key={person.name} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3"><UserAvatar name={person.name} tone="indigo" size="size-9" /><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-100">{person.name}</p><p className="text-[9px] text-slate-500">{person.role}</p></div><span className="text-right text-[9px] text-slate-400">{person.skills.join(' · ')}</span></article>)}</div><div className="mt-4 rounded-lg border border-slate-800 p-3"><p className="text-[10px] font-semibold text-slate-200">Request a mentor</p><p className="mt-1 text-[9px] text-slate-500">Ask for research guidance from an experienced mentor.</p><Link href="/researcher/access" className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-indigo-300">Request mentor access <ArrowRight className="size-3" aria-hidden="true" /></Link></div></section>;
  if (section === 'research') return <div className="space-y-4"><section className={shellClass}><h2 className="text-sm font-bold text-white">Research notes</h2><ul className="mt-3 space-y-3">{[['Literature review: evaluation methods', 'Compare sensitivity and specificity reporting across recent studies.', 'Dr. Ananya Rao · Oct 4'], ['Dataset review: sample coverage', 'Document cohort representation and image acquisition settings.', 'Sharath Swaroop · Oct 2'], ['Research question', 'Which evaluation design best supports reproducible early-stage findings?', 'Team note · Sep 29']].map(([title, detail, author]) => <li key={title} className="rounded-lg border border-slate-800 bg-slate-950 p-3"><p className="text-[10px] font-semibold text-slate-100">{title}</p><p className="mt-1 text-[9px] leading-4 text-slate-400">{detail}</p><p className="mt-2 text-[8px] text-slate-500">{author}</p></li>)}</ul></section><DocumentsPanel /></div>;
  if (section === 'implementation') return <section className={shellClass}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Implementation plan</h2><StatusBadge tone="blue">3 workstreams</StatusBadge></div><div className="mt-4 space-y-4">{[['Baseline model & evaluation', 60, 'In progress'], ['Dataset documentation', 80, 'In review'], ['Reproducibility package', 25, 'Planned']].map(([title, value, status]) => <div key={String(title)}><div className="mb-1 flex justify-between gap-3 text-[10px]"><span className="font-semibold text-slate-200">{title}</span><span className="text-slate-400">{status}</span></div><ProgressBar value={Number(value)} tone="violet" /></div>)}</div><div className="mt-4 rounded-lg bg-slate-950 p-3"><p className="text-[9px] font-semibold text-slate-200">Current implementation note</p><p className="mt-1 text-[9px] leading-4 text-slate-400">Evaluation scripts should record data split, model configuration, and environment version for each run.</p></div></section>;
  if (section === 'experiments') return <section className={shellClass}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Experiments</h2><StatusBadge tone="amber">Execution UI only</StatusBadge></div><p className="text-pretty mt-1 text-[9px] text-slate-400">Documented experiment examples; no jobs are being executed.</p><div className="mt-3 space-y-2">{[['Baseline model evaluation', 'Compare sensitivity across a held-out cohort', 'Results documented'], ['Augmentation sensitivity analysis', 'Assess the impact of image normalization choices', 'In review'], ['Reproducibility check', 'Repeat selected runs with fixed configuration', 'Planned']].map(([name, goal, status]) => <article key={name} className="rounded-lg border border-slate-800 bg-slate-950 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-semibold text-slate-100">{name}</p><p className="mt-1 text-[9px] text-slate-400">{goal}</p></div><StatusBadge tone={status === 'Planned' ? 'amber' : 'blue'}>{status}</StatusBadge></div></article>)}</div></section>;
  if (section === 'evidence') return <div className="space-y-4"><section className={shellClass}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Research Evidence</h2><StatusBadge tone="blue">6 shared items</StatusBadge></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{[['Problem Statement.pdf', '2.4 MB', 'Public'], ['Dataset Guide.pdf', '1.2 MB', 'Team'], ['Evaluation Criteria.pdf', '800 KB', 'Team'], ['NDA & IP Terms.pdf', '600 KB', 'Restricted']].map(([name, size, access]) => <DocumentCard key={name} title={name} kind={size} access={access} />)}</div></section><section className={shellClass}><h2 className="text-xs font-bold text-white">Evidence notes</h2><p className="text-pretty mt-2 text-[9px] leading-4 text-slate-400">Methods, sources, and provenance are recorded alongside project evidence so collaborators can interpret and reproduce findings.</p></section></div>;
  if (section === 'milestones') return <section className={shellClass}><h2 className="text-sm font-bold text-white">Project Milestones</h2><ol className="mt-4 space-y-4">{[['Baseline model + report', 'Oct 12', 'In progress'], ['Dataset review', 'Oct 18', 'Upcoming'], ['Reproducibility package', 'Oct 25', 'Planned'], ['Final research report', 'Nov 3', 'Planned']].map(([name, due, status], index) => <li key={name} className="flex gap-3"><span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold', index === 0 ? 'bg-violet-100 text-violet-700' : 'bg-slate-800 text-slate-400')}>{index + 1}</span><div className="flex-1 border-b border-slate-800 pb-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-[10px] font-semibold text-slate-200">{name}</p><StatusBadge tone={index === 0 ? 'violet' : 'slate'}>{status}</StatusBadge></div><p className="mt-1 text-[9px] text-slate-500">Target date · {due}</p></div></li>)}</ol></section>;
  if (section === 'contributions') return <div className="space-y-3"><section className={shellClass}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Contribution review</h2><StatusBadge tone="blue">Human review required</StatusBadge></div><p className="mt-1 text-[9px] text-slate-400">AI analysis is illustrative only. Mentors make all final review and credit decisions.</p></section>{[['Baseline evaluation summary', 'Sharath Swaroop', 80, 'Mentor review pending'], ['MRI dataset documentation', 'Priya Nair', 60, 'Approved'], ['Literature review notes', 'Karan Patel', 45, 'Under review']].map(([name, author, credits, status]) => <section key={String(name)} className={shellClass}><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-[10px] font-bold text-slate-100">{name}</h3><p className="mt-1 text-[9px] text-slate-500">Submitted by {author}</p></div><StatusBadge tone={status === 'Approved' ? 'emerald' : 'amber'}>{status}</StatusBadge></div><div className="mt-3 rounded-lg border border-indigo-900 bg-indigo-950/60 p-3"><p className="text-[9px] font-semibold text-indigo-200">AI analysis · sample</p><p className="mt-1 text-[9px] leading-4 text-slate-300">Evidence completeness and reproducibility are strong; verify cohort coverage in mentor review.</p></div><p className="mt-2 text-[9px] text-slate-400">Suggested credits <span className="font-bold text-slate-100">{credits}</span> · Final credits <span className="font-bold text-slate-100">{status === 'Approved' ? credits : 'Pending'}</span></p></section>)}</div>;
  if (section === 'activity') return <section className={shellClass}><h2 className="text-sm font-bold text-white">Project Activity</h2><div className="mt-3"><ActivityFeed items={demoActivity} /></div></section>;
  return <section className={shellClass}><h2 className="text-sm font-bold text-white">{titleCase(section)}</h2><p className="text-pretty mt-2 text-[10px] leading-5 text-slate-300">{sectionDescription(section)}</p></section>;
}

function DocumentsPanel() {
  return <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-bold text-white">Key Documents</h2><StatusBadge tone="blue">4 documents</StatusBadge></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{[['Problem Statement.pdf', '2.4 MB', 'Public'], ['Dataset Guide.pdf', '1.2 MB', 'Team'], ['Evaluation Criteria.pdf', '800 KB', 'Team'], ['NDA & IP Terms.pdf', '600 KB', 'Restricted']].map(([name, size, access]) => <DocumentCard key={name} title={name} kind={size} access={access} />)}</div></section>;
}

function ActivityPanel() {
  return <section className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex items-center justify-between"><h2 className="text-xs font-bold text-white">Recent Project Activity</h2><Activity className="size-4 text-slate-400" aria-hidden="true" /></div><div className="mt-3"><ActivityFeed items={demoActivity.slice(0, 3)} /></div></section>;
}

function sectionDescription(section: string) {
  const descriptions: Record<string, string> = {
    charter: 'The project charter establishes goals, research principles, ownership, and how project contributions are reviewed.',
    team: 'Meet the researchers, mentors, and contributors working together on this project.',
    research: 'Review literature, research notes, shared methods, and project findings.',
    implementation: 'Track the implementation plan, technical decisions, and deliverables.',
    experiments: 'Review documented experiments, hypotheses, and reproducibility notes.',
    'ai-workspace': 'AI Mesh research and analysis agents are represented as UI concepts only. No runtime is connected.',
    evidence: 'Browse project-approved evidence, datasets, and supporting documents.',
    access: 'Request the project resources required for your contribution.',
    milestones: 'Track upcoming research milestones and team progress.',
    contributions: 'Review submitted work, AI analysis summaries, mentor reviews, and suggested credits.',
    activity: 'A timestamped timeline of project discussions and changes.',
    overview: 'Project goals, research scope, and collaboration status.',
  };
  return descriptions[section] ?? 'Explore the project workspace and its shared research resources.';
}

export function RoleScreen({ segments }: { segments: string[] }) {
  const { currentRole } = useRole();
  if (segments[0] === 'projects') {
    if (segments.length === 1 && currentRole === 'STUDENT') return <StudentProjects />;
    if (segments.length === 1) return <ProjectListing role={currentRole} />;
    const id = segments[1] ?? demoProjects[0].id;
    const section = segments[2] ?? 'overview';
    return <ProjectWorkspace id={id} section={section} />;
  }
  const roleSlug = segments[0] ?? 'student';
  const role: UserRole = knownRoles.has(roleSlug) ? roleBySlug[roleSlug] : 'STUDENT';
  const roleSection = segments[1] ?? 'dashboard';
  const selectedSection = roleSection === 'projects'
    ? 'projects'
    : roleSection === 'research-workspace' || roleSection === 'workspace' || roleSection === 'my-research'
      ? 'research-workspace'
      : roleSection === 'access-requests' || roleSection === 'requests'
        ? 'access-requests'
        : roleSection;
  const isDashboard = selectedSection === '' || selectedSection === 'dashboard';
  if (role === 'STUDENT') {
    if (isDashboard) return <StudentDashboard />;
    if (selectedSection === 'projects') return <StudentProjects />;
    if (selectedSection === 'my-work') return <StudentMyWork />;
    if (selectedSection === 'ai-workspace') return <StudentAIWorkspace />;
    if (selectedSection === 'skills') return <SkillsPage />;
    if (selectedSection === 'contributions') return <StudentContributions />;
    if (selectedSection === 'access' || selectedSection === 'access-requests') return <StudentAccess />;
    if (selectedSection === 'messages') return <StudentMessages />;
  }
  return isDashboard ? <Dashboard role={role} /> : selectedSection === 'projects' ? <ProjectListing role={role} /> : <GenericRolePage role={role} section={selectedSection} />;
}
