import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  position: relative;
  overflow-x: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Content = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: white;
  font-size: 2rem;
  margin: 0 0 32px 0;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  color: white;
  margin-bottom: 8px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const TextDisplay = styled.pre`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-family: monospace;
  white-space: pre-wrap;
  margin: 0;
  column-width: ${props => props.columns ? 'calc(50% - 1rem)' : 'auto'};
  column-count: ${props => props.columns ? 2 : 1};
  column-gap: 2rem;
  column-fill: balance;
  
  /* Evita quebra de linha no meio das palavras */
  word-break: keep-all;
  overflow-wrap: break-word;
  
  /* Garante que cada linha fique em uma única coluna */
  & > * {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Ajusta para mobile */
  @media (max-width: 768px) {
    column-count: 1;
    column-width: auto;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-family: monospace;
  min-height: 200px;
  resize: none;
  backdrop-filter: blur(10px);
  white-space: pre;
  tab-size: 4;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${props => props.$primary && `
    background: #1db954;
    color: white;

    &:hover {
      background: #1ed760;
    }
  `}

  ${props => props.$secondary && `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}
`;

const ViewButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(29, 185, 84, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    font-size: 1.1rem;
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

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const Tab = styled.button`
  background: ${props => props.active ? 'rgba(29, 185, 84, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(29, 185, 84, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ChordInfo = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  align-items: center;
`;

const KeySelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }

  option {
    background: #2c2c2c;
  }
`;

const LogoLink = styled(Link)`
  display: block;
  text-decoration: none;
  margin-right: 2rem;
`;

const LogoImage = styled.img`
  width: 320px;
  height: 120px;
  object-fit: contain;
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
  const [showChords, setShowChords] = useState(true);
  const [showLyrics, setShowLyrics] = useState(true);
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
    setShowLyrics(!showLyrics);
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
      <Header>
        <LogoLink to="/">
          <LogoImage src={process.env.PUBLIC_URL + '/Planner_Music.png'} alt="Planner Music" />
        </LogoLink>
        <PageTitle>{item?.title}</PageTitle>
        <ButtonGroup>
          <Button $secondary onClick={handlePrint}>
            <FiPrinter /> Imprimir
          </Button>
          <Button $secondary onClick={handleShare}>
            <FiShare2 /> Compartilhar
          </Button>
          <Button $secondary onClick={handleEdit}>
            <FiEdit2 /> Editar
          </Button>
          <Button $secondary danger onClick={handleDelete}>
            <FiTrash2 /> Excluir
          </Button>
        </ButtonGroup>
      </Header>

      <Content>
        <Tabs>
          <Tab active={!showChords} onClick={() => setShowChords(false)}>
            Letra
          </Tab>
          <Tab active={showChords} onClick={() => setShowChords(true)}>
            Cifra
          </Tab>
          <ViewButton 
            active={showColumns} 
            onClick={() => setShowColumns(!showColumns)}
          >
            <FiColumns /> {showColumns ? 'Uma Coluna' : 'Duas Colunas'}
          </ViewButton>
        </Tabs>

        {showChords ? (
          <MusicContent visible={true}>
            <ChordInfo>
              {item.key && (
                <InfoItem>
                  <Label>Tom:</Label>
                  <KeySelect
                    value={currentKey}
                    onChange={(e) => handleKeyChange(e)}
                  >
                    {availableKeys.map((key) => (
                      <option key={key.note} value={key.note}>
                        {key.note} {key.semitones !== 0 && `(${key.semitones > 0 ? '+' : ''}${key.semitones})`}
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
                </InfoItem>
              )}
              
              {item.rhythm && (
                <InfoItem>
                  <Label>Ritmo:</Label>
                  <span>{item.rhythm}</span>
                </InfoItem>
              )}
              
              {item.tempo && (
                <InfoItem>
                  <Label>BPM:</Label>
                  <span>{item.tempo}</span>
                </InfoItem>
              )}
            </ChordInfo>

            <TextDisplay columns={showColumns}>
              {transposedChords}
            </TextDisplay>

            {item.observations && (
              <>
                <Label>Observações</Label>
                <TextDisplay>
                  {item.observations}
                </TextDisplay>
              </>
            )}
          </MusicContent>
        ) : (
          <MusicContent visible={true}>
            <TextDisplay columns={showColumns}>
              {item.lyrics}
            </TextDisplay>
          </MusicContent>
        )}
      </Content>
    </Container>
  );
};

export default MusicDetails;
