const dynamodb = require('../dynamoDBUtils');

const getUserFromDb = async (userId) => {
    try {
        const response = await dynamodb.getItem("Users", { userId });
        return response;
    } catch (error) {
        console.error('Error fetching user from DynamoDB:', error);
        throw new Error('Error fetching user from DynamoDB');
    }
};

const getAllUsersFromDb = async () => {
    try {
        const response = await dynamodb.scanItems('Users');
        return response;
    } catch (error) {
        console.error('Error fetching all users from DynamoDB:', error);
        throw new Error('Error fetching all users from DynamoDB');
    }
};

const login = async (email) => {
    try {
        const tableName = 'Users';
        const filterExpression = 'email = :email';
        const expressionAttributeValues = { ':email': email };
        const users = await dynamodb.scanItems(tableName, filterExpression, expressionAttributeValues);
        return users;
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Error during login');
    }
};

const register = async (newItem) => {
    try {
        const response = await dynamodb.addItem("Users", newItem);
        return response;
    } catch (error) {
        console.error('Error registering new user:', error);
        throw new Error('Error registering new user');
    }
};

const updateUser = async (key, data) => {
    try {
        const response = await dynamodb.updateItem("Users", key, data, "attribute_exists(userId)");
        return response;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Error updating user');
    }
};

module.exports = {
    getUserFromDb,
    getAllUsersFromDb,
    login,
    register,
    updateUser
};
