import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import styled from 'styled-components';
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
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
  position: relative;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const TotalMusic = styled.span`
  color: white;
  font-size: 1.1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  padding-right: 40px;
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

const SearchIcon = styled(FiSearch)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
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

const MusicListContainer = styled.div`
  position: relative;
`;

const MusicItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MusicInfo = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const MusicTitle = styled.h3`
  margin: 0;
  margin-bottom: 0.5rem;
  color: white;
  font-size: 1.1rem;
`;

const MusicArtist = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const MusicActions = styled.div`
  position: relative;
  z-index: 1000;
`;

const OptionsButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px;
  cursor: pointer;
  position: relative;
  z-index: 1000;

  &:hover {
    color: white;
  }

  &:focus {
    outline: none;
  }
`;

const OptionsMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: #282828;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  z-index: 1001;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  color: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 1.1rem;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
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
      <Content>
        <ListHeader>
          <TotalMusic>Total de músicas: {filteredMusic.length}</TotalMusic>
          <AddButton onClick={handleAddNew}>
            <FiPlus /> Nova Música
          </AddButton>
        </ListHeader>

        <SearchContainer>
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
        </SearchContainer>

        <MusicListContainer>
          {filteredMusic.length > 0 ? (
            filteredMusic.map(item => (
              <MusicItem key={item.id} onClick={() => handleItemClick(item)}>
                <MusicInfo>
                  <MusicTitle>{item.title}</MusicTitle>
                  <MusicArtist>{item.artist}</MusicArtist>
                </MusicInfo>
                <MusicActions>
                  <OptionsButton onClick={(e) => toggleMenu(e, item.id)}>
                    <FiMoreVertical />
                  </OptionsButton>
                  {openMenuId === item.id && (
                    <OptionsMenu>
                      <MenuItem onClick={(e) => handleEdit(e, item)}>
                        <FiEdit2 /> Editar
                      </MenuItem>
                      <MenuItem onClick={(e) => handleDelete(e, item)}>
                        <FiTrash2 /> Excluir
                      </MenuItem>
                    </OptionsMenu>
                  )}
                </MusicActions>
              </MusicItem>
            ))
          ) : (
            <NoResults>
              {searchTerm ? 'Nenhuma música encontrada' : 'Nenhuma música cadastrada'}
            </NoResults>
          )}
        </MusicListContainer>
      </Content>
    </Container>
  );
};

export default MusicList;
