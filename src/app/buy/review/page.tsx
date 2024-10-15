"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import BackButton from "../../../components/BackButton/BackButton";
import MenuButton from "../../../components/MenuButton/MenuButton";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import { createOrder } from "../../utils/contractUtils";

const steps = [
  { label: "Amount", status: "completed" as "completed", number: 1 },
  { label: "Wallet", status: "completed" as "completed", number: 2 },
  { label: "Review", status: "active" as "active", number: 3 },
  { label: "Status", status: "upcoming" as "upcoming", number: 4 },
];

export default function BuyReview() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amount = searchParams.get("amount");
  const receiveAmount = searchParams.get("receiveAmount");
  const walletAddress = searchParams.get("walletAddress");
  const phone = searchParams.get("phone");

  const [gatewayStatus, setGatewayStatus] = useState("inactive");
  const [orderStatus, setOrderStatus] = useState("inactive");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      setGatewayStatus("active");

      // Call the createOrder function from contractUtils
      if (walletAddress && amount && receiveAmount) {
        const tx = await createOrder(walletAddress, amount, receiveAmount);
        console.log("Transaction successful: ", tx);
      } else {
        throw new Error("Missing required transaction details.");
      }

      console.log("Transaction successful");

      setGatewayStatus("completed");

      // Process order status
      setOrderStatus("active");
      await new Promise((resolve) => setTimeout(resolve, 2500));
      setOrderStatus("completed");

      // Redirect to status page
      router.push("/buy/status");
    } catch (error) {
      console.error("Error during transaction: ", error);
      setIsProcessing(false);
      setGatewayStatus("inactive");
      setOrderStatus("inactive");
    }
  };

  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(() => {
        router.push("/buy/status");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isProcessing, router]);

  return (
    <div className={styles.container}>
      <div className={styles.widget}>
        <div className={styles.header}>
          <BackButton />
          <MenuButton />
        </div>
        <ProgressBar steps={steps} currentStep={3} />

        <h2>Review Transaction Details</h2>
        <div className={styles.reviewContent}>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>You are buying:</span>
            <span>{receiveAmount} USDC</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>You will pay:</span>
            <span>{amount} KES</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Payment Method:</span>
            <span>M-PESA</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Phone Number:</span>
            <span>{phone}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Wallet Address:</span>
            <span>{walletAddress}</span>
          </div>
          <div className={styles.reviewItem}>
            <span className={styles.reviewLabel}>Estimated Fee:</span>
            <span>0.31 USDC</span>
          </div>
        </div>

        <div className={styles.warning}>
          <p>Please verify all details carefully. Transactions cannot be reversed once confirmed.</p>
          <p>Double-check the amount and wallet address before proceeding.</p>
        </div>

        <div className={styles.confirmationSteps}>
          <h3>Confirmation Steps</h3>
          <p>The following steps will be taken to complete your transaction:</p>

          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[gatewayStatus]}`}></div>
            <span className={`${styles.stepText} ${gatewayStatus === "inactive" ? styles.inactive : ""}`}>
              1. Create Order
            </span>
          </div>
          <div className={styles.step}>
            <div className={`${styles.stepLoader} ${styles[orderStatus]}`}></div>
            <span className={`${styles.stepText} ${orderStatus === "inactive" ? styles.inactive : ""}`}>
              2. Order Settlement
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className={`${styles.nextButton} ${isProcessing ? styles.processing : ""}`}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Confirm Transaction"}
        </button>
      </div>
    </div>
  );
}
