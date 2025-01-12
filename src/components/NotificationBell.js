import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '../contexts/NotificationContext';

const BellContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin-right: 16px;
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: inherit;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    color: #333;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f44336;
  color: white;
  border-radius: 50%;
  padding: 1px 4px;
  font-size: 10px;
  min-width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(50%, -50%);
`;

const PopoverContainer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.show ? 'block' : 'none'};
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #eee;
  background-color: ${props => props.read ? 'white' : 'rgba(25, 118, 210, 0.08)'};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationMessage = styled.div`
  font-size: 12px;
  color: #333;
  line-height: 1.4;
`;

const TimeStamp = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 4px;
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 8px;
  border: none;
  background: none;
  color: #1976d2;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-top: 1px solid #eee;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const EmptyMessage = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
  font-size: 12px;
`;

export default function NotificationBell() {
  const [showPopover, setShowPopover] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotifications();
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowPopover(!showPopover);
    if (!showPopover && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <BellContainer ref={containerRef}>
      <IconButton onClick={handleBellClick}>
        <FiBell />
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </IconButton>

      <PopoverContainer show={showPopover}>
        <NotificationList>
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} read={notification.read}>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <TimeStamp>{formatTimestamp(notification.timestamp)}</TimeStamp>
                </NotificationItem>
              ))}
              <ClearButton onClick={clearNotifications}>
                Limpar todas
              </ClearButton>
            </>
          ) : (
            <EmptyMessage>Nenhuma notificação</EmptyMessage>
          )}
        </NotificationList>
      </PopoverContainer>
    </BellContainer>
  );
}
