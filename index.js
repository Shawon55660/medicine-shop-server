require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
const port = process.env.PORT || 8000;
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)

//midle ware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const usersCollection = client.db('mediStore').collection('users')
    const categoryCollection = client.db('mediStore').collection('category')
    const medicinesCollection = client.db('mediStore').collection('medicines')
    const advertisementsCollection = client.db('mediStore').collection('advertisements')
    const cartCollection = client.db('mediStore').collection('cart')
    const paymentsCollection = client.db('mediStore').collection('payments')
    //jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })
    //verify token API
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized ki' });

      }

      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded
        next()
      })

    }

    //users info API start
    //users post api
    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      const userEmail = userInfo.email
      const filter = { email: userEmail }
      const alreadyExiting = await usersCollection.findOne(filter)
      if (alreadyExiting) {
        return
      } else {
        const result = await usersCollection.insertOne(userInfo)
        res.send(result)

      }



    })
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    //update role api
    app.patch('/updateRole/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      const { role } = req.body

      const query = { _id: new ObjectId(id) }
      const update = {
        $set: {
          role: role
        }

      }
      const result = await usersCollection.updateOne(query, update)
      res.send(result)
    })

    //users info API end

    //manage-category API make start
    //add category with post api
    app.post('/add-category', async (req, res) => {
      const categoryInfo = req.body;
      const filter = {
        MedicineCategory: categoryInfo.MedicineCategory
      }
      const alreadyExiting = await categoryCollection.findOne(filter)

      if (alreadyExiting) return res.send({ message: "Category already exists" })
      const result = await categoryCollection.insertOne(categoryInfo)
      res.send(result)
    })
    // get category API
    app.get('/category', async (req, res) => {
      const result = await categoryCollection.find().toArray()
      res.send(result)
    })

    //category delete api
    app.delete('/category-delete/:id', async (req, res) => {

      const deleteId = req.params.id;
      const filter = { _id: new ObjectId(deleteId) }
      const result = await categoryCollection.deleteOne(filter);
      res.send(result)
    })
    //get category by ID
    app.get('/category/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const result = await categoryCollection.findOne(filter)
      res.send(result)
    })
    //category updated api
    app.patch('/update-category/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body
      const filter = { _id: new ObjectId(id) }
      console.log(updateData.MedicineCategory)
      const updatedData = {
        $set:
        {
          MedicineCategory: updateData.MedicineCategory,
          categoryPhoto: updateData.categoryPhoto

        }

      }
      const result = await categoryCollection.updateOne(filter, updatedData)
      res.send(result)
    })
    //manage-category API make end

    //manage-medicines API make start
    //post medicines
    app.post('/add-medicines', async (req, res) => {
      const info = req.body;
      const result = await medicinesCollection.insertOne(info)
      res.send(result)
    })
    app.get('/medicinesAll', async (req, res) => {
      const result = await medicinesCollection.find().toArray()
      res.send(result)
    })

    //get medicines bt email
    app.get('/medicines', verifyToken, async (req, res) => {
      const sellerEmail = req.query.sellerEmail;
      const query = { sellerEmail: sellerEmail }
      const result = await medicinesCollection.find(query).toArray()
      res.send(result)
    })
    //get medicines by category
    app.get('/category-medicines', async (req, res) => {
      const category = req.query.category;

      const query = { category: category }
      const result = await medicinesCollection.find(query).toArray()
      res.send(result)
    })
    app.get('/medicines-details/:id', async (req, res) => {
      const id = req.params.id

      const filter = { _id: new ObjectId(id) }
      const result = await medicinesCollection.findOne(filter)

      res.send(result)
    })
    //manage-medicines API make end

    // manage-advertisements API make start

    //post advertisements
    app.post('/advertisements', async (req, res) => {
      const data = req.body;
      const result = await advertisementsCollection.insertOne(data)
      res.send(result)
    })
    // get advertisement
    app.get('/advertisements', verifyToken, async (req, res) => {
      const sellerEmail = req.query.sellerEmail;
      const query = { sellerEmail: sellerEmail }
      const result = await advertisementsCollection.find(query).toArray()
      res.send(result)

    })
    app.get('/advertisements-all', verifyToken, async (req, res) => {

      const result = await advertisementsCollection.find().toArray()
      res.send(result)

    })

    //update role api
    app.patch('/add-bannar/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      const { status } = req.body

      const query = { _id: new ObjectId(id) }
      const update = {
        $set: {
          status: status
        }

      }
      const result = await advertisementsCollection.updateOne(query, update)
      res.send(result)
    })
    // manage-advertisements API make start

    //cart item API make start
    app.post('/cart', async (req, res) => {
      const userInfo = req.body
      const userEmail = userInfo.userEmail
      const id = userInfo.medicineId
      const query = { medicineId: id, userEmail: userEmail }
      const alreadyExiting = await cartCollection.findOne(query)
      console.log(alreadyExiting)

      if (alreadyExiting) return res.send({ error: "already added" })
      else {
        const result = await cartCollection.insertOne(userInfo)

        res.send(result)

      }
    })
    //cart by email
    app.get('/cartsOwner', verifyToken, async (req, res) => {
      const userEmail = req.query.userEmail;
      const query = { userEmail: userEmail }
      const result = await cartCollection.find(query).toArray()
      res.send(result)

    })
    //cart delete one
    app.delete('/cart-delete/:id', async (req, res) => {

      const deleteId = req.params.id;
      const filter = { _id: new ObjectId(deleteId) }
      const result = await cartCollection.deleteOne(filter);
      res.send(result)
    })
    //delete all cart
    app.delete('/cart-deleteAll', async (req, res) => {

     
      const userEmail = req.query.userEmail
      const query = {userEmail:userEmail}

      const result = await cartCollection.deleteMany(query);
      res.send(result)
    })
    // cartUpdate increase
    app.patch('/cartUpdateInc/:id', async (req, res) => {
      const id = req.params.id;
     

      const filter = { _id: new ObjectId(id) }
      const cartItem = await cartCollection.findOne(filter)
      const medicineItem = await medicinesCollection.findOne(new ObjectId(cartItem.medicineId))
      
      if ( cartItem.quentity >= medicineItem.Massunit ) {
        return res.send({ 
            success: false, 
            message: 'Quantity cannot be more unit ' 
        });
    }

      const currentQuantity = cartItem.quentity;
      const unitPrice = cartItem.Price / currentQuantity;
      const newQuantity = currentQuantity + 1;
      const newPrice = unitPrice * newQuantity;
      const update = {
        $set: {
          quentity: newQuantity,
          Price: newPrice
        }
      }


      const result = await cartCollection.updateOne(filter, update)
      res.send(result)
    })
    // cartUpdate decrease
    app.patch('/cartUpdateDec/:id', async (req, res) => {
      const id = req.params.id;
    


      const filter = { _id: new ObjectId(id) }
      const cartItem = await cartCollection.findOne(filter)
      if (cartItem.quentity <= 1) {
        return res.send({ 
            success: false, 
            message: 'Quantity cannot be reduced below 1' 
        });
    }
      const currentQuantity = cartItem.quentity;
      const unitPrice = cartItem.Price / currentQuantity;
      
      const newQuantity = currentQuantity - 1;
      const newPrice = unitPrice * newQuantity;
      const update = {
        $set: {
          quentity: newQuantity,
          Price: newPrice
        }
      }


      const result = await cartCollection.updateOne(filter, update)
      res.send(result)
    })
    //cart item API make end

    //payment api make start here

    //payment intent api
    app.post('/create-payment-intent',async(req,res)=>{
      
      const {price,cartData} = req.body;
      // console.log(cartData)
      const amount = parseInt(price * 100)
      const paymentIntent =await stripe.paymentIntents.create({
        
        amount:amount,
        currency:'bdt',
        payment_method_types:['card'],
       
       
      })
      res.send({clientSecret: paymentIntent.client_secret,cartData:cartData})
    })
        //payment collection post api
        app.post('/payment',async(req,res)=>{
          const paymentInfo = req.body
          const result = await paymentsCollection.insertOne(paymentInfo)
          
        
        const query = {
          _id:{
            $in:paymentInfo.cartId.map(id=> new ObjectId(id))
          }
        }
     const deleteResult = await cartCollection.deleteMany(query)
     res.send({result, deleteResult})
    })
  //get api payments
    app.get('/payments',async(req,res)=>{
      const result  = await paymentsCollection.find().toArray()
      res.send(result)
    })

    //patch status payments
    app.patch('/paymentUpdate/:id',async(req,res)=>{
      const id = req.params.id
      const query  = {_id: new ObjectId(id)}
      const update = {
        $set:{
          status:'paid'
        }
      }
      const result = await paymentsCollection.updateOne(query,update)
      res.send(result)
    })

    // payment get by buyerEmail
    app.get('/buyerPayment', async(req,res)=>{
      const buyerEmail = req.query.buyerEmail;
      const query = {
        buyerEmail:buyerEmail
      }
      const result = await paymentsCollection.find(query).toArray()
      res.send(result)
    })
    //payment api make end here

    //check email and get role
    app.get('/users/role/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) return res.status(403).send({ message: 'forbidden access' })



      const query = { email: email };
      const user = await usersCollection.findOne(query)

      if (user) {
        const role = user?.role;

        res.send({ role })
      }


    })






  }
  finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('is running.........................')
})
app.listen(port, () => {
  console.log(`this is run is ${port}`)
})
