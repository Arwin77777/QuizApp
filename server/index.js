const express = require('express');
const cors = require('cors');
const createUser = require('./models/user');
const Quiz = require('./models/quiz');
const { createServer } = require('dynamodb-admin');
const { client, docClient } = require('./db');


const app = express();
app.use(cors());
app.use(express.json());
const adminApp = createServer(client, docClient);
// let onetimepassword;
const host = 'localhost';
const port = 8002;
const server = adminApp.listen(port, host);

server.on('listening', () => {
  const address = server.address();
  console.log(`Listening on http://${address.address}:${address.port}`);
});
createUser().catch(err => console.log("error", err));
Quiz().catch(err => console.log("error", err));




require('./routes/routes')(app);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



app.listen(3000, () => {
  console.log('Example app listening at http://localhost:3000');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});











///////////Password Section////////////////




// app.put('/changePassword',verifyToken, async (req, res) => {
//   const { userId,email, password, otp } = req.body;
//   const updatedAt = moment().unix();
//   try {
//     console.log(otp, "======", onetimepassword)
//     if (onetimepassword !== Number(otp)) {
//       res.status(401).json("Invalid Otp");
//     }
//     let KeyConditionExpression = "userId = :value";
//     let ExpressionAttributeValues = {
//       ":value": userId,
//     };

//     let response1 = await dynamodb.queryItems(
//       "Users",
//       KeyConditionExpression,
//       ExpressionAttributeValues,
//       "email"
//     );

//     if (response1.length === 0) {
//       res.status(404).json("User not found");
//     } else {
//       try {
//         let hash = await bcrypt.hash(password, 10);
//         await dynamodb.updateItem("Users", { userId: userId }, { password: hash , updatedAt:updatedAt }, 'attribute_exists(userId)');
//         res.status(200).json("Password Updated");
//       } catch (error) {
//         return res.status(500).json({});
//       }
//     }
//   } catch (error) {
//     return res.status(500).json({error});
//   }

// })

// app.get('/password/:userId',verifyToken, async (req, res) => {
//   const userId = req.params.userId;
//   try {
//     let KeyConditionExpression = "userId = :value";
//     let ExpressionAttributeValues = {
//       ":value": userId,
//     };
//     let response = await dynamodb.queryItems(
//       "Users",
//       KeyConditionExpression,
//       ExpressionAttributeValues,
//       "email"
//     );
//     const email = response[0].email;
//     console.log(email);
//     if (response.length === 0) {
//       return res.status(404).json("User not found");
//     } else {
//       onetimepassword = generateOtp();
//       let response = await sendEmail(email, onetimepassword);
//       if (response) {
//         return res.status(200).json("Otp sent");
//       } else {
//         return res.status(500).json("Internal server error");
//       }
//     }
//   } catch (error) {
//     return error;
//   }
// })








