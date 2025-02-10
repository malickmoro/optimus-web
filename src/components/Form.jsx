// src/components/Form.jsx
import { useContext, useEffect, useState } from 'react';
import logo from '../assets/img/pee.jpg';
import Footer from './Footer';
import ContextVariables from '../context/ContextVariables';
import { generate_payment_link_hubtel, generate_payment_link_redde, validateCryptoWallet } from '../Functions';
import { AnimatePresence, motion } from 'framer-motion';
import axios from "axios";
import hubtelLogo from '../assets/img/hubtellogo.svg';
import reddeLogo from '../assets/img/reddes-logo.png';


const Form = () => {
  // State variables to hold form data
  const { domain, apiKey, cediRate } = useContext(ContextVariables);
  const [crypto, setCrypto] = useState('');
  const [USDAmount, setUSDAmount] = useState(0.0);
  const [cryptoAmount, setCryptoAmount] = useState(0.0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [fee, setFee] = useState(0.0);
  const [minimumUSDAmount, setMinimunUSDAmount] = useState(0.0);
  const [amountToPay, setAmountToPay] = useState(0.0);
  const [exchangeRate, setExchangeRate] = useState(0.0);
  const [formError, setFormError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [walletError, setWalletError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [hubtelLoading, setHubtelLoading] = useState(false);
  const [reddeLoading, setReddeLoading] = useState(false);

  const paymentData = {
    clientReference: `Payment_${Date.now()}`,
    amountGHS: amountToPay,
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

  const handleCryptoChange = async (event) => {
    if (!event) return;
    const selectedCrypto = event.target.value;
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

      // Determine fee based on the purchase amount
      let additionalFee = 0;

      if (USDAmount >= 0 && USDAmount <= 50) {
        additionalFee = 3;
      } else if (USDAmount >= 51 && USDAmount <= 100) {
        additionalFee = 4;
      } else if (USDAmount > 100) {
        additionalFee = 0.05 * USDAmount; // 5% of the purchase amount
      }

      const totalFeeUSD = withdrawalFee + additionalFee;
      const min = totalFeeUSD + 2;
      setMinimunUSDAmount(min);
      setFee(totalFeeUSD.toFixed(2));
      setExchangeRate(exchangeRate);

    } catch (error) {
      console.log(error.message);
      setFormError("Error fetching fee");
      setTimeout(() => { setFormError("") }, 1000);
    }
  };

  // Function to handle quantity change
  const handleUSDAmountChange = async () => {
    if (USDAmount < 1 || exchangeRate <= 0) {
      setAmountToPay(0);
      setCryptoAmount(0);
      return;
    }
    const totalUSDAmount = parseFloat(USDAmount) + parseFloat(fee);
    setCryptoAmount((USDAmount / exchangeRate).toFixed(8));
    setAmountToPay((totalUSDAmount * cediRate).toFixed(2));
  };



  const handleCryptoAmountChange = async () => {
    if (!(cryptoAmount > 0) || exchangeRate <= 0) {
      setAmountToPay(0);
      setUSDAmount(0);
      return;
    }
    const usdAmount = cryptoAmount * exchangeRate;
    const totalPay = usdAmount + fee;

    setAmountToPay(totalPay * cediRate);
    setUSDAmount(usdAmount.toFixed(2));
  };


  // Function to handle form submission
  const handleSubmit = async (type) => {
    if (type === 'hubtel') {
      setHubtelLoading(true);
    } else if (type === 'redde') {
      setReddeLoading(true);
    }

    if (!crypto) {
      setFormError("Please select a cryptocurrency to buy.");
      setTimeout(() => { setFormError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    } else if (USDAmount <= 0 || USDAmount < minimumUSDAmount) {
      setAmountError(`Minimum usd amount to buy is $5`);
      setTimeout(() => { setAmountError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    } else if (!cryptoAmount) {
      setAmountError("Crypto amount must be greater than 0.");
      setTimeout(() => { setAmountError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    } else if (walletAddress?.length === 0) {
      setWalletError("Please enter a valid wallet address.");
      setTimeout(() => { setWalletError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    } else if (!await validateCryptoWallet(crypto, walletAddress)) {
      setWalletError(`Invalid ${crypto} wallet`);
      setTimeout(() => { setWalletError(""); setHubtelLoading(false); setReddeLoading(false); }, 1000);
      return;
    } else if (cryptoAmount <= 0) {
      setAmountError("Please enter a valid cryptocurrency amount.");
      setTimeout(() => { setAmountError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError("Phone number must be 10 digits long.");
      setTimeout(() => { setPhoneError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    } else if (!/^0[25]/.test(phoneNumber)) {
      setPhoneError("Phone number must begin with 0 and be followed by 5 or 2.");
      setTimeout(() => { setPhoneError(""); setHubtelLoading(false); setReddeLoading(false); }, 2000);
      return;
    }

    if (phoneNumber.startsWith('0')) {
      setPhoneNumber('233' + phoneNumber.slice(1));
    }
    if (type === 'hubtel') {
      generate_payment_link_hubtel(domain, apiKey, setFormError, null, paymentData, orderData, () => setHubtelLoading(false));

    } else if (type === 'redde') {
      generate_payment_link_redde(domain, apiKey, setFormError, null, paymentData, orderData, () => setReddeLoading(false));
    }

    reset();
    setCrypto('');
  };

  const reset = () => {
    setUSDAmount(0.0);
    setCryptoAmount(0.0);
    setPhoneNumber('');
    setWalletAddress('');
    setMinimunUSDAmount(0.0);
    setFee(0.0);
    setExchangeRate(0.0);
    setAmountToPay(0.0);
    setHubtelLoading(false);
    setReddeLoading(false);
  }

  useEffect(() => {
    const updateValues = async () => {
      if (crypto) {  // Only run if crypto is selected
        try {
          const response = await axios.get(
            `${domain}/optimus/v1/api/cryptomus/exchange-rate/${crypto}?to=USD`,
            {
              headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey,
              },
            }
          );
          // Rest of your exchange rate logic here
          const exchangeRate = parseFloat(response?.data?.result[0]?.course).toFixed(2);
          const withdrawalFee = Math.ceil(parseFloat(response?.data?.result[0]?.withdrawalFee) * 100) / 100;

          let additionalFee = 0;
          if (USDAmount >= 0 && USDAmount <= 50) {
            additionalFee = 3;
          } else if (USDAmount >= 51 && USDAmount <= 100) {
            additionalFee = 4;
          } else if (USDAmount > 100) {
            additionalFee = 0.05 * USDAmount;
          }

          const totalFeeUSD = withdrawalFee + additionalFee;
          const min = totalFeeUSD + 2;
          setMinimunUSDAmount(min);
          setFee(totalFeeUSD.toFixed(2));
          setExchangeRate(exchangeRate);
        } catch (error) {
          console.log(error);
          setFormError("Error fetching fee");
          setTimeout(() => { setFormError("") }, 1000);
        }
      }
    };

    updateValues();
  }, [crypto, USDAmount, walletAddress, domain, apiKey]);


  return (
    <div className="md:w-[50%] w-full p-2 md:px-10">
      <div className="flex flex-col justify-center items-center py-5">
        <img alt="Plutus Logo" width="100" height="100" className="h-20 w-auto" style={{ color: 'transparent' }} src={logo} />
        <h2 className="text-[1.3rem] md:text-[1.3rem] text-center font-black text-transparent bg-gradient-to-r from-[#fafcff] to-[#ffdfdc] bg-clip-text drop-shadow-sm shadow-cyan-500 uppercase ">
          THE PLUTUS HOME
        </h2>
      </div>
      <div className="py-5">
        <h1 className="text-[1.3rem] md:text-[1.3rem] text-center font-black text-transparent bg-gradient-to-r from-[#fafcff] to-[#ffdfdc] bg-clip-text drop-shadow-sm shadow-cyan-500 ">
          LTC | XMR | USDT | BTC
        </h1>
      </div>
      <div className="p-5 bg-neutral-800 rounded-[6px] flex flex-col md:flex-row">
        <div className="flex flex-col flex-grow md:p-5 py-5">
          <AnimatePresence>
            {formError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="error"
                style={{ fontSize: "12px", color: "yellow", marginTop: "3px" }}
              >
                <i className="bx bxs-error bx-tada"></i>
                {formError}
                <i className="bx bxs-error bx-tada"></i>
              </motion.p>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="w-full mt-5 flex flex-col gap-5">
            <div className="space-y-2">
              <label className="font-medium text-md" htmlFor="voucher">
                Select Crypto
              </label>
              <select
                id="voucher"
                value={crypto}
                onChange={handleCryptoChange}
                className="h-10 w-full px-3 py-2 text-sm bg-neutral-700 border border-neutral-600 text-neutral-300 appearance-none pr-8"
                style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNNC4yOTMgNi4yOTNsNC4yOTMgNC4yOTMgNC4yMjctNC4yMjdhMSAxIDAgMCAxIDEuNDE0IDEuNDE0bC00LjI5MyA0LjI5M2ExIDEgMCAwIDEtMS40MTQgMGwtNC4yOTMtNC4yOTNhMSAxIDAgMCAxIDEuNDE0LTEuNDE0eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4K)', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
              >
                <option value="">Select Crypto</option>
                <option value="LTC">Litecoin (LTC)</option>
                <option value="XMR">Monero (XMR)</option>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>
            </div>

            <AnimatePresence>
              {amountError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="error"
                  style={{ fontSize: "12px", color: "yellow", marginTop: "3px" }}
                >
                  <i className="bx bxs-error bx-tada"></i>
                  {amountError}
                  <i className="bx bxs-error bx-tada"></i>
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <label className="font-medium text-md" htmlFor="amount_usd">
                Amount (USD) - Cedi Rate({cediRate})
              </label>
              <input
                type="number"
                id="amount_usd"
                value={USDAmount}
                inputMode='decimal'
                onChange={(e) => {
                  setUSDAmount(e.target.value);
                }}
                onKeyUp={() => {
                  handleUSDAmountChange();
                }}
                className="h-10 w-full px-3 py-2 bg-neutral-700 border border-neutral-600"
                placeholder="Amount in USD"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium text-md" htmlFor="amount_crypto">
                Amount ({crypto})
              </label>
              <input
                type="number"
                id="amount_crypto"
                inputMode='decimal'
                value={cryptoAmount}
                onChange={(e) => {
                  setCryptoAmount(e.target.value);
                }}
                onKeyUp={() => {
                  handleCryptoAmountChange();
                }}
                className="h-10 w-full px-3 py-2 bg-neutral-700 border border-neutral-600"
                placeholder={`Amount in ${crypto}`}
              />
            </div>


            <AnimatePresence>
              {walletError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="error"
                  style={{ fontSize: "12px", color: "yellow", marginTop: "3px" }}
                >
                  <i className="bx bxs-error bx-tada"></i>
                  {walletError}
                  <i className="bx bxs-error bx-tada"></i>
                </motion.p>
              )}
            </AnimatePresence>
            {/*Crypto Wallet Input */}
            <div className="space-y-2">
              <label className="font-medium text-md" htmlFor="wallet">
                Enter your {crypto} address
              </label>
              <input
                type="text"
                id="wallet"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="h-10 w-full px-3 py-2 bg-neutral-700 border border-neutral-600"
              />
            </div>

            <AnimatePresence>
              {phoneError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="error"
                  style={{ fontSize: "12px", color: "yellow", marginTop: "3px" }}
                >
                  <i className="bx bxs-error bx-tada"></i>
                  {phoneError}
                  <i className="bx bxs-error bx-tada"></i>
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <label className="font-medium text-md" htmlFor="phone">
                Phone Number (For Notifications)
              </label>
              <input
                type="tel"
                id="phone"
                inputMode='numeric'
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-10 w-full px-3 py-2 bg-neutral-700 border border-neutral-600"
                placeholder="e.g. 0244123456"
              />
            </div>

            <table className="w-full mt-5">
              <tbody>
                <tr>
                  <td className="font-bold text-md text-left">Exchange Rate</td>
                  <td className="font-medium text-md text-right">${exchangeRate}</td>
                </tr>
                <tr>
                  <td className="font-bold text-md text-left">Service Fee</td>
                  <td className="font-medium text-md text-right">${fee}</td>
                </tr>
                <tr>
                  <td className="font-bold text-md text-left">Amount To Pay</td>
                  <td className="font-medium text-md text-right">GH₵{amountToPay}</td>
                </tr>
              </tbody>
            </table>
            {/* Submit Button */}

            <div className="block w-full text-center">
              <span>Pay with</span>
            </div>

            <div className="flex flex-row gap-3">

              {hubtelLoading ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="h-30 px-4 py-2 w-full bg-gray-500 text-primary-foreground rounded-[4px] flex justify-center items-center"
                  disabled={hubtelLoading}
                >
                  <span>
                    <i className="bx bx-loader bx-spin"></i> Processing...
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="h-30 px-4 py-2 w-full bg-white text-black rounded-[4px] flex justify-center items-center"
                  type="button"
                  onClick={() => handleSubmit('hubtel')}
                >
                  <span>
                    <img src={hubtelLogo} alt="Hubtel Logo" className="h-10 w-auto" />
                  </span>
                </motion.button>
              )}

              {reddeLoading ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="h-30 px-4 py-2 w-full bg-gray-500 text-primary-foreground rounded-[4px] flex justify-center items-center"
                  disabled={reddeLoading}
                >
                  <span>
                    <i className="bx bx-loader bx-spin"></i> Processing...
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="h-30 px-4 py-2 w-full bg-white text-primary-foreground rounded-[4px] flex justify-center items-center"
                  type="button"
                  onClick={() => handleSubmit('redde')}
                >
                  <span>
                    <img src={reddeLogo} alt="Redde Logo" className="h-10 w-auto" />
                  </span>
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Form;
