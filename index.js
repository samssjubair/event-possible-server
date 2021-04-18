const express = require('express')
const bodyParser=require('body-parser');
const fileUpload=require('express-fileupload');
const fs=require('fs-extra')
require('dotenv').config();
const cors=require('cors')

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('bson');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uizyj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5055


app.get('/', (req, res) => {
  res.send('Hello World!')
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingsCollection = client.db("eventPossible").collection("bookings");
  const reviewsCollection = client.db("eventPossible").collection("reviews");
  const servicesCollection = client.db("eventPossible").collection("services");
  const adminsCollection = client.db("eventPossible").collection("admins");

  app.post("/addAdmin",(req,res)=>{
      console.log(req.body);
      adminsCollection.insertOne(req.body)
      .then(result=>{
          res.send(result.insertedCount>0)
      })
  })

  app.post('/addBooking',(req,res)=>{
      const booking=req.body;
      console.log(booking);
      bookingsCollection.insertOne(booking)
      .then(result=>{
          res.send(result.insertedCount>0)
      })
  })

  app.post('/addService',(req,res)=>{
      const name=req.body.name;
      const price=req.body.price;
      const description=req.body.description;
      const file=req.files.file;

      const newImg=file.data;
      const encImg=newImg.toString('base64');
      const image={
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg,'base64')
    };

    servicesCollection.insertOne({name,price,description,img: image})
    .then(result=>{
        res.send(result.insertedCount>0)
    })

  })

  app.get("/allServices",(req,res)=>{
      servicesCollection.find({})
      .toArray((err,documents)=>{
          res.send(documents);
      })
  })

  app.delete("/deleteService",(req,res)=>{
      servicesCollection.deleteOne({_id: ObjectId(req.body.id)})
      .then(result=>{
          res.send(result.deletedCount>0)
      })
  })

  app.post('/addReview',(req,res)=>{
      const review=req.body;
      console.log(review);
      reviewsCollection.insertOne(review)
      .then(result=>{
          res.send(result.insertedCount>0)
      })
  })

  app.get('/allBookings',(req,res)=>{
    
    bookingsCollection.find({})
    .toArray((err,documents)=>{
        res.send(documents);
    })
  })

  app.get('/allReviews',(req,res)=>{
    
    reviewsCollection.find({})
    .toArray((err,documents)=>{
        res.send(documents);
    })
  })

  app.post('/userBookings',(req,res)=>{
      const email=req.body.email;
      
      bookingsCollection.find({email: email})
      .toArray((err,documents)=>{
          
          res.send(documents);
      })
  })

  app.patch('/updateStatus/:id',(req,res)=>{
      console.log(req.params,req.body);
      bookingsCollection.updateOne({_id: ObjectId(req.params.id)},
      {
          $set: {status:req.body.value}
      })
      .then(result=>{
          res.send(result.modifiedCount>0)
      })
  })
  
  app.post("/isAdmin",(req,res)=>{
      console.log(req.body.email);
      adminsCollection.find({email: req.body.email})
      .toArray((err,documents)=>{
          if(documents.length>0){
              res.send(true)
          }
      })
  })
  
  
});

app.listen(process.env.PORT|| port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})