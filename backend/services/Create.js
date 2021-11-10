const Users = require('../models/Users')

module.exports = async (dataObj) => {
  try {
    await Users.insertMany(dataObj)

    return true
  } catch (err) {
    return false
  }
}