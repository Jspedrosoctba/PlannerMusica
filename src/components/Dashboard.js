import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { FiMusic, FiPieChart, FiSettings, FiUpload, FiLogOut, FiEdit2, FiX, FiPlus } from 'react-icons/fi';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import NotificationBell from './NotificationBell';
import ReactLoading from 'react-loading';

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

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 2rem;
`;

const LogoImage = styled.img`
  width: 320px;
  height: 120px;
  object-fit: contain;
`;

const UserWelcome = styled.div`
  display: flex;
  flex-direction: column;
  color: white;

  h1 {
    font-size: 2rem;
    margin: 0;
    font-weight: 500;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    margin: 8px 0 0 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TotalCard = styled(Card)`
  grid-column: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ArtistsCard = styled(Card)`
  grid-column: 2;
`;

const RecentCard = styled(Card)`
  grid-column: 1 / -1;
  margin-top: 24px;
`;

const CardTitle = styled.h2`
  color: white;
  font-size: 1.5rem;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TotalNumber = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: white;
`;

const ArtistItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SongItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:not(:last-child) {
    margin-bottom: 8px;
  }

  .song-details {
    opacity: 0.8;
    font-size: 0.9rem;
    margin-top: 4px;
  }
`;

const SongTitle = styled.div`
  flex: 1;
  
  .song-name {
    font-weight: 500;
    margin-bottom: 4px;
  }
`;

const SongArtist = styled.div`
  opacity: 0.8;
  font-size: 0.9rem;
  margin-top: 4px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 20px;
`;

const UserMenu = styled.div`
  position: absolute;
  top: ${props => props.style.top}px;
  left: ${props => props.style.left}px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 200px;
  z-index: 1000;
  transform: translateX(-90%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 28px;
    width: 12px;
    height: 12px;
    background: rgba(0, 0, 0, 0.85);
    transform: rotate(45deg);
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: #764ba2;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #667eea;
  }

  svg {
    font-size: 1.2rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Dashboard = () => {
  const [recentSongs, setRecentSongs] = useState([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [topArtists, setTopArtists] = useState([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const avatarRef = useRef();

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setUserData({
          name: user.displayName || user.email?.split('@')[0] || 'Usuário',
          photoURL: user.photoURL,
          uid: user.uid
        });

        const musicsRef = collection(db, 'musics');
        const userMusicsQuery = query(
          musicsRef,
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(userMusicsQuery);
        const allSongs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        const sortedSongs = allSongs.sort((a, b) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        const recentSongsList = sortedSongs.slice(0, 5);
        
        setRecentSongs(recentSongsList);
        setTotalSongs(allSongs.length);

        const artistCount = allSongs.reduce((acc, song) => {
          const artist = song.artist || 'Desconhecido';
          acc[artist] = (acc[artist] || 0) + 1;
          return acc;
        }, {});

        const topArtistsList = Object.entries(artistCount)
          .map(([artist, count]) => ({ artist, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopArtists(topArtistsList);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target?.files?.[0];
    
    if (!file) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    // Verifica o tamanho do arquivo (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    try {
      const storage = getStorage();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      const imageRef = ref(storage, `profile_photos/${user.uid}_${Date.now()}`);
      await uploadBytes(imageRef, file);
      const photoURL = await getDownloadURL(imageRef);
      await updateProfile(user, { photoURL });
      
      setUserData(prev => ({ ...prev, photoURL }));
      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error('Erro ao atualizar a foto. Tente novamente.');
    }
  };

  const handleAvatarClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 10,
      left: rect.right
    });
    setShowUserMenu(!showUserMenu);
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <LogoContainer>
          <LogoImage src="/Planner_Music.png" alt="Planner Music" />
        </LogoContainer>
        <HeaderRight>
          <NotificationBell />
          <Avatar
            ref={avatarRef}
            src={userData?.photoURL || '/default-avatar.png'}
            onClick={handleAvatarClick}
          />
        </HeaderRight>
      </Header>

      <Content>
        <UserWelcome>
          <h1>Olá, {userData?.name}</h1>
          <p>Tenha um bom evento!</p>
        </UserWelcome>

        <ButtonContainer>
          <ActionButton onClick={() => navigate('/musiclist')}>
            <FiMusic /> Ver Músicas
          </ActionButton>
          <ActionButton onClick={() => navigate('/music/new')}>
            <FiPlus /> Nova Música
          </ActionButton>
        </ButtonContainer>

        <Grid>
          <TotalCard>
            <CardTitle>
              <FiMusic />
              Total de Músicas
            </CardTitle>
            <TotalNumber>{totalSongs}</TotalNumber>
          </TotalCard>

          <ArtistsCard>
            <CardTitle>
              <FiPieChart />
              Artistas mais populares
            </CardTitle>
            {topArtists.map((artist, index) => (
              <ArtistItem key={index}>
                <span>{artist.artist}</span>
                <span>{artist.count}x</span>
              </ArtistItem>
            ))}
          </ArtistsCard>

          <RecentCard>
            <CardTitle>
              <FiMusic />
              Músicas Recentes
            </CardTitle>
            {recentSongs.length > 0 ? (
              recentSongs.map((song) => (
                <SongItem key={song.id} onClick={() => navigate(`/music/${song.id}`)}>
                  <div>
                    <SongTitle>{song.title}</SongTitle>
                    <SongArtist>{song.artist}</SongArtist>
                  </div>
                </SongItem>
              ))
            ) : (
              <EmptyMessage>Nenhuma música cadastrada ainda</EmptyMessage>
            )}
          </RecentCard>
        </Grid>
      </Content>

      {showUserMenu && (
        <UserMenu style={{ top: menuPosition.top, left: menuPosition.left }}>
          <MenuItem onClick={() => fileInputRef.current.click()}>
            <FiUpload /> Alterar foto
          </MenuItem>
          <MenuItem onClick={() => {
            setShowUserMenu(false);
            navigate('/edit-profile');
          }}>
            <FiEdit2 /> Editar Perfil
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <FiLogOut /> Sair
          </MenuItem>
        </UserMenu>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handlePhotoUpload}
      />
    </Container>
  );
};

export default Dashboard;
