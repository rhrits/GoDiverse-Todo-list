import { Database } from '@/lib/schema'
import { useUsers } from '@/lib/useUsers'
import { Session, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react'
import { format, isToday, isPast, parseISO } from 'date-fns'
import Notification from './Notification'

type Todos = Database['public']['Tables']['todos']['Row']

export default function TodoList({ session }: { session: Session }) {
  const supabase = useSupabaseClient<Database>()
  const [todos, setTodos] = useState<Todos[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('') // NEW
  const [dueDate, setDueDate] = useState<string>('') // NEW
  const [errorText, setErrorText] = useState('')
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created' | 'overdue' | 'today'>('all') // NEW

  const user = session.user
  const users = useUsers()

  useEffect(() => {
    const fetchTodos = async () => {
      let query = supabase.from('todos').select('*').order('id', { ascending: true })
      if (filter === 'assigned') query = query.eq('assigned_to', user.id)
      if (filter === 'created') query = query.eq('user_id', user.id)
      if (filter === 'overdue') query = query.lt('due_date', format(new Date(), 'yyyy-MM-dd')).eq('assigned_to', user.id)
      if (filter === 'today') query = query.eq('due_date', format(new Date(), 'yyyy-MM-dd')).eq('assigned_to', user.id)
      const { data: todos, error } = await query
      if (error) console.log('error', error)
      else setTodos(todos || [])
    }
    fetchTodos()
  }, [supabase, filter, user.id])

  const addTodo = async (taskText: string) => {
  let task = taskText.trim()
  // Enforce minimum length for task (matches DB constraint)
  if (task.length < 4) {
    setErrorText('Task must be at least 4 characters.')
    return
  }
  const { data: todo, error } = await supabase
    .from('todos')
    .insert({
      task,
      user_id: user.id,
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
    })
    .select()
    .single()

  if (error) {
    setErrorText(error.message)
    console.log(error)
  } else {
    setTodos([...todos, todo])
    setNewTaskText('')
    setAssignedTo('')
    setDueDate('')
    // Send notification if assigned to someone else
    if (assignedTo && assignedTo !== user.id) {
      await supabase.from('notifications').insert({
        recipient_id: assignedTo,
        sender_id: user.id,
        todo_id: todo.id,
        message: `You have been assigned a new task: "${task}"`,
      })
    }
  }
}

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from('todos').delete().eq('id', id).throwOnError()
      setTodos(todos.filter((x) => x.id != id))
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div className="w-full">
      <Notification userId={user.id} />
      <h1 className="mb-12">Todo List.</h1>
      {/* Filter UI */}
      <div className="flex gap-2 mb-4">
        <button className={filter === 'all' ? 'font-bold' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'assigned' ? 'font-bold' : ''} onClick={() => setFilter('assigned')}>Assigned to Me</button>
        <button className={filter === 'created' ? 'font-bold' : ''} onClick={() => setFilter('created')}>Created by Me</button>
        <button className={filter === 'overdue' ? 'font-bold' : ''} onClick={() => setFilter('overdue')}>Overdue</button>
        <button className={filter === 'today' ? 'font-bold' : ''} onClick={() => setFilter('today')}>Due Today</button>
      </div>
      {/* Add Task Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addTodo(newTaskText)
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2"
          type="text"
          placeholder="make coffee"
          value={newTaskText}
          onChange={(e) => {
            setErrorText('')
            setNewTaskText(e.target.value)
          }}
        />
        <select
          className="rounded p-2"
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
        >
          <option value="">Assign to...</option>
          {users
            .filter(u => u.id !== user.id)
            .map(u => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
        </select>
        <input
          className="rounded p-2"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <button className="btn-black" type="submit">
          Add
        </button>
      </form>
      {!!errorText && <Alert text={errorText} />}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {todos.map((todo) => (
            <Todo key={todo.id} todo={todo} onDelete={() => deleteTodo(todo.id)} users={users} />
          ))}
        </ul>
      </div>
    </div>
  )
}

const Todo = ({
  todo,
  onDelete,
  users,
}: {
  todo: Todos
  onDelete: () => void
  users: { id: string; email: string }[]
}) => {
  const supabase = useSupabaseClient<Database>()
  const [isCompleted, setIsCompleted] = useState(todo.is_complete)

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from('todos')
        .update({ is_complete: !isCompleted })
        .eq('id', todo.id)
        .throwOnError()
        .select()
        .single()

      if (data) setIsCompleted(data.is_complete)
    } catch (error) {
      console.log('error', error)
    }
  }

  // Find assigned user email
  const assignedUser = users.find(u => u.id === todo.assigned_to)

  return (
    <li className="w-full block cursor-pointer hover:bg-200 focus:outline-none focus:bg-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center">
          <div className="text-sm leading-5 font-medium truncate">{todo.task}</div>
          {todo.due_date && (
            <div className="ml-4 text-xs text-gray-500">
              Due: {todo.due_date}
              {todo.due_date && isPast(parseISO(todo.due_date)) && !isToday(parseISO(todo.due_date)) && (
                <span className="ml-2 text-red-500">(Overdue)</span>
              )}
              {todo.due_date && isToday(parseISO(todo.due_date)) && (
                <span className="ml-2 text-green-500">(Today)</span>
              )}
            </div>
          )}
          {assignedUser && (
            <div className="ml-4 text-xs text-blue-500">
              Assigned to: {assignedUser.email}
            </div>
          )}
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={toggle}
            type="checkbox"
            checked={!!isCompleted}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="gray">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  )
}

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
)