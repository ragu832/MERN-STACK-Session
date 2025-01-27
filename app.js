//Import required modules
const http = require('http');
const express = require('express');
const { error } = require('console');
const { MongoClient } = require("mongodb");
const app = express();

// Use express.json() middleware
app.use(express.json());

//server creation
let server = http.createServer(app);
const port = 3006;

//server listening
server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});

const uri = "mongodb+srv://ragu:ragu@cluster0.crtcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Add mongoose connection setup
const mongoose = require('mongoose');
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Ensure your IP address is whitelisted in MongoDB Atlas.');   
  });

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


const ExpenseTrackerschema = new mongoose.Schema({
    id: {type: String, required: true, unique: true},
    title: {type: String, required: true}, 
    amount: {type: Number, required: true}, 
});

const ExpenseTracker = mongoose.model('ExpenseTrackers', ExpenseTrackerschema);

app.get('/api/expense', async (req, res) => {
    try {
        const expense = await ExpenseTracker.find();
        res.status(200).json(expense);
    }catch{
        res.status(500).json({message: error.message});
    }
});

app.get("/api/expense/:id", async(req, res) =>{

    try{
        const id = req.params.id;
        const expense = await ExpenseTracker.findOne({ id: id });
        if(!expense){
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json(expense);
    }
    catch(error){
        res.status(500).json({ message: error.message });
    }
});

const { v4: uuidv4 } = require('uuid');

//API to add the expense(POST request)
app.post('/api/expense', async (req, res) => {
    try {
        const data = req.body;
        const newexpense = new ExpenseTracker({
            id: uuidv4(),
            title: data.title, 
            amount: data.amount
        });
        const expense = await newexpense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: "Invalid JSON input" });
    }
});

//API to update the expense(PUT request)
app.put("/api/expense/:id", async (req, res) => {
    const { id } = req.params;
    const { title, amount } = req.body;
    try {
        const updateexpense = await ExpenseTracker.findOneAndUpdate(
            { id }, 
            { title, amount }
        );
        if (!updateexpense) {
            return res.status(404).json({message: "Expense not found"});
        }
        res.status(200).json(updateexpense);
    } catch (error) {
        res.status(500).json({message: "Error in updating expense"})
    }
});