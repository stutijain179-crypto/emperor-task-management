import React, { useMemo, useState } from 'react'
import {
  Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Circle,
  Clock3, Filter, LayoutDashboard, Menu, MoreHorizontal, Pencil, Plus, Search,
  SlidersHorizontal, Sparkles, Target, Trash2, X, Zap,
} from 'lucide-react'

type Status = 'AVAILABLE' | 'IN PROGRESS' | 'COMPLETED' | 'OVERDUE'
type Priority = 'Low' | 'Medium' | 'High'
type Task = {
  id: string; title: string; description: string; features: string[]; outcome: string
  dueDate: string; status: Status; priority: Priority; progress: number; category: string
}
type Toast = { id: number; message: string; tone: 'success' | 'error' }

const initialTasks: Task[] = [
  { id: '1', title: 'Task Management Application', description: 'Develop a full-stack task management application for creating, updating and tracking tasks.', features: ['User authentication', 'CRUD operations', 'Task status tracking', 'Responsive design', 'API integration'], outcome: 'Learn full-stack application structure, API integration and dynamic data handling.', dueDate: '2026-09-12', status: 'IN PROGRESS', priority: 'High', progress: 65, category: 'Product' },
  { id: '2', title: 'AI Resume Analyzer', description: 'Build a smart resume analyzer that turns experience into actionable career insights.', features: ['PDF parsing', 'Skill extraction', 'Feedback report'], outcome: 'Ship a useful AI workflow with a thoughtful user experience.', dueDate: '2026-09-18', status: 'AVAILABLE', priority: 'Medium', progress: 20, category: 'AI / ML' },
  { id: '3', title: 'Portfolio Case Study', description: 'Document the process, decisions and measurable outcomes of a recent build.', features: ['Narrative structure', 'Visual polish', 'Public launch'], outcome: 'Create a credible proof of work for future opportunities.', dueDate: '2026-09-05', status: 'COMPLETED', priority: 'Low', progress: 100, category: 'Career' },
  { id: '4', title: 'Learn Vector Databases', description: 'Explore semantic search patterns and build a small retrieval prototype.', features: ['Embeddings', 'Indexing', 'Evaluation'], outcome: 'Understand the foundations of modern retrieval systems.', dueDate: '2026-09-02', status: 'OVERDUE', priority: 'High', progress: 35, category: 'AI / ML' },
]

const storageKey = 'emperor-tasks'
const today = new Date('2026-09-03T12:00:00')

