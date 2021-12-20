const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q0pfb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CONNECT}`);
  const doctorsCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_CONNECTED}`);
  app.post('/addAppointment', (req, res) => {
    const newAppointment = req.body;
    collection.insertOne(newAppointment)
    .then(result =>{
      res.send(result.acknowledged === true );
    })
  });

  app.post('/addADoctor', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;

    // const filePath =`${__dirname}/doctors/${file.name}`;
    // file.mv( filePath, err=>{
      // if(err){
      //   console.log(err);
      //   res.status(5000).send({msg : 'Failed to upload Image'})
      // }
      //const newImg = fs.readFileSync(filePath);
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      const image = {
        contentType : file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      }

      doctorsCollection.insertOne({image, name, email})
      .then(result => {
        res.send(result.acknowledged === true);
        // fs.remove(filePath, error=> {
        //   if(error){
        //     console.log(error);
        //     res.status(5000).send({msg :'Failed to upload Image'});
        //   }          
        // })
       
      })
      // return res.send({name : file.name, path:`/${file.name}`});
    // })
   
  });

  app.get('/doctors', (req, res)=>{
    doctorsCollection.find({})
    .toArray((err, documents)=>{
      res.send(documents);
    })
  })

  app.post('/appointmentsByDate', (req, res) => {
    const date = req.body;
    const email = req.body.email;
    console.log(email)
    doctorsCollection.find({email : email})
    .toArray((err, doctors)=>{
       const filter = {appointment : date.date};
      if(doctors.length === 0){
        filter.email = email;
      }
      collection.find(filter)
    .toArray((err, documents)=>{
      res.send(documents);
    })
    })
    
  });

  app.post('/isDoctor', (req, res) => {
    const email = req.body.email;
    doctorsCollection.find({email : email})
    .toArray((err, doctors)=>{
      res.send(doctors.length > 0)
    })
    
  });

  app.get('/allAppointments', (req, res) => {
    collection.find({})
    .toArray((err, documents)=>{
      res.send(documents);
    })
  })
  

});

app.get('/', (req, res) => {
  res.send('Hello Server Fast to Work .... !')
});

app.listen(port);

