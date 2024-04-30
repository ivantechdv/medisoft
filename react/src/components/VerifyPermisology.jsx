import { Navigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

export const VerifyPermisology = ({

  children,
  canAccess, 

}) => {
   
  if (canAccess !== true) {
    return <Navigate to={'/'} />;
  }


  return children ? children : <Outlet />;
};
