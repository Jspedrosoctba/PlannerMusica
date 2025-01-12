import React from 'react';
import styled from 'styled-components';
import { FiMoreVertical } from 'react-icons/fi';

const MenuPortal = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
`;

const MenuPositioner = styled.div`
  position: absolute;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  pointer-events: auto;
`;

const OptionsMenu = styled.div`
  background: #282828;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  overflow: hidden;
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

const OptionsButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 8px;
  cursor: pointer;

  &:hover {
    color: white;
  }

  &:focus {
    outline: none;
  }
`;

const FloatingMenu = ({ 
  isOpen, 
  position, 
  onButtonClick, 
  menuItems 
}) => {
  return (
    <>
      <OptionsButton onClick={onButtonClick}>
        <FiMoreVertical />
      </OptionsButton>
      {isOpen && (
        <MenuPortal>
          <MenuPositioner top={position.top} left={position.left}>
            <OptionsMenu>
              {menuItems.map((item, index) => (
                <MenuItem key={index} onClick={item.onClick}>
                  {item.icon} {item.label}
                </MenuItem>
              ))}
            </OptionsMenu>
          </MenuPositioner>
        </MenuPortal>
      )}
    </>
  );
};

export default FloatingMenu;
