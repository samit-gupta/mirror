import { createBrowserRouter } from 'react-router-dom'
import GuestRoute from '../components/auth/GuestRoute'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { ROUTES } from '../constants/routes'
import MarketingLayout from '../layouts/MarketingLayout'
import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Setup from '../pages/Setup'
import Dashboard from '../pages/Dashboard'
import Chat from '../pages/Chat'
import Journal from '../pages/Journal'
import Memories from '../pages/Memories'

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [{ path: ROUTES.LANDING, element: <Landing /> }],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <Login /> },
          { path: ROUTES.SIGNUP, element: <Signup /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.SETUP, element: <Setup /> },
          { path: ROUTES.DASHBOARD, element: <Dashboard /> },
          { path: ROUTES.CHAT, element: <Chat /> },
          { path: ROUTES.CHAT_CONVERSATION, element: <Chat /> },
          { path: ROUTES.JOURNAL, element: <Journal /> },
          { path: ROUTES.MEMORIES, element: <Memories /> },
        ],
      },
    ],
  },
])
