// const uniqueId = uuidv4();
const dynamodb = require('../contoller');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs')
const { client, docClient } = require('../db');
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const uniqueId = uuidv4();


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
        console.log(userId)
        try {
            if (!userId) {
                return res.status(401).json({ error: "userId required" });
            }
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, "qwerty123");
            } catch (error) {
                return res.status(401).json({ error: "Invalid token" });
            }

            // const userId = decoded.userId;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            console.log(decoded.email);

            let response;
            try {
                response = await dynamodb.getItem("Users", { userId: userId });
            } catch (error) {
                console.error('Error fetching user from DynamoDB:', error);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (response) {
                return res.status(200).json(response);
            } else {
                return res.status(404).json({ error: "User not found" });
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });




    app.get('/users', verifyToken, async (req, res) => {
        try {
            const params = {
                TableName: 'Users'
            };
            const command = new ScanCommand(params);
            const data = await docClient.send(command);
            return res.status(200).json(data.Items);
        } catch (err) {
            console.error("Error", err);

            if (err.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "Table not found" });
            } else if (err.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ error: "Throughput limit exceeded, please try again later" });
            } else if (err.name === 'InternalServerError') {
                return res.status(500).json({ error: "Internal server error, please try again later" });
            } else if (err.name === 'ServiceUnavailable') {
                return res.status(503).json({ error: "Service is currently unavailable, please try again later" });
            } else {
                return res.status(500).json({ error: "Unknown error occurred" });
            }
        }
    });


    app.post('/login', async (req, res) => {
        const { email, password } = req.body;

        const params = {
            TableName: 'Users',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        try {
            const command = new ScanCommand(params);
            const data = await docClient.send(command);

            if (data.Items.length === 0) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const user = data.Items[0];
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
            } else if (err.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ error: 'Throughput limit exceeded, please try again later' });
            } else if (err.name === 'InternalServerError') {
                return res.status(500).json({ error: 'Internal server error, please try again later' });
            } else if (err.name === 'ServiceUnavailable') {
                return res.status(503).json({ error: 'Service is currently unavailable, please try again later' });
            } else {
                return res.status(500).json({ error: 'Unknown error occurred' });
            }
        }
    });


    app.post('/user', async (req, res) => {
        const { email, password, role, userName } = req.body;

        const scanParams = {
            TableName: 'Users',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        try {
            // Check if the user already exists
            const scanCommand = new ScanCommand(scanParams);
            const scanData = await docClient.send(scanCommand);

            if (scanData.Items.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create a new user
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


            const response = await dynamodb.addItem("Users", newItem);

            // Generate JWT token
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
            } else if (error.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ message: 'Throughput limit exceeded, please try again later' });
            } else if (error.name === 'InternalServerError') {
                return res.status(500).json({ message: 'Internal server error, please try again later' });
            } else if (error.name === 'ServiceUnavailable') {
                return res.status(503).json({ message: 'Service is currently unavailable, please try again later' });
            } else {
                return res.status(500).json({ message: 'Unknown error occurred' });
            }
        }
    });



    app.put('/user', verifyToken, async (req, res) => {
        try {
            const token = req.headers.authorization.split(' ')[1];
            console.log(token);
            const decoded = jwt.verify(token, "qwerty123");
            const userId = decoded.userId;

            const { password, ...data } = req.body;
            const key = { userId: userId };
            data.updatedAt = moment().unix();

            const response = await dynamodb.updateItem("Users", key, data, "attribute_exists(userId)");
            if (response) {
                return res.status(200).json(response.Attributes);
            } else {
                throw new Error("Failed to update user");
            }
        } catch (error) {
            console.error("Error updating user", error);

            // Handle JWT verification errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: "Invalid token" });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Token expired" });
            }

            // Handle DynamoDB errors
            if (error.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "User not found" });
            } else if (error.name === 'ConditionalCheckFailedException') {
                return res.status(409).json({ error: "User update condition not met" });
            } else if (error.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ error: "Request limit exceeded, please try again later" });
            } else if (error.name === 'InternalServerError') {
                return res.status(500).json({ error: "Internal Server Error, please try again later" });
            }

            // Handle any other errors
            return res.status(500).json({ error: "An unknown error occurred" });
        }
    });





    /////get all the quizzes
    app.get('/quizzes', verifyToken, async (req, res) => {
        try {
            const response = await dynamodb.scanItems('Quiz');
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
            // Generate unique IDs for quiz and questions
            const quizId = uuidv4();
            const questionsWithIds = questions.map(question => ({
                questionId: uuidv4(),
                ...question
            }));

            // Verify admin token
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            if (!token || decoded.role !== "admin") {
                return res.status(401).json({ error: "Unauthorized" });
            }

            // Prepare quiz item for DynamoDB
            const createdBy = decoded.userId;
            const updatedBy = userId; // Assuming userId is provided in req.body for tracking purposes
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
            }

            const data = await dynamodb.addItem("Quiz", Item);
            return res.status(200).json(quizId);
        } catch (error) {
            console.error('Error creating quiz:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Unauthorized" });
            }

            
            if (error.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "Quiz table not found" });
            } else if (error.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ error: "Request limit exceeded, please try again later" });
            } else if (error.name === 'InternalServerError') {
                return res.status(500).json({ error: "Internal Server Error, please try again later" });
            }

           
            return res.status(500).json({ error: 'Failed to create quiz' });
        }
    });



    //get quiz by id (id has to be sent via query params)

    app.get("/quiz", verifyToken, async (req, res) => {
        const { quizId } = req.query;

        try {
            if (!quizId) {
                return res.status(400).json({ error: "quizId parameter is required" });
            }

            const key = { quizId: quizId };
            const response = await dynamodb.getItem("Quiz", key);

            if (response) {
                return res.status(200).json(response);
            } else {
                return res.status(404).json({ error: "Quiz not found" });
            }
        } catch (err) {
            console.error("Error fetching quiz:", err);

           
            if (err.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "Quiz table not found" });
            } else if (err.name === 'InternalServerError') {
                return res.status(500).json({ error: "Internal Server Error, please try again later" });
            }

            return res.status(500).json({ error: "Failed to fetch quiz" });
        }
    });



    //Editing quiz where quiz id has to be sent via query params 
    app.put('/quiz', verifyToken, async (req, res) => {
        try {
            
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            if (!token || decoded.role !== 'admin') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const { quizId } = req.query;
            const { ...data } = req.body;

            if (!quizId) {
                return res.status(400).json({ message: 'quizId is required' });
            }

            data.updatedAt = moment().unix();
            data.updatedBy = decoded.userId;


            const key = { quizId: quizId };
            const response = await dynamodb.updateItem("Quiz", key, data);

            console.log('Quiz updated successfully:', response.Attributes);
            return res.status(200).json(response.Attributes);
        } catch (error) {
            console.error('Error updating quiz:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: 'Invalid quizId or missing data' });
            }

            if (error.name === 'ResourceNotFoundException') {
                return res.status(404).json({ error: "Quiz not found" });
            } else if (error.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ error: "Request limit exceeded, please try again later" });
            } else if (error.name === 'InternalServerError') {
                return res.status(500).json({ error: "Internal Server Error, please try again later" });
            }

            return res.status(500).json({ error: 'Failed to update quiz' });
        }
    });

    //deleting a particular quiz (id has to be sent via query params)
    app.delete("/quiz", verifyToken, async (req, res) => {
        const { quizId } = req.query;

        try {
           
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            if (!token || decoded.role !== 'admin') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Check if quizId is provided
            if (!quizId) {
                return res.status(400).json({ message: 'quizId is required' });
            }

            // Check if the quiz exists
            const key = { quizId: quizId };
            const response = await dynamodb.getItem("Quiz", key);

            if (!response) {
                return res.status(404).json({ message: "Quiz not found" });
            }

            // Delete the quiz from DynamoDB
            const deleteResponse = await dynamodb.deleteItem("Quiz", key);
            console.log('Quiz deleted successfully:', deleteResponse);

            return res.status(200).json({ message: 'Quiz deleted successfully' });
        } catch (error) {
            console.error('Error deleting quiz:', error);

            // Handle JWT verification errors
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Handle missing quizId
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: 'Invalid quizId or missing data' });
            }

            // Handle DynamoDB errors
            if (error.name === 'ResourceNotFoundException') {
                return res.status(404).json({ message: "Quiz table not found" });
            } else if (error.name === 'ProvisionedThroughputExceededException') {
                return res.status(503).json({ message: "Request limit exceeded, please try again later" });
            } else if (error.name === 'InternalServerError') {
                return res.status(500).json({ message: "Internal Server Error, please try again later" });
            }

            // Handle any other unexpected errors
            return res.status(500).json({ message: 'Failed to delete quiz' });
        }
    });



    ////////////////////Score Section///////////////////////




    app.post('/score', verifyToken, async (req, res) => {
        const { quizData, answers, feedback, rating } = req.body;

        try {
            // Check if quizData is provided
            if (!quizData) {
                return res.status(404).json({ message: 'Quiz not found in request body' });
            }

            // Calculate score
            const score = calculateScore(quizData, answers);
            const totalQuestions = quizData.questions.length;
            const attemptedQuestions = answers.length;

            // Verify user token
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            if (!token || !decoded.userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Prepare score parameters
            const userId = decoded.userId;
            const quizId = quizData.quizId;
            const params = {
                quizId,
                userId,
                score: Number(score),
                rating,
                feedback,
                totalQuestions,
                attemptedQuestions,
                submittedAt: moment().unix()
            };

            // Add score to DynamoDB
            try {
                const response = await dynamodb.addItem("Scores", params);
                if (response) {
                    return res.status(200).json({ message: "Score added successfully" });
                }
            } catch (error) {
                console.error('Error adding score to DynamoDB:', error);
                return res.status(500).json({ error: 'Failed to add score' });
            }
        } catch (error) {
            console.error('Error processing score:', error);

            // Handle token verification errors
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Handle any other unexpected errors
            return res.status(500).json({ error: 'Failed to process score' });
        }
    });

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

    app.get('/scores', verifyToken, async (req, res) => {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'userId parameter is required' });
        }
        let KeyConditionExpression = "userId = :value";
        let ExpressionAttributeValues = {
            ":value": userId,
        };
        try {
            let response = await dynamodb.queryItems(
                "Scores",
                KeyConditionExpression,
                ExpressionAttributeValues
            );

            if (response.length === 0) {
                return res.status(404).json("User not found");
            }
            if (response) {
                return res.status(200).json(response);

            } else {
                return res.status(500).json("Internal server error");
            }
        }
        catch (err) {
            console.error('Error fetching user scores:', err);
            return res.status(500).json("Internal server error");
        }

    })

    app.get('/score', verifyToken, async (req, res) => {
        try {
            // Verify user token
            const token = req.headers.authorization?.split(' ')[1];
            const decoded = jwt.verify(token, "qwerty123");
            const userId = decoded.userId;

            // Validate quizId parameter
            const { quizId } = req.query;
            if (!quizId) {
                return res.status(400).json({ message: 'quizId parameter is required' });
            }

            // Prepare DynamoDB scan parameters
            const FilterExpression = "userId = :userId AND contains(quizId,:quizId)";
            const ExpressionAttributeValues = {
                ":userId": userId,
                ":quizId": quizId
            }

            // Perform DynamoDB scan operation
            const response = await dynamodb.scanItems("Scores", FilterExpression, ExpressionAttributeValues);

            // Handle no score found
            if (response.length === 0) {
                return res.status(404).json({ message: "No score found" });
            }

            // Return scores
            return res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching scores:', error);

            // Handle JWT verification errors
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Handle DynamoDB errors
            return res.status(500).json({ message: 'Error fetching scores' });
        }
    });



    app.get('/allScores', verifyToken, async (req, res) => {
        try {

            const response = await dynamodb.scanItems("Scores");

            if (response.length === 0) {
                return res.status(200).json(response);
            }

            return res.status(200).json(response);
        } catch (error) {
            console.error('Error fetching scores:', error);

            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            return res.status(500).json({ message: 'Error fetching scores' });
        }
    });



}