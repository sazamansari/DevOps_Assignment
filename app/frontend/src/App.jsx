import { useState, useEffect } from 'react'
import { Server, Database, Github, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import './App.css'

function App() {
    const [data, setData] = useState({ message: 'Loading...', commit_sha: '...' })
    const [dbStatus, setDbStatus] = useState('Checking...')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const msgRes = await fetch('/api/message')
                const msgData = await msgRes.json()
                setData(msgData)
            } catch (err) {
                setData({ message: 'Backend Connection Failed', commit_sha: 'N/A' })
            }

            try {
                const readyRes = await fetch('/api/ready')
                const readyData = await readyRes.json()
                setDbStatus(readyData.status === 'ready' ? 'Connected to RDS' : 'DB Integration Error')
            } catch (err) {
                setDbStatus('RDS Connection Failed')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="container">
            <div className="card">
                <header>
                    <div className="logo-area">
                        <Server className="icon-main" />
                        <h1>Alpha EKS Demo</h1>
                    </div>
                    <p className="subtitle">Enterprise Kubernetes Delivery</p>
                </header>

                <main>
                    <div className="status-grid">
                        <div className={`status-item ${loading ? 'loading' : ''}`}>
                            <div className="label">
                                <Github size={16} />
                                <span>Message</span>
                            </div>
                            <div className="value">{data.message}</div>
                        </div>

                        <div className="status-item">
                            <div className="label">
                                <Database size={16} />
                                <span>RDS Status</span>
                            </div>
                            <div className={`value ${dbStatus.includes('Connected') ? 'success' : 'error'}`}>
                                {dbStatus.includes('Connected') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span>{dbStatus}</span>
                            </div>
                        </div>
                    </div>

                    <div className="footer-info">
                        <div className="sha-badge">
                            <span className="sha-label">COMMIT</span>
                            <span className="sha-value">{data.commit_sha.substring(0, 7)}</span>
                        </div>
                    </div>
                </main>
            </div>
            <div className="background-glow"></div>
        </div>
    )
}

export default App
