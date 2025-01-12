import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNotifications } from '../contexts/NotificationContext';
import styled from 'styled-components';
import { FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import ReactLoading from 'react-loading';
import FloatingMenu from './FloatingMenu';

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 2rem;
  color: white;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background: ${props => props.danger ? '#dc3545' : props.primary ? '#1db954' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.danger ? '#c82333' : props.primary ? '#1ed760' : 'rgba(255, 255, 255, 0.2)'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const InputGroup = styled.div`
  flex: 1;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);

  &::after {
    content: ${props => props.required ? '" *"' : '""'};
    color: #ff4444;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1db954;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1db954;
  }

  option {
    background: #333;
    color: white;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  font-family: monospace;
  resize: vertical;
  white-space: pre-wrap;

  &:focus {
    outline: none;
    border-color: #1db954;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const BackButton = styled(Button)`
  margin-bottom: 1rem;
`;

const MusicForm = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    lyrics: '',
    tone: '',
    category: '',
    createdAt: '',
    updatedAt: '',
    userId: ''
  });
  const [user, setUser] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, [auth]);

  const timeSignatureOptions = [
    '2/2',
    '2/4',
    '3/4',
    '4/4',
    '5/4',
    '6/4',
    '3/8',
    '6/8',
    '7/8',
    '9/8',
    '12/8'
  ];

  const keyOptions = [
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'Cm',
    'C#m',
    'Dbm',
    'Dm',
    'D#m',
    'Ebm',
    'Em',
    'Fm',
    'F#m',
    'Gbm',
    'Gm',
    'G#m',
    'Abm',
    'Am',
    'A#m',
    'Bbm',
    'Bm'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) {
      errors.push('O título é obrigatório');
    }
    if (!formData.artist.trim()) {
      errors.push('O artista é obrigatório');
    }
    if (!formData.tone.trim()) {
      errors.push('O tom é obrigatório');
    }
    if (!formData.lyrics.trim()) {
      errors.push('A letra é obrigatória');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const commonData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const musicRef = collection(db, 'musics');
      await addDoc(musicRef, commonData);

      // Adiciona notificação após sucesso na criação
      addNotification(`Nova música "${formData.title}" adicionada`, 'success');
      
      toast.success('Música salva com sucesso!');
      navigate('/musiclist');
    } catch (error) {
      console.error('Erro ao salvar música:', error);
      toast.error('Erro ao salvar música');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/musiclist');
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - 150 + window.scrollX,
    });
    setIsMenuOpen(!isMenuOpen);
  };

  const getMenuItems = () => [
    {
      label: 'Salvar',
      icon: <FiSave />,
      onClick: handleSubmit
    },
    {
      label: 'Cancelar',
      icon: <FiX />,
      onClick: handleCancel
    }
  ];

  if (isLoading) {
    return (
      <Container>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
        </Content>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <h2>Por favor, faça login para acessar essa página.</h2>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <Header>
          <Title>Nova Música</Title>
          <ButtonGroup>
            <Button type="button" danger onClick={handleCancel}>
              <FiX /> Cancelar
            </Button>
            <Button type="submit" primary form="musicForm">
              <FiSave /> Salvar
            </Button>
          </ButtonGroup>
        </Header>

        <Form id="musicForm" onSubmit={handleSubmit}>
          <FormGroup>
            <InputGroup>
              <Label required>Título</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nome da música"
                required
              />
            </InputGroup>
            <InputGroup>
              <Label required>Artista</Label>
              <Input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Nome do artista"
                required
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <InputGroup>
              <Label>Tempo</Label>
              <Select
                name="rhythm"
                value={formData.rhythm}
                onChange={handleChange}
              >
                <option value="">Selecione o tempo</option>
                {timeSignatureOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Tom</Label>
              <Select
                name="key"
                value={formData.key}
                onChange={handleChange}
              >
                <option value="">Selecione um tom</option>
                {keyOptions.map(key => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </Select>
            </InputGroup>
            <InputGroup>
              <Label>Andamento (BPM)</Label>
              <Input
                type="number"
                name="tempo"
                value={formData.tempo}
                onChange={handleChange}
                placeholder="Ex: 120"
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <InputGroup>
              <Label required>Letra</Label>
              <TextArea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleChange}
                placeholder="Cole a letra da música aqui..."
                rows={10}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label required>Cifra</Label>
              <TextArea
                name="chords"
                value={formData.chords}
                onChange={handleChange}
                placeholder="Cole a cifra da música aqui..."
                rows={10}
                required
              />
            </InputGroup>
          </FormGroup>

          <InputGroup>
            <Label>Observações</Label>
            <TextArea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Adicione aqui suas observações sobre a música"
              style={{ minHeight: '100px' }}
            />
          </InputGroup>
        </Form>
      </Content>
    </Container>
  );
};

export default MusicForm;
