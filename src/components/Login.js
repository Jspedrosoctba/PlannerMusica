import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ReactLoading from 'react-loading';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => (props.error ? '#ff4444' : '#e1e1e1')};
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: #666;
  
  &:hover {
    color: #333;
  }
  
  &:focus {
    outline: none;
  }
`;

const ErrorMessage = styled.span`
  color: #ff4444;
  font-size: 0.875rem;
`;

const Button = styled.button`
  background: #1db954;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.7 : 1)};
  transition: all 0.3s ease;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${props => (props.disabled ? '#1DB954' : '#1ed760')};
    transform: ${props => (props.disabled ? 'none' : 'translateY(-2px)')};
  }
`;

const SignupLink = styled.p`
  color: #999;
  text-align: center;
  margin-top: 1.5rem;

  a {
    color: #1db954;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingSpinner = styled(ReactLoading)`
  margin: 0 auto;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Salvar informação do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userCredential.user));
      toast.success('Login realizado com sucesso!');
      navigate('/musiclist');
    } catch (error) {
      let errorMessage = 'Erro ao fazer login';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = error.message;
      }

      toast.error(errorMessage);
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <LoginCard>
        <Title>Login</Title>
        <StyledForm onSubmit={handleLogin}>
          <InputGroup>
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              disabled={isLoading}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </PasswordToggle>
            </InputWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner type="spin" color="#fff" height={20} width={20} />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </StyledForm>

        <SignupLink>
          Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
        </SignupLink>
      </LoginCard>
    </Container>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func,
};

export default Login;
