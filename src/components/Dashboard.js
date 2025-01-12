import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { collection, getDocs, query, where, doc, getDoc, setDoc, orderBy, limit } from 'firebase/firestore';
import { db, auth, storage } from '../firebaseConfig';
import { FiMusic, FiFileText, FiPieChart, FiClock, FiBell, FiUser, FiLogOut, FiUpload, FiSettings, FiMail } from 'react-icons/fi';
import ReactLoading from 'react-loading';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationBell from './NotificationBell';

const Container = styled.div`
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1.5rem;
  color: white;
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const RecentList = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 1.5rem;
`;

const ListItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;

  &:last-child {
    border-bottom: none;
  }

  h4 {
    margin: 0;
    font-size: 1.1rem;
  }

  p {
    margin: 0.5rem 0 0;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  margin-bottom: 2rem;
  position: relative;
`;

const UserWelcome = styled.div`
  color: white;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-image: url(${props => props.src || ''});
  background-size: cover;
  background-position: center;
  background-color: rgba(255, 255, 255, 0.1);
  cursor: pointer;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  
  &:hover {
    color: #1db954;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #ff4757;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenu = styled.div`
  position: fixed;
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10000;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem 1rem;
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  
  svg {
    font-size: 1.5rem;
    margin-right: 0.5rem;
  }
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
`;

const SongItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SongTitle = styled.div`
  margin: 0;
  font-size: 1rem;
  color: #fff;
  white-space: pre-line;
  line-height: 1.4;

  .song-name {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .song-details {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const EmptyMessage = styled.p`
  color: white;
  text-align: center;
  padding: 1rem;
`;

const NoResults = styled.p`
  color: white;
  text-align: center;
  padding: 1rem;
`;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const avatarRef = useRef();
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [recentSongs, setRecentSongs] = useState([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [topArtists, setTopArtists] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserData({
            ...data,
            id: user.uid,
            email: user.email || data.email,
            name: data.name || user.displayName || 'Usuário',
            photoURL: user.photoURL || data.photoURL
          });
        } else {
          const basicUserData = {
            name: user.displayName || 'Usuário',
            email: user.email,
            photoURL: user.photoURL,
            id: user.uid,
            createdAt: new Date()
          };
          await setDoc(userDocRef, basicUserData);
          setUserData(basicUserData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast.error('Erro ao carregar dados do usuário');
      }
    };

    const fetchStats = async () => {
      try {
        if (!user) return;

        const musicsRef = collection(db, 'musics');
        const q = query(musicsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const musics = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Estatísticas gerais
        setTotalSongs(musics.length);
        
        // Músicas recentes
        const recentMusics = [...musics]
          .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
          .slice(0, 5);
        setRecentSongs(recentMusics);

        // Contagem por artista
        const artistCounts = musics.reduce((acc, music) => {
          const artist = music.artist || 'Desconhecido';
          acc[artist] = (acc[artist] || 0) + 1;
          return acc;
        }, {});

        const artistStats = Object.entries(artistCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([artist, count]) => ({ artist, count }));

        setTopArtists(artistStats);

      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        toast.error('Erro ao carregar estatísticas');
      }
    };

    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      loadDashboard();
    }
  }, [user, loading]);

  if (!user && !loading) {
    navigate('/login');
    return null;
  }

  if (loading || isLoading) {
    return (
      <Container>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
        </Content>
      </Container>
    );
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      const storageRef = ref(storage, `userPhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'users', user.uid), {
        photoURL: photoURL
      }, { merge: true });

      setUserData(prev => ({
        ...prev,
        photoURL: photoURL
      }));

      toast.success('Foto atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      toast.error('Erro ao atualizar foto');
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const handleAvatarClick = () => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.right - 200 // 200px é a largura do menu
      });
      setShowUserMenu(!showUserMenu);
    }
  };

  return (
    <Container>
      <Content>
        <Header>
          <UserWelcome>
            <UserAvatar 
              ref={avatarRef}
              src={userData?.photoURL}
              onClick={handleAvatarClick}
            />
            <span>Olá, {userData?.name || 'Usuário'}</span>
          </UserWelcome>

          <HeaderActions>
            <NotificationBell />
          </HeaderActions>

          {showUserMenu && (
            <UserMenu $top={menuPosition.top} $left={menuPosition.left}>
              <MenuItem onClick={handleEditProfile}>
                <FiSettings /> Editar Perfil
              </MenuItem>
              <FileInput
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
              />
              <MenuItem onClick={() => fileInputRef.current?.click()}>
                <FiUpload /> Alterar Foto
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <FiLogOut /> Sair
              </MenuItem>
            </UserMenu>
          )}
        </Header>

        <Grid>
          <Card>
            <CardHeader>
              <FiMusic />
              <CardTitle>Total de Músicas</CardTitle>
            </CardHeader>
            <CardValue>{totalSongs}</CardValue>
          </Card>

          <Card>
            <CardHeader>
              <FiPieChart />
              <CardTitle>Artistas mais populares</CardTitle>
            </CardHeader>
            <div>
              {topArtists.map((artist, index) => (
                <div key={artist.artist} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>{artist.artist}</span>
                  <span>{artist.count}x</span>
                </div>
              ))}
            </div>
          </Card>
        </Grid>

        <RecentList>
          <CardHeader>
            <FiMusic />
            <CardTitle>Músicas Recentes</CardTitle>
          </CardHeader>
          {recentSongs.length > 0 ? (
            recentSongs.map((song) => (
              <SongItem key={song.id} onClick={() => navigate(`/music/${song.id}`)}>
                <SongTitle>
                  <div className="song-name">{song.title}</div>
                  <div className="song-details">
                    {song.artist}
                  </div>
                </SongTitle>
              </SongItem>
            ))
          ) : (
            <NoResults>Nenhuma música cadastrada ainda</NoResults>
          )}
        </RecentList>
      </Content>
    </Container>
  );
};

export default Dashboard;
