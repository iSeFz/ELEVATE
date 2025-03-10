import { FC } from 'react';
import {
  List, 
  ListItem, 
  ListItemIcon
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  PieChart,
  ShoppingBag,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router';

import {CustomBox, TitleText, StyledListItemText} from "./sidebarStyles"

const Sidebar: FC = () => {
  const navigate = useNavigate();
  return (
    <CustomBox>
      <TitleText variant = "h4">
        ELEVATE
      </TitleText>
      
      {/*fix the text style and style the menu more*/}
      <List>
        <ListItem button onClick={() => navigate('/')} sx={{backgroundColor:'black', borderRadius:3, margin:2, width:250}}>
          <ListItemIcon>
            <PieChart htmlColor="white"/>
          </ListItemIcon>
          <StyledListItemText primary="Dashboard" slotProps={{primary:{color:"White"}}}/>
        </ListItem>
        
        <ListItem button onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <StyledListItemText primary="Brand Profile"/>
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <ShoppingBag />
          </ListItemIcon>
          <StyledListItemText primary="Manage Products"/>
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <StyledListItemText primary="Settings"/>
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <StyledListItemText primary="Sign Out"/>
        </ListItem>
      </List>
    </CustomBox>
  );
};

export default Sidebar;