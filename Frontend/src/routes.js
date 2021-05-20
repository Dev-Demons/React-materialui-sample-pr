import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import Products from './pages/Products';
import Blog from './pages/Blog';
import User from './pages/User';
import NotFound from './pages/Page404';
import Client from './pages/Client';
import Venue from './pages/Venue';
import ClientDetail from './pages/ClientDetail';
import VenueDetail from './pages/VenueDetail';
import Order from './pages/Order';
import OrderDetail from './pages/OrderDetail';
// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" replace /> },
        { path: 'app', element: <DashboardApp /> },
        { path: 'client', element: <Client /> },
        { path: 'venue', element: <Venue /> },
        { path: 'client-new', element: <ClientDetail type="New" /> },
        { path: 'client-modify', element: <ClientDetail type="Update" /> },
        { path: 'venue-new', element: <VenueDetail type="New" /> },
        { path: 'venue-modify', element: <VenueDetail type="Update" /> },
        { path: 'order', element: <Order /> },
        { path: 'order-new', element: <OrderDetail type="New" /> },
        { path: 'order-modify', element: <OrderDetail type="Update" /> }
        // { path: 'user', element: <User /> },
        // { path: 'products', element: <Products /> },
        // { path: 'blog', element: <Blog /> }
      ]
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
