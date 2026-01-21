const nodemailer = require("nodemailer");
const { verifiedMails } = require("../Models/VerifiedMails");
const { OTP } = require("../Models/OTP");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const foundMail = await verifiedMails.findOne({ email });
    if (foundMail) {
      throw new Error("Email Already Verified.");
    }

    let otp = "";
    for (let i = 1; i <= 6; i++) {
      otp += Math.floor(Math.random() * 10);
    }
    //console.log(otp)

    await OTP.create({ email, otp });

const otpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Entangl | Verify Your Email</title>

<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f5f5f7;
    font-family: 'Arial', Helvetica, sans-serif;
  }

  .container {
    max-width: 600px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 12px 30px rgba(0,0,0,0.08);
  }

  .header {
    background: linear-gradient(135deg, #ec4899, #8b5cf6);
    padding: 30px;
    text-align: center;
    color: #ffffff;
  }

  .header h1 {
    margin: 0;
    font-size: 30px;
    letter-spacing: 1px;
  }

  .header p {
    margin-top: 8px;
    font-size: 15px;
    opacity: 0.95;
  }

  .content {
    padding: 35px 30px;
    color: #333333;
  }

  .content h2 {
    margin-top: 0;
    font-size: 22px;
    font-weight: 600;
  }

  .content p {
    font-size: 15px;
    line-height: 1.7;
    color: #555555;
  }

  .otp-box {
    margin: 35px auto;
    text-align: center;
  }

  .otp {
    display: inline-block;
    background: #fdf2f8;
    color: #831843;
    font-size: 34px;
    letter-spacing: 10px;
    padding: 16px 28px;
    border-radius: 12px;
    font-weight: bold;
    border: 1px dashed #f472b6;
  }

  .note {
    margin-top: 25px;
    font-size: 13px;
    color: #777777;
  }

  .footer {
    background: #fafafa;
    padding: 22px;
    text-align: center;
    font-size: 13px;
    color: #888888;
  }

  .footer span {
    color: #8b5cf6;
    font-weight: 600;
  }
</style>
</head>

<body>
  <div class="container">

    <div class="header">
      <h1>Entangl</h1>
      <p>Where connections begin 💞</p>
    </div>

    <div class="content">
      <h2>Hey there 👋</h2>

      <p>
        Welcome to <strong>Entangl</strong>!  
        You’re just one step away from discovering meaningful connections.
      </p>

      <p>
        Please enter the OTP below to verify your email address:
      </p>

      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>

      <p>
        This OTP is valid for the next <strong>2 minutes</strong>.  
        For your safety, please do not share this code with anyone.
      </p>

      <p class="note">
        If you didn’t request this verification, you can safely ignore this email.
      </p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} <span>Entangl</span> · All rights reserved<br/>
      Built with care for privacy & trust 💖
    </div>

  </div>
</body>
</html>
`;


    await transport.sendMail({
      from: '"Entangl" <satyamg567@gmail.com>',
      to: email,
      subject: "OTP for Account Registration",
      html : otpEmailTemplate(otp)
    });

    res.status(201).json({msg: 'OTP Successfully sent'})
  } catch (error) {
    res.status(400).json({error:error.message})
  }
}

const verifyOTP = async(req,res)=>{
    try {
        const { otp, email } = req.body

        const founData = await OTP.findOne({
            $and : [
                {otp} ,{email}
            ]
        })

        if(!founData){
            throw new Error('Invalid OTP')
        }

        await verifiedMails.create({email})
        res.status(200).json({msg:'Email Verified Scuccessfully!'})

    } catch (error) {
        res.status(400).json({error:error.message})
    }
}

module.exports = {
    sendOTP, verifyOTP
}