// src/components/Form.jsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';
import ContextVariables from '../context/ContextVariables';
import { generate_payment_link_hubtel, generate_payment_link_redde, validateCryptoWallet } from '../Functions';
import axios from "axios";
import hubtelLogo from '../assets/img/hubtellogo.svg';
import reddeLogo from '../assets/img/reddes-logo.png';
import LoadingModal from './LoadingModal';

const Form = () => {
  // Context and existing state
  const { domain, apiKey, cediRate } = useContext(ContextVariables);
  
  // Form state
  const [step, setStep] = useState(1);
  const [crypto, setCrypto] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [amountType, setAmountType] = useState('USD'); // USD, GHS, or CRYPTO
  const [phoneNumber, setPhoneNumber] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  
  // Calculated amounts
  const [USDAmount, setUSDAmount] = useState(0.0);
  const [GHSAmount, setGHSAmount] = useState(0.0);
  const [cryptoAmount, setCryptoAmount] = useState(0.0);
  const [amountToPay, setAmountToPay] = useState(0.0);
  
  // Existing state
  const [fee, setFee] = useState(0.0);
  const [minimumUSDAmount, setMinimumUSDAmount] = useState(0.0);
  const [exchangeRate, setExchangeRate] = useState(0.0);
  const [formError, setFormError] = useState('');
  const [hubtelLoading, setHubtelLoading] = useState(false);
  const [reddeLoading, setReddeLoading] = useState(false);
  const isLoading = hubtelLoading || reddeLoading;

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-orange-600' },
    { symbol: 'XMR', name: 'Monero', icon: 'ɱ', color: 'from-orange-500 to-red-600' },
    { symbol: 'LTC', name: 'Litecoin', icon: 'Ł', color: 'from-gray-400 to-gray-600' },
    { symbol: 'USDT', name: 'Tether', icon: '₮', color: 'from-green-400 to-green-600' }
  ];

  const paymentProviders = [
    { 
      id: 'hubtel', 
      name: 'Hubtel', 
      logo: hubtelLogo,
      description: 'Mobile Money & Card',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'redde', 
      name: 'Redde Online', 
      logo: reddeLogo,
      description: 'All Networks',
      color: 'from-green-500 to-green-600'
    }
  ];

  const steps = [
    { id: 1, name: 'Select Crypto', icon: '💰' },
    { id: 2, name: 'Enter Details', icon: '📝' },
    { id: 3, name: 'Payment Method', icon: '💳' },
    { id: 4, name: 'Confirm', icon: '✅' }
  ];

  // Your existing payment data objects
  const paymentData = {
    clientReference: `Payment_${Date.now()}`,
    amountGHS: parseFloat(amountToPay),
  };

  const orderData = {
    cryptoAmount: cryptoAmount,
    fee: fee,
    crypto: crypto,
    email: null,
    phoneNumber: phoneNumber,
    rate: cediRate,
    address: walletAddress,
  };

  // Your existing crypto change handler
  const handleCryptoChange = async (selectedCrypto) => {
    setCrypto(selectedCrypto);
    if (selectedCrypto === '') {
      reset();
      return;
    }

    try {
      const response = await axios.get(
        `${domain}/optimus/v1/api/cryptomus/exchange-rate/${selectedCrypto}?to=USD`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": apiKey,
          },
        }
      );

      const exchangeRate = parseFloat(response?.data?.result[0]?.course).toFixed(2);
      const withdrawalFee = Math.ceil(parseFloat(response?.data?.result[0]?.withdrawalFee) * 100) / 100;
      setMinimumUSDAmount(Math.ceil(parseFloat(response?.data?.result[0]?.minimum) * 100) / 100);

      setFee(withdrawalFee);
      setExchangeRate(exchangeRate);

    } catch (error) {
      console.log(error.message);
      setFormError("Error fetching fee");
      setTimeout(() => { setFormError("") }, 1000);
    }
  };

  // Calculate fee function (your existing logic)
  const calculateFee = (usdAmount) => {
    if (usdAmount >= 1 && usdAmount < 50) {
      return 3;
    } else if (usdAmount >= 50 && usdAmount <= 100) {
      return 4;
    } else if (usdAmount > 100) {
      return 0.05 * usdAmount;
    } else {
      return 0;
    }
  };

  // Handle amount changes based on input type
  const handleAmountChange = useCallback(() => {
    if (!amountInput || !exchangeRate || exchangeRate <= 0) {
      setUSDAmount(0);
      setGHSAmount(0);
      setCryptoAmount(0);
      setAmountToPay(0);
      return;
    }

    const inputValue = parseFloat(amountInput);
    if (isNaN(inputValue) || inputValue <= 0) return;

    let additionalFee, totalFeeUSD, totalUSDAmount;

    switch (amountType) {
      case 'USD': {
        additionalFee = calculateFee(inputValue);
        totalFeeUSD = parseFloat(fee) + additionalFee;
        totalUSDAmount = inputValue + totalFeeUSD;
        setUSDAmount(inputValue.toFixed(2));
        setCryptoAmount((inputValue / exchangeRate).toFixed(8));
        setGHSAmount((totalUSDAmount * cediRate).toFixed(2));
        setAmountToPay((totalUSDAmount * cediRate).toFixed(2));
        break;
      }

      case 'GHS': {
        const estimatedUSDAmount = inputValue / cediRate;
        additionalFee = calculateFee(estimatedUSDAmount);
        const usdAmountGHS = estimatedUSDAmount - additionalFee;
        setUSDAmount(usdAmountGHS.toFixed(2));
        setCryptoAmount((usdAmountGHS / exchangeRate).toFixed(8));
        setGHSAmount(inputValue.toFixed(2));
        setAmountToPay(inputValue.toFixed(2));
        break;
      }

      case 'CRYPTO': {
        const usdAmountCrypto = inputValue * exchangeRate;
        additionalFee = calculateFee(usdAmountCrypto);
        setUSDAmount(usdAmountCrypto.toFixed(2));
        setCryptoAmount(inputValue.toFixed(8));
        setGHSAmount(((usdAmountCrypto + additionalFee) * cediRate).toFixed(2));
        setAmountToPay(((usdAmountCrypto + additionalFee) * cediRate).toFixed(2));
        break;
      }

      default:
        break;
    }
  }, [amountInput, amountType, exchangeRate, cediRate, fee]);

  // Toast-based submit handler
  const handleSubmit = async (type) => {
    setFormError('');
    // ...existing code...

    if (type === 'hubtel') {
      setHubtelLoading(true);
    } else if (type === 'redde') {
      setReddeLoading(true);
    }

    // Validation checks
    if (!crypto) {
      toast.error("Please select a cryptocurrency to buy.");
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }

    const currentUSDAmount = parseFloat(USDAmount);
    if (currentUSDAmount <= 0 || currentUSDAmount < minimumUSDAmount) {
      toast.error(`Minimum USD amount to buy is ${minimumUSDAmount}`);
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }

    const currentCryptoAmount = parseFloat(cryptoAmount);
    if (!currentCryptoAmount || currentCryptoAmount <= 0) {
      toast.error("Crypto amount must be greater than 0.0");
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }

    // Wallet validation before phone number
    if (!walletAddress || walletAddress.length === 0) {
      toast.error("Please enter a valid wallet address.");
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }

    const isValidWallet = await validateCryptoWallet(crypto, walletAddress);
    if (!isValidWallet) {
      toast.error(`Invalid ${crypto} wallet address`);
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }
    // Phone number validation after wallet
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      toast.error("Phone number must be 10 digits long.");
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }
    if (!/^0[25]/.test(phoneNumber)) {
      toast.error("Phone number must begin with 0 and be followed by 5 or 2.");
      setHubtelLoading(false);
      setReddeLoading(false);
      return;
    }

    // Format phone number
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = '233' + phoneNumber.slice(1);
    }

    // Update order data with formatted phone
    const updatedOrderData = {
      ...orderData,
      phoneNumber: formattedPhone,
      cryptoAmount: parseFloat(cryptoAmount),
      fee: parseFloat(fee)
    };

    const updatedPaymentData = {
      ...paymentData,
      amountGHS: parseFloat(amountToPay)
    };

    // Call the appropriate payment function
    if (type === 'hubtel') {
      generate_payment_link_hubtel(domain, apiKey, setFormError, null, updatedPaymentData, updatedOrderData, () => {
        setHubtelLoading(false);
      });
    } else if (type === 'redde') {
      generate_payment_link_redde(domain, apiKey, setFormError, null, updatedPaymentData, updatedOrderData, () => {
        setReddeLoading(false);
      });
    }
    // Don't reset form here - let the payment flow handle it
  };

  const reset = () => {
    setUSDAmount(0.0);
    setCryptoAmount(0.0);
    setPhoneNumber('');
    setWalletAddress('');
    setMinimumUSDAmount(0.0);
    setFee(0.0);
    setExchangeRate(0.0);
    setAmountToPay(0.0);
    setAmountInput('');
    setStep(1);
    setSelectedProvider('');
  };

  // Effect to handle amount changes (with proper dependencies to prevent infinite loop)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleAmountChange();
    }, 100); // Debounce to prevent rapid calculations
    return () => clearTimeout(timeoutId);
  }, [handleAmountChange]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-4">
      <LoadingModal isLoading={isLoading} />
      
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            THE PLUTUS HOME
          </h2>
          <p className="text-sm sm:text-base text-slate-300">LTC | XMR | USDT | BTC</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {steps.map((stepItem, index) => (
              <React.Fragment key={stepItem.id}>
                <motion.div 
                  className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                    step >= stepItem.id 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-slate-700 text-slate-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm sm:text-xl">{stepItem.icon}</span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-6 sm:w-12 h-1 rounded-full transition-all duration-300 ${
                    step > stepItem.id ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="backdrop-blur-xl bg-white/10 rounded-2xl sm:rounded-3xl border border-white/20 p-4 sm:p-6 md:p-8 shadow-2xl"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Select Cryptocurrency */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Select Cryptocurrency</h2>
                
                {/* Error Display */}
                <AnimatePresence>
                  {formError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="error text-yellow-400 text-sm flex items-center gap-2"
                    >
                      <i className="bx bxs-error bx-tada"></i>
                      {formError}
                      <i className="bx bxs-error bx-tada"></i>
                    </motion.p>
                  )}
                </AnimatePresence>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {cryptos.map((cryptoOption) => (
                    <motion.button
                      key={cryptoOption.symbol}
                      onClick={() => {
                        setCrypto(cryptoOption.symbol);
                        handleCryptoChange(cryptoOption.symbol);
                      }}
                      className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                        crypto === cryptoOption.symbol
                          ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r ${cryptoOption.color} flex items-center justify-center text-white text-lg sm:text-xl font-bold`}>
                          {cryptoOption.icon}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-white text-sm sm:text-base">{cryptoOption.symbol}</p>
                          <p className="text-xs sm:text-sm text-slate-300">{cryptoOption.name}</p>
                        </div>
                      </div>
                      
                      {crypto === cryptoOption.symbol && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white text-sm">✓</span>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={() => setStep(2)}
                  disabled={!crypto}
                  className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  whileHover={crypto ? { scale: 1.02 } : {}}
                  whileTap={crypto ? { scale: 0.98 } : {}}
                >
                  Continue
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Enter Details */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Enter Payment Details</h2>
                
                <div className="space-y-4">
                  {/* Amount Input with Currency Selection */}
                  <div className="space-y-2">
                    <div className='flex justify-between items-center'>
                      <label className="text-sm font-medium text-slate-300">Enter Amount</label>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-300">Cedi Rate: {cediRate}</div>
                        {minimumUSDAmount > 0 && (
                          <div className="text-xs text-yellow-400">Min: ${minimumUSDAmount}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Currency Type Selector */}
                    <div className="flex rounded-lg sm:rounded-xl bg-slate-800/50 p-1 mb-3">
                      {[
                        { type: 'USD', symbol: '$', label: 'USD' },
                        { type: 'GHS', symbol: '₵', label: 'Cedis' },
                        { type: 'CRYPTO', symbol: cryptos.find(c => c.symbol === crypto)?.icon || '₿', label: crypto }
                      ].map((currency) => (
                        <button
                          key={currency.type}
                          onClick={() => setAmountType(currency.type)}
                          className={`flex-1 py-2 px-2 sm:px-3 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                            amountType === currency.type
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="hidden sm:inline">{currency.symbol} </span>{currency.label}
                        </button>
                      ))}
                    </div>
                    
                  {/* Amount Error - toast only, no inline */}
                    
                    {/* Amount Input */}
                    <div className="relative">
                      <input
                        type="number"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full p-3 sm:p-4 bg-slate-800/50 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                        placeholder={`Enter amount in ${amountType === 'CRYPTO' ? crypto : amountType}`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center">
                        <span className="text-slate-400 text-sm sm:text-base">
                          {amountType === 'USD' ? '$' : amountType === 'GHS' ? '₵' : cryptos.find(c => c.symbol === crypto)?.icon}
                        </span>
                      </div>
                    </div>
                    
                    {/* Live Conversion Display */}
                    {amountInput && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-slate-800/30 rounded-lg p-3 space-y-1"
                      >
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-slate-400">USD:</span>
                          <span className="text-white">${USDAmount}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-slate-400">GHS:</span>
                          <span className="text-white">₵{GHSAmount}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-slate-400">{crypto}:</span>
                          <span className="text-white">{cryptoAmount}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">{crypto} Wallet Address</label>
                    
                    {/* Wallet Error - toast only, no inline */}
                    
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full p-3 sm:p-4 bg-slate-800/50 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                      placeholder={`Enter your ${crypto} wallet address`}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Phone Number (For Notifications)</label>
                    
                    {/* Phone Error - toast only, no inline */}
                    
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-3 sm:p-4 bg-slate-800/50 border border-slate-600 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 focus:outline-none transition-all duration-300 text-sm sm:text-base"
                      placeholder="e.g. 0244123456"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    onClick={() => setStep(1)}
                    className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-slate-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      setFormError('');
                      const currentUSDAmount = parseFloat(USDAmount);
                      if (!amountInput || isNaN(currentUSDAmount) || currentUSDAmount <= 0) {
                        toast.error('Please enter a valid amount.');
                        return;
                      }
                      if (currentUSDAmount < minimumUSDAmount) {
                        toast.error(`Minimum USD amount to buy is ${minimumUSDAmount}`);
                        return;
                      }
                      if (!walletAddress || walletAddress.length === 0) {
                        toast.error('Please enter a valid wallet address.');
                        return;
                      }
                      // Wallet validation before phone validation
                      const isValidWallet = await validateCryptoWallet(crypto, walletAddress);
                      if (!isValidWallet) {
                        toast.error(`Invalid ${crypto} wallet address`);
                        return;
                      }
                      if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
                        toast.error('Phone number must be 10 digits long.');
                        return;
                      }
                      if (!/^0[25]/.test(phoneNumber)) {
                        toast.error('Phone number must begin with 0 and be followed by 5 or 2.');
                        return;
                      }
                      setStep(3);
                    }}
                    className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Choose Payment Method */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Choose Payment Method</h2>
                
                <div className="block w-full text-center text-slate-300 mb-4">
                  <span>Pay with</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  {paymentProviders.map((provider) => (
                    <motion.button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                        selectedProvider === provider.id
                          ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-32 h-16 sm:w-40 sm:h-20 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center">
                          <img src={provider.logo} alt={`${provider.name} Logo`} className="h-8 sm:h-10 w-auto" />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-white text-base sm:text-lg">{provider.name}</h3>
                          <p className="text-slate-300 text-xs sm:text-sm">{provider.description}</p>
                        </div>
                        {selectedProvider === provider.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <span className="text-white text-xs sm:text-sm">✓</span>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    onClick={() => setStep(2)}
                    className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-slate-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    onClick={() => setStep(4)}
                    disabled={!selectedProvider}
                    className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
                    whileHover={selectedProvider ? { scale: 1.02 } : {}}
                    whileTap={selectedProvider ? { scale: 0.98 } : {}}
                  >
                    Continue
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirm Payment */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6">Confirm Payment</h2>
                
                <div className="space-y-3 sm:space-y-4 bg-slate-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">Cryptocurrency:</span>
                    <span className="text-white font-semibold">{crypto}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">{crypto} Price:</span>
                    <span className="text-white font-semibold">${exchangeRate}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">Amount ({crypto}):</span>
                    <span className="text-white font-semibold">{cryptoAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">USD Value:</span>
                    <span className="text-white font-semibold">${USDAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">Rate:</span>
                    <span className="text-green-400 font-semibold">{cediRate}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">Service Fee:</span>
                    <span className="text-white font-semibold">${fee}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-slate-300">Payment Method:</span>
                    <span className="text-white font-semibold">
                      {paymentProviders.find(p => p.id === selectedProvider)?.name}
                    </span>
                  </div>
                  <div className="border-t border-slate-600 pt-3 sm:pt-4">
                    <div className="flex justify-between text-base sm:text-lg">
                      <span className="text-white font-semibold">Amount To Pay:</span>
                      <span className="text-white font-bold">GH₵{amountToPay}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    onClick={() => setStep(3)}
                    className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-slate-700 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>

                  {/* Payment Provider Buttons */}
                  {selectedProvider === 'hubtel' && (
                    <motion.button
                      onClick={() => handleSubmit('hubtel')}
                      disabled={hubtelLoading}
                      className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base disabled:opacity-50"
                      whileHover={!hubtelLoading ? { scale: 1.02 } : {}}
                      whileTap={!hubtelLoading ? { scale: 0.98 } : {}}
                    >
                      {hubtelLoading ? (
                        <span className="flex items-center justify-center">
                          <i className="bx bx-loader bx-spin mr-2"></i> Processing...
                        </span>
                      ) : (
                        `Pay with Hubtel`
                      )}
                    </motion.button>
                  )}

                  {selectedProvider === 'redde' && (
                    <motion.button
                      onClick={() => handleSubmit('redde')}
                      disabled={reddeLoading}
                      className="w-full sm:flex-1 py-3 sm:py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base disabled:opacity-50"
                      whileHover={!reddeLoading ? { scale: 1.02 } : {}}
                      whileTap={!reddeLoading ? { scale: 0.98 } : {}}
                    >
                      {reddeLoading ? (
                        <span className="flex items-center justify-center">
                          <i className="bx bx-loader bx-spin mr-2"></i> Processing...
                        </span>
                      ) : (
                        `Pay with Redde Online`
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
    </div>
  );
};

export default Form;