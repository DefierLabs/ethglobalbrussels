import { ethers } from 'ethers';
import OpulentSilverABI from './OpulentSilverABI.json';

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const opulentSilver = new ethers.Contract(contractAddress, OpulentSilverABI, provider);

export { provider, opulentSilver };
