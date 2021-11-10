const Users = require('../models/Users')

module.exports = async (_id, set) => {
  try {
    await Users.update({ _id }, { $set: set })

    return true
  } catch (err) {
    return false
  }
}