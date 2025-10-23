const express = require("express");
const mongoose = require("mongoose");

const mongoURI = 'mongodb://localhost:27017/user_inventory_db';

async function connectToMongoDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB via Mongoose');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
});

const Recipe = require("./models/Recipe");
const RECIPE = "Recipe";
const User= require("./models/User");
const USER = "User";
const UserInventory = require("./models/UserInventory");
const INVENTORY = "Inventory";

let path = require("path");
const app = express();
app.use(express.json());
const PORT_NUMBER = 8080;
app.listen(PORT_NUMBER);
app.use(express.static("./dist/actorApp/browser"));


async function startServer() {
    try {
        await connectToMongoDB();
        app.listen(PORT_NUMBER, () => {
            console.log(`Server is running on http://localhost:${PORT_NUMBER}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();



