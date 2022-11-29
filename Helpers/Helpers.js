const Wallet = require("../model/wallet");
const WalletTransaction = require("../model/wallet_transaction");
const Transaction = require("../model/transaction");




// Validating User wallet
const validateUserWallet = async (userId) => {
    try {
      // check if user have a wallet, else create wallet
      const userWallet = await Wallet.findOne({ userId });
  
      // If user wallet doesn't exist, create a new one
      if (!userWallet) {
        // create wallet
        const wallet = await Wallet.create({
          userId,
        });
        return wallet;
      }
      return userWallet;
    } catch (error) {
      console.log(error);
    }
  };
  
  // Create Wallet Transaction
  const createWalletTransaction = async (userId, status, currency, amount) => {
    try {
      // create wallet transaction
      const walletTransaction = await WalletTransaction.create({
        amount,
        userId,
        isInflow: true,
        currency,
        status,
      });
      return walletTransaction;
    } catch (error) {
      console.log(error);
    }
  };
  
  // Create Transaction
  const createTransaction = async (
    userId,
    id,
    status,
    currency,
    amount,
    customer
  ) => {
    try {
      // create transaction
      const transaction = await Transaction.create({
        userId,
        transactionId: id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone_number,
        amount,
        currency,
        paymentStatus: status,
        paymentGateway: "flutterwave",
      });
      return transaction;
    } catch (error) {
      console.log(error);
    }
  };
  
  // Update wallet 
  const updateWallet = async (userId, amount) => {
    try {
      // update wallet
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { $inc: { balance: amount } },
        { new: true }
      );
      return wallet;
    } catch (error) {
      console.log(error);
    }
  };



const  PayString = (email, fullname, amount) => {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receive Payment</title>
      </head>
      <body>
        <form>
          <script src="https://checkout.flutterwave.com/v3.js"></script>
          <button type="button" onClick="makePayment()">Pay With Flutterwave</button>
        </form>
    
        <script>
          function makePayment() {
            FlutterwaveCheckout({
              public_key: "FLWPUBK_TEST-7a704ca8c70172a160aa818c29d501eb-X",
              tx_ref: "hooli-tx-1920bbtyt",
              amount: ${amount},
              currency: "NGN",
              country: "NG",
              payment_options: "card",
    
              // specified redirect URL
              redirect_url: "http://localhost:4001/response",
    
              // use customer details if user is not logged in, else add user_id to the request
              customer: {
                email: "${email}",
                phone_number: "08088098622",
                name: "${fullname}",
              },
              callback: function (data) {
                console.log(data);
              },
              onclose: function () {
                // close modal
              },
              customizations: {
                title: "Flutterwave Demo",
                description: "Flutterwave Payment Demo",
                logo: "https://cdn.iconscout.com/icon/premium/png-256-thumb/payment-2193968-1855546.png",
              },
            });
          }
        </script>
      </body>
    </html>`
}






  module.exports =  {
    validateUserWallet,
    createWalletTransaction,
    createTransaction,
    updateWallet,
    PayString
  }