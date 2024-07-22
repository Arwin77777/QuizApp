const dynamodb = require('../dynamoDBUtils');
const moment = require('moment');


const allQuizzes = async () => {
    try {
        return await dynamodb.scanItems('Quiz');
    }
    catch (err) {
        console.error('Error fetching all quizzes:', err);
        throw new Error('Error fetching all quizzes');
    }
}

const addQuiz = async (quiz) => {
    try {
        return await dynamodb.addItem("Quiz", quiz);
    } catch (error) {
        console.error('Error adding quiz:', error);
        throw new Error('Error adding quiz');
    }
};

const getQuizById = async (quizId) => {
    try {
        return await dynamodb.getItem("Quiz", { quizId });
    } catch (error) {
        console.error('Error fetching quiz by ID:', error);
        throw new Error('Error fetching quiz by ID');
    }
};


const updateQuiz = async (quizId, data) => {
    try {
        const key = { quizId };
        data.updatedAt = moment().unix();
        return await dynamodb.updateItem("Quiz", key, data);
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw new Error('Error updating quiz');
    }
};

const deleteQuiz = async (quizId) => {
    try {
        const key = { quizId };
        return await dynamodb.deleteItem("Quiz", key);
    } catch (error) {
        console.error('Error deleting quiz:', error);
        throw new Error('Error deleting quiz');
    }
};

module.exports = {
    allQuizzes,
    addQuiz,
    getQuizById,
    updateQuiz,
    deleteQuiz
};
