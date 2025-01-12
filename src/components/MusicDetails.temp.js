import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styled from 'styled-components';
import { FiEdit2, FiTrash2, FiShare2, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';

// ... (mantendo todos os styled components)

const MusicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editedItem, setEditedItem] = useState(null);
  const [showChords, setShowChords] = useState(false);

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

  // ... (resto do código permanece o mesmo, apenas substituindo as referências de "Ritmo" para "Tempo")

  return (
    <Container>
      <Content>
        <BackButton onClick={handleBack}>
          Voltar
        </BackButton>

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
                  <Label>Título</Label>
                  <Input
                    type="text"
                    name="title"
                    value={editedItem.title}
                    onChange={handleChange}
                  />
                </InputGroup>
                <InputGroup>
                  <Label>Artista</Label>
                  <Input
                    type="text"
                    name="artist"
                    value={editedItem.artist}
                    onChange={handleChange}
                  />
                </InputGroup>
              </FormGroup>

              {item.collection === 'chords' && (
                <FormGroup>
                  <InputGroup>
                    <Label>Tempo</Label>
                    <Select
                      name="rhythm"
                      value={editedItem.rhythm}
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
                      value={editedItem.key}
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
                      value={editedItem.tempo}
                      onChange={handleChange}
                    />
                  </InputGroup>
                </FormGroup>
              )}

              <InputGroup>
                <Label>{item.collection === 'lyrics' ? 'Letra' : 'Cifra'}</Label>
                <TextArea
                  name={item.collection === 'lyrics' ? 'lyrics' : 'chords'}
                  value={item.collection === 'lyrics' ? editedItem.lyrics : editedItem.chords}
                  onChange={handleChange}
                />
              </InputGroup>

              {item.collection === 'chords' && (
                <InputGroup>
                  <Label>Observações</Label>
                  <TextArea
                    name="observations"
                    value={editedItem.observations}
                    onChange={handleChange}
                    style={{ minHeight: '100px' }}
                  />
                </InputGroup>
              )}
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

            {item.collection === 'chords' && (
              <ChordDetails>
                {item.key && (
                  <p><strong>Tom:</strong> {item.key}</p>
                )}
                {item.rhythm && (
                  <p><strong>Tempo:</strong> {item.rhythm}</p>
                )}
                {item.tempo && (
                  <p><strong>Andamento:</strong> {item.tempo} BPM</p>
                )}
              </ChordDetails>
            )}

            {item.lyrics && item.chords ? (
              <>
                <ToggleContainer onClick={toggleView}>
                  <ToggleBackground active={showChords} />
                  <ToggleOption active={!showChords}>Letra</ToggleOption>
                  <ToggleOption active={showChords}>Cifra</ToggleOption>
                </ToggleContainer>

                <MusicContent visible={!showChords}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {item.lyrics}
                  </pre>
                </MusicContent>

                <MusicContent visible={showChords}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {item.chords}
                  </pre>
                  {item.observations && (
                    <div style={{ marginTop: '2rem' }}>
                      <h3>Observações:</h3>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {item.observations}
                      </pre>
                    </div>
                  )}
                </MusicContent>
              </>
            ) : (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: item.collection === 'chords' ? 'monospace' : 'inherit'
              }}>
                {item.collection === 'lyrics' ? item.lyrics : item.chords}
              </pre>
            )}
          </>
        )}
      </Content>

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
              Copiar conteúdo
            </ShareButton>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default MusicDetails;
