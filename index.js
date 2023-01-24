const express = require(`express`);
const cors = require(`cors`);
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();


//middleware
app.use(cors())
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i8hxp3j.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 

// jwt verify function
function jwtverify(req, res,next){
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if(!authHeader){
        return res.status(401).send({message: 'unautharized access'})
    }

    const token = authHeader.split(` `)[1]
    //token match koranor kaj kora hoyece
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: `forbidden access`})
        }
        req.decoded = decoded;
        next()
    })

}



async function run(){
    try{
        const servicesCollections = client.db('geniuscar').collection('services')
        const orderCollections = client.db('geniuscar').collection('orders')


        //jwt token emplement:
        app.post('/jwt', (req,res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'})
            res.send({token})
             
        })

        app.get('/services',async(req,res) => {
            const query =  {}
            const cursor = await servicesCollections.find(query).toArray();
            res.send(cursor)
        })

        app.get(`/services/:id`, async(req,res) => {
            const id = req.params.id;
            const query ={_id : ObjectId(id)}
            const services = await servicesCollections.findOne(query)
            res.send(services)
        })
       
        //order create:
        app.post(`/orders`, async(req,res) => {
            const order = req.body;
            const result = await orderCollections.insertOne(order);
            res.send(result)
        })

         //get specific order specific user email 
         app.get(`/orders`, jwtverify, async(req,res) => {
            //console.log(req.query.email);
            //console.log(req.headers.authorization);
            const decoded =req.decoded;
            //console.log(decoded)

            if(decoded.email !== req.query.email){
                res.status(401).send({message: `unathorized acess`})
            }

            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor =  orderCollections.find(query);
            const service = await cursor.toArray();
            res.send(service)

        })

        //delete order:
        app.delete('/orders/:id', async(req,res)=>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)}
            const resualt = await orderCollections.deleteOne(query);
            res.send(resualt)
        })

        //update
        app.patch('/orders/:id', async(req,res) => {
            const id = req.params.id;
            const status = req.body.status;  
            console.log(status)
            const  query = {_id : ObjectId(id)}
            const updateDoc = {
                $set: {
                    status : status
                }
            }
            const resualt = await orderCollections.updateOne(query, updateDoc);
            res.send(resualt)
        })
        
    }
    finally{

    }
}
run().catch(err => console.log(err))






//testing purpose
app.get('/', (req, res) => {
    res.send(`Gineous car service running`)
})

app.listen(port, () => {
    console.log(`the port is running ${port}`);
})