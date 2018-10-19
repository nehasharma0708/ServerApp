const express = require("express");
const bodyParser = require("body-parser");
const mongo  = require('mongodb').MongoClient;
const assert = require("assert");

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {  // Enable cross origin resource sharing (for app frontend)
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // Prevents CORS preflight request from redirecting
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next(); // Passes control to next handler
    }
});

app.get("/user", (req, res, next) => {
  let result = "";
  mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    let db = client.db(dbName);
    let cursor = db.collection('user-data').find({}, {limit: 1}).sort({$natural: -1});
    cursor.forEach((doc, err) => {
      assert.equal(null, err);
      result = doc;
    }, () => {
          client.close();
          console.log(result);
          res.json({message: result});
    });
  });
});

app.post('/user', (req, res, next) => {
  var body = req.body;
  var item = {
    username : body.name,
    date : new Date(),
    email : body.email,
    phone : body.phone
  };
  saveToDataBase(item);
  console.log('user', body.name);  
  res.json({ message: body.name });
});


app.listen(8000, () => {
    console.log("Listening on port : 8000");
});

function saveToDataBase (item) {
  mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    let db = client.db(dbName);
    db.collection('user-data').insertOne(item, (err, client) => {
      assert.equal(null, err);
      console.log('Item inserted');
    });
    client.close();
  });
}