import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const dataFile = join(root, 'data', 'tasks.json')
const port = Number(process.env.PORT || 8787)
const apiKey = process.env.EMPEROR_API_KEY

if (!apiKey) {
  console.error('EMPEROR_API_KEY is required. Copy .env.example and set it before starting the API.')
  process.exit(1)
}

const readTasks = () => {
  if (!existsSync(dataFile)) return []
  return JSON.parse(readFileSync(dataFile, 'utf8'))
}
const writeTasks = (tasks) => {
  mkdirSync(dirname(dataFile), { recursive: true })
  writeFileSync(dataFile, JSON.stringify(tasks, null, 2))
}
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*' })
  res.end(JSON.stringify(body))
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN || '*', 'Access-Control-Allow-Headers': 'Content-Type, X-API-Key', 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS' })
    return res.end()
  }
  if (req.url === '/health' && req.method === 'GET') return send(res, 200, { status: 'ok', service: 'emperor-task-management-api' })
  if (req.headers['x-api-key'] !== apiKey) return send(res, 401, { error: 'Invalid or missing API key.' })

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  if (!url.pathname.startsWith('/api/tasks')) return send(res, 404, { error: 'Route not found.' })
  const taskId = url.pathname.split('/')[3]

  if (req.method === 'GET') return send(res, 200, taskId ? readTasks().find(task => task.id === taskId) || { error: 'Task not found.' } : readTasks())

  let raw = ''
  req.on('data', chunk => { raw += chunk })
  req.on('end', () => {
    let payload = {}
    try { payload = raw ? JSON.parse(raw) : {} } catch { return send(res, 400, { error: 'Request body must be valid JSON.' }) }
    const tasks = readTasks()
    if (req.method === 'POST') {
      if (typeof payload.title !== 'string' || !payload.title.trim()) return send(res, 422, { error: 'Task title is required.' })
      const task = { ...payload, id: randomUUID(), title: payload.title.trim(), createdAt: new Date().toISOString() }
      writeTasks([...tasks, task])
      return send(res, 201, task)
    }
    const index = tasks.findIndex(task => task.id === taskId)
    if (index < 0) return send(res, 404, { error: 'Task not found.' })
    if (req.method === 'PATCH') {
      const updated = { ...tasks[index], ...payload, id: tasks[index].id, updatedAt: new Date().toISOString() }
      tasks[index] = updated
      writeTasks(tasks)
      return send(res, 200, updated)
    }
    if (req.method === 'DELETE') {
      tasks.splice(index, 1)
      writeTasks(tasks)
      return send(res, 204, {})
    }
    return send(res, 405, { error: 'Method not allowed.' })
  })
})

server.listen(port, () => console.log(`Emperor API listening on http://localhost:${port}`))
