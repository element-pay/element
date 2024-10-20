"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import BackButton from '../../../components/BackButton/BackButton';
import MenuButton from '../../../components/MenuButton/MenuButton';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import { erc20Abi, gatewayAbi } from "../../api/abi";
import { useAccount, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { fetchRate, fetchAccountName, fetchSupportedInstitutions, fetchAggregatorPublicKey } from "../../api/aggregator";
import { getGatewayContractAddress, fetchSupportedTokens, publicKeyEncrypt } from "../../utils";
import { type BaseError, formatUnits, parseUnits, encodeFunctionData, getAddress, decodeEventLog, concatBytes } from "viem";
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

  const [isApprovalLogsFetched, setIsApprovalLogsFetched] = useState<boolean>(false);
  const [isOrderCreatedLogsFetched, setIsOrderCreatedLogsFetched] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string | null>(null);  // This will store the order ID
  const [createdAt, setCreatedAt] = useState<string | null>(null);  // This will store the order creation timestamp
  const [transactionStatus, setTransactionStatus] = useState<string>('inactive');  // Manage transaction status



  // Get all possible parameters
  const amount = searchParams.get('amount');
  const token = searchParams.get('token');
  const network = searchParams.get('network');
  const receiveCurrency = searchParams.get('receiveCurrency');
  const receiveAmount = searchParams.get('receiveAmount');
  const offrampType = searchParams.get('offrampType');
  const phone = searchParams.get('account');
  
  // Bank transfer specific parameters
  const bank = searchParams.get('selectedBank');
  console.log("Bank is:", bank);
  

  // const account = searchParams.get('account');
  const memo = searchParams.get('memo');
  
  // Mobile money specific parameter
  // const phone = searchParams.get('phone');

  const [gatewayStatus, setGatewayStatus] = useState('inactive');
  const [orderStatus, setOrderStatus] = useState('inactive');
  const [isProcessing, setIsProcessing] = useState(false);

  const [gatewayAllowance, setGatewayAllowance] = useState<number>(0);
  const [isGatewayApproved, setIsGatewayApproved] = useState<boolean>(false);
  const [isOrderCreated, setIsOrderCreated] = useState<boolean>(false);

  

  const account = useAccount();
  console.log("Account is:", account);
// p[rint account?.address?.slice(-4)]
  console.log("Amount is:", amount);
  console.log("Token is:", token);
  console.log("Network is:", network);
  console.log("Receive currency is:", receiveCurrency);
  console.log("Receive amount is:", receiveAmount);
  console.log("Offramp type is:", offrampType);
  console.log("Bank is:", bank);
  console.log("Memo is:", memo);
  console.log("Phone is:", phone);
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
        const allowance = Number(formatUnits(gatewayAllowanceInWei, tokenDecimals!));
        const requiredAmount = parseFloat(amount!.toString());

        console.log(`Allowance: ${allowance}, Required Amount: ${requiredAmount}`);
        setIsGatewayApproved(true);
      }
  }
  }, [gatewayAllowanceInWei, tokenAddress, amount]);

  const resetAllowance = async () => {
    await approveGateway({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: "approve",
      args: [
        getGatewayContractAddress("Base") as `0x${string}`,
        BigInt(0),
      ],
    });
    console.log("Allowance reset to 0");
  };
  


  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!client || isApprovalLogsFetched || !isConfirming) {
      console.log("Client is:", client);
      console.log("Conneced account is:", account);
      console.log("Skipping Approval logs logic because one condition is not met", { client, isApprovalLogsFetched, isConfirming });
      return;
    }

    const getApprovalLogs = async () => {
      try {
        console.log("Fetching Approval logs...");
        const toBlock = await client.getBlockNumber();

        const logs = await client.getContractEvents({
          address: tokenAddress,
          abi: erc20Abi,
          eventName: "Approval",
          args: {
            owner: account.address,
            spender: getGatewayContractAddress("Base") as `0x${string}`,
          },
          fromBlock: toBlock - BigInt(50),
          toBlock: toBlock,
        });
        console.log("Approval logs fetched:", logs);

        if (logs.length > 0) {
          const decodedLog = decodeEventLog({
            abi: erc20Abi,
            eventName: "Approval",
            data: logs[0].data,
            topics: logs[0].topics,
          });
          console.log("Approval logs decoded:", decodedLog);

          if (decodedLog.args.value === parseUnits(amount!.toString(), tokenDecimals!)) {
            console.log("Approval logs match the amount. Proceeding to create order...");
            clearInterval(intervalId);
            setIsApprovalLogsFetched(true);
            await createOrder();
          } else {
            console.log("Approval logs do not match the amount. Waiting for correct logs...");
          }
        }
      } catch (error) {
        console.error("Error fetching Approval logs:", error);
      }
    };

    // Initial call
    getApprovalLogs();

    // Set up polling
    intervalId = setInterval(getApprovalLogs, 2000);

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [client, isApprovalLogsFetched, isConfirming]);


  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    console.log("isConfirming is:", isConfirming);
    console.log("isOrderCreatedLogsFetched is:", isOrderCreatedLogsFetched);
    

    if (!client || isOrderCreatedLogsFetched) {
      console.log("Skipping order created logs logic because one condition is not met", { client, isApprovalLogsFetched, isConfirming });
      return;
    }
    

    const getOrderCreatedLogs = async () => {
      try {
        const toBlock = await client!.getBlockNumber();
        console.log("Current block number:", toBlock);
        const logs = await client!.getContractEvents({
          address: getGatewayContractAddress("Base") as `0x${string}`,
          abi: gatewayAbi,
          eventName: "OrderCreated",
          args: {
            sender: account.address,
            token: tokenAddress,
          },
          fromBlock: toBlock - BigInt(50),
          toBlock: toBlock,
        });
        console.log("OrderCreated logs fetched:", logs); 

        if (logs.length > 0) {
          const decodedLog = decodeEventLog({
            abi: gatewayAbi,
            eventName: "OrderCreated",
            data: logs[0].data,
            topics: logs[0].topics,
          });
          console.log("OrderCreated logs fetched:", decodedLog);

          setIsOrderCreatedLogsFetched(true);
          clearInterval(intervalId);
          setOrderId(decodedLog.args.orderId);
          //console.log("Order ID is:", orderId);
          console.log(`********************************************************************`);
          console.log("Order ID is:", decodedLog.args.orderId);
          console.log(`********************************************************************`);
          console.log("Order ID is:", decodedLog.args.orderId);
          console.log(`********************************************************************`);
          setCreatedAt(new Date().toISOString());
          setTransactionStatus("pending");
        }
      } catch (error) {
        console.error("Error fetching OrderCreated logs:", error);
      }
    };

    // Initial call
    getOrderCreatedLogs();

    // Set up polling
    intervalId = setInterval(getOrderCreatedLogs, 2000);

    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [client, isOrderCreatedLogsFetched]);



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
      getGatewayContractAddress("Base") as `0x${string}`,
    ],
  });
  
  const { data: smartGatewayAllowanceInWei } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "allowance",
    args: [
      account.address!,
      getGatewayContractAddress("Base") as `0x${string}`,
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
      accountIdentifier: phone,
      accountName: phone,
      institution: bank,
      providerId: PROVIDER_ID,
      memo: memo,
    };

    console.log(`********************************************************************`);
    console.log("Recipient data:", recipient);
    console.log("account name is:", recipient.accountName);
    console.log("account identifier is:", recipient.accountIdentifier);
    console.log("institution is:", recipient.institution);
    console.log("Recipient data:", recipient);
    console.log(`********************************************************************`);
    console.log(`********************************************************************`);

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
      console.log("Starting createOrder...");
      const params = await prepareCreateOrderParams();
      setCreatedAt(new Date().toISOString());
      console.log("Order params prepared:", params);

      setCreatedAt(new Date().toISOString());

      console.log("Smart token balance:", smartTokenBalance);
      console.log("Amount:", amount);


      if (smartTokenBalance >= parseFloat(amount!.toString())) {
        // Create order with sponsored user operation
        console.log("Proceeding with sponsored user operation...");
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
          console.log("Approving gateway contract to spend token...");
          transactions.push({
            to: tokenAddress,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [
                getGatewayContractAddress("Base") as `0x${string}`,
                parseUnits(amount!.toString(), tokenDecimals!),
              ],
            }),
          });
        }

        if (paymasterAllowance < parseFloat(amount!)) {
          // Approve paymaster contract to spend token
          console.log("Approving paymaster contract to spend token...");
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
        console.log("Executing mutate with transactions:", transactions);

        try {
          mutate({ transactions });
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
          setIsOrderCreated(true);
          console.log("Order creation completed with mutate.");
        }catch (error) {
          console.error("Error creating order:", error);
          setErrorMessage((error as BaseError).shortMessage || (error as BaseError).message);
          setIsConfirming(false);
        }

        
        setIsOrderCreated(true);
        console.log("Order creation completed with mutate.");
      } else {
        // Create order
        console.log("Proceeding to create order directly...");
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
        setIsOrderCreated(true);
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
  useEffect(() => {
    if (orderId) {
      console.log("OrderId is now available in state:", orderId);
    }
  }, [orderId]);
  useEffect(() => {
    if (!account?.address) {
      console.log("Wallet disconnected, please reconnect");
    } else {
      console.log("Account is connected:", account.address);
    }
  }, [account]);
  
  const handlePaymentConfirmation = async () => {
    try {
      setIsConfirming(true);

      if (gatewayAllowance < parseFloat(amount!.toString())) {
        // Approve gateway contract if not already approved
        await handleGatewayAproval();
        setIsGatewayApproved(true);
      }
      
      // After approval, create the order
      // await createOrder();

    } catch (e: any) {
      setErrorMessage((e as BaseError).shortMessage || e!.message);
      setIsConfirming(false);
    }
};

const handleGatewayAproval = async () => {
  try {
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
      const receipt = await client!.waitForTransactionReceipt({ hash: txResult });
      console.log("Gateway approval receipt:", receipt);
      if (receipt.status === "success") {	
        console.log("Gateway approval receipt:", receipt);
        await createOrder();
        setIsConfirming(false);
      } else {
        console.error("Gateway approval failed. Transaction receipt status:", receipt.status);
        setErrorMessage("Gateway approval failed. Please try again.");
        setIsConfirming(false);
      }

  } catch (error) {
    console.error("Error during payment confirmation:", error);
    setErrorMessage("An error occurred while confirming the payment.");
    setIsConfirming(false);
  }
};
  useEffect(() => {
    if (orderId) {
      console.log("Saving orderId to local storage:", orderId);
      localStorage.setItem('orderId', orderId); 
    }
  }, [orderId]);




  const handleConfirm = async () => {
    setIsProcessing(true);
  
    setGatewayStatus('active');
    setTransactionStatus('active');

    console.log("Starting confirmation process...");

    try{
      await handlePaymentConfirmation();
      console.log("Payment confirmed successfully");
      setGatewayStatus('completed');
      setTransactionStatus('completed');
      setIsProcessing(false);

    } catch (error) {
      console.error('Error creating order:', error);
      setOrderStatus('failed');
      setTransactionStatus('failed');
      setErrorMessage((error as BaseError)?.shortMessage || 'An error occurred while creating the order.');

    }
    const waitForOrderLogs = new Promise<void>((resolve, reject) => {
      console.log("Waiting for order logs...************************************");
      const intervalId = setInterval(() => {
        console.log("Checking if order logs are fetched in the wait for order logs function...");
        if (isOrderCreatedLogsFetched) {
          console.log(`isOrderCreatedLogsFetched is: ${isOrderCreatedLogsFetched}`);
          clearInterval(intervalId);
          resolve();
        }
      }, 1000);

      setTimeout(() => {
        console.log("Order logs not fetched within 30 seconds. Proceeding...");
        clearInterval(intervalId);
        resolve(); // Proceed without logs?
      }, 10000); 
      
    });

    // Wait for the logs

    await waitForOrderLogs;
    setIsProcessing(false);
    console.log("Order logs fetched successfully. Order ID is:", orderId);

    router.push(`/sell/status?orderId=${orderId}`);
  
    
  };
  

  return (
    <Suspense fallback={<div>Loading...</div>}>
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
                <span>{phone}</span>
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

        <div>
          Current Allowance: {gatewayAllowance} {token}
          {isGatewayApproved && (
            <button onClick={resetAllowance}>Reset Gateway</button>
          )}
        </div>


        <div className={styles.confirmationSteps}>
          <h3>Confirmation Steps</h3>
          <p>Your wallet will request two permissions to complete this transaction:</p>
          
          <div className={styles.step}>
          <div className={`${styles.stepLoader} ${isGatewayApproved ? styles.completed : styles.inactive}`}></div>
          <span className={`${styles.stepText} ${!isGatewayApproved ? styles.inactive : ''}`}>
            1. Approve Gateway Permission
          </span>

          </div>
          <div className={styles.step}>
          <div className={`${styles.stepLoader} ${isOrderCreated ? styles.completed : styles.inactive}`}></div>
          <span className={`${styles.stepText} ${!isOrderCreated ? styles.inactive : ''}`}>
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
    </Suspense>
  );
}