import { makeStyles } from '@mui/styles';

const drawerWidth = 240;
const GlobalStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    backgroundColor: '#F8F8F8', // Light silver background
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: '#B0C4DE', // Light steel blue
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
  },
  toolbarButtons: {
    marginLeft: 'auto',
  },
  noBg: {
    backgroundColor: '#D3D3D3', // Light gray
    boxShadow: 'none',
    borderColor: '#C0C0C0', // Silver
    margin: theme.spacing(1),
    padding: theme.spacing(1),
  },
}));

export default GlobalStyles;
