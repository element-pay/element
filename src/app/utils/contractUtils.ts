import { ethers } from 'ethers';
import { useAccount, usePublicClient, useContractWrite } from 'wagmi';
import SimpleOrderHandlerABI from './SimpleOrderHandlerABI.json';

const contractAddress = 'YOUR_CONTRACT_ADDRESS';

// This hook should be used inside a React component
export function useSimpleOrderHandler() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { write: createOrderWrite, isLoading, isSuccess, error } = useContractWrite({
    address: contractAddress,
    abi: SimpleOrderHandlerABI,
    functionName: 'createOrder',
  });

  const handleCreateOrder = async (amount: string, receiveAmount: string) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    const parsedAmount = ethers.utils.parseUnits(amount, 6);
    
    await createOrderWrite({
      args: [address, parsedAmount],
    });
  };

  return {
    createOrder: handleCreateOrder,
    isLoading,
    isSuccess,
    error,
  };
}

// This function can be used outside of React components
export async function getOrderDetails(orderId: string) {
  const publicClient = await import('wagmi/actions').then(module => module.getPublicClient());
  
  const data = await publicClient.readContract({
    address: contractAddress,
    abi: SimpleOrderHandlerABI,
    functionName: 'getOrder',
    args: [orderId],
  });

  return data;
}