import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Grid } from '@mui/material';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { opulentSilver } from './web3';

function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [silverAmount, setSilverAmount] = useState('');

  useEffect(() => {
    async function loadBalance() {
      if (isConnected && address) {
        const balance = await opulentSilver.balanceOf(address);
        setBalance(ethers.utils.formatEther(balance));
      }
    }
    loadBalance();
  }, [isConnected, address]);

  const handleMint = async () => {
    if (isConnected && address) {
      const signer = opulentSilver.connect(new ethers.providers.Web3Provider(window.ethereum).getSigner());
      await signer.mintSilver({ value: ethers.utils.parseEther(ethAmount) });
      const balance = await opulentSilver.balanceOf(address);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const handleBurn = async () => {
    if (isConnected && address) {
      const signer = opulentSilver.connect(new ethers.providers.Web3Provider(window.ethereum).getSigner());
      await signer.burnSilver(ethers.utils.parseEther(silverAmount));
      const balance = await opulentSilver.balanceOf(address);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const handleBuySilverWithEth = async () => {
    if (isConnected && address) {
      const signer = opulentSilver.connect(new ethers.providers.Web3Provider(window.ethereum).getSigner());
      await signer.buySilverWithEth({ value: ethers.utils.parseEther(ethAmount) });
      const balance = await opulentSilver.balanceOf(address);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  const handleBuyEthWithSilver = async () => {
    if (isConnected && address) {
      const signer = opulentSilver.connect(new ethers.providers.Web3Provider(window.ethereum).getSigner());
      await signer.buyEthWithSilver(ethers.utils.parseEther(silverAmount));
      const balance = await opulentSilver.balanceOf(address);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Opulent Silver DApp</Typography>
      <ConnectButton />
      {isConnected && (
        <>
          <Typography variant="h6">Account: {address}</Typography>
          <Typography variant="h6">Balance: {balance} opXAG</Typography>
          <Box mt={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ETH Amount"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <Button variant="contained" color="primary" onClick={handleMint} fullWidth>Mint Silver</Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Silver Amount"
                  value={silverAmount}
                  onChange={(e) => setSilverAmount(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <Button variant="contained" color="primary" onClick={handleBurn} fullWidth>Burn Silver</Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" color="secondary" onClick={handleBuySilverWithEth} fullWidth>Buy Silver with ETH</Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button variant="contained" color="secondary" onClick={handleBuyEthWithSilver} fullWidth>Buy ETH with Silver</Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Container>
  );
}

export default App;
