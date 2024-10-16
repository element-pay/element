import { ethers } from 'ethers';
import { useContract, useSigner } from 'wagmi';
import SimpleOrderHandlerABI from './SimpleOrderHandlerABI.json'; // ABI of the contract

const contractAddress = 'YOUR_CONTRACT_ADDRESS';

export function useSimpleOrderHandler() {
  const { data: signer } = useSigner();

  const contract = useContract({
    addressOrName: contractAddress,
    contractInterface: SimpleOrderHandlerABI,
    signerOrProvider: signer,
  });

  return contract;
}

export async function createOrder(walletAddress, amount, receiveAmount) {
  const contract = useSimpleOrderHandler();
  const tx = await contract.createOrder(walletAddress, ethers.utils.parseUnits(amount, 6));
  await tx.wait();
  return tx;
}