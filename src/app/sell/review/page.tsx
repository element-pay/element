"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import { erc20Abi, gatewayAbi } from "../../api/abi";
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { fetchRate, fetchAccountName, fetchSupportedInstitutions, fetchAggregatorPublicKey } from "../../api/aggregator";
import { getGatewayContractAddress, fetchSupportedTokens, publicKeyEncrypt } from "../../utils";
import { type BaseError, formatUnits, parseUnits, encodeFunctionData, getAddress } from "viem";
import { useSendSponsoredTransaction, useUserOpWait } from "@biconomy/use-aa";


const steps = [
  { label: 'Amount', status: 'completed' as 'completed', number: 1 },
  { label: 'Review', status: 'active' as 'active', number: 2 },
  { label: 'Process', status: 'upcoming' as 'upcoming', number: 3 },
  { label: 'Status', status: 'upcoming' as 'upcoming', number: 4 },
];
const PROVIDER_ID = process.env.NEXT_PUBLIC_PROVIDER_ID;



export default function SellReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [smartGatewayAllowance, setSmartGatewayAllowance] = useState<number>(0);
  const [paymasterAllowance, setPaymasterAllowance] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);


  // Get all possible parameters
  const amount = searchParams.get('amount');
  const token = searchParams.get('token');
  const network = searchParams.get('network');
  const receiveCurrency = searchParams.get('receiveCurrency');
  const receiveAmount = searchParams.get('receiveAmount');
  const offrampType = searchParams.get('offrampType');
  
  // Bank transfer specific parameters
  const bank = searchParams.get('bank') || 'No bank specified';
  

  // const account = searchParams.get('account');
  const memo = searchParams.get('memo');
  
  // Mobile money specific parameter
  const phone = searchParams.get('phone');

  const [gatewayStatus, setGatewayStatus] = useState('inactive');
  const [orderStatus, setOrderStatus] = useState('inactive');
  const [isProcessing, setIsProcessing] = useState(false);

  const [gatewayAllowance, setGatewayAllowance] = useState<number>(0);
  const [isGatewayApproved, setIsGatewayApproved] = useState<boolean>(false);
  const [isOrderCreated, setIsOrderCreated] = useState<boolean>(false);

  const account = useAccount();
  const client = usePublicClient();

  const tokenDecimals = fetchSupportedTokens("Base")?.find(
    (t) => t.symbol.toUpperCase() === token,
  )?.decimals;

  const tokenAddress = fetchSupportedTokens("Base")?.find(
    (t) => {
      console.log("Looking for token symbol:", t.symbol.toUpperCase(), "Matching with:", token);
      return t.symbol.toUpperCase() === token;
    }
  )?.address as `0x${string}`;
  const tokenSymbol = fetchSupportedTokens("Base")?.find(
    (t) => t.symbol.toUpperCase() === token,
  )?.symbol;
  
  if (!tokenAddress) {
    console.error("Token address is undefined. Check the network and token symbol.");
  }
  
  const gatewayContractAddress = getGatewayContractAddress("Base") as `0x${string}`;

  if (!gatewayContractAddress) {
    console.error("Gateway contract address is undefined");
  }

  const { data: gatewayAllowanceInWei } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress, // Token contract address
    functionName: "allowance",
    args: [account.address!, gatewayContractAddress],
  });
  
  useEffect(() => {
    if (gatewayAllowanceInWei && tokenAddress) {
      const tokenDecimals = fetchSupportedTokens("Base")?.find(t => t.symbol.toUpperCase() === token)?.decimals;
      setGatewayAllowance(Number(formatUnits(gatewayAllowanceInWei, tokenDecimals!)));
      if (gatewayAllowanceInWei > parseUnits(amount!.toString(), tokenDecimals!)) {
        setIsGatewayApproved(true);
      }
  }
  }, [gatewayAllowanceInWei, tokenAddress, amount]);

  

  
  // const handleGatewayApproval = async () => {
  //   console.log("Starting gateway approval...");

  //   const tokenDecimals = fetchSupportedTokens("Base")?.find(t => t.symbol.toUpperCase() === token)?.decimals;
    
  //   if (!tokenDecimals) {
  //     console.error("Token decimals not found");
  //     setErrorMessage("Token decimals not found. Please try again.");
  //     return false;
  //   }

  //   const data = encodeFunctionData({
  //     abi: erc20Abi,
  //     functionName: "approve",
  //     args: [
  //       getGatewayContractAddress("Base") as `0x${string}`,
  //       parseUnits(amount!.toString(), tokenDecimals!), 
  //     ],
  //   });
  
  //   try {
  //     const txResult = await approveGateway({
  //       abi: erc20Abi,
  //       address: tokenAddress,
  //       functionName: "approve",
  //       args: [
  //         getGatewayContractAddress("Base") as `0x${string}`,
  //         parseUnits(amount!.toString(), tokenDecimals!), 
  //       ],
  //     });
  //     console.log("Gateway approved successfully:", txResult);
  
  //     setIsGatewayApproved(true);
  //     return true;
  //   } catch (error) {
  //     console.error("Failed to approve gateway:", error);
  //     setErrorMessage("Gateway approval failed. Please try again.");
  //     return false;
  //   }
  // };


  const { data: smartTokenBalanceInWei } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [account.address!], 
  });
  
  const smartTokenBalance = smartTokenBalanceInWei ? Number(formatUnits(smartTokenBalanceInWei, tokenDecimals!)) : 0;

  const { data: paymasterAllowanceInWei } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [
      getAddress("0x00000f79b7faf42eebadba19acc07cd08af44789"),
      getGatewayContractAddress(account.chain?.name) as `0x${string}`,
    ],
  });
  
  const { data: smartGatewayAllowanceInWei } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [
      account.address!,
      getGatewayContractAddress(account.chain?.name) as `0x${string}`,
    ],
  });
  
  
  
  useEffect(() => {
    if (smartGatewayAllowanceInWei && tokenDecimals) {
      setSmartGatewayAllowance(
        Number(formatUnits(smartGatewayAllowanceInWei, tokenDecimals)),
      );
    }
  
    if (paymasterAllowanceInWei && tokenDecimals) {
      setPaymasterAllowance(
        Number(formatUnits(paymasterAllowanceInWei, tokenDecimals)),
      );
    }
  }, [smartGatewayAllowanceInWei, paymasterAllowanceInWei, tokenDecimals]);
  
  const prepareCreateOrderParams = async () => {

    if (!tokenSymbol) {
      throw new Error('Token is not defined');
    }
  
    const rateResponse = await fetchRate({
      token: tokenSymbol!,
      amount: parseFloat(amount!.toString()),
      currency: receiveCurrency!,
    });
  
    const rate = rateResponse.data; 
    // Prepare recipient data
    const recipient = {
      // accountIdentifier: formValues.accountIdentifier,
      // accountName: recipientName,
      institution: bank,
      providerId: PROVIDER_ID,
      memo: memo,
    };

    // Fetch aggregator public key
    const publicKey = await fetchAggregatorPublicKey();
    const encryptedRecipient = publicKeyEncrypt(recipient, publicKey.data);

    // Prepare transaction parameters
    const params = {
      token: tokenAddress,
      amount: parseUnits(amount!.toString(), tokenDecimals!),
      rate: parseUnits(rate.toString(), 0),
      senderFeeRecipient: getAddress(
        "0x0000000000000000000000000000000000000000",
      ),
      senderFee: BigInt(0),
      refundAddress: account.address,
      messageHash: encryptedRecipient,
    };

    return params;
  };

  const {
    data: hash,
    error,
    isPending,
    writeContractAsync: approveGateway,
  } = useWriteContract();

  const {
    mutate,
    data: userOpResponse,
    error: userOpError,
    isPending: useropIsPending,
  } = useSendSponsoredTransaction();

  const {
    data: hashCreateOrder,
    error: errorCreateOrder,
    isPending: isPendingCreateOrder,
    writeContractAsync: createOrderAsync,
  } = useWriteContract();

  const createOrder = async () => {
    try {
      const params = await prepareCreateOrderParams();
      // setCreatedAt(new Date().toISOString());
      let orderId: string | null = null;


      if (smartTokenBalance >= parseFloat(amount!.toString())) {
        // Create order with sponsored user operation
        let transactions = [
          {
            to: getGatewayContractAddress("Base") as `0x${string}`,
            data: encodeFunctionData({
              abi: gatewayAbi,
              functionName: "createOrder",
              args: [
                params.token,
                params.amount,
                params.rate,
                params.senderFeeRecipient,
                params.senderFee,
                params.refundAddress!,
                params.messageHash,
              ],
            }),
          },
        ];

        if (smartGatewayAllowance < parseFloat(amount!)) {
          // Approve gateway contract to spend token
          transactions.push({
            to: tokenAddress,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [
                getGatewayContractAddress(account.chain?.name) as `0x${string}`,
                parseUnits(amount!.toString(), tokenDecimals!),
              ],
            }),
          });
        }

        if (paymasterAllowance < parseFloat(amount!)) {
          // Approve paymaster contract to spend token
          transactions.push({
            to: tokenAddress,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [
                getAddress("0x00000f79b7faf42eebadba19acc07cd08af44789"),
                parseUnits(amount!.toString(), tokenDecimals!),
              ],
            }),
          });
        }

        mutate({ transactions });
        
        setIsOrderCreated(true);
      } else {
        // Create order
        const response = await createOrderAsync({
          abi: gatewayAbi,
          address: getGatewayContractAddress(
            "Base",
          ) as `0x${string}`,
          functionName: "createOrder",
          args: [
            params.token,
            params.amount,
            params.rate,
            params.senderFeeRecipient,
            params.senderFee,
            params.refundAddress!,
            params.messageHash,
          ],
        });
        console.log("Create order response:", response);
        // orderId = response? || null;

        setIsOrderCreated(true);
        return response;
      }
    } catch (e: any) {
      if (error) {
        console.error("Error creating order:", error);
        setErrorMessage((error as BaseError).shortMessage || error!.message);
      } else {
        setErrorMessage((e as BaseError).shortMessage);
      }
      setIsConfirming(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    try {
      setIsConfirming(true);

      // if (gatewayAllowance < parseFloat(amount!)) {
      //   console.log("Gateway not approved. Attempting approval...");

        console.log("Attempting to approve gateway with params:", {
          tokenAddress,
          amount: parseUnits(amount!.toString(), tokenDecimals!)
        });
        
  
        const txResult = await approveGateway({
          abi: erc20Abi,
          address: tokenAddress,
          functionName: "approve",
          args: [
            getGatewayContractAddress("Base") as `0x${string}`,
            parseUnits(amount!.toString(), tokenDecimals!),
          ],
        });
  
        if (txResult) {
          console.log("Gateway approved successfully:", txResult);
          setIsGatewayApproved(true);
        } else {
          console.error("Gateway approval failed. No result returned.");
          setErrorMessage("Gateway approval failed. Please try again.");
          setIsConfirming(false);
          return;
        }
      // } else {
      //   console.log("Gateway already approved. Proceeding...");
      //   setIsGatewayApproved(true);
      // }
  
        const response = await createOrder();
        console.log("Order created successfully:", response);
    
        console.log("Payment confirmed successfully.");
        setIsConfirming(false);
    } catch (error) {
      console.error("Error during payment confirmation:", error);
      setErrorMessage("An error occurred while confirming the payment.");
      setIsConfirming(false);
    }
  };

  const handleCreateOrder = async () => {
    console.log("Creating order...");

    try {
      await createOrder();
      console.log("Order created successfully");
      
      setOrderStatus('completed');
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderStatus('failed');
      setErrorMessage((error as BaseError)?.shortMessage || 'An error occurred while creating the order.');
    }
  };




  const handleConfirm = async () => {
    setIsProcessing(true);
  
    setGatewayStatus('active');

    console.log("Starting confirmation process...");

    // if (!isGatewayApproved) {
    //   await handleGatewayApproval(); 
    //   if (!isGatewayApproved) {
    //     console.error("Gateway approval failed or not reflected in state.");
    //     setIsProcessing(false);
    //     return;
    //   }
    // } else {
    //   console.log("Gateway is already approved. Proceeding to create order...");
    // }
    // setGatewayStatus('completed');
  
    setOrderStatus('active');
    // if (isGatewayApproved) {
    //   console.log("Gateway is approved. Proceeding to create order...");
    //   await handleCreateOrder();
    // }
    try{
      await handlePaymentConfirmation();
      console.log("Payment confirmed successfully");
      // await handleCreateOrder();
      setGatewayStatus('completed');

    } catch (error) {
      console.error('Error creating order:', error);
      setOrderStatus('failed');
      setErrorMessage((error as BaseError)?.shortMessage || 'An error occurred while creating the order.');
    }
    
    setOrderStatus('completed');
  
    setIsProcessing(false);
    router.push('/sell/status');
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={2} />

        <h2>Review Transaction Details</h2>
        <div className={styles.reviewContent}>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>You are selling:</span>
            <span>{amount} {token} ({network})</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>You will receive:</span>
            <span>{receiveAmount} {receiveCurrency}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Payment Method:</span>
            <span>{offrampType === 'mobile' ? 'Mobile Money' : 'Bank Transfer'}</span>
          </div>

          {offrampType === 'mobile' ? (
            // Mobile Money Details
            <div className={styles.paymentDetails}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Mobile Money Number:</span>
                <span>{phone}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Network Provider:</span>
                <span>{receiveCurrency === 'UGX' ? 'MTN/Airtel Uganda' : 
                       receiveCurrency === 'KES' ? 'M-PESA Kenya' : 
                       'Mobile Money Ghana'}</span>
              </div>
            </div>
          ) : (
            // Bank Transfer Details
            <div className={styles.paymentDetails}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Bank Name:</span>
                <span>{decodeURIComponent(bank || '')}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Account Number:</span>
                <span>{account?.address?.slice(-4)}</span>
              </div>
              {memo && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Transfer Memo:</span>
                  <span>{memo}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.warning}>
          <p>Please verify all details carefully. Transactions cannot be reversed once confirmed.</p>
          <p>Failed transactions due to incorrect details may incur a refund fee.</p>
        </div>

        <div className={styles.confirmationSteps}>
          <h3>Confirmation Steps</h3>
          <p>Your wallet will request two permissions to complete this transaction:</p>
          
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[gatewayStatus]}`}></div>
            <span className={`${styles.stepText} ${gatewayStatus === 'inactive' ? styles.inactive : ''}`}>
              1. Approve Gateway Permission
            </span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[orderStatus]}`}></div>
            <span className={`${styles.stepText} ${orderStatus === 'inactive' ? styles.inactive : ''}`}>
              2. Create Order Transaction
            </span>
          </div>
        </div>

        <button 
          onClick={handleConfirm} 
          className={`${styles.nextButton} ${isProcessing ? styles.processing : ''}`}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Confirm Transaction'}
        </button>
      </div>
    </div>
  );
}