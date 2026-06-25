import { useEffect, useState } from 'react'
import AuthAlert from '../components/auth/AuthAlert'

const initialMockGoals = [
  {
    id: '1',
    title: 'Become fit',
    category: 'Health',
    progress: 40,
    status: 'In Progress',
  },
  {
    id: '2',
    title: 'Learn AI Systems',
    category: 'Career',
    progress: 75,
    status: 'In Progress',
  },
  {
    id: '3',
    title: 'Build financial freedom',
    category: 'Finance',
    progress: 10,
    status: 'In Progress',
  },
]

const inputClassName =
  'mt-1.5 w-full rounded-lg border border-mirror-border bg-mirror-elevated px-4 py-2 text-sm text-mirror-text placeholder:text-mirror-subtle focus:border-mirror-accent focus:outline-none focus:ring-1 focus:ring-mirror-accent disabled:cursor-not-allowed disabled:opacity-60'

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states for adding a new goal
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Career')
  const [newProgress, setNewProgress] = useState(0)

  // Editing state
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setGoals(initialMockGoals)
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  // Derived stats
  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.status === 'Completed').length
  const inProgressGoals = goals.filter((g) => g.status === 'In Progress').length

  function handleAddGoal(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!newTitle.trim()) {
      setError('Goal title is required.')
      return
    }

    const newGoal = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory,
      progress: Math.min(Math.max(Number(newProgress) || 0, 0), 100),
      status: Number(newProgress) >= 100 ? 'Completed' : 'In Progress',
    }

    setGoals((prev) => [newGoal, ...prev])
    setNewTitle('')
    setNewProgress(0)
    setShowAddForm(false)
    setSuccess('Goal successfully added!')
  }

  function handleUpdateProgress(id, value) {
    const nextProgress = Math.min(Math.max(Number(value) || 0, 0), 100)
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          let nextStatus = g.status
          if (nextProgress >= 100) {
            nextStatus = 'Completed'
          } else if (g.status === 'Completed' && nextProgress < 100) {
            nextStatus = 'In Progress'
          }
          // Note: If the status is 'Paused', it remains 'Paused' when progress changes below 100.
          return {
            ...g,
            progress: nextProgress,
            status: nextStatus,
          }
        }
        return g
      })
    )
  }

  function handleDeleteGoal(id) {
    if (editingId === id) {
      setEditingId(null)
    }
    setGoals((prev) => prev.filter((g) => g.id !== id))
    setSuccess('Goal removed.')
  }

  function startEdit(goal) {
    setError('')
    setSuccess('')
    setEditingId(goal.id)
    setEditTitle(goal.title)
    setEditCategory(goal.category)
    setEditStatus(goal.status)
  }

  function handleSaveEdit(e, id) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!editTitle.trim()) {
      setError('Goal title is required.')
      return
    }

    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          let finalProgress = g.progress
          let finalStatus = editStatus

          // Automatic status/progress syncing
          if (editStatus === 'Completed') {
            finalProgress = 100
          } else if (g.status === 'Completed' && editStatus !== 'Completed') {
            // Changed away from completed
            finalProgress = 99
          } else if (editStatus === 'In Progress' && finalProgress >= 100) {
            finalProgress = 99
          }

          return {
            ...g,
            title: editTitle.trim(),
            category: editCategory,
            status: finalStatus,
            progress: finalProgress,
          }
        }
        return g
      })
    )

    setEditingId(null)
    setSuccess('Goal updated successfully!')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Goals</h1>
          <p className="mt-1 text-mirror-muted">
            Track your milestones and personal progress toward your Future Self.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError('')
            setSuccess('')
            setShowAddForm(!showAddForm)
            if (editingId) setEditingId(null)
          }}
          disabled={loading}
          className="rounded-lg bg-mirror-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {showAddForm ? 'Cancel' : 'Add Goal'}
        </button>
      </header>

      {/* Goal Statistics Cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-mirror-border bg-mirror-surface p-4 text-center sm:text-left">
            <p className="text-2xl font-bold text-mirror-text">{totalGoals}</p>
            <p className="text-xs sm:text-sm text-mirror-muted mt-0.5">Total Goals</p>
          </div>
          <div className="rounded-xl border border-mirror-border bg-mirror-surface p-4 text-center sm:text-left">
            <p className="text-2xl font-bold text-emerald-400">{completedGoals}</p>
            <p className="text-xs sm:text-sm text-mirror-muted mt-0.5">Completed</p>
          </div>
          <div className="rounded-xl border border-mirror-border bg-mirror-surface p-4 text-center sm:text-left">
            <p className="text-2xl font-bold text-mirror-accent">{inProgressGoals}</p>
            <p className="text-xs sm:text-sm text-mirror-muted mt-0.5">In Progress</p>
          </div>
        </div>
      )}

      <AuthAlert variant="error" message={error} />
      <AuthAlert variant="success" message={success} />

      {showAddForm && (
        <div className="mb-8 rounded-xl border border-mirror-border bg-mirror-surface p-5 sm:p-6">
          <h2 className="text-lg font-medium mb-4">New Goal</h2>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label htmlFor="goal-title" className="block text-xs font-medium text-mirror-muted">
                Goal Title
              </label>
              <input
                id="goal-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Run a half marathon"
                className={inputClassName}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="goal-category" className="block text-xs font-medium text-mirror-muted">
                  Category
                </label>
                <select
                  id="goal-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={inputClassName}
                >
                  <option value="Career">Career</option>
                  <option value="Health">Health</option>
                  <option value="Finance">Finance</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="goal-progress" className="block text-xs font-medium text-mirror-muted">
                  Initial Progress (%)
                </label>
                <input
                  id="goal-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-mirror-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
            >
              Create Goal
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-mirror-border border-t-mirror-accent" />
          <p className="text-sm text-mirror-muted">Loading your goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-mirror-border bg-mirror-surface/50 p-10 text-center">
          <p className="text-sm font-medium text-mirror-text">No goals tracked yet</p>
          <p className="mt-2 text-sm text-mirror-muted">
            Add your first goal to visualize your milestones and progress.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mt-6 rounded-lg bg-mirror-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mirror-accent-hover"
          >
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const isEditing = editingId === goal.id

            return (
              <article
                key={goal.id}
                className="rounded-xl border border-mirror-border bg-mirror-surface p-5 transition-colors hover:border-mirror-accent/20"
              >
                {isEditing ? (
                  <form onSubmit={(e) => handleSaveEdit(e, goal.id)} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-mirror-muted">Goal Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={inputClassName}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-mirror-muted">Category</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className={inputClassName}
                        >
                          <option value="Career">Career</option>
                          <option value="Health">Health</option>
                          <option value="Finance">Finance</option>
                          <option value="Lifestyle">Lifestyle</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-mirror-muted">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className={inputClassName}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Paused">Paused</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-mirror-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-mirror-accent-hover"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-mirror-border px-3 py-1.5 text-xs font-medium text-mirror-muted hover:bg-mirror-elevated hover:text-mirror-text"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-full bg-mirror-accent/15 px-2.5 py-0.5 text-xs font-medium text-mirror-accent">
                        {goal.category}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          goal.status === 'Completed'
                            ? 'text-emerald-400'
                            : goal.status === 'Paused'
                            ? 'text-amber-400'
                            : 'text-mirror-muted'
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-mirror-text mb-4">{goal.title}</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-mirror-muted">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-mirror-elevated overflow-hidden">
                        <div
                          className="h-full bg-mirror-accent transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleUpdateProgress(goal.id, e.target.value)}
                          className="flex-1 accent-mirror-accent h-1.5 rounded-lg bg-mirror-elevated cursor-pointer"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(goal)}
                            className="text-xs text-mirror-accent hover:text-mirror-accent-hover transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
