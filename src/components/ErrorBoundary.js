import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
  background-color: #fff3f3;
`;

const ErrorButton = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #cc0000;
  }
`;

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <ErrorContainer>
      <h2>Oops! Algo deu errado</h2>
      <p>Erro: {error.message}</p>
      <ErrorButton onClick={resetErrorBoundary}>Tentar Novamente</ErrorButton>
    </ErrorContainer>
  );
}

export function withErrorBoundary(Component) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorFallback;
