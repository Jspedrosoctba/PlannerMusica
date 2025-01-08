import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiShare2, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';

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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  margin-bottom: 1rem;

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
  margin-bottom: 1rem;

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
  margin-bottom: 1rem;
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

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;

  p {
    margin: 0.5rem 0;
  }
`;

const ShareModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 90%;
  width: 400px;
  color: #333;

  h2 {
    margin-top: 0;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const BackButton = styled(Button)`
  margin-bottom: 1rem;
`;

const MusicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editedItem, setEditedItem] = useState(null);

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

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setIsLoading(true);
    try {
      // Tentar buscar primeiro na coleção lyrics
      let docRef = doc(db, 'lyrics', id);
      let docSnap = await getDoc(docRef);

      // Se não encontrar, tentar na coleção chords
      if (!docSnap.exists()) {
        docRef = doc(db, 'chords', id);
        docSnap = await getDoc(docRef);
      }

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data(),
          collection: docSnap.ref.parent.id // salva a coleção de origem
        };
        setItem(data);
        setEditedItem(data);
      } else {
        toast.error('Música não encontrada');
        navigate('/musiclist');
      }
    } catch (error) {
      console.error('Erro ao buscar música:', error);
      toast.error('Erro ao carregar a música');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedItem({
      ...editedItem,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!editedItem.title.trim() || !editedItem.artist.trim()) {
      toast.error('Título e artista são obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      const docRef = doc(db, item.collection, id);
      await updateDoc(docRef, {
        ...editedItem,
        updatedAt: new Date()
      });
      
      setItem(editedItem);
      setIsEditing(false);
      toast.success('Música atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar a música');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta música?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteDoc(doc(db, item.collection, id));
      toast.success('Música excluída com sucesso!');
      navigate('/musiclist');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir a música');
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Copiado para a área de transferência!');
        setShowShareModal(false);
      })
      .catch(() => {
        toast.error('Erro ao copiar');
      });
  };

  const handleBack = () => {
    navigate('/musiclist');
  };

  if (isLoading) {
    return (
      <Container>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
        </Content>
      </Container>
    );
  }

  if (!item) {
    return null;
  }

  const formatShareText = () => {
    let text = `${item.title} - ${item.artist}\n\n`;
    
    if (item.collection === 'chords') {
      text += `Tom: ${item.key}\n`;
      text += `Ritmo: ${item.rhythm}\n`;
      if (item.tempo) text += `Andamento: ${item.tempo} BPM\n`;
      text += '\n';
    }

    text += item.collection === 'lyrics' ? item.lyrics : item.chords;

    if (item.collection === 'chords' && item.observations) {
      text += '\n\nObservações:\n' + item.observations;
    }

    return text;
  };

  return (
    <Container>
      <Content>
        <BackButton onClick={handleBack}>
          Voltar para a lista
        </BackButton>

        <Header>
          <Title>{isEditing ? 'Editar Música' : item.title}</Title>
          <ButtonGroup>
            {isEditing ? (
              <>
                <Button primary onClick={handleSave} disabled={isLoading}>
                  <FiSave /> Salvar
                </Button>
                <Button onClick={handleCancel}>
                  <FiX /> Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEdit}>
                  <FiEdit2 /> Editar
                </Button>
                <Button onClick={handleShare}>
                  <FiShare2 /> Compartilhar
                </Button>
                <Button danger onClick={handleDelete}>
                  <FiTrash2 /> Excluir
                </Button>
              </>
            )}
          </ButtonGroup>
        </Header>

        {isEditing ? (
          <>
            <Label>Título</Label>
            <Input
              name="title"
              value={editedItem.title}
              onChange={handleChange}
              placeholder="Título da música"
            />

            <Label>Artista</Label>
            <Input
              name="artist"
              value={editedItem.artist}
              onChange={handleChange}
              placeholder="Nome do artista"
            />

            {item.collection === 'chords' && (
              <>
                <Label>Tom</Label>
                <Select name="key" value={editedItem.key} onChange={handleChange}>
                  <option value="">Selecione o Tom</option>
                  {keyOptions.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </Select>

                <Label>Ritmo</Label>
                <Select name="rhythm" value={editedItem.rhythm} onChange={handleChange}>
                  <option value="">Selecione o Ritmo</option>
                  {rhythmOptions.map(rhythm => (
                    <option key={rhythm} value={rhythm}>{rhythm}</option>
                  ))}
                </Select>

                <Label>Andamento (BPM)</Label>
                <Input
                  type="number"
                  name="tempo"
                  value={editedItem.tempo}
                  onChange={handleChange}
                  placeholder="Ex: 120"
                />
              </>
            )}

            <Label>{item.collection === 'lyrics' ? 'Letra' : 'Cifra'}</Label>
            <TextArea
              name={item.collection === 'lyrics' ? 'lyrics' : 'chords'}
              value={item.collection === 'lyrics' ? editedItem.lyrics : editedItem.chords}
              onChange={handleChange}
              placeholder={`Cole aqui a ${item.collection === 'lyrics' ? 'letra' : 'cifra'} da música...`}
            />

            {item.collection === 'chords' && (
              <>
                <Label>Observações</Label>
                <TextArea
                  name="observations"
                  value={editedItem.observations}
                  onChange={handleChange}
                  placeholder="Observações adicionais..."
                  style={{ minHeight: '100px' }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <InfoSection>
              <p><strong>Artista:</strong> {item.artist}</p>
              {item.collection === 'chords' && (
                <>
                  <p><strong>Tom:</strong> {item.key}</p>
                  <p><strong>Ritmo:</strong> {item.rhythm}</p>
                  {item.tempo && <p><strong>Andamento:</strong> {item.tempo} BPM</p>}
                </>
              )}
              <p><strong>Adicionado em:</strong> {new Date(item.createdAt.toDate()).toLocaleDateString()}</p>
              {item.updatedAt && (
                <p><strong>Última atualização:</strong> {new Date(item.updatedAt.toDate()).toLocaleDateString()}</p>
              )}
            </InfoSection>

            <Label>{item.collection === 'lyrics' ? 'Letra' : 'Cifra'}</Label>
            <TextArea
              value={item.collection === 'lyrics' ? item.lyrics : item.chords}
              readOnly
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
            />

            {item.collection === 'chords' && item.observations && (
              <>
                <Label>Observações</Label>
                <TextArea
                  value={item.observations}
                  readOnly
                  style={{ 
                    minHeight: '100px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                  }}
                />
              </>
            )}
          </>
        )}
      </Content>

      {showShareModal && (
        <>
          <Overlay onClick={() => setShowShareModal(false)} />
          <ShareModal>
            <h2>Compartilhar {item.title}</h2>
            <p>Copie o conteúdo para compartilhar:</p>
            
            <TextArea
              value={formatShareText()}
              readOnly
              style={{ 
                height: '200px',
                backgroundColor: '#f5f5f5',
                color: '#333'
              }}
            />
            
            <ButtonGroup style={{ marginTop: '1rem' }}>
              <Button primary onClick={() => copyToClipboard(formatShareText())}>
                Copiar Conteúdo
              </Button>
              <Button onClick={() => setShowShareModal(false)}>
                Fechar
              </Button>
            </ButtonGroup>
          </ShareModal>
        </>
      )}
    </Container>
  );
};

export default MusicDetails;
