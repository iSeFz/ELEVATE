import { FC } from 'react';
import {
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import {CustomBox, TitleText} from "./sidebarStyles"


const Sidebar: FC = () => {
  return (
    <CustomBox>
      <TitleText variant = "h4">
        ELEVATE
      </TitleText>
      
      {/*fix the text style and style the menu more*/}
      <List>
        <ListItem button selected>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem button>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Brand Profile" />
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Products" />
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>

        <ListItem button>
          <ListItemIcon>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </ListItem>
      </List>
    </CustomBox>
  );
};

export default Sidebar;