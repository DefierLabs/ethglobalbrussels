import React from 'react';
import GlobalStyles from './../GlobalStyles';
import clsx from 'clsx';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import {useContractRead, erc20ABI, useAccount} from 'wagmi'


export default function Bar() {
  const classes = GlobalStyles();
  const { address, isConnecting, isDisconnected } = useAccount()

  return (
    <div className="appBar">
      <AppBar position="static" className={clsx(classes.appBar)} style={{ spacing: 1 }}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>Opulent Silver</Typography>
          <div>
            <Button color="inherit" href="/" >dApp</Button>
            {!isDisconnected ? (<><Button color="inherit" href="https://arbitrum.blockscout.com/address/0x9C1c63264bD6C34fcedc6B421d9F27B90EF2E5d8" > 🚀{"$opXAG"}🌙</Button></>) : (<><Button color="inherit" href="https://arbitrum.blockscout.com/address/0x9C1c63264bD6C34fcedc6B421d9F27B90EF2E5d8" > 🚀{"$opXAG"}🌙</Button></>)}
          </div>
          <div className={classes.toolbarButtons}>
            <ConnectButton />  
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}
