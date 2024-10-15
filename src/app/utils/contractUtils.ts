import { ethers } from "ethers";
import { contractABI } from "../api/abi2";
// Replace with your contract's address
const CONTRACT_ADDRESS = "0x8698bE57C454B71E86258fabB56b10fACbB2a859";

// Initialize ethers.js and MetaMask provider
export const initializeProvider = async () => {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider;
  } else {
    console.log("MetaMask not detected!");
    return null;
  }
};

// Function to create order by interacting with the contract
export const createOrder = async (walletAddress: string, amount: string) => {
  try {
    const provider = await initializeProvider();
    if (!provider) return;

    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

    // Convert amount to Wei if needed, or format it as required by your contract
    const amountInWei = ethers.utils.parseUnits(amount, 18); // Assuming 18 decimals

    // Call createOrder function
    const tx = await contract.createOrder(walletAddress, amountInWei);
    await tx.wait(); // Wait for the transaction to be confirmed

    return tx; // Return the transaction object for further use
  } catch (error) {
    console.error("Error during createOrder transaction: ", error);
    throw new Error("Transaction failed");
  }
};
