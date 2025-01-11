//Import required modules
const http = require('http');
const express = require('express');
const { error } = require('console');
const mongooes = require('mongoose');
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


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb://cluster0-shard-00-00.crtcs.mongodb.net:27017,cluster0-shard-00-01.crtcs.mongodb.net:27017,cluster0-shard-00-02.crtcs.mongodb.net:27017/Expense_Tracker?replicaSet=atlas-rcb9se-shard-0&ssl=true&authSource=admin";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000, // Increase connection timeout to 30 seconds
  socketTimeoutMS: 45000,  // Increase socket timeout to 45 seconds
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


// //Database Connection
// const mongourl = "mongodb://127.0.0.1:27017/Project";
// mongooes.connect(mongourl)
// .then(() => {
//     console.log('Database connected successfully');
//     // app.listen(port,()=>{

//     //     console.log(`Server is running on port ${port}`);
//     // })
// })
// .catch((error) => {
//     console.error('Database connection error:', error);
// });

const ExpenseTrackerschema = new mongooes.Schema({
    id: {type: String, required: true, unique: true},
    title: {type: String, required: true}, 
    amount: {type: Number, required: true}, 
});

const ExpenseTracker = mongooes.model('ExpenseTrackers', ExpenseTrackerschema);

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
