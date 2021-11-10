var express = require("express");
var router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
var url = "mongodb://localhost:27017/"; // mongodb url information
var userlist = "";

const client = new MongoClient(url);
client.connect();
const dbo = client.db("dashboard"); // selecting database
const collection = dbo.collection("users");

/* GET users listing. */
router.get("/", function (req, res, next) { // GET method
  collection.find({}).toArray(function (err, result) { // using collection users, find users information
    if (err) throw err;
    res.json(result);
  });
});

// router.get("/:id", function (req, res, next) { // GET method - individual record
//   collection.findOne({
//     _id: new ObjectId(req.params.id), // converting string to object id using objectid method
//   },
//     function (err, result) {
//       if (err) throw err;
//       res.json(result);
//     });
// });

router.post("/", function (req, res) { // POST method - add purpose
  // res.send("POST request to homepage")
  collection.insertOne(
    {
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    },
    function (err, result) {
      if (err) throw err;
      res.json(result);
    })
})

// router.put("/", function (req, res) { // PUT method - update purpose
//   // res.send("PUT request to homepage")
//   collection.findOneAndUpdate(
//     { _id: new ObjectId(req.body.id) },
//     {
//       $set: {
//         name: req.body.name,
//         email: req.body.email
//       }
//     }, {
//     upsert: true
//   }
//   )
//     .then(result => res.json(result))
// });

//-----------------------------------------------------------------
// UPDATE SINGLE USER ROUTER
router.put("/:id", function (req, res, next) {
  const updateObject = {
    id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  }
  collection.findOneAndUpdate(
    { _id: new ObjectId(req.params.id) },
    {
      $set: {
        ...updateObject
      }
    }, {
    upsert: true
  }).then(result => res.send({
    data: { ...updateObject, _id: result.value._id }
  }))
});

// GET SINGLE USER ROUTER
router.get("/:id", function (req, res, next) {
  collection.findOne({
    _id: new ObjectId(req.params.id)
  },
    function (err, result) {
      if (err) throw err;
      res.send({ message: "Welcome to GET ONE users route", data: result });
    }
  )
});


// DELETE ROUTER
router.delete("/:id", function (req, res, next) {
  collection.deleteOne(
    {
      _id: new ObjectId(req.params.id),
    },
    function (err, result) {
      if (err) throw err;
      res.send(result);
    }
  );
});

module.exports = router;
