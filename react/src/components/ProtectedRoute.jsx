import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

export const ProtectedRoute = ({
  user,
  from,
  children,
  
  redirectTo = '/login',
}) => {
 


  if (from !== Cookies.get('from')) {
    return <Navigate to={'/'} />;
  }

  if (!user) {
    const usercookie = Cookies.get('user');
    if (usercookie) {
      const userDataCookie = JSON.parse(usercookie);
      user = userDataCookie;
    } else {
      return <Navigate to={redirectTo} />;
    }
  }
  return children ? children : <Outlet />;
};
