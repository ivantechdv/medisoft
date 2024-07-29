import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Users from './../pages/users';
import Clients from './../pages/clients';
import Client from './../pages/clients/client';
import Employees from './../pages/employees';
import Employee from './../pages/employees/employee';
function RoutesApp() {
  return (
    <>
      <Routes>
        <Route path='/users' element={<Users />} />

        {/* Clientes */}
        <Route path='/clients' element={<Clients />} />
        <Route path='/client' element={<Client />} />
        <Route path='/client/:id' element={<Client />} />
        {/* Clientes */}

        {/* Clientes */}
        <Route path='/employees' element={<Employees />} />
        <Route path='/employee' element={<Employee />} />
        <Route path='/employee/:id' element={<Employee />} />
        {/* Clientes */}
      </Routes>
    </>
  );
}
export default RoutesApp;
