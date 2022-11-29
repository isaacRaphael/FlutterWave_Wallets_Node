require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const path = require('path');
const fs = require('fs');

//Models
const User = require("./model/user");
const Wallet = require("./model/wallet");

//Helpers
const { validateUserWallet, createWalletTransaction, createTransaction, updateWallet, PayString } = require('./Helpers/Helpers');

const app = express();

app.use(express.json());


app.post("/api/register", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), 
      password: encryptedPassword,
    });

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    // return new user
    res.status(201).json({success : true, message : "Registration Successful", user, token});
  } catch (err) {
    console.log(err);
  }
});
    
// Login
app.post("/api/login", async (req, res) => {
try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).json({success : false, message :"All input is required"});
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // user
      res.status(200).json({success : true, message : "Login Successful", user,  token});
    } else {
        res.status(400).json({ success : false, message :"Invalid Credentials"});
    }
  } catch (err) {
    console.log(err);
  }
});


app.get("/pay", async (req, res) => {
    const { email, amount} = req.body;
    if(!email || !amount){
        res.sendStatus(400);
    }else{
        try{
            const target_path = path.join(__dirname + "/index.html");
            if(fs.existsSync(target_path)){
                fs.unlinkSync(target_path);
            }
            const user = await User.findOne({email});
            if(!user){
                res.sendStatus(404);
            }
            fs.writeFileSync(target_path, PayString(email, `${user.first_name} ${user.last_name}`, amount));
            res.sendFile(target_path);
        }catch(err){
            console.log(err);
            res.sendStatus(500);
        }
    }
});

app.get("/response", async (req, res) => {
    const { transaction_id } = req.query;
  
    const url = `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`;

    const response = await axios({
      url,
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
      },
    });
  
    console.log(response.data.data)

    const { status, currency, id, amount, customer } = response.data.data;

    // check if customer exist in our database
    const user = await User.findOne({ email: customer.email });
  
    // check if user have a wallet, else create wallet
    const wallet = await validateUserWallet(user._id);
  
    // create wallet transaction
    await createWalletTransaction(user._id, status, currency, amount);
  
    // create transaction
    await createTransaction(user._id, id, status, currency, amount, customer);
  
    await updateWallet(user._id, amount);
  
    return res.status(200).json({
      response: "wallet funded successfully",
      data: wallet,
    });
    
  });

  app.get("/wallet/:userId/balance", async (req, res) => {
    try {
      const { userId } = req.params;
  
      const wallet = await Wallet.findOne({ userId });
      // user
      res.status(200).json(wallet.balance);
    } catch (err) {
      console.log(err);
    }
  });



module.exports = app;