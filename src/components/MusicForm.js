import React, { useState } from 'react';
import styled from 'styled-components';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const FormCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(243, 233, 233, 0.1);
  width: 100%;
  max-width: 800px;
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 28px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FormSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: 200px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px;
  background: #ffffff;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  color: #333;
  font-size: 16px;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 14px;
  background: #ffffff;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  color: #000;
  font-size: 16px;
  resize: vertical;
  font-family: monospace;

  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const Button = styled.button`
  background: #1db954;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #1ed760;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background: ${props => (props.active ? '#1db954' : '#f5f5f5')};
  color: ${props => (props.active ? 'white' : '#333')};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => (props.active ? '#1ed760' : '#e5e5e5')};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const MusicForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' ou 'chords'
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    lyrics: '',
    chords: '',
    rhythm: '',
    key: '',
    tempo: '',
    observations: '',
  });

  const rhythmOptions = [
    'Samba',
    'Rock',
    'Pop',
    'Pagode',
    'Sertanejo',
    'Forró',
    'Axé',
    'Funk',
    'MPB',
    'Outro',
  ];

  const keyOptions = ['C', 'Cm', 'D', 'Dm', 'E', 'Em', 'F', 'Fm', 'G', 'Gm', 'A', 'Am', 'B', 'Bm'];

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('O título da música é obrigatório');
      return false;
    }
    if (!formData.artist.trim()) {
      toast.error('O nome do artista é obrigatório');
      return false;
    }
    if (activeTab === 'chords' && !formData.key) {
      toast.error('Selecione o tom da música');
      return false;
    }
    if (activeTab === 'chords' && !formData.rhythm) {
      toast.error('Selecione o ritmo da música');
      return false;
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Separar os dados em duas coleções diferentes
      if (formData.lyrics.trim()) {
        await addDoc(collection(db, 'lyrics'), {
          title: formData.title,
          artist: formData.artist,
          lyrics: formData.lyrics,
          createdAt: new Date(),
          type: 'lyrics'
        });
      }

      if (formData.chords.trim()) {
        await addDoc(collection(db, 'chords'), {
          title: formData.title,
          artist: formData.artist,
          chords: formData.chords,
          key: formData.key,
          rhythm: formData.rhythm,
          tempo: formData.tempo,
          observations: formData.observations,
          createdAt: new Date(),
          type: 'chords'
        });
      }

      toast.success('Música salva com sucesso!');
      navigate('/musiclist', { replace: true });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar a música');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Adicionar Música</Title>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'lyrics'} 
            onClick={() => setActiveTab('lyrics')}
            type="button"
          >
            Letra da Música
          </Tab>
          <Tab 
            active={activeTab === 'chords'} 
            onClick={() => setActiveTab('chords')}
            type="button"
          >
            Cifra/Acordes
          </Tab>
        </TabContainer>

        <StyledForm onSubmit={handleSubmit}>
          <FormSection>
            <FormGroup>
              <Label>Título da Música</Label>
              <Input
                type="text"
                name="title"
                placeholder="Ex: Tudo Sobre Ele"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Artista</Label>
              <Input
                type="text"
                name="artist"
                placeholder="Ex: Morada"
                value={formData.artist}
                onChange={handleChange}
                required
              />
            </FormGroup>
          </FormSection>

          {activeTab === 'chords' && (
            <FormSection>
              <FormGroup>
                <Label>Ritmo</Label>
                <Select name="rhythm" value={formData.rhythm} onChange={handleChange} required>
                  <option value="">Selecione o Ritmo</option>
                  {rhythmOptions.map(rhythm => (
                    <option key={rhythm} value={rhythm}>
                      {rhythm}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Tom</Label>
                <Select name="key" value={formData.key} onChange={handleChange} required>
                  <option value="">Selecione o Tom</option>
                  {keyOptions.map(key => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Andamento (BPM)</Label>
                <Input
                  type="number"
                  name="tempo"
                  placeholder="Ex: 120"
                  value={formData.tempo}
                  onChange={handleChange}
                />
              </FormGroup>
            </FormSection>
          )}

          {activeTab === 'lyrics' ? (
            <FormGroup>
              <Label>Letra da Música</Label>
              <TextArea
                name="lyrics"
                placeholder="Cole aqui a letra da música..."
                value={formData.lyrics}
                onChange={handleChange}
              />
            </FormGroup>
          ) : (
            <>
              <FormGroup>
                <Label>Cifra/Acordes</Label>
                <TextArea
                  name="chords"
                  placeholder="Cole aqui a cifra com os acordes..."
                  value={formData.chords}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Observações</Label>
                <TextArea
                  name="observations"
                  placeholder="Observações adicionais sobre a música..."
                  value={formData.observations}
                  onChange={handleChange}
                  style={{ minHeight: '100px' }}
                />
              </FormGroup>
            </>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <ReactLoading type="spin" color="#fff" height={20} width={20} />
                Salvando...
              </>
            ) : (
              'Salvar Música'
            )}
          </Button>
        </StyledForm>
      </FormCard>
    </Container>
  );
};

export default MusicForm;
