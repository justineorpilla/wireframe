var express = require('express');
var router = express.Router();

const { MongoClient, ObjectId } = require("mongodb")
var url = "mongodb://localhost:27017/";

const client = new MongoClient(url)
client.connect()
const dbo = client.db("dashboard");
const collection = dbo.collection("groupchat");

/* GET users listing. */
router.post("/", function (req, res, next) {

  collection.insertOne(
    {
      id: req.body.id,
      chat: req.body.chat,
      timestamp: req.body.timestamp,
      sender: req.body.sender,
    },
    function (err, result) {
      if (err) throw err;
      res.send(result);
    }
  )
});
//Getting uploads
router.get('/', function (req, res, next) {
  collection.find({}).toArray(function (err, result) {
    if (err) throw err;
    res.send(result);
  })
});

module.exports = router;