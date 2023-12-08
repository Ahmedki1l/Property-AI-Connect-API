const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json())

app.listen(
  PORT,
  () => console.log(`it's live on port ${PORT}`)
)

//variables
const assets = require('./Models/Assets');


///Methods
//GET
app.get('/', (req, res)=>{
  res.send('Welcome to PAC API!');
})

app.get('/assets', (req, res) =>{
  res.status(200).send(assets);
})

//Get Asset by id
app.get('/assets/:id', (req, res)=>{
  const {id} = req.params;
  const asset = assets.find((e)=>e.id == id);
  console.log(asset);
  if(asset){
    res.status(200).send(asset);
  }
  else{
    res.status(418).send({message: `Couldn't find an asset with id: ${id}!!`});
  }
})

//Get asset by location
app.get('/assets/location/:location', (req, res)=>{
  const {location} = req.params;
  const asset = assets.filter((e)=>e.location == location);
  console.log(asset);
  if(asset){
    res.status(200).send(asset);
  }
  else{
    res.status(418).send({message: `Couldn't find an asset in ${location}!!`});
  }
})

//Post
app.post('/assets/', (req, res)=>{
  let id;
  assets.forEach(element => {
    id = element.id;
  });
  id++;
  const {size, location, noOfRooms} = req.body;

  if(!size || !location || !noOfRooms){
    res.status(418).send({ message: 'please check your entities' })
  }

  let newAsset = {id, size, location, noOfRooms};
  assets.push(newAsset);

  res.send(assets);
})

//Post
app.put('/assets/:id', (req, res)=>{
  const {id} = req.params;
  const {size, location, noOfRooms} = req.body;
  let index = assets.findIndex((e)=>e.id == id);
  if(index !== -1){
    let updatedAsset = assets[index] = {id:id, size: size, location: location, noOfRooms: noOfRooms};
    res.send({message: `asset updated successfully!`, updatedAsset});
  }
  else{
    res.status(404).send({message:`cannot find an asset with this id!!`});
  }
})

//Delete
app.delete('/assets/:id', (req, res)=>{
  const {id} = req.params;
  let index = assets.findIndex((e)=>e.id == id);
  if(index !== -1){
    const deletedAsset = assets.splice(index, 1)[0];
    res.send({message: `asset deleted successfully!`, deletedAsset});
  }
  else{
    res.status(404).send({message:`cannot find an asset with this id!!`});
  }
})