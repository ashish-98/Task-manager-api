//CRUD

// const mongodb = require('mongodb')
// const ObjectID = mongodb.ObjectID
// const MongoClient = mongodb.MongoClient

const {MongoClient, ObjectID} = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id = new ObjectID()
// console.log(id)
// console.log(id.getTimestamp())

MongoClient.connect(connectionURL, {useUnifiedTopology: true}, (error, client) => {
    if(error) {
      return console.log('Unable to connect')
    }

    const db = client.db(databaseName)
    
    db.collection('users').updateOne({_id: new ObjectID("601187a82f5a4119e43daca2")}, {
      $set: {
        name: "Anurag"
      }
    }).then((result) => {
      console.log(result)
    }).catch((error) => {
      console.log(error)
    })
    

    // db.collection('Tasks').find({completed: false}).toArray((error, users) => {
    //   if(error) {
    //     return console.log('Unable tto fetch')
    //   }
    //   console.log(users)
    // })
})