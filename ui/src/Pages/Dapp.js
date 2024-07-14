import * as React from 'react';
import GlobalStyles from '../GlobalStyles';
import { Typography, Card, CardContent, TextField, Button, Grid, Divider, InputAdornment } from '@mui/material';
import { useContractRead, useAccount, useContractWrite, usePrepareContractWrite, useBalance } from 'wagmi';
import { ethers } from 'ethers';


const contractAddress = '0x9C1c63264bD6C34fcedc6B421d9F27B90EF2E5d8'; // Replace with your contract address
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "COLLATERALIZATION_RATIO",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "FEE_PERCENTAGE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "PRICE_FEED_DECIMALS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "collateralBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintSilver",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burnSilver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "silverAmount",
        "type": "uint256"
      }
    ],
    "name": "buyEthWithSilver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buySilverWithEth",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [],
    "name": "getPrices",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getCollateralBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getCollateralizationRatio",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ethAmount",
        "type": "uint256"
      }
    ],
    "name": "calculateSilverForEth",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "silverAmount",
        "type": "uint256"
      }
    ],
    "name": "calculateEthForSilver",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ethAmount",
        "type": "uint256"
      }
    ],
    "name": "getExpectedSilverForEth",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "silverAmount",
        "type": "uint256"
      }
    ],
    "name": "getExpectedEthForSilver",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]

const WETH_DECIMALS = 18; // 1e15 gwei

export default function Dapp() {
  const classes = GlobalStyles();
  const { address } = useAccount();
  const [mintAmount, setMintAmount] = React.useState('');
  const [burnAmount, setBurnAmount] = React.useState('');
  const [buyAmount, setBuyAmount] = React.useState('');
  const [sellAmount, setSellAmount] = React.useState('');

  // Read contract data
  const { data: prices } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getPrices',
  });

  const { data: collateralBalance } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getCollateralBalance',
    args: [address],
  });

  const { data: silverBalance } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: collateralizationRatio } = useContractRead({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getCollateralizationRatio',
    args: [address],
  });

  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Prepare contract writes
  const { config: mintConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'mintSilver',
    args: [],
    overrides: {
      value: mintAmount ? ethers.utils.parseUnits(mintAmount, WETH_DECIMALS) : undefined,
    },
  });

  const { config: burnConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'burnSilver',
    args: [burnAmount ? ethers.utils.parseUnits(burnAmount, WETH_DECIMALS) : 0],
  });

  const { config: buyConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'buySilverWithEth',
    args: [],
    overrides: {
      value: buyAmount ? ethers.utils.parseUnits(buyAmount, WETH_DECIMALS) : undefined,
    },
  });

  const { config: sellConfig } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'buyEthWithSilver',
    args: [sellAmount ? ethers.utils.parseUnits(sellAmount, WETH_DECIMALS) : 0],
  });

  // Contract writes
  const { write: mint } = useContractWrite(mintConfig);
  const { write: burn } = useContractWrite(burnConfig);
  const { write: buy } = useContractWrite(buyConfig);
  const { write: sell } = useContractWrite(sellConfig);

  const formatBalance = (balance) => {
    if (!balance) return 'N/A';
    return parseFloat(ethers.utils.formatUnits(balance, WETH_DECIMALS)).toFixed(4);
  };

  const ethPrice = prices?.[0] ? parseFloat(ethers.utils.formatUnits(prices[0], 8)) : 0;
  const silverPrice = prices?.[1] ? parseFloat(ethers.utils.formatUnits(prices[1], 8)) : 0;
  const exchangeRate = ethPrice && silverPrice ? (ethPrice / silverPrice).toFixed(4) : 'N/A';

  const handleMax = (setter, balance) => {
    if (balance) {
      setter(ethers.utils.formatUnits(balance, WETH_DECIMALS));
    }
  };

  return (
    <div className="Dapp">
      <Typography align="center" variant="h3" className={classes.title} color="white">
        Opulent
      </Typography>

      <Card style={{ marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Contract Information</Typography>
          <Divider style={{ margin: '10px 0' }} />
          <Typography>ETH Price: ${ethPrice.toFixed(2)}</Typography>
          <Typography>Silver Price: ${silverPrice.toFixed(2)}</Typography>
          <Typography>Exchange Rate: 1 ETH = {exchangeRate} Silver</Typography>
          <Typography>Your ETH Balance: {formatBalance(ethBalance?.value)} ETH</Typography>
          <Typography>Your Silver Balance: {formatBalance(silverBalance)} Silver</Typography>
          <Typography>Your Collateral Balance: {formatBalance(collateralBalance)} ETH</Typography>
          <Typography>Your Collateralization Ratio: {collateralizationRatio ? `${collateralizationRatio.toString()}%` : 'N/A'}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card style={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Deposit Collateral & Mint</Typography>
              <Typography>Current ETH Balance: {formatBalance(ethBalance?.value)} ETH</Typography>
              <TextField
                label="ETH Amount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => handleMax(setMintAmount, ethBalance?.value)}>Max</Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" color="primary" onClick={() => mint?.()} fullWidth>
                Mint Silver
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Burn & Retrieve Collateral</Typography>
              <Typography>Current Silver Balance: {formatBalance(silverBalance)} Silver</Typography>
              <TextField
                label="Silver Amount"
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => handleMax(setBurnAmount, silverBalance)}>Max</Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" color="secondary" onClick={() => burn?.()} fullWidth>
                Burn Silver
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Buy Silver</Typography>
              <Typography>Current ETH Balance: {formatBalance(ethBalance?.value)} ETH</Typography>
              <Typography>Buy Price: 1 ETH = {exchangeRate} Silver</Typography>
              <TextField
                label="ETH Amount"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => handleMax(setBuyAmount, ethBalance?.value)}>Max</Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" color="primary" onClick={() => buy?.()} fullWidth>
                Buy Silver
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card style={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6">Sell Silver</Typography>
              <Typography>Current Silver Balance: {formatBalance(silverBalance)} Silver</Typography>
              <Typography>Sell Price: {exchangeRate} Silver = 1 ETH</Typography>
              <TextField
                label="Silver Amount"
                type="number"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => handleMax(setSellAmount, silverBalance)}>Max</Button>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="contained" color="secondary" onClick={() => sell?.()} fullWidth>
                Sell Silver
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}