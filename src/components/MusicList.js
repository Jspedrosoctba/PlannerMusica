import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ReactLoading from 'react-loading';
import { Link } from 'react-router-dom';

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

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const MusicGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const MusicCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const MusicTitle = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const MusicInfo = styled.p`
  color: rgba(255, 255, 255, 0.9);
  margin: 4px 0;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const ClearButton = styled(FiX)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  
  &:hover {
    color: white;
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

const MusicList = () => {
  const navigate = useNavigate();
  const [allMusic, setAllMusic] = useState([]);
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchItems(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = allMusic.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.artist.toLowerCase().includes(searchLower)
      );
    });
    setFilteredMusic(filtered);
  }, [searchTerm, allMusic]);

  const fetchItems = async (userId) => {
    setIsLoading(true);
    try {
      const musicsRef = collection(db, 'musics');
      const q = query(musicsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllMusic(items);
      setFilteredMusic(items);
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleAddNew = () => {
    navigate('/music/new');
  };

  const handleItemClick = (item) => {
    navigate(`/music/${item.id}`);
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleEdit = (e, item) => {
    e.stopPropagation();
    navigate(`/edit/${item.id}`);
    setOpenMenuId(null);
  };

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta música?')) {
      try {
        // await deleteDoc(doc(db, 'music', item.id));
        setAllMusic(allMusic.filter(music => music.id !== item.id));
        setFilteredMusic(filteredMusic.filter(music => music.id !== item.id));
        // toast.success('Música excluída com sucesso!');
      } catch (error) {
        // toast.error('Erro ao excluir música');
        console.error('Error deleting document: ', error);
      }
    }
    setOpenMenuId(null);
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
        <PageTitle>Músicas</PageTitle>
        <AddButton onClick={handleAddNew}>
          <FiPlus /> Nova Música
        </AddButton>
      </Header>
      <Content>
        <SearchInput
          type="text"
          placeholder="Buscar música..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <ClearButton onClick={clearSearch}>
            <FiX />
          </ClearButton>
        )}
        <MusicGrid>
          {filteredMusic.length > 0 ? (
            filteredMusic.map(item => (
              <MusicCard key={item.id} onClick={() => handleItemClick(item)}>
                <MusicTitle>{item.title}</MusicTitle>
                <MusicInfo>{item.artist}</MusicInfo>
              </MusicCard>
            ))
          ) : (
            <div>
              {searchTerm ? 'Nenhuma música encontrada' : 'Nenhuma música cadastrada'}
            </div>
          )}
        </MusicGrid>
      </Content>
    </Container>
  );
};

export default MusicList;
