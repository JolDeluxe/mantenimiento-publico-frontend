// src/pages/not-found.jsx
// Vista básica para rutas inexistentes
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-6xl font-bold text-slate-800 mb-2">404</h1>
      <p className="text-xl text-slate-600 mb-6">Página no encontrada</p>
      <Link 
        to="/" 
        className="text-marca-primario hover:underline font-semibold"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;