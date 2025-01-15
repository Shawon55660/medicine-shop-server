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

    //all colection here
    const usersCollection =   client.db('mediStore').collection('users')
    //jwt related api
    app.post('/jwt',async(req,res)=>{
        const user = req.body;
        const token= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})

        res.send({token})
    })
    //verify token API
    const verifyToken =  (req,res,next)=>{
      if(!req.headers.authorization){
        return res.status(401).send({ message: 'unauthorized ki' });

      }

      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
        if(error){
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded =  decoded
        next()
      })

    }

    //users info API
    app.post('/users',async(req,res)=>{
      const userInfo = req.body;
      const userEmail = userInfo.email 
     const filter = {email:userEmail}
     const alreadyExiting = await usersCollection.findOne(filter)
     if(alreadyExiting) {
      return
     } else{
      const result = await usersCollection.insertOne(userInfo)
      res.send(result)

     }

     

    })

    //check email and get role
    app.get('/users/role/:email',verifyToken, async(req,res)=>{
      const email = req.params.email;
      if (email !== req.decoded.email) return res.status(403).send({ message: 'forbidden access' })

     

        const query = {email:email};
        const user = await usersCollection.findOne(query)
        
        if(user){
          const role = user?.role;
        
          res.send({role})
        }
        
      
    })
    // //check email is Seller
    // app.get('/users/seller/:email',verifyToken, async(req,res)=>{
    //   const email = req.params.email;
    //   if (email !== req.decoded.email) return res.status(403).send({ message: 'forbidden access' })

       

    //     const query = {email:email};
    //     const user = await usersCollection.findOne(query)
    //     let seller = false
    //     if(user){
    //       seller = user?.role === 'seller';
    //     }
    //     res.send({seller})
      
    // })
   
  }
   finally {
   
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('is running.........................')
})
app.listen(port,()=>{
    console.log(`this is run is ${port}`)
})
