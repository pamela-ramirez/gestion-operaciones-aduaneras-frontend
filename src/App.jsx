import React from 'react';
import Login from './pages/login/Login';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


export default function App() {
    return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={ <Login/>} />

      </Routes>
    </BrowserRouter>
  );
}
