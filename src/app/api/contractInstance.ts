import { ethers } from "ethers";
import { contractABI } from "./abi2";

const contractAddress = "0x8698bE57C454B71E86258fabB56b10fACbB2a859";

export async function createOrderOnChain(userAddress: string, amount: number): Promise<string> {
  // Logic to connect to the smart contract and create an order
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const transaction = await contract.createOrder(userAddress, amount);
  const receipt = await transaction.wait();

  const orderId = receipt.events?.find(event => event.event === 'OrderCreated')?.args?.orderId;
  return orderId;
}
