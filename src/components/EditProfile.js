import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import ReactLoading from 'react-loading';

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  color: white;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background: #4CAF50;
  color: white;
`;

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setFormData({
              name: data.name || '',
              phone: data.phone || '',
              birthDate: data.birthDate || ''
            });
          } else {
            // Se o documento não existe, criar com dados básicos
            const basicUserData = {
              name: user.displayName || '',
              email: user.email,
              photoURL: user.photoURL
            };
            await setDoc(userDocRef, basicUserData);
            setFormData({
              name: basicUserData.name,
              phone: '',
              birthDate: ''
            });
          }
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          toast.error('Erro ao carregar dados do usuário');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (user && !loading) {
      fetchUserData();
    }
  }, [user, loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...formData,
        email: user.email,
        photoURL: user.photoURL
      }, { merge: true });
      
      toast.success('Perfil atualizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <LoadingContainer>
        <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Card>
        <Title>Editar Perfil</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Telefone</Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Seu telefone"
            />
          </FormGroup>

          <FormGroup>
            <Label>Data de Nascimento</Label>
            <Input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </FormGroup>

          <ButtonGroup>
            <CancelButton type="button" onClick={() => navigate('/dashboard')}>
              Cancelar
            </CancelButton>
            <SaveButton type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <ReactLoading type="spin" color="#fff" height={20} width={20} />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </SaveButton>
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
};

export default EditProfile;
