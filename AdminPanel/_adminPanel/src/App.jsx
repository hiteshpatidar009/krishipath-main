import { useEffect, useMemo, useState } from 'react'
import './App.css'

const ADMIN_EMAIL = 'admin@krishipath.in'
const ADMIN_PASSWORD = 'admin123'
const SESSION_KEY = 'krishipath-admin-session'

const grainOptions = ['Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Barley', 'Soybean', 'Mustard']

const initialProducts = [
  { id: '1', grainType: 'Wheat', gradeA: 2740, gradeB: 2620, gradeC: 2490, updatedAt: '2026-07-11T07:20:00Z' },
  { id: '2', grainType: 'Rice', gradeA: 3340, gradeB: 3190, gradeC: 3020, updatedAt: '2026-07-11T08:05:00Z' },
  { id: '3', grainType: 'Soybean', gradeA: 4380, gradeB: 4170, gradeC: 3950, updatedAt: '2026-07-10T18:40:00Z' },
]

const emptyForm = {
  grainType: grainOptions[0],
  gradeA: '',
  gradeB: '',
  gradeC: '',
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function App() {
  const [session, setSession] = useState(() => {
    const stored = window.localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [products, setProducts] = useState(initialProducts)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } else {
      window.localStorage.removeItem(SESSION_KEY)
    }
  }, [session])

  const stats = useMemo(() => {
    const total = products.length
    const average = total
      ? Math.round(products.reduce((sum, product) => sum + product.gradeA + product.gradeB + product.gradeC, 0) / (total * 3))
      : 0
    const highest = products.length ? Math.max(...products.flatMap((product) => [product.gradeA, product.gradeB, product.gradeC])) : 0
    return { total, average, highest }
  }, [products])

  const handleLogin = (event) => {
    event.preventDefault()
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setSession({ role: 'admin', name: 'KrishiPath Admin' })
      setMessage('')
      return
    }
    setMessage('Invalid admin credentials. Use admin@krishipath.in / admin123.')
  }

  const handleLogout = () => {
    setSession(null)
    setEmail('')
    setPassword('')
  }

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingId(product.id)
    setForm({
      grainType: product.grainType,
      gradeA: String(product.gradeA),
      gradeB: String(product.gradeB),
      gradeC: String(product.gradeC),
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSaveProduct = () => {
    const gradeA = Number(form.gradeA)
    const gradeB = Number(form.gradeB)
    const gradeC = Number(form.gradeC)

    if (!form.grainType || [gradeA, gradeB, gradeC].some((value) => Number.isNaN(value) || value <= 0)) {
      alert('Please select a grain type and enter valid prices for all three categories.')
      return
    }

    const nextProduct = {
      id: editingId || crypto.randomUUID(),
      grainType: form.grainType,
      gradeA,
      gradeB,
      gradeC,
      updatedAt: new Date().toISOString(),
    }

    setProducts((current) =>
      editingId
        ? current.map((product) => (product.id === editingId ? nextProduct : product))
        : [nextProduct, ...current],
    )
    closeModal()
  }

  const handleDeleteProduct = (id) => {
    const target = products.find((product) => product.id === id)
    if (!target) return

    const confirmed = window.confirm(`Delete ${target.grainType} from the price board?`)
    if (!confirmed) return

    setProducts((current) => current.filter((product) => product.id !== id))
  }

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="login-card">
          <div className="auth-badge">KrishiPath Admin</div>
          <h1>Admin management for mandi price updates</h1>
          <p>
            Log in with admin credentials to manage grain prices, edit category values,
            and keep the price board up to date.
          </p>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              <span>Email</span>
              <input
                type="email"
                placeholder="admin@krishipath.in"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {message ? <div className="form-message">{message}</div> : null}
            <button type="submit" className="primary-btn">
              Sign in as admin
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <div className="dashboard-shell">
      <header className="topbar">
        <div>
          <div className="brand-row">
            <div className="brand-mark">K</div>
            <div>
              <p className="eyebrow">KrishiPath Admin Panel</p>
              <h2>Mandi price management</h2>
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="secondary-btn" onClick={openCreateModal}>
            Add Product
          </button>
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Today’s overview</p>
            <h1>Keep grain prices accurate and easy to update</h1>
            <p>
              Add new products, update category prices, or remove old entries when mandi
              rates change.
            </p>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <span>Total products</span>
              <strong>{stats.total}</strong>
            </article>
            <article className="stat-card">
              <span>Average rate</span>
              <strong>{currencyFormatter.format(stats.average)}</strong>
            </article>
            <article className="stat-card">
              <span>Highest rate</span>
              <strong>{currencyFormatter.format(stats.highest)}</strong>
            </article>
          </div>
        </section>

        <section className="content-grid">
          <article className="panel table-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Product list</p>
                <h3>Grain price board</h3>
              </div>
              <button type="button" className="secondary-btn" onClick={openCreateModal}>
                Add Product
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Grain Type</th>
                    <th>Grade A</th>
                    <th>Grade B</th>
                    <th>Grade C</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="grain-cell">
                          <div className="grain-icon">{product.grainType.slice(0, 1)}</div>
                          <div>
                            <strong>{product.grainType}</strong>
                            <span>Mandi live board</span>
                          </div>
                        </div>
                      </td>
                      <td>{currencyFormatter.format(product.gradeA)}</td>
                      <td>{currencyFormatter.format(product.gradeB)}</td>
                      <td>{currencyFormatter.format(product.gradeC)}</td>
                      <td>{dateFormatter.format(new Date(product.updatedAt))}</td>
                      <td>
                        <div className="action-group">
                          <button type="button" className="edit-btn" onClick={() => openEditModal(product)}>
                            Edit
                          </button>
                          <button type="button" className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <aside className="panel side-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Admin actions</p>
                <h3>What you can do here</h3>
              </div>
            </div>

            <div className="checklist">
              <div>
                <span>1</span>
                <p>Select a grain type from the dropdown.</p>
              </div>
              <div>
                <span>2</span>
                <p>Enter prices for Grade A, Grade B, and Grade C.</p>
              </div>
              <div>
                <span>3</span>
                <p>Use edit to update a price when mandi rates change.</p>
              </div>
              <div>
                <span>4</span>
                <p>Remove items that are no longer active in the board.</p>
              </div>
            </div>

            <div className="info-card">
              <p>Logged in as admin</p>
              <strong>{session.name}</strong>
              <span>Use this panel to manage daily anaz bhav updates for farmers.</span>
            </div>
          </aside>
        </section>
      </main>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Product details</p>
                <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
              </div>
              <button type="button" className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-grid">
              <label>
                <span>Grain type</span>
                <select
                  value={form.grainType}
                  onChange={(event) => setForm((current) => ({ ...current, grainType: event.target.value }))}
                >
                  {grainOptions.map((grain) => (
                    <option key={grain} value={grain}>
                      {grain}
                    </option>
                  ))}
                </select>
              </label>

              {['gradeA', 'gradeB', 'gradeC'].map((field, index) => (
                <label key={field}>
                  <span>{['Grade A', 'Grade B', 'Grade C'][index]} price</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter price"
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  />
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={handleSaveProduct}>
                {editingId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
