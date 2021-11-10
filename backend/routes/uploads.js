var express = require('express');
var router = express.Router();
var formidable = require('formidable');
const fs = require('fs');
const path = require('path')

const { MongoClient, ObjectId } = require("mongodb")
var url = "mongodb://localhost:27017/";

const client = new MongoClient(url)
client.connect()
const dbo = client.db("dashboard");
const collection = dbo.collection("uploads");

// Get all Uploads
router.get('/', function (req, res, next) {
  collection.find({}).toArray(function (err, result) {
    if (err) throw err;
    res.send(result);
  })
});


// Delete single file
router.delete("/:id", function (req, res, next) {
  collection.deleteOne({
    _id: new ObjectId(req.params.id)
  },
    function (err, result) {
      if (err) throw err;
      res.send({
        result
      });
    }
  )
});

//Get specific edit
router.put("/:id", function (req, res, next) {


  collection.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    {
      $set: {
        id: req.body.id,
        filename: req.body.filename,
        label: req.body.label,
        parent: req.body.parent,
        shared: req.body.shared
      }
    }, {
    upsert: true
  }).then(result => res.send({
    message: "Welcome to UPDATE users route",
    data: { result }
  }))
});

// Edit Uploads
router.put("/:id", function (req, res, next) {
  collection
    .findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          label: req.body.label,
        },
      },
      {
        upsert: true,
      }
    )
    .then((result) => res.json(result));
});

router.post("/files", function (req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {

    const file_id = Number(new Date());
    const getExtension = files.file.originalFilename.split('.').pop();

    var oldpath = files.file.filepath;
    var newpath = `uploads/${file_id}.${getExtension}`;

    fs.copyFile(oldpath, newpath, function (err) {
      if (err) throw err;
      res.send({ file_uploaded: `${file_id}.${getExtension}` });
    });
  });
});

// Upload new file
router.post("/", function (req, res, next) {
  const insertObject = {
    id: req.body.id,
    filename: req.body.filename,
    label: req.body.label,
    parent: req.body.parent,
    uploader_name: req.body.uploader_name,
    uploader_email: req.body.uploader_email,
    shared: []
  }
  collection.insertOne(
    { ...insertObject },
    function (err, result) {
      if (err) throw err;
      res.send({ message: "Welcome to POST uploads route", data: { ...insertObject, _id: result.insertedId, } });
    }
  )
});

//SHARE
router.get("/:id", function (req, res, next) {
  collection.findOne({
    _id: new ObjectId(req.params.id)
  },
    function (err, result) {
      if (err) throw err;
      res.send({
        data: result
      });
    }
  )
});

module.exports = router;