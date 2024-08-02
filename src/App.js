import React, { useState } from 'react';
import Login from './components/login';
import Dashboard from './components/dashboard';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (username, password) => {
    // Implement login logic here
    console.log("Login attempt with", username, password);
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  return loggedIn ? <Dashboard onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}

export default App;
