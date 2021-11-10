const Users = require('../models/Users')

module.exports = async () => {
  try {
    const results = await Users.find()

    return results
  } catch (err) {
    return []
  }
}