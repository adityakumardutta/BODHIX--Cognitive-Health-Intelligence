import { Navigate } from 'react-router-dom'
import { useAuth } from '../services/authContext.jsx'
import Layout from '../components/Layout.jsx'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}
