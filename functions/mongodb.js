const { MongoClient } = require('mongodb');
var db

MongoClient.connect('mongodb://localhost:27017/', {useNewUrlParser: true}, (err, client) => {
  db = client.db('bdgdc')
});

module.exports = {
  findOne: async (collectionName, searchParms, returnParms) =>{
    const collection = db.collection(collectionName)
    return await collection.findOne(searchParms, returnParms)
  },
  insertOne: async (collectionName, json) => {
    const collection = db.collection(collectionName)
    return await collection.insertOne(json)
  },
  find: async (collectionName, searchParms, returnParms, cursor, lim) =>{
    const collection = db.collection(collectionName)
    return await collection.find(searchParms, returnParms).sort({$natural: -1}).skip(cursor).limit(lim).toArray()
  },
  deleteOne: async (collectionName, searchParms) => {
    const collection = db.collection(collectionName)
    return await collection.deleteOne(searchParms)
  },
  updateOne: async (collectionName, searchParms, upDateParms) => {
    const collection = db.collection(collectionName)
    return await collection.updateOne(searchParms, upDateParms)
  }
}