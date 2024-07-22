const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const userController = require('../controllers/userController');
const quizController = require('../controllers/quizController');
const scoreController = require('../controllers/scoreController');


module.exports = function (app) {

    const verifyToken = (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized: No token provided' });
            }
            const decoded = jwt.verify(token, "qwerty123");
            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized: Token expired' });
            }
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };



    app.get("/user", verifyToken, async (req, res) => {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: "userId required" });
        }

        try {
            const user = await userController.getUserFromDb(userId);
            if (user) {
                return res.status(200).json(user);
            } else {
                return res.status(404).json({ error: "User not found" });
            }
        } catch (error) {
            console.error('Error fetching user from DynamoDB:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });




    app.get('/users', verifyToken, async (req, res) => {
        try {
            const users = await userController.getAllUsersFromDb();
            return res.status(200).json(users);
        } catch (err) {
            console.error("Error", err);

            if (err.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "Table not found" });
            } else {
                return res.status(500).json({ error: "Unknown error occurred" });
            }
        }
    });


    app.post('/login', async (req, res) => {
        const { email, password } = req.body;


        try {
            const data = await userController.login(email);
            console.log(data);

            if (!data[0]) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = data[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { userId: user.userId, email: user.email, role: user.role },
                'qwerty123',
                { expiresIn: '10h' }
            );

            return res.status(200).json({ token });

        } catch (err) {
            console.error('Error', err);

            if (err.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: 'Table not found' });
            } else {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    });


    app.post('/user', async (req, res) => {
        const { email, password, role, userName } = req.body;

        try {

            const scanData = await userController.login(email);

            if (scanData.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const userId = uuidv4();
            const hashedPassword = await bcrypt.hash(password, 10);
            const newItem = {
                userId,
                email,
                password: hashedPassword,
                role,
                userName,
                updatedAt: ""
            };

            if (!userName || !email || !password || !role) {
                return res.status(400).json({ error: "Provide all required fields" })
            }


            const response = await userController.register(newItem);

            const token = jwt.sign(
                { userId: newItem.userId, email: newItem.email, role: newItem.role },
                'qwerty123',
                { expiresIn: '1h' }
            );

            return res.status(201).json({ token });

        } catch (error) {
            console.error('Error processing request:', error);

            if (error.name === 'ResourceNotFoundException') {
                return res.status(404).json({ message: 'Table not found' });
            } else {
                return res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    });



    app.put('/user', verifyToken, async (req, res) => {
        try {
            const { userId } = req.user;
            const { password, ...data } = req.body;
            const key = { userId };
            data.updatedAt = moment().unix();

            const response = await userController.updateUser(key, data);
            if (response) {
                return res.status(200).json(response.Attributes);
            } else {
                throw new Error("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user", error);

            if (error.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "User not found" });
            } else {
                return res.status(500).json({ error: "Internal Server Error, please try again later" });
            }
        }
    });



    //////////////Quiz Endpoints//////////////////////

    /////get all the quizzes
    app.get('/quizzes', verifyToken, async (req, res) => {
        try {
            const response = await quizController.allQuizzes();
            return res.status(200).json(response);
        }
        catch (error) {
            console.log(error);
            return res.status(500).send("Internal server error");
        }
    })

    app.post('/quiz', verifyToken, async (req, res) => {
        const { category, quizName, quizImage, questions, userId } = req.body;

        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");

            if (decoded.role !== "admin") {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const quizId = uuidv4();
            const questionsWithIds = questions.map(question => ({
                questionId: uuidv4(),
                ...question
            }));

            const createdBy = decoded.userId;
            const updatedBy = userId;
            const updatedAt = moment().unix();

            const Item = {
                quizId,
                category,
                quizName,
                quizImage,
                questions: questionsWithIds,
                createdBy,
                updatedBy,
                updatedAt
            };

            await quizController.addQuiz(Item);
            return res.status(200).json(quizId);
        } catch (error) {
            console.error('Error creating quiz:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Unauthorized" });
            }

            return res.status(500).json({ error: 'Failed to create quiz' });
        }
    });



    app.get('/quiz', verifyToken, async (req, res) => {
        const { quizId } = req.query;

        try {
            if (!quizId) {
                return res.status(400).json({ error: "quizId parameter is required" });
            }

            const response = await quizController.getQuizById(quizId);

            if (response) {
                return res.status(200).json(response);
            } else {
                return res.status(404).json({ error: "Quiz not found" });
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);

            return res.status(500).json({ error: "Failed to fetch quiz" });
        }
    });




    //Editing quiz where quiz id has to be sent via query params 
    app.put('/quiz', verifyToken, async (req, res) => {
        const { quizId } = req.query;
        const data = req.body;

        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");

            if (decoded.role !== 'admin') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!quizId) {
                return res.status(400).json({ message: 'quizId is required' });
            }

            data.updatedBy = decoded.userId;
            const response = await quizController.updateQuiz(quizId, data);

            return res.status(200).json(response.Attributes);
        } catch (error) {
            console.error('Error updating quiz:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (error.message === 'Error updating quiz') {
                return res.status(400).json({ message: 'Invalid quizId or missing data' });
            }

            return res.status(500).json({ message: 'Failed to update quiz' });
        }
    });

    //deleting a particular quiz (id has to be sent via query params)
    app.delete('/quiz', verifyToken, async (req, res) => {
        const { quizId } = req.query;

        try {
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");

            if (decoded.role !== 'admin') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (!quizId) {
                return res.status(400).json({ message: 'quizId is required' });
            }

            const existingQuiz = await quizController.getQuizById(quizId);
            if (!existingQuiz) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            await quizController.deleteQuiz(quizId);

            return res.status(200).json({ message: 'Quiz deleted successfully' });
        } catch (error) {
            console.error('Error deleting quiz:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (error.message === 'Error deleting quiz') {
                return res.status(400).json({ message: 'Invalid quizId or missing data' });
            }

            return res.status(500).json({ message: 'Failed to delete quiz' });
        }
    });


    ////////////////////Score Section///////////////////////

    const calculateScore = (quizData, userAnswers) => {
        let score = 0;
        const point = 100 / (quizData.questions.length);

        userAnswers.forEach(answer => {
            const question = quizData.questions.find(q => q.questionId === answer.questionId);
            if (question) {
                const isCorrect = question.correctOptionIds.every(correctOptionId =>
                    answer.selectedOptionIds.includes(correctOptionId)
                ) && question.correctOptionIds.length === answer.selectedOptionIds.length;

                if (isCorrect) {
                    score += point;
                }
                else {
                    console.log(question);
                }
            }
        });

        return score;
    };


    app.post('/score', verifyToken, async (req, res) => {
        const { quizData, answers, feedback, rating } = req.body;

        try {
            if (!quizData) {
                return res.status(400).json({ message: 'Quiz data is required' });
            }

            const score = calculateScore(quizData, answers);
            const totalQuestions = quizData.questions.length;
            const attemptedQuestions = answers.length;

            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            if (!decoded.userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const params = {
                quizId: quizData.quizId,
                userId: decoded.userId,
                score: Number(score),
                rating,
                feedback,
                totalQuestions,
                attemptedQuestions,
                submittedAt: moment().unix()
            };

            await scoreController.addScore(params);
            return res.status(200).json({ message: "Score added successfully" });

        } catch (error) {
            console.error('Error processing score:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            return res.status(500).json({ error: 'Failed to process score' });
        }
    });



    app.get('/scores', verifyToken, async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'userId parameter is required' });
        }

        try {
            const response = await scoreController.getUserScores(userId);

            if (response.length === 0) {
                return res.status(404).json({ message: 'No scores found for user' });
            }

            return res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching user scores:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            return res.status(500).json({ message: 'Failed to fetch scores' });
        }
    });

    app.get('/score', verifyToken, async (req, res) => {
        const { quizId } = req.query;

        try {
            if (!quizId) {
                return res.status(400).json({ message: 'quizId parameter is required' });
            }

            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            const userId = decoded.userId;

            const response = await scoreController.getScoreByQuiz(userId, quizId);

            if (response.length === 0) {
                return res.status(404).json({ message: 'No score found for the specified quiz' });
            }

            return res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching scores:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            return res.status(500).json({ message: 'Failed to fetch scores' });
        }
    });


    app.get('/allScores', verifyToken, async (req, res) => {
        try {
            const response = await scoreController.getAllScores();
            return res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching all scores:', error);
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }
            return res.status(500).json({ message: 'Failed to fetch scores' });
        }
    });

}




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