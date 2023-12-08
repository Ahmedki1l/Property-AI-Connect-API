const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const PORT = 8080;

const uri = "mongodb+srv://PAC-Ahmed:PAC-01556617918@pac.6qbzqpp.mongodb.net/?retryWrites=true&w=majority";
const databaseName = "PAC-MainDatabase";
const collectionName = "Assets";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json());

app.listen(PORT, () => console.log(`Server is live on port ${PORT}`));

app.get('/', (req, res) => {
  res.send('Welcome to PAC API!');
});

app.get('/assets', async (req, res) => {
  try {
    const db = client.db(databaseName);
    const assets = db.collection(collectionName);
    const assetList = await assets.find({}).toArray();
    res.status(200).send(assetList);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Get Asset by id
app.get('/assets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = client.db(databaseName);
    const assets = db.collection(collectionName);

    const asset = await assets.findOne({ _id: parseInt(id, 10) });

    if (asset) {
      res.status(200).send(asset);
    } else {
      res.status(418).send({ message: `Couldn't find an asset with id: ${id}!!` });
    }
  } catch (error) {
    console.error('Error fetching asset by id:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Get asset by location
app.get('/assets/location/:location', async (req, res) => {
  const { location } = req.params;

  try {
    const db = client.db(databaseName);
    const assets = db.collection(collectionName);

    const assetList = await assets.find({ location }).toArray();

    if (assetList.length > 0) {
      res.status(200).send(assetList);
    } else {
      res.status(418).send({ message: `Couldn't find any assets in ${location}!!` });
    }
  } catch (error) {
    console.error('Error fetching assets by location:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Post
app.post('/assets/', async (req, res) => {
  try {
    const { size, location, noOfRooms } = req.body;

    if (!size || !location || !noOfRooms) {
      res.status(418).send({ message: 'please check your entities' });
      return;
    }

    const db = client.db(databaseName);
    const assets = db.collection(collectionName);

    // Get the latest _id from the collection
    const latestDocument = await assets.findOne({}, { sort: { _id: -1 } });
    const latestId = latestDocument ? latestDocument._id : 0;

    const newAsset = { _id: latestId + 1, size, location, noOfRooms };
    await assets.insertOne(newAsset);

    res.send(newAsset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Put
app.put('/assets/:id', async (req, res) => {
  const { id } = req.params;
  const { size, location, noOfRooms } = req.body;

  try {
    const db = client.db(databaseName);
    const assets = db.collection(collectionName);

    const filter = { _id: parseInt(id, 10) };
    const update = { $set: { size, location, noOfRooms } };

    const result = await assets.updateOne(filter, update);

    if (result.modifiedCount === 1) {
      res.send({ message: 'Asset updated successfully!' });
    } else {
      res.status(404).send({ message: `Cannot find an asset with this id: ${id}!!` });
    }
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Delete
app.delete('/assets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = client.db(databaseName);
    const assets = db.collection(collectionName);

    const result = await assets.deleteOne({ _id: parseInt(id, 10) });

    if (result.deletedCount === 1) {
      res.send({ message: 'Asset deleted successfully!' });
    } else {
      res.status(404).send({ message: `Cannot find an asset with this id: ${id}!!` });
    }
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



// Ensure to keep the MongoDB connection open
process.on('SIGINT', () => {
  client.close();
  process.exit();
});
