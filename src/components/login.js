import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginPage.css';
import preprodcorpGif from './assets/images/logo.gif';

function Login({ onLogin, onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    if (username.trim() === '' || password.trim() === '') {
      setError('Username and password are required.');
      return;
    }
    setError('');
    onLogin(username, password);
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    if (username.trim() === '' || password.trim() === '' || email.trim() === '' || confirmPassword.trim() === '') {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address.');
      return;
    }
    setError('');
    onSignup(username, password, email);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center login-container">
      <div className="login-box">
        <img src={preprodcorpGif} alt="preprod Emulet Logo" className="gif" />
        {isLogin ? (
          <Form onSubmit={handleLoginSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3 input-box">
              <Form.Control 
                type="text" 
                placeholder="Enter username" 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              <Form.Label>Username</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3 input-box">
              <Form.Control 
                type="password" 
                placeholder="Password" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <Form.Label>Password</Form.Label>
            </Form.Group>
            <Button variant="primary" type="submit" className="btn">
              Sign in
            </Button>
            <p className="toggle-link" onClick={() => setIsLogin(false)}>Don't have an account? Sign up</p>
          </Form>
        ) : (
          <Form onSubmit={handleSignupSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3 input-box">
              <Form.Control 
                type="text" 
                placeholder="Enter username" 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
              <Form.Label>Username</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3 input-box">
              <Form.Control 
                type="email" 
                placeholder="Enter email" 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <Form.Label>Email</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3 input-box">
              <Form.Control 
                type="password" 
                placeholder="Password" 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <Form.Label>Password</Form.Label>
            </Form.Group>
            <Form.Group className="mb-3 input-box">
              <Form.Control 
                type="password" 
                placeholder="Confirm password" 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              <Form.Label>Confirm Password</Form.Label>
            </Form.Group>
            <Button variant="primary" type="submit" className="btn">
              Sign up
            </Button>
            <p className="toggle-link" onClick={() => setIsLogin(true)}>Already have an account? Sign in</p>
          </Form>
        )}
      </div>
    </Container>
  );
}

export default Login;
