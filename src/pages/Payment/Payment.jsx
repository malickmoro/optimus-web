import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import ContextVariables from "../../context/ContextVariables";
// import AuthContext from "../../context/AuthContext";
import styled from "styled-components";
import { fetchPlutusAuthKey, fixedHeight, fixedWidth, removePlutusAuthKey, updatePlutusAuth } from "../../Functions";
import { Route, Routes, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import PropTypes from 'prop-types';


export const StyledPay = styled(motion.section)`
  width: 100%;
  height: ${fixedHeight(100)}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: black;
  > .left {
    width: 60%;
    height: 100%;
    overflow: hidden;
    border-radius: 0 25px 25px 0;
    > img {
      position: absolute;
      z-index: 1;
    }

    > h1 {
      color: white;
      font-size: ${fixedHeight(5)}px;
      z-index: 2;
    }
  }
  > .right {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    > .payDone {
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
      width: 100%;
      min-height: ${fixedHeight(40)}px;
      height: auto;
      flex-direction: column;
      row-gap: ${fixedHeight(2)}px;
      > h3 {

        width: auto;
        height: auto;
        font-size: ${fixedHeight(4)}px;
        > svg {
          width: ${fixedWidth(10)}px;
          height: ${fixedWidth(10)}px;
        }
        > svg.failed {
          fill: red;
        }
        > svg.success {
          fill: green;
        }
      }
      > h1 {
        font-size: ${fixedHeight(4)}px;
      }
      > p {
        font-size: ${fixedHeight(2.25)}px;
      }

      @media only screen and (max-width: 768px) {
        & {
          width: 100%;
          > h3 {
            text-align: center;
          }
        }
      }
    }

    > .paymentProcess {
      background-color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 50%;
      border: 1px solid white;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      padding: ${fixedHeight(5)}px;
      
      > .progress-bar {
        width: 90%;
        background-color: #ddd;
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 20px;

        > .progress {
          height: 100%;
          background-color: hsl(288.75, 40%, 30%);
          width: 0%; 
          transition: width 0.4s ease-in-out;
        }
      }
      > .step1, .step2, .step3 {
          width: ${fixedWidth(27.5)}px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: ${fixedHeight(5)}px;
          background: transparent;
          row-gap: ${fixedHeight(1.5)}px;

        > h3 {
          font-size: ${fixedHeight(3)}px;
          color: hsl(288.75, 40%, 30%);
          align-self: center;
        }

        > p {
          font-size: ${fixedHeight(1.75)}px;

          > span {
            font-size: ${fixedHeight(2)}px;
            font-weight: 600;
          }
        }
          
        > .error {
          font-size: ${fixedHeight(1.7)}px;
          align-self: center;
          color: yellow;
        }
      
        > input,
        select {
          border: 1px solid silver;
          border-radius: 7.5px;
          height: ${fixedHeight(6)}px;
          padding: 0 5%;
          margin: 2% 0;
          font-size: ${fixedHeight(2)}px;
          margin-bottom: ${fixedHeight(2.5)}px;
          &:focus {
            border-color: hsl(288.75, 40%, 30%);
          }
        }
        > button {
          border-radius: 7.5px;
          height: ${fixedHeight(6)}px;
          background: linear-gradient(
            135deg,
            hsl(288.75, 40%, 30%),
            hsl(289.09, 55%, 45%)
          );
          color: white;
          font-size: ${fixedHeight(2.1)}px;
        }

        > .cancel {
          border-radius: 7.5px;
          height: ${fixedHeight(6)}px;
          background: transparent;
          color: hsl(288.75, 40%, 30%);
          border: 2px solid hsl(288.75, 40%, 30%);
          font-size: ${fixedHeight(2.1)}px;
          font-weight: 700;
        }

        > .codeArea {
          margin: 2% 0;
          margin-bottom: ${fixedHeight(2.5)}px;
          >  h1 {
            font-size: ${fixedHeight(2.5)}px;
            color: black;
            align-self: center;
          }

          > input {
            font-size: ${fixedHeight(2.5)}px;
            &:focus {
            border-color: hsl(288.75, 40%, 30%);
            }
          }
          
        }
      }

      > .step2 {
        padding-bottom: ${fixedHeight(2)}px;
      }

      > .step3 {
        row-gap: ${fixedHeight(1.5)}px;
        padding-bottom: ${fixedHeight(2)}px;
        > h3 {
          font-size: ${fixedHeight(3)}px;

        }
      } 

      @media only screen and (max-width: 768px) {
        & {
          width: 100%;
          > h3 {
            text-align: center;
          }
        }
        height: 40%;
        width: 90%;
        padding: ${fixedHeight(3)}px;
        > .step1, .step2, .step3 {
          width: 100%;
          padding: ${fixedHeight(3)}px;
          > h3 {
            font-size: ${fixedHeight(2.5)}px;
          }
          > p {
            font-size: ${fixedHeight(1.5)}px;
            > span {
              font-size: ${fixedHeight(1.75)}px;
            }
          }
          > .error {
            font-size: ${fixedHeight(1.5)}px;
          }
          > input,
          select {
            height: ${fixedHeight(5)}px;
            font-size: ${fixedHeight(1.75)}px;
          }
          > button, > .cancel {
            height: ${fixedHeight(5)}px;
            font-size: ${fixedHeight(1.75)}px;
          }
          > .codeArea {
            margin-bottom: ${fixedHeight(2)}px;
            > h1 {
              font-size: ${fixedHeight(2)}px;
            }
            > input {
              font-size: ${fixedHeight(2)}px;
            }
          }
        }
        > .step3 {
          > h3 {
            font-size: ${fixedHeight(2.4)}px;
          }
        }
      }
    }
  }
`;

const Payment = () => {
  return (
    <StyledPay>
      <div className="right">
        <Routes>
          <Route
            path="/"
            element={
              <AnimatePresence>
                <PaymentProcess />
              </AnimatePresence>
            }
          />
          <Route
            path="/success/*"
            element={
              <AnimatePresence>
                <PayDone type={"success"} />
              </AnimatePresence>
            }
          />
          <Route
            path="/failed/*"
            element={
              <AnimatePresence>
                <PayDone type={"failed"} />
              </AnimatePresence>
            }
          />
        </Routes>
      </div>
    </StyledPay>
  );
};

export default Payment;



const PayDone = ({ type }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setTimeout(() => {
      navigate("/", { state: { reload: true } });
    }, 2000);
  }, [navigate]);

  return (
    <div className="payDone center">
      {type.toLowerCase() === "success" ? (
        <>
          <h3>
            <svg
              className="success"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.999 14.413-3.713-3.705L7.7 11.292l2.299 2.295 5.294-5.294 1.414 1.414-6.706 6.706z"></path>
            </svg>
          </h3>
          <h1>Payment Successful</h1>
          <p><i className="bx bx-loader bx-spin"></i>Returning to user profile...</p>
        </>
      ) : type.toLowerCase() === "failed" ? (
        <>
          <h3>
            <svg
              className="failed"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M12.884 2.532c-.346-.654-1.422-.654-1.768 0l-9 17A.999.999 0 0 0 3 21h18a.998.998 0 0 0 .883-1.467L12.884 2.532zM13 18h-2v-2h2v2zm-2-4V9h2l.001 5H11z"></path>
            </svg>
          </h3>
          <h1>Payment Unsuccessful</h1>
          <p><i className="bx bx-loader bx-spin"></i>Returning to user profile...</p>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

PayDone.propTypes = {
  type: PropTypes.oneOf(['success', 'failed']).isRequired
};

function PaymentProcess() {
  const clientReference = fetchPlutusAuthKey("clientReference");
  const token = fetchPlutusAuthKey("token");
  const amount = fetchPlutusAuthKey("amount");
  // const step = fetchPlutusAuthKey("step");
  const prefix = fetchPlutusAuthKey("prefix");
  const { domain, apiKey } = useContext(ContextVariables);
  // const { authInfo } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initial, setInitial] = useState("XXXX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amountRemaining, setAmountRemaining] = useState(amount);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
  const [input4, setInput4] = useState('');
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!authInfo?.token) {
  //     navigate("/auth/login");
  //   } else {
  //     if (step) {
  //       setCurrentStep(step);
  //     }
  //     if (prefix) {
  //       setInitial(prefix);
  //     }
  //   }
  // }, []);


  const handlePhoneNumberSubmit = () => {
    console.log('Phone number submitted:', phoneNumber);
    if (!/^\d{12}$/.test(phoneNumber)) {
      setError("Phone number must be 12 digits long.");
      setTimeout(() => { setError(""); }, 3000);
      return;
    }
    if (!/^233[25]/.test(phoneNumber)) {
      setError("Phone number must begin with 233 and be followed by 5 or 2.");
      setTimeout(() => { setError(""); }, 3000);
      return;
    }
    if (!/^\d+$/.test(phoneNumber)) {
      setError("Phone number must contain only numbers.");
      setTimeout(() => { setError(""); }, 3000);
      return;
    }
    setLoading(true);

    const url = domain + "/optimus/v1/api/payment/sendCode";
    const headers = {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    };

    const data = {
      "phoneNumber": phoneNumber,
      "clientReference": clientReference
    };

    console.log(JSON.stringify(data, null, 2));

    axios
      .post(url, data, { headers })
      .then((response) => {
        const result = response.data;
        setInitial(prefix || result);
        updatePlutusAuth("prefix", result);
        setLoading(false);
        setCurrentStep(2); // Move to next step only on success
        updatePlutusAuth("step", 2);
      })
      .catch((error) => {
        console.log(` The client refernce is ${clientReference} and the token is ${token}`);
        console.log(error);
        if (error.status === 400) {
          setError("Error sending code");
          setLoading(false);
        } else {
          setError("Unexpected Error");
          setLoading(false);
        }
      });
  };

  const handleVerificationSubmit = () => {
    if (input1 === '' || input2 === '' || input3 === '' || input4 === '') {
      setError("Code must be four digits");
      setTimeout(() => { setError(""); }, 2000);
      return;
    }

    const otpCode = input1 + input2 + input3 + input4;
    setLoading(true);
    const url = domain + "/optimus/v1/api/payment/verifyCode";
    const headers = {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    };

    const data = {
      "otpCode": otpCode,
      "clientReference": clientReference
    };

    console.log(JSON.stringify(data, null, 2));

    axios
      .post(url, data, { headers })
      .then(() => {
        setLoading(false);
        setCurrentStep(3); // Move to next step only on success
        updatePlutusAuth("step", 3);
      })
      .catch((error) => {
        if (error.status === 400) {
          setError("Invalid Otp Code");
          setTimeout(() => { setError("") }, 1000);
          setLoading(false);
        } else {
          setError("Unexpected Error");
          setLoading(false);
        }
      });
  };

  const handlePayment = () => {
    setLoading(true);
    const url = domain + `/optimus/v1/api/payment/checkPayment/${clientReference}`;
    const headers = {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    };

    axios
      .post(url, null, { headers })
      .then((response) => {
        if (response.data.amountRemaining === 0) {
          reset();
          navigate('/payment/success'); // Redirect on successful payment

        }

        if (response.data.amountRemaining > 0) {
          console.log(`The amount remaining ${response.data.amountRemaining}`)
          setError("Payment Incomplete");
          setTimeout(() => { setError("") }, 1000);
          setAmountRemaining(response.data.amountRemaining);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Error checking payment");
        setLoading(false);
      });
  };

  const handleCancel = () => {
    closePage();
  };

  const reset = () => {
    removePlutusAuthKey("prefix");
    updatePlutusAuth("step", 1);
    setError("");
    setInput1("");
    setInput2("");
    setInput3("");
    setInput4("");
    removePlutusAuthKey("clientReference");
    removePlutusAuthKey("step");
    removePlutusAuthKey("amount");
  }

  const handleChangeNumber = () => {
    setCurrentStep(1);
    reset();
  }

  const closePage = () => {
    const url = domain + `/optimus/v1/api/payment/cancel/${clientReference}`;
    const headers = {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    };

    axios
      .post(url, null, { headers })
      .then(() => {
        reset();
        navigate('/payment/failed');
      })
      .catch((error) => {
        if (error.status === 401) {
          navigate("/auth/login")
          localStorage.clear();
        }
        setError("Order Not Found")
      });

  }

  const handleCodeInput = (value, setter, nextInputRef) => {
    setError("");
    if (value === '' || (value.match(/[0-9]/) && value.length === 1)) {
      setter(value);
      if (nextInputRef && value !== '') {
        nextInputRef.current.focus();
      }
    }
  };

  // Refs to access input fields
  const inputRef2 = React.createRef();
  const inputRef3 = React.createRef();
  const inputRef4 = React.createRef();

  return (
    <div className="paymentProcess">
      <button onClick={closePage} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'red' }}>
        <ion-icon name="close" size="large"></ion-icon>
      </button>
      <div className="progress-bar">
        <div style={{ width: `${(currentStep / 3) * 100}%`, height: '10px', backgroundColor: 'hsl(288.75, 40%, 30%);' }} className="progress"></div>
      </div>
      {
        currentStep === 1 && (
          <div className="step1">
            <h3>Enter your payment number</h3>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="error"
                >
                  <i className="bx bxs-error bx-tada"></i>
                  {error}
                  <i className="bx bxs-error bx-tada"></i>
                </motion.p>
              )}
            </AnimatePresence>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => { setPhoneNumber(e.target.value); setError("") }}
              placeholder="233XXXXXXXXX"
            />
            {loading ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={loading}
              >
                <span>
                  <i className="bx bx-loader bx-spin"></i> Sending Code...
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePhoneNumberSubmit}
              >
                <span>
                  Send Code <ion-icon name="arrow-forward"></ion-icon>
                </span>
              </motion.button>
            )}
          </div>
        )
      }
      {
        currentStep === 2 && (
          <div className="step2">
            <h3>Enter Verification Code</h3>

            <div className="codeArea" style={{ display: 'flex', justifyContent: 'center', gap: '10px', height: fixedHeight(5) }}>
              <h1 style={{ alignSelf: 'center' }}>{initial} - </h1>
              <input
                type="text"
                value={input1}
                onChange={(e) => handleCodeInput(e.target.value, setInput1, inputRef2)}
                maxLength="1"
                style={{ width: '50px', textAlign: 'center' }}
                inputMode="decimal"
              />
              <input
                ref={inputRef2}
                type="text"
                value={input2}
                onChange={(e) => handleCodeInput(e.target.value, setInput2, inputRef3)}
                maxLength="1"
                style={{ width: '50px', textAlign: 'center' }}
                inputMode="decimal"
              />
              <input
                ref={inputRef3}
                type="text"
                value={input3}
                onChange={(e) => handleCodeInput(e.target.value, setInput3, inputRef4)}
                maxLength="1"
                style={{ width: '50px', textAlign: 'center' }}
                inputMode="decimal"
              />
              <input
                ref={inputRef4}
                type="text"
                value={input4}
                onChange={(e) => handleCodeInput(e.target.value, setInput4, null)}
                maxLength="1"
                style={{ width: '50px', textAlign: 'center' }}
                inputMode="decimal"
              />
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="error"
                >
                  <i className="bx bxs-error bx-tada"></i>
                  {error}
                  <i className="bx bxs-error bx-tada"></i>
                </motion.p>
              )}
            </AnimatePresence>
            {loading ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={loading}
              >
                <span>
                  <i className="bx bx-loader bx-spin"></i> Verifying...
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleVerificationSubmit}
              >
                <span>
                  Verify <ion-icon name="arrow-forward"></ion-icon>
                </span>
              </motion.button>

            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="cancel"
              onClick={handleChangeNumber}
            >
              <span>
                Change Number <ion-icon name="arrow-back"></ion-icon>
              </span>
            </motion.button>
          </div>
        )
      }
      {
        currentStep === 3 && (
          <div className="step3">
            <h3>Make Payment on <span style={{ color: 'green' }}>*713*5713#</span></h3>
            <h3>Name - <span style={{ color: 'green' }}>The Plutus Home</span></h3>
            <h3>Amount Remaining - <span style={{ color: 'green' }}>GH₵ {amountRemaining}</span></h3>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="error"
                >
                  <i className="bx bxs-error bx-tada"></i>
                  {error}
                  <i className="bx bxs-error bx-tada"></i>
                </motion.p>
              )}
            </AnimatePresence>

            {loading ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={loading}
              >
                <span>
                  <i className="bx bx-loader bx-spin"></i> Checking Payment...
                </span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePayment}
              >
                <span>
                  Payment Made <ion-icon name="arrow-forward"></ion-icon>
                </span>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="cancel"
              onClick={handleCancel}
            >
              <span>
                Cancel <ion-icon name="close"></ion-icon>
              </span>
            </motion.button>
          </div>
        )
      }
    </div>
  );
}
