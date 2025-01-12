import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiColumns, FiMusic, FiPrinter } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { transposeChords, getAllKeys } from '../utils/transposeChords';
import ReactLoading from 'react-loading';

const PrintContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;

  @media print {
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
`;

const PageContainer = styled.div`
  page-break-after: always;
  min-height: ${props => props.isLastPage ? 'auto' : '100vh'};
  position: relative;
  padding: 2rem;

  @media print {
    padding: 1cm;
    margin: 0;
  }
`;

const PageNumber = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  font-size: 0.9rem;
  color: #666;

  @media print {
    bottom: 0.5cm;
    right: 1cm;
  }
`;

const PrintHeader = styled.div`
  margin-bottom: 2rem;
  @media print {
    display: none;
  }
`;

const OptionsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  
  @media print {
    display: none;
  }
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.primary ? '#1a73e8' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#1a73e8' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: ${props => props.primary ? '#1557b0' : '#f5f5f5'};
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns ? 'repeat(2, 1fr)' : '1fr'};
  gap: 2rem;
  margin-top: 2rem;
  height: 100%;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Artist = styled.h2`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
`;

const MusicInfo = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Section = styled.div`
  margin: 1rem 0;
  position: relative;
`;

const ChordLine = styled.div`
  font-family: monospace;
  font-size: 1.2rem;
  font-weight: 500;
  white-space: pre-wrap;
  color: ${props => props.showChords ? '#1a73e8' : 'transparent'};
  height: ${props => props.isSection ? 'auto' : props.showChords ? 'auto' : '0'};
  margin: ${props => props.isSection ? '1rem 0 0.5rem' : props.showChords ? '0.5rem 0' : '0'};
  opacity: ${props => props.showChords || props.isSection ? '1' : '0'};
  transition: all 0.3s ease;
  overflow: hidden;
  
  ${props => props.isSection && `
    color: #666;
    font-weight: bold;
    text-transform: uppercase;
    height: auto;
    margin: 1rem 0 0.5rem;
    opacity: 1;
  `}
`;

const LyricLine = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0.5rem 0;
  white-space: pre-wrap;
  color: #333;
`;

const LineContainer = styled.div`
  position: relative;
  margin: 0.5rem 0;
  padding: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: white;
  color: #333;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #666;
