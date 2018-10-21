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
  let resultArray = [];
  mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    let db = client.db(dbName);

    let cursor = db.collection('user-data').find().sort({$natural: -1}).limit(10);
    cursor.forEach((doc, err) => {
      assert.equal(null, err);
      resultArray.push(doc);
    }, () => {
      client.close();
      console.log(resultArray);
      res.json({message: resultArray});
    });
  });
});

app.post('/user', (req, res, next) => {
  var body = req.body;
  var item = {
    username : body.name,
    date : body.date,
    cmtName : body.cmtName
  };
  saveToDataBase(item);
  console.log('user', body.cmtName);  
  res.json({ message: body.cmtName });
});

app.put('/user', (req, res, next) => {
  var body = req.body;
  var item = {
    username : body.name,
    date : body.date,
    cmtName : body.cmtName
  };
  var newItem = {
    username : body.name,
    date : body.date,
    cmtName : body.cmtName,
    resComments: body.resComments

  };
  console.log('resComments', newItem);  
  updateDataBase(item, newItem);
  console.log('user', body.cmtName);  
  res.json({ resComments : body.resComments});

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

function updateDataBase (item, newItem) {
  mongo.connect(url, { useNewUrlParser: true }, (err, client) => {
    assert.equal(null, err);
    let db = client.db(dbName);
    db.collection('user-data').findOneAndUpdate(item, {$set :newItem}, {new: true, upsert: true}, (err, doc) => {
      assert.equal(null, err);
      console.log('Item updated');
      console.log(doc);
      console.log(newItem);
    });
    client.close();
  });
}