import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import Users from './../pages/users'
function RoutesApp() {
    return (
        <>
            <Routes>
                <Route path='/users' element={<Users />} />
            </Routes>
        </>
    );
}
export default RoutesApp;