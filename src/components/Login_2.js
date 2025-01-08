import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Title, StyledForm, Input, Button } from '../styles/SharedStyles';

// Use componentes importados em vez de styled-components locais
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/music-form');
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Title>Login</Title>
        <StyledForm onSubmit={handleLogin}>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Senha"
            required
          />
          <Button type="submit">Entrar</Button>
        </StyledForm>
        <SignupLink>
          Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
        </SignupLink>
      </LoginCard>
    </Container>
  );
};

export default Login;
