import styled from 'styled-components';

// Container principal
export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

// Card base
export const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

// Título padrão
export const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
`;

// Formulário base
export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Input padrão
export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
`;

// Botão padrão
export const Button = styled.button`
  background: #667eea;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #764ba2;
    transform: translateY(-2px);
  }
`;
