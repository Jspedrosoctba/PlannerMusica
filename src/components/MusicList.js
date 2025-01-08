import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiMusic, FiBookOpen } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background: ${props => (props.active ? '#1db954' : 'rgba(255, 255, 255, 0.1)')};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => (props.active ? '#1ed760' : 'rgba(255, 255, 255, 0.2)')};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: #1db954;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
`;

const CardArtist = styled.p`
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
`;

const CardInfo = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
`;

const AddButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #1db954;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background: #1ed760;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: white;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-top: 2rem;

  h3 {
    margin: 1rem 0;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const MusicList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lyrics'); // 'lyrics' ou 'chords'
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, activeTab),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      toast.error('Erro ao carregar a lista de músicas');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.artist.toLowerCase().includes(searchLower)
    );
  });

  const handleAddClick = () => {
    navigate('/music-form');
  };

  const handleItemClick = (item) => {
    navigate(`/music/${item.id}`);
  };

  return (
    <Container>
      <Content>
        <Header>
          <Title>Minhas Músicas</Title>
        </Header>

        <TabContainer>
          <Tab 
            active={activeTab === 'lyrics'} 
            onClick={() => setActiveTab('lyrics')}
          >
            <FiBookOpen /> Letras
          </Tab>
          <Tab 
            active={activeTab === 'chords'} 
            onClick={() => setActiveTab('chords')}
          >
            <FiMusic /> Cifras
          </Tab>
        </TabContainer>

        <SearchInput
          type="text"
          placeholder="Pesquisar por título ou artista..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading ? (
          <LoadingContainer>
            <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
          </LoadingContainer>
        ) : filteredItems.length > 0 ? (
          <Grid>
            {filteredItems.map((item) => (
              <Card key={item.id} onClick={() => handleItemClick(item)}>
                <CardTitle>{item.title}</CardTitle>
                <CardArtist>{item.artist}</CardArtist>
                <CardInfo>
                  {activeTab === 'chords' && (
                    <>
                      <span>Tom: {item.key}</span>
                      <span>Ritmo: {item.rhythm}</span>
                    </>
                  )}
                  <span>
                    {new Date(item.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </CardInfo>
              </Card>
            ))}
          </Grid>
        ) : (
          <EmptyState>
            <FiMusic size={48} />
            <h3>Nenhuma {activeTab === 'lyrics' ? 'letra' : 'cifra'} encontrada</h3>
            <p>
              Comece adicionando suas {activeTab === 'lyrics' ? 'letras' : 'cifras'} 
              favoritas!
            </p>
          </EmptyState>
        )}

        <AddButton onClick={handleAddClick}>
          <FiPlus />
        </AddButton>
      </Content>
    </Container>
  );
};

export default MusicList;
