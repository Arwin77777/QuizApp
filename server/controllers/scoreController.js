const dynamodb = require('../dynamoDBUtils');


const addScore = async (params) => {
    try {
        return await dynamodb.addItem("Scores", params);
    } catch (error) {
        console.error('Error adding score to DynamoDB:', error);
        throw new Error('Error adding score');
    }
};

const getUserScores = async (userId) => {
    try {
        const KeyConditionExpression = "userId = :value";
        const ExpressionAttributeValues = { ":value": userId };
        return await dynamodb.queryItems("Scores", KeyConditionExpression, ExpressionAttributeValues);
    } catch (error) {
        console.error('Error fetching user scores:', error);
        throw new Error('Error fetching user scores');
    }
};

const getScoreByQuiz = async (userId, quizId) => {
    try {
        const FilterExpression = "userId = :userId AND contains(quizId, :quizId)";
        const ExpressionAttributeValues = {
            ":userId": userId,
            ":quizId": quizId
        };
        return await dynamodb.scanItems("Scores", FilterExpression, ExpressionAttributeValues);
    } catch (error) {
        console.error('Error fetching score by quiz:', error);
        throw new Error('Error fetching score by quiz');
    }
};


const getAllScores = async () => {
    try {
        return await dynamodb.scanItems("Scores");
    } catch (error) {
        console.error('Error fetching all scores:', error);
        throw new Error('Error fetching all scores');
    }
};

module.exports = {
    addScore,
    getUserScores,
    getScoreByQuiz,
    getAllScores
};
