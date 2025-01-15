require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt =  require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 8000;

//midle ware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_NAME}:${process.env.DATABASE_PASSWORD}@cluster0.u5q3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    //jwt related api
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})

        res.send({token})
    })
   
  } finally {
   
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('is running.........................')
})
app.listen(port,()=>{
    console.log(`this is run is ${port}`)
})
