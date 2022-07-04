const express = require("express");
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.1iw08.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection = client.db("emaJhon").collection("products");
        //geting all products
        app.get('/products',async(req,res)=>{
            const query = {};
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log(page,size);
            const cursor = productCollection.find(query);
            let products;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray();
            }else{
                products = await cursor.toArray();
            }
            res.send(products);
        })
        //get the product length
        app.get('/productsCount',async (req,res)=>{
            const count = await productCollection.estimatedDocumentCount();
            res.send({count});
        })
        //get by ids
        app.post('/productsByIds',async (req,res)=>{
            const ids = req.body;
            const wrapingIds = ids.map(id=>ObjectId(id));
            console.log(ids);
            const query = {_id:{$in:wrapingIds}};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
    }finally{
        //await client.close();
    }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log("listening to ",port);
})