`;

const PrintableMusic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [music, setMusic] = useState(null);
  const [showChords, setShowChords] = useState(true);
  const [columns, setColumns] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [availableKeys, setAvailableKeys] = useState([]);
  const [transposedChords, setTransposedChords] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState([]);
  const LINES_PER_PAGE = columns ? 60 : 40; // Ajuste esses valores conforme necessário

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Usuário não autenticado');
          setIsLoading(false);
          return;
        }

        const docRef = doc(db, 'musics', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const musicData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          console.log('Música carregada:', musicData); // Debug
          setMusic(musicData);
          if (musicData.key) {
            const keys = getAllKeys(musicData.key);
            setAvailableKeys(keys);
            setCurrentKey(musicData.key);
          }
        } else {
          setError('Música não encontrada');
        }
      } catch (error) {
        console.error('Error fetching music:', error);
        setError('Erro ao carregar a música');
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMusic();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  useEffect(() => {
    if (music?.chords && currentKey) {
      const originalKey = music.key;
      const targetKey = currentKey;
      const semitones = availableKeys.find(k => k.note === targetKey)?.semitones || 0;
      
      try {
        const transposed = transposeChords(music.chords, semitones);
        setTransposedChords(transposed);
      } catch (error) {
        console.error('Erro ao transpor acordes:', error);
      }
    }
  }, [music?.chords, currentKey, availableKeys]);

  const splitIntoPages = (sections) => {
    const pages = [];
    let currentPage = [];
    let currentLineCount = 0;

    sections.forEach((section) => {
      const sectionLineCount = section.reduce((count, line) => {
        // Conta linhas de acordes e letras
        return count + (line.trim().startsWith('[') ? 2 : 1);
      }, 0);

      if (currentLineCount + sectionLineCount > LINES_PER_PAGE) {
        if (currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          currentLineCount = 0;
        }
      }

      currentPage.push(section);
      currentLineCount += sectionLineCount;

      // Se a seção atual completou a página
      if (currentLineCount >= LINES_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [];
        currentLineCount = 0;
      }
    });

    // Adiciona a última página se houver conteúdo
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  };

  const renderMusicContent = () => {
    if (!transposedChords) return null;

    const lines = transposedChords.split('\n');
    const sections = [];
    let currentSection = [];
    
    lines.forEach((line, index) => {
      if (line.trim() === '') {
        if (currentSection.length > 0) {
          sections.push([...currentSection]);
          currentSection = [];
        }
      } else {
        currentSection.push(line);
      }
      
      if (index === lines.length - 1 && currentSection.length > 0) {
        sections.push([...currentSection]);
      }
    });

    const pages = splitIntoPages(sections);
    
    const isChordLine = (line) => {
      const trimmedLine = line.trim();
      
      // Se é uma linha vazia
      if (!trimmedLine) return false;

      // Se tem letra minúscula no início da linha (provavelmente é letra da música)
      if (/^[a-z]/.test(trimmedLine)) return false;

      // Verifica se a linha contém acordes
      const hasChords = (text) => {
        // Padrão que identifica um acorde
        const chordPattern = /[A-G][#b]?[m]?[0-9]?(maj|M|dim|aug|sus[24]|[4567])?/;
        return chordPattern.test(text);
      };

      // Casos especiais que devem ser tratados como acordes
      const specialCases = [
        // Linha começa com "Tom:" seguido de acorde
        /^Tom:\s*[A-G][#b]?[m]?$/,
        // Linha com [Intro] seguida de acordes
        /^\[Intro\].*[A-G][#b]?/,
        // Acordes entre parênteses (incluindo números)
        /^\(\s*([A-G][#b]?[m]?[0-9]?(maj|M|dim|aug|sus[24]|[4567])?(\s+|$))+\s*\)$/,
        // Sequência de acordes com espaços
        /^[A-G][#b]?[m]?[0-9]?(\s+[A-G][#b]?[m]?[0-9]?)+$/,
        // Acordes com barra
        /^[A-G][#b]?[m]?[0-9]?\/[A-G][#b]?/
      ];

      // Se corresponde a algum caso especial, é uma linha de acordes
      if (specialCases.some(pattern => pattern.test(trimmedLine))) {
        return true;
      }

      // Se é um acorde sozinho
      if (/^[A-G][#b]?[m]?[0-9]?(maj|M|dim|aug|sus[24]|[4567])?$/.test(trimmedLine)) {
        return true;
      }

      // Se tem mais acordes que palavras normais, provavelmente é uma linha de acordes
      const words = trimmedLine.split(/\s+/);
      const chordCount = words.filter(word => hasChords(word)).length;
      const totalWords = words.length;

      return chordCount > totalWords / 2;
    };

    const renderLine = (line, sectionIndex, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Se é um marcador de seção (exceto [Intro])
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']') && !trimmedLine.includes('Intro')) {
        return (
          <ChordLine 
            key={`${sectionIndex}-${lineIndex}`}
            isSection={true}
          >
            {trimmedLine.slice(1, -1)}
          </ChordLine>
        );
      }

      // Adiciona log para debug
      console.log('Linha:', trimmedLine, 'isChordLine:', isChordLine(trimmedLine));

      if (isChordLine(trimmedLine)) {
        return (
          <ChordLine 
            key={`${sectionIndex}-${lineIndex}`}
            showChords={showChords}
            isSection={false}
          >
            {line}
          </ChordLine>
        );
      }

      return <LyricLine key={`${sectionIndex}-${lineIndex}`}>{line}</LyricLine>;
    };

    return pages.map((page, pageIndex) => (
      <PageContainer key={pageIndex} isLastPage={pageIndex === pages.length - 1}>
        <ContentContainer columns={columns}>
          {columns ? (
            <>
              <div>
                {page.slice(0, Math.ceil(page.length / 2)).map((section, sectionIndex) => (
                  <Section key={sectionIndex}>
                    {section.map((line, lineIndex) => renderLine(line, sectionIndex, lineIndex))}
                  </Section>
                ))}
              </div>
              <div>
                {page.slice(Math.ceil(page.length / 2)).map((section, sectionIndex) => (
                  <Section key={sectionIndex}>
                    {section.map((line, lineIndex) => renderLine(line, sectionIndex, lineIndex))}
                  </Section>
                ))}
              </div>
            </>
          ) : (
            <div>
              {page.map((section, sectionIndex) => (
                <Section key={sectionIndex}>
                  {section.map((line, lineIndex) => renderLine(line, sectionIndex, lineIndex))}
                </Section>
              ))}
            </div>
          )}
        </ContentContainer>
        <PageNumber>Página {pageIndex + 1} / {pages.length}</PageNumber>
      </PageContainer>
    ));
  };

  const renderHeader = () => (
    <>
      <Title>{music?.title}</Title>
      <Artist>{music?.artist}</Artist>
      
      <MusicInfo>
        <InfoItem>
          <span>Tom:</span> {currentKey}
        </InfoItem>
        {music?.rhythm && (
          <InfoItem>
            <span>Ritmo:</span> {music.rhythm}
          </InfoItem>
        )}
        {music?.tempo && (
          <InfoItem>
            <span>BPM:</span> {music.tempo}
          </InfoItem>
        )}
      </MusicInfo>
    </>
  );

  if (isLoading) {
    return (
      <LoadingContainer>
        <ReactLoading type="bars" color="#1a73e8" height={50} width={50} />
        <LoadingText>Carregando música...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <LoadingText>{error}</LoadingText>
      </LoadingContainer>
    );
  }

  if (!music) {
    return (
      <LoadingContainer>
        <LoadingText>Música não encontrada</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <PrintContainer>
      <PrintHeader>
        <OptionsBar>
          <Option>
            <FiColumns />
            <Button onClick={() => setColumns(!columns)}>
              {columns ? 'Uma Coluna' : 'Duas Colunas'}
            </Button>
          </Option>
          <Option>
            <FiMusic />
            <Button onClick={() => setShowChords(!showChords)}>
              {showChords ? 'Ocultar Cifras' : 'Mostrar Cifras'}
            </Button>
          </Option>
          <Option>
            <label>Tom:</label>
            <Select 
              value={currentKey} 
              onChange={(e) => setCurrentKey(e.target.value)}
              disabled={!availableKeys.length}
            >
              {availableKeys.map(key => (
                <option key={key.note} value={key.note}>{key.note}</option>
              ))}
            </Select>
          </Option>
          <Button primary onClick={() => window.print()}>
            <FiPrinter /> Imprimir
          </Button>
        </OptionsBar>
      </PrintHeader>

      {renderHeader()}
      {renderMusicContent()}
    </PrintContainer>
  );
};

export default PrintableMusic;
