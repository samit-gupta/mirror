import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

export default function MarketingLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="marketing" />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