function readTasks(): Task[] {
  try { const stored = localStorage.getItem(storageKey); return stored ? JSON.parse(stored) : initialTasks } catch { return initialTasks }
}
function saveTasks(tasks: Task[]) { localStorage.setItem(storageKey, JSON.stringify(tasks)) }
function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }
function daysLeft(value: string) {
  const days = Math.ceil((new Date(`${value}T12:00:00`).getTime() - today.getTime()) / 86400000)
  return days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days left`
}

const statusClass: Record<Status, string> = { AVAILABLE: 'available', 'IN PROGRESS': 'progress', COMPLETED: 'completed', OVERDUE: 'overdue' }

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(readTasks)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sort, setSort] = useState('deadline')
  const [selected, setSelected] = useState<Task | null>(null)
  const [editing, setEditing] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [month, setMonth] = useState(8)
  const [quote, setQuote] = useState(0)
  const [toast, setToast] = useState<Toast | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [submissionTask, setSubmissionTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  const notify = (message: string, tone: Toast['tone'] = 'success') => {
    setToast({ id: Date.now(), message, tone })
    window.setTimeout(() => setToast(null), 2800)
  }
  const updateTasks = (next: Task[]) => {
    setTasks(next)
    try { saveTasks(next) } catch { notify('Could not save changes. Please try again.', 'error') }
  }
  const metrics = useMemo(() => ({
    total: tasks.length, completed: tasks.filter(t => t.status === 'COMPLETED').length,
    progress: tasks.filter(t => t.status === 'IN PROGRESS').length, overdue: tasks.filter(t => t.status === 'OVERDUE').length,
  }), [tasks])
  const visible = useMemo(() => tasks.filter(t => {
    const matchesText = `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter
    return matchesText && matchesStatus && matchesPriority
  }).sort((a, b) => sort === 'priority' ? ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]) : a.dueDate.localeCompare(b.dueDate)), [tasks, query, statusFilter, priorityFilter, sort])

  const changeStatus = (task: Task, status: Status) => {
    const nextTask = { ...task, status, progress: status === 'COMPLETED' ? 100 : task.progress }
    updateTasks(tasks.map(t => t.id === task.id ? nextTask : t))
    setSelected(nextTask)
    notify(status === 'COMPLETED' ? 'Task marked as completed.' : status === 'IN PROGRESS' ? 'Task started.' : 'Task status updated.')
  }
  const removeTask = (id: string) => { updateTasks(tasks.filter(t => t.id !== id)); setSelected(null); setDeleteTask(null); notify('Task deleted successfully.') }
  const motivation = ['Learn. Build. Improve.', 'Discipline creates results.', 'Think strategically. Execute consistently.', 'Don’t just learn technology. Build with it.']
  const calendarDays = new Date(2026, month + 1, 0).getDate()
  const firstDay = new Date(2026, month, 1).getDay()

  return (
    <div className="emperor-app" style={{ '--parallax-x': `${parallax.x}px`, '--parallax-y': `${parallax.y}px` } as React.CSSProperties} onMouseMove={event => setParallax({ x: (event.clientX / window.innerWidth - .5) * 10, y: (event.clientY / window.innerHeight - .5) * 8 })}>
      <div className="emperor-stars" />
      <div className="emperor-mountains emperor-mountains-far" /><div className="emperor-mountains emperor-mountains-near" /><div className="emperor-fog" />
      <aside className={`emperor-sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="emperor-mark"><div className="crown-mark">✦</div><div><strong>EMPEROR</strong><span>BUILD. LEAD. CREATE.</span></div></div>
        <nav className="emperor-nav">
          {[['Dashboard', LayoutDashboard], ['My Tasks', Target], ['Projects', Sparkles], ['Calendar', CalendarDays], ['Progress', Zap], ['Profile', Circle]].map(([label, Icon], i) => (
            <a href={i === 0 ? '#top' : `#${String(label).toLowerCase().replace(' ', '-')}`} className={i === 0 ? 'active' : ''} key={String(label)} onClick={() => setMobileNav(false)}><Icon size={17} />{label as string}</a>
          ))}
        </nav>
        <div className="sidebar-bottom"><div className="streak"><span>FOCUS STREAK</span><b>07 <small>days</small></b><div className="streak-bar"><i /></div></div><div className="sidebar-user"><div className="avatar">E</div><span><b>Emperor</b><small>Personal workspace</small></span><MoreHorizontal size={16} /></div></div>
      </aside>

      <main className="emperor-main" id="top">
        <header className="emperor-header"><button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open menu" aria-expanded={mobileNav}><Menu size={21} /></button><div className="header-context"><span>WORKSPACE</span><b>Task Management</b></div><div className="header-actions"><div className="header-popover-wrap"><button className="icon-button" aria-label="Notifications" onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false) }}><Bell size={18} /><i /></button>{notificationsOpen && <div className="header-popover notification-popover"><b>Notifications</b><p><span className="dot blue" /> {metrics.progress} mission{metrics.progress === 1 ? '' : 's'} in progress</p><p><span className="dot red" /> {metrics.overdue} deadline{metrics.overdue === 1 ? '' : 's'} need attention</p></div>}</div><div className="header-popover-wrap"><button className="header-avatar" aria-label="Open profile" onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false) }}>E</button>{profileOpen && <div className="header-popover profile-popover"><b>EMPEROR</b><p>Developer · Builder</p><a href="#profile" onClick={() => setProfileOpen(false)}>View profile</a></div>}</div><ChevronDown size={15} /></div></header>
        <div className="emperor-content">
          <section className="hero">
            <div><span className="eyebrow">THURSDAY, 03 SEPTEMBER 2026</span><h1>Welcome back, <em>Emperor.</em></h1><p>Stay focused. Build consistently. Lead your day.</p></div>
            <div className="today-progress"><div className="ring"><strong>{metrics.total ? Math.round(metrics.completed / metrics.total * 100) : 0}<small>%</small></strong></div><div><span>TODAY</span><b>{metrics.total - metrics.completed} Tasks Remaining</b><small>{metrics.completed} of {metrics.total} completed</small></div></div>
          </section>

          <section className="stats-grid" id="progress">{[['TOTAL TASKS', metrics.total, 'neutral'], ['COMPLETED', metrics.completed, 'green'], ['IN PROGRESS', metrics.progress, 'blue'], ['OVERDUE', metrics.overdue, 'red']].map(([label, value, tone]) => <div className="stat-card" key={String(label)}><span>{label as string}</span><strong className={String(tone)}>{String(value).padStart(2, '0')}</strong><small><span className={`dot ${tone}`} />{label === 'TOTAL TASKS' ? 'Across your workspace' : `${Math.round(Number(value) / Math.max(metrics.total, 1) * 100)}% of all tasks`}</small></div>)}</section>

          <section className="section-heading" id="my-tasks"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>Active missions <span>{visible.length}</span></h2></div><button className="primary-button" onClick={() => { setEditing(null); setShowForm(true) }}><Plus size={17} /> New Task</button></section>
          <section className="toolbar"><div className="search-box"><Search size={16} /><input placeholder="Search tasks..." value={query} onChange={e => setQuery(e.target.value)} /></div><div className="filter-wrap"><Filter size={15} />{['All', 'AVAILABLE', 'IN PROGRESS', 'COMPLETED', 'OVERDUE'].map(s => <button className={statusFilter === s ? 'selected' : ''} onClick={() => setStatusFilter(s)} key={s}>{s === 'IN PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}</button>)}</div><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} aria-label="Filter by priority"><option value="All">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select><select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort tasks"><option value="deadline">Sort: Deadline</option><option value="priority">Sort: Priority</option></select><SlidersHorizontal size={17} className="mobile-filter" /></section>

          <section className="task-grid">{visible.length === 0 ? <div className="empty-state"><Target size={30} /><h3>Your workspace is clear.</h3><p>Create your first task and start building.</p></div> : visible.map((task, index) => <TiltCard key={task.id}><article className="task-card"><div className="task-top"><span className="task-number">TASK {String(index + 1).padStart(2, '0')}</span><span className={`status-badge ${statusClass[task.status]}`}><i />{task.status}</span><button className="more-button" onClick={() => { setEditing(task); setShowForm(true) }} aria-label={`Edit ${task.title}`} title="Edit task"><MoreHorizontal size={18} /></button></div><div className="task-meta"><span><CalendarDays size={13} /> {formatDate(task.dueDate)}</span><span className={task.status === 'OVERDUE' ? 'danger' : ''}><Clock3 size={13} /> {daysLeft(task.dueDate)}</span></div><h3>{task.title}</h3><p>{task.description}</p><div className="feature-list"><span>KEY FEATURES</span>{task.features.slice(0, 3).map(feature => <b key={feature}><Check size={12} />{feature}</b>)}</div><div className="outcome"><span>EXPECTED OUTCOME</span><p>{task.outcome}</p></div><div className="task-footer"><div className="progress-copy"><span>Progress <b>{task.progress}%</b></span><div className="progress-track"><i style={{ width: `${task.progress}%` }} /></div></div><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority}</span></div><button className="view-button" onClick={() => setSelected(task)}>VIEW TASK <ChevronRight size={15} /></button></article></TiltCard>)}</section>

          <section className="lower-grid" id="calendar"><div className="calendar-card"><div className="card-heading"><div><span className="eyebrow">PLAN AHEAD</span><h2>Deadline calendar</h2></div><div className="month-control"><button onClick={() => setMonth(Math.max(0, month - 1))} aria-label="Previous month"><ChevronLeft size={16} /></button><b>{new Date(2026, month).toLocaleDateString('en-US', { month: 'long' })} 2026</b><button onClick={() => setMonth(Math.min(11, month + 1))} aria-label="Next month"><ChevronRight size={16} /></button></div></div><div className="calendar-week">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={`${d}${i}`}>{d}</span>)}</div><div className="calendar-grid">{Array.from({ length: firstDay }).map((_, i) => <i key={`blank${i}`} />)}{Array.from({ length: calendarDays }, (_, i) => i + 1).map(day => { const date = `2026-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const due = tasks.filter(t => t.dueDate === date); return <button className={due.length ? 'has-task' : ''} key={day} onClick={() => due[0] && setSelected(due[0])} aria-label={`${formatDate(date)}${due.length ? `, ${due.length} task${due.length > 1 ? 's' : ''}` : ''}`}>{day}{due.length > 0 && <i />}</button> })}</div></div><div className="mindset-card" id="projects"><div className="mindset-icon"><Sparkles size={18} /></div><span className="eyebrow">THE EMPEROR MINDSET</span><h2>{motivation[quote]}</h2><p>Your edge is built one deliberate action at a time.</p><button onClick={() => setQuote((quote + 1) % motivation.length)}>Next thought <ChevronRight size={15} /></button></div></section>
          <section className="profile-section" id="profile"><span className="eyebrow">PERSONAL BRAND</span><h2>EMPEROR</h2><p>Developer · AI/ML Learner · Builder · Future Entrepreneur</p><div><b>{metrics.completed}</b><span>Tasks completed</span><b>{metrics.total ? Math.round(metrics.completed / metrics.total * 100) : 0}%</b><span>Learning progress</span></div></section>
        </div>
      </main>
      {selected && <TaskModal task={selected} onClose={() => setSelected(null)} onStatus={changeStatus} onEdit={() => { setEditing(selected); setSelected(null); setShowForm(true) }} onDelete={() => setDeleteTask(selected)} onSubmit={() => setSubmissionTask(selected)} />}
      {deleteTask && <ConfirmDialog task={deleteTask} onClose={() => setDeleteTask(null)} onConfirm={() => removeTask(deleteTask.id)} />}
      {submissionTask && <SubmissionDialog task={submissionTask} onClose={() => setSubmissionTask(null)} onSubmit={() => { setSubmissionTask(null); notify('Work submitted successfully.') }} />}
      {showForm && <TaskForm task={editing} onClose={() => setShowForm(false)} onSave={task => { updateTasks(editing ? tasks.map(t => t.id === task.id ? task : t) : [...tasks, task]); setShowForm(false); notify(editing ? 'Task updated successfully.' : 'Task created successfully.') }} />}
      {toast && <div className={`toast ${toast.tone}`} role="status"><Check size={15} />{toast.message}</div>}
    </div>
  )
}

function TiltCard({ children }: { children: React.ReactNode }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  return <div className="tilt-card" onMouseMove={event => { const rect = event.currentTarget.getBoundingClientRect(); setTilt({ x: ((event.clientY - rect.top) / rect.height - .5) * -5, y: ((event.clientX - rect.left) / rect.width - .5) * 5 }) }} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>{children}</div>
}

function TaskModal({ task, onClose, onStatus, onEdit, onDelete, onSubmit }: { task: Task; onClose: () => void; onStatus: (task: Task, status: Status) => void; onEdit: () => void; onDelete: () => void; onSubmit: () => void }) {
  return <div className="modal-backdrop" onMouseDown={e => e.currentTarget === e.target && onClose()}><div className="task-modal"><button className="modal-close" onClick={onClose} aria-label="Close task details"><X size={18} /></button><span className={`status-badge ${statusClass[task.status]}`}><i />{task.status}</span><span className="eyebrow modal-label">TASK DETAILS</span><h2>{task.title}</h2><p className="modal-description">{task.description}</p><div className="detail-columns"><div><span className="detail-label">REQUIREMENTS</span><ul>{task.features.map(f => <li key={f}><Check size={14} />{f}</li>)}</ul></div><div><span className="detail-label">EXPECTED OUTCOME</span><p>{task.outcome}</p><span className="detail-label">DEADLINE</span><p>{formatDate(task.dueDate)} · {daysLeft(task.dueDate)}</p></div></div><div className="modal-progress"><span>Progress <b>{task.progress}%</b></span><div className="progress-track"><i style={{ width: `${task.progress}%` }} /></div></div><div className="modal-actions"><button onClick={() => onStatus(task, task.status === 'COMPLETED' ? 'IN PROGRESS' : task.status === 'AVAILABLE' ? 'IN PROGRESS' : 'COMPLETED')} className="primary-button">{task.status === 'COMPLETED' ? 'CONTINUE' : task.status === 'AVAILABLE' ? 'START TASK' : 'MARK COMPLETE'}</button><button className="secondary-button" onClick={onSubmit}>SUBMIT WORK</button><button className="secondary-button" onClick={onEdit}><Pencil size={15} /> Edit</button><button className="delete-button" onClick={onDelete} aria-label="Delete task"><Trash2 size={15} /></button></div></div></div>
}

function TaskForm({ task, onClose, onSave }: { task: Task | null; onClose: () => void; onSave: (task: Task) => void }) {
  const [form, setForm] = useState<Task>(task || { id: crypto.randomUUID(), title: '', description: '', features: ['Thoughtful execution'], outcome: '', dueDate: '2026-09-30', status: 'AVAILABLE', priority: 'Medium', progress: 0, category: 'Product' })
  const [error, setError] = useState('')
  const set = (key: keyof Task, value: string) => setForm({ ...form, [key]: value })
  return <div className="modal-backdrop"><form className="task-modal form-modal" onSubmit={e => { e.preventDefault(); if (!form.title.trim()) { setError('Add a task title to continue.'); return } if (!form.description.trim()) { setError('Add a short description to continue.'); return } if (!form.dueDate || Number.isNaN(new Date(`${form.dueDate}T12:00:00`).getTime())) { setError('Choose a valid deadline.'); return } onSave({ ...form, title: form.title.trim(), description: form.description.trim() }) }}><button type="button" className="modal-close" onClick={onClose} aria-label="Close task form"><X size={18} /></button><span className="eyebrow modal-label">{task ? 'REFINE MISSION' : 'NEW MISSION'}</span><h2>{task ? 'Edit task' : 'Create a task'}</h2>{error && <p className="form-error" role="alert">{error}</p>}<label>Task title<input required value={form.title} onChange={e => { setError(''); set('title', e.target.value) }} placeholder="e.g. Launch landing page" /></label><label>Description<textarea required value={form.description} onChange={e => { setError(''); set('description', e.target.value) }} placeholder="What does success look like?" /></label><div className="form-row"><label>Priority<select value={form.priority} onChange={e => set('priority', e.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option></select></label><label>Due date<input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} /></label></div><div className="form-row"><label>Category<input value={form.category} onChange={e => set('category', e.target.value)} /></label><label>Status<select value={form.status} onChange={e => set('status', e.target.value as Status)}><option>AVAILABLE</option><option>IN PROGRESS</option><option>COMPLETED</option><option>OVERDUE</option></select></label></div><div className="modal-actions"><button type="submit" className="primary-button">{task ? 'SAVE CHANGES' : 'CREATE TASK'}</button><button type="button" className="secondary-button" onClick={onClose}>Cancel</button></div></form></div>
}

function ConfirmDialog({ task, onClose, onConfirm }: { task: Task; onClose: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop"><div className="task-modal confirm-modal"><button className="modal-close" onClick={onClose} aria-label="Close confirmation"><X size={18} /></button><span className="eyebrow modal-label">DESTRUCTIVE ACTION</span><h2>Delete this task?</h2><p className="modal-description">“{task.title}” will be permanently removed from your workspace.</p><div className="modal-actions"><button className="delete-confirm" onClick={onConfirm}>DELETE TASK</button><button className="secondary-button" onClick={onClose}>Keep task</button></div></div></div>
}

function SubmissionDialog({ task, onClose, onSubmit }: { task: Task; onClose: () => void; onSubmit: () => void }) {
  return <div className="modal-backdrop"><form className="task-modal form-modal" onSubmit={e => { e.preventDefault(); onSubmit() }}><button type="button" className="modal-close" onClick={onClose} aria-label="Close submission form"><X size={18} /></button><span className="eyebrow modal-label">SUBMISSION</span><h2>Submit your work</h2><p className="modal-description">Attach a link or note for <b>{task.title}</b>.</p><label>Project link<input required type="url" placeholder="https://..." /></label><label>Notes<textarea required placeholder="What did you build?" /></label><div className="modal-actions"><button className="primary-button" type="submit">SUBMIT WORK</button><button type="button" className="secondary-button" onClick={onClose}>Cancel</button></div></form></div>
}
