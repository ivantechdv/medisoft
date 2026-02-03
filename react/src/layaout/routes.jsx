import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Users from './../pages/users';
import Patologies from './../pages/patologies';
import Clients from './../pages/clients';
import Client from './../pages/clients/client';
import Employees from './../pages/employees';
import Employee from './../pages/employees/employee';
import Services from '../pages/services';
import SetPassword from './../pages/users/SetPassword';

function RoutesApp() {
  return (
    <Routes>
      <Route path='/users' element={<Users />} />
      <Route path='/set-password' element={<SetPassword />} />
      <Route path='/set-password/:token' element={<SetPassword />} />
      {/* Clientes */}
      <Route path='/clients' element={<Clients />} />
      <Route path='/client' element={<Client />} />
      <Route path='/client/:id' element={<Client />} />
      {/* Empleados */}
      <Route path='/employees' element={<Employees />} />
      <Route path='/employee' element={<Employee />} />
      <Route path='/employee/:id' element={<Employee />} />

      {/* Patologies */}
      <Route path='/patologies' element={<Patologies />} />
      <Route path='/services' element={<Services />} />
    </Routes>
  );
}

export default RoutesApp;
