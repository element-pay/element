export const createOrder = async (
    setGatewayStatus: React.Dispatch<React.SetStateAction<string>>,
    setOrderStatus: React.Dispatch<React.SetStateAction<string>>,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    router: any
  ) => {
    setIsProcessing(true);
    setGatewayStatus('active');
  
    // Simulate the first step of order creation (e.g., interacting with API or contract)
    await new Promise(resolve => setTimeout(resolve, 2500));
    setGatewayStatus('completed');
  
    setOrderStatus('active');
  
    // Simulate the second step of order confirmation
    await new Promise(resolve => setTimeout(resolve, 2500));
    setOrderStatus('completed');
  
    // Navigate to the status page
    router.push('/buy/status');
  };
  