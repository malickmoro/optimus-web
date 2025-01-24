import axios from "axios";

export const fixedHeight = (height) => {
    return (height / 100) * window.innerHeight;
};
export const fixedWidth = (width) => {
    return (width / 100) * window.innerWidth;
};

export const inMobileView = () => {
    return window.innerWidth < 768;
};

export const generate_payment_link_hubtel = (domain, apiKey, formError, token, paymentData, orderData, onSuccess) => {

    const url = domain + "/optimus/v1/api/payment/generate";
    const adjustedAmountGHS = parseFloat(paymentData.amountGHS) + (parseFloat(paymentData.amountGHS) * 0.02);
    const headers = {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
    };

    const data = {
        "clientReference": paymentData.clientReference,
        "currency": "GHS",
        "amountGHS": adjustedAmountGHS,
        "cryptoAmount": parseFloat(orderData.cryptoAmount),
        "fee": orderData.fee,
        "email": "test@theplutushome.com",
        "crypto": orderData.crypto,
        "phone": orderData.phoneNumber,
        "rate": orderData.rate,
        "address": orderData.address,
        "transactionId": orderData.transactionId
    };

    console.log(JSON.stringify(data, null, 2));

    axios
        .post(url, data, { headers })
        .then((response) => {
            const result = response.data;
            if (result.status && result.data && result.data.checkoutUrl) {
                let paymentUrl = result.data.checkoutUrl;
                onSuccess();
                window.location.href = paymentUrl;
            } else {
                formError("Error generating payment link");
                onSuccess();
            }
        })
        .catch((error) => {
            if (error.status === 400) {
                formError("Amount not feasible, please reduce or contact admin!");
                setTimeout(() => { formError("") }, 2000);
                onSuccess();
            } else {
                formError("Unexpected Error");
                setTimeout(() => { formError("") }, 2000);
                onSuccess();
            }
        });
}

export const generate_payment_link_redde = (domain, apiKey, formError, token, paymentData, orderData, onSuccess) => {
    const url = domain + "/optimus/v1/api/payment/redde/checkout";
    const adjustedAmountGHS = parseFloat(paymentData.amountGHS) + (parseFloat(paymentData.amountGHS) * 0.02);
    const headers = {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
    };

    const data = {
        "clientReference": paymentData.clientReference,
        "currency": "GHS",
        "amountGHS": adjustedAmountGHS,
        "cryptoAmount": parseFloat(orderData.cryptoAmount),
        "fee": orderData.fee,
        "email": "test@theplutushome.com",
        "crypto": orderData.crypto,
        "phone": orderData.phoneNumber,
        "rate": orderData.rate,
        "address": orderData.address,
        "transactionId": orderData.transactionId
    };

    console.log(JSON.stringify(data, null, 2));

    axios
        .post(url, data, { headers })
        .then((response) => {
            const result = response.data;
            if (result.status && result.data && result.data.checkouturl) {
                let paymentUrl = result.data.checkouturl;
                onSuccess();
                window.location.href = paymentUrl;
            } else {
                formError("Error generating payment link");
                onSuccess();
            }
        })
        .catch((error) => {
            if (error.status === 400) {
                formError("Amount not feasible, please reduce or contact admin!");
                setTimeout(() => { formError("") }, 2000);
                onSuccess();
            } else {
                formError("Unexpected Error");
                setTimeout(() => { formError("") }, 2000);
                onSuccess();
            }
        });
    //TODO: Implement Redde Payment Link Generation
}

