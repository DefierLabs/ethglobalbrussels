import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";
//imports
import Bar from "./Components/Bar.js";

import Dapp from "./Pages/Dapp.js";
import Disconnected from "./Pages/Disconnected";
import Footer from "./Components/Footer.js";

//WEB3
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import {polygon, arbitrum, Chain } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useAccount } from 'wagmi'

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: "#000000"
    },
  },
});

const customArbitrum = {
  ...arbitrum,
  blockExplorers: {
    default: {
      name: 'Arbitrum Blockscout',
      url: 'https://arbitrum.blockscout.com/',
    },
    etherscan: {
      name: 'Arbitrum Blockscout',
      url: 'https://arbitrum.blockscout.com/',
    },
  },
};

const { chains, provider } = configureChains(
  [customArbitrum],
  [
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'Opulent',
  chains
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function App() {
  const { address, isConnecting, isDisconnected } = useAccount()
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} coolMode showRecentTransactions={true}>
          <Bar/>

          {!isDisconnected ? (
            <>
          <BrowserRouter>
            <Routes>
              <Route path='' element={<Dapp/>} />
            </Routes>
          </BrowserRouter>

          </>) : (<><Disconnected /></>)}

          <Footer/>
        </RainbowKitProvider>
      </WagmiConfig>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
