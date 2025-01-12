import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styled from 'styled-components';
import { 
  FiEdit2, 
  FiTrash2, 
  FiShare2, 
  FiSave, 
  FiX, 
  FiColumns, 
  FiGrid,
  FiArrowUp,
  FiArrowDown,
  FiArrowLeft,
  FiPrinter
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';
import { transposeChords, getAllKeys } from '../utils/transposeChords';
import { useNotifications } from '../contexts/NotificationContext';

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

const KeySelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.5);
  }

  option {
    background: #333;
    color: white;
  }
`;

const TextArea = styled.pre`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  font-family: ${props => props.isCifra ? 'monospace' : 'inherit'};
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  column-count: ${props => props.columns ? 2 : 1};
  column-gap: 2rem;
  column-rule: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    column-count: 1;
  }

  &:focus {
    outline: none;
    border-color: #1db954;
  }
`;

const EditTextArea = styled.textarea`
  width: 100%;
  min-height: 300px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 1rem;
  font-family: ${props => props.isCifra ? 'monospace' : 'inherit'};
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
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #333;
  padding: 2rem;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ShareButton = styled(Button)`
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
`;

const ToggleContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 4px;
  margin-bottom: 1rem;
  width: fit-content;
  cursor: pointer;
`;

const ToggleOption = styled.div`
  padding: 8px 16px;
  border-radius: 16px;
  color: white;
  transition: all 0.3s ease;
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.8)' : 'transparent'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};

  &:hover {
    background: ${props => props.active ? 'rgba(29, 185, 84, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const MusicContent = styled.div`
  display: ${props => props.visible ? 'block' : 'none'};
  margin-top: 1rem;
`;

const ChordDetails = styled.div`
  margin: 1rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 6px;

  p {
    margin: 0.5rem 0;
  }
`;

const ChordControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 6px;
`;

const CurrentKey = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransposeButton = styled(Button)`
  padding: 0.5rem;
  min-width: 40px;
  justify-content: center;
`;

const ViewControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ViewButton = styled.button`
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(29, 185, 84, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    font-size: 1.1rem;
  }
`;

const MusicInfo = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);

  span {
    font-weight: bold;
    color: white;
  }
`;

const MusicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [currentKey, setCurrentKey] = useState('');
  const [transposedChords, setTransposedChords] = useState('');
  const [availableKeys, setAvailableKeys] = useState([]);
  const [showChords, setShowChords] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

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

  useEffect(() => {
    fetchItem();
  }, [id]);

  useEffect(() => {
    if (item?.key) {
      const keys = getAllKeys(item.key);
      setAvailableKeys(keys);
      setCurrentKey(item.key);
    }
  }, [item?.key]);

  useEffect(() => {
    if (item?.chords && currentKey) {
      const originalKey = item.key;
      const targetKey = currentKey;
      const semitones = availableKeys.find(k => k.note === targetKey)?.semitones || 0;
      
      try {
        const transposed = transposeChords(item.chords, semitones);
        setTransposedChords(transposed);
      } catch (error) {
        console.error('Erro ao transpor acordes:', error);
      }
    }
  }, [item?.chords, currentKey, availableKeys]);

  const fetchItem = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'musics', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data()
        };
        setItem(data);
        setEditedItem(data);
        setCurrentKey(data.key || '');
        setTransposedChords(data.chords || '');
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

  const handleTranspose = (direction) => {
    const change = direction === 'up' ? 1 : -1;
    const newSemitones = availableKeys.find(k => k.note === currentKey)?.semitones + change;
    const newKey = availableKeys.find(k => k.semitones === newSemitones)?.note;
    setCurrentKey(newKey);
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
    setIsLoading(true);
    try {
      const musicRef = doc(db, 'musics', id);
      await updateDoc(musicRef, {
        ...editedItem,
        updatedAt: new Date().toISOString()
      });

      addNotification(`Música "${editedItem.title}" atualizada`, 'success');
      
      toast.success('Música atualizada com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar música:', error);
      toast.error('Erro ao atualizar música');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta música?')) {
      setIsLoading(true);
      try {
        const musicRef = doc(db, 'musics', id);
        await deleteDoc(musicRef);

        addNotification(`Música "${item.title}" excluída`, 'warning');
        
        toast.success('Música excluída com sucesso!');
        navigate('/musiclist');
      } catch (error) {
        console.error('Erro ao excluir música:', error);
        toast.error('Erro ao excluir música');
      } finally {
        setIsLoading(false);
      }
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

  const formatShareText = () => {
    let text = `${item.title} - ${item.artist}\n\n`;
    
    if (item.key) {
      text += `Tom: ${item.key}\n`;
      if (availableKeys.find(k => k.note === currentKey)?.semitones !== 0) {
        text += `Tom atual: ${currentKey} (${availableKeys.find(k => k.note === currentKey)?.semitones > 0 ? '+' : ''}${availableKeys.find(k => k.note === currentKey)?.semitones})\n`;
      }
    }
    if (item.tempo) text += `Andamento: ${item.tempo} BPM\n`;
    text += '\n';

    if (item.chords) {
      text += 'CIFRA:\n';
      text += transposedChords;
      text += '\n\n';
    }

    if (item.lyrics) {
      text += 'LETRA:\n';
      text += item.lyrics;
    }

    if (item.observations) {
      text += `\n\nObservações:\n${item.observations}`;
    }

    return text;
  };

  const handleKeyChange = (e) => {
    setCurrentKey(e.target.value);
  };

  const toggleView = () => {
    setShowChords(!showChords);
  };

  const toggleColumns = () => {
    setShowColumns(!showColumns);
  };

  const handlePrint = () => {
    window.open(`/print/${id}`, '_blank');
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

  return (
    <Container>
      <Content>
        <Header>
          <BackButton onClick={handleBack}>
            Voltar
          </BackButton>
        </Header>

        {isEditing ? (
          <>
            <Header>
              <Title>Editando Música</Title>
              <ButtonGroup>
                <Button danger onClick={handleCancel}>
                  <FiX /> Cancelar
                </Button>
                <Button primary onClick={handleSave}>
                  <FiSave /> Salvar
                </Button>
              </ButtonGroup>
            </Header>

            <Form>
              <FormGroup>
                <InputGroup>
                  <Label required>Título</Label>
                  <Input
                    type="text"
                    name="title"
                    value={editedItem.title}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>

                <InputGroup>
                  <Label required>Artista</Label>
                  <Input
                    type="text"
                    name="artist"
                    value={editedItem.artist}
                    onChange={handleChange}
                    required
                  />
                </InputGroup>
              </FormGroup>

              <FormGroup>
                <InputGroup>
                  <Label>Tom</Label>
                  <Select
                    name="key"
                    value={editedItem.key || ''}
                    onChange={handleChange}
                  >
                    <option value="">Selecione...</option>
                    {keyOptions.map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </Select>
                </InputGroup>

                <InputGroup>
                  <Label>Ritmo</Label>
                  <Input
                    type="text"
                    name="rhythm"
                    value={editedItem.rhythm || ''}
                    onChange={handleChange}
                    placeholder="Ex: Samba, Rock, etc"
                  />
                </InputGroup>

                <InputGroup>
                  <Label>Andamento (BPM)</Label>
                  <Input
                    type="number"
                    name="tempo"
                    value={editedItem.tempo || ''}
                    onChange={handleChange}
                    placeholder="Ex: 120"
                  />
                </InputGroup>
              </FormGroup>

              <InputGroup>
                <Label>Cifra</Label>
                <EditTextArea
                  name="chords"
                  value={editedItem.chords || ''}
                  onChange={handleChange}
                  placeholder="Cole aqui a cifra da música..."
                  isCifra
                />
              </InputGroup>

              <InputGroup>
                <Label>Letra</Label>
                <EditTextArea
                  name="lyrics"
                  value={editedItem.lyrics || ''}
                  onChange={handleChange}
                  placeholder="Cole aqui a letra da música..."
                />
              </InputGroup>

              <InputGroup>
                <Label>Observações</Label>
                <EditTextArea
                  name="observations"
                  value={editedItem.observations || ''}
                  onChange={handleChange}
                  placeholder="Adicione observações sobre a música..."
                />
              </InputGroup>
            </Form>
          </>
        ) : (
          <>
            <Header>
              <div>
                <Title>{item.title}</Title>
                <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {item.artist}
                </p>
              </div>
              <ButtonGroup>
                <Button onClick={handlePrint}>
                  <FiPrinter /> Imprimir
                </Button>
                <Button onClick={handleShare}>
                  <FiShare2 /> Compartilhar
                </Button>
                <Button onClick={handleEdit}>
                  <FiEdit2 /> Editar
                </Button>
                <Button danger onClick={handleDelete}>
                  <FiTrash2 /> Excluir
                </Button>
              </ButtonGroup>
            </Header>

            <ViewControls>
              <ControlGroup>
                {item.lyrics && item.chords && (
                  <ToggleContainer onClick={toggleView}>
                    <ToggleOption active={!showChords}>Letra</ToggleOption>
                    <ToggleOption active={showChords}>Cifra</ToggleOption>
                  </ToggleContainer>
                )}

                <ViewButton
                  active={showColumns}
                  onClick={toggleColumns}
                  title={showColumns ? "Uma coluna" : "Duas colunas"}
                >
                  {showColumns ? <FiGrid /> : <FiColumns />}
                  {showColumns ? "Uma coluna" : "Duas colunas"}
                </ViewButton>
              </ControlGroup>

              {showChords && item.key && (
                <ControlGroup>
                  <Label>Tom:</Label>
                  <KeySelect value={currentKey} onChange={handleKeyChange}>
                    {availableKeys.map(({ note, display }) => (
                      <option key={note} value={note}>
                        {display}
                      </option>
                    ))}
                  </KeySelect>
                  <ButtonGroup>
                    <TransposeButton onClick={() => handleTranspose('down')}>
                      <FiArrowDown />
                    </TransposeButton>
                    <TransposeButton onClick={() => handleTranspose('up')}>
                      <FiArrowUp />
                    </TransposeButton>
                  </ButtonGroup>
                </ControlGroup>
              )}
            </ViewControls>

            <MusicContent visible={!showChords}>
              {item.lyrics && (
                <TextArea columns={showColumns}>
                  {item.lyrics}
                </TextArea>
              )}
            </MusicContent>

            <MusicContent visible={showChords}>
              {item.chords && (
                <>
                  <MusicInfo>
                    {item.key && (
                      <InfoItem>
                        Tom original: <span>{item.key}</span>
                      </InfoItem>
                    )}
                    {currentKey && availableKeys.find(k => k.note === currentKey)?.semitones !== 0 && (
                      <InfoItem>
                        Tom atual: <span>{currentKey} ({availableKeys.find(k => k.note === currentKey)?.semitones > 0 ? '+' : ''}{availableKeys.find(k => k.note === currentKey)?.semitones})</span>
                      </InfoItem>
                    )}
                    {item.rhythm && (
                      <InfoItem>
                        Ritmo: <span>{item.rhythm}</span>
                      </InfoItem>
                    )}
                    {item.tempo && (
                      <InfoItem>
                        BPM: <span>{item.tempo}</span>
                      </InfoItem>
                    )}
                  </MusicInfo>

                  <TextArea isCifra columns={showColumns}>
                    {transposedChords}
                  </TextArea>

                  {item.observations && (
                    <>
                      <Label>Observações</Label>
                      <TextArea columns={showColumns}>
                        {item.observations}
                      </TextArea>
                    </>
                  )}
                </>
              )}
            </MusicContent>
          </>
        )}

        {showShareModal && (
          <Modal onClick={() => setShowShareModal(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Compartilhar</ModalTitle>
                <CloseButton onClick={() => setShowShareModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>
              <ShareButton onClick={() => copyToClipboard(formatShareText())}>
                Copiar texto
              </ShareButton>
            </ModalContent>
          </Modal>
        )}
      </Content>
    </Container>
  );
};

export default MusicDetails;