export const begin_payment = (domain, apiKey, formError, token, paymentData, orderData, onSuccess) => {

    const url = domain + "/optimus/v1/api/payment/initiate";
    const adjustedAmountGHS = (parseFloat(paymentData.amountGHS) + (parseFloat(paymentData.amountGHS) * 0.02)).toFixed(2);
    const headers = {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };

    const data = {
        "clientReference": paymentData.clientReference,
        "amountGHS": adjustedAmountGHS,
        "cryptoAmount": parseFloat(orderData.cryptoAmount),
        "fee": orderData.fee,
        "crypto": orderData.crypto,
        "email": orderData.email,
        "rate": orderData.rate,
        "address": orderData.address,
    };

    console.log(JSON.stringify(data, null, 2));

    axios
        .post(url, data, { headers })
        .then((response) => {
            updatePlutusAuth("clientReference", paymentData.clientReference);
            updatePlutusAuth("amount", adjustedAmountGHS);
            const result = response.data;
            console.log(result);
            onSuccess();
            window.location.href = "/payment";
        })
        .catch((error) => {
            if (error.status === 400) {
                formError("Amount not feasible, please reduce or contact admin!");
                onSuccess();
            } else {
                console.log(error);
                formError("Unexpected Error");
                onSuccess();
            }
        });
}

// Function to fetch a particular string from plutusAuth
export const fetchPlutusAuthKey = (key) => {
    const storedData = localStorage.getItem("auth");
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData[key] || null; // Return the value or null if the key doesn't exist
    }
    return null; // Return null if plutusAuth doesn't exist
}

// Function to remove a particular string (key-value pair) from plutusAuth
export const removePlutusAuthKey = (key) => {
    const storedData = localStorage.getItem("auth");
    if (storedData) {
        const parsedData = JSON.parse(storedData);

        if (key in parsedData) {
            delete parsedData[key]; // Remove the key-value pair
            localStorage.setItem("auth", JSON.stringify(parsedData)); // Save updated data
        }
    }
}

export const updatePlutusAuth = (key, value) => {
    // Retrieve the existing object from localStorage
    const storedData = localStorage.getItem("auth");

    // If the auth object doesn't exist, create it
    if (!storedData) {
        const newAuth = {};
        newAuth[key] = value;
        localStorage.setItem("auth", JSON.stringify(newAuth));
    } else {
        // If it exists, update the key-value pair
        const plutusAuth = JSON.parse(storedData);
        plutusAuth[key] = value;
        localStorage.setItem("auth", JSON.stringify(plutusAuth));
    }
};

export const validateMoneroAddress = async (address) => {
    if (
        (address.length === 95 &&
            (address.startsWith("4") || address.startsWith("8"))) ||
        (address.length === 106 && address.startsWith("4"))
    ) {
        return true; // Valid address
    } else {
        return false; // Invalid address
    }
};

export const validateLitecoinAddress = async (address) => {
    // Validate legacy and SegWit addresses
    if (
        (address.length === 34 &&
            (address.startsWith("M") || address.startsWith("L") || address.startsWith("3"))) ||
        (address.length >= 42 && address.length <= 90 && address.startsWith("ltc1"))
    ) {
        return true; // Valid address
    } else {
        return false; // Invalid address
    }
};


export const validateUsdtTrc20Address = async (address) => {
    if (address.startsWith("T") && address.length === 34) {
        return true; // Valid address
    } else {
        return false; // Invalid address
    }
};

export const validateBitcoinAddress = (address) => {
    // Legacy addresses (P2PKH) start with 1
    const legacyRegex = /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/;

    // P2SH addresses start with 3
    const p2shRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;

    // Bech32 addresses (Native SegWit) start with bc1
    const bech32Regex = /^bc1[a-z0-9]{39,59}$/;

    // Test all formats
    return legacyRegex.test(address) ||
        p2shRegex.test(address) ||
        bech32Regex.test(address);
};

export const validateCryptoWallet = async (cryptoType, walletAddress) => {
    switch (cryptoType) {
        case "BTC":
            return validateBitcoinAddress(walletAddress);
        case "LTC":
            return await validateLitecoinAddress(walletAddress);
        case "USDT":
            return await validateUsdtTrc20Address(walletAddress);
        case "XMR":
            return await validateMoneroAddress(walletAddress);
        default:
            return false;
    }
};