const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port=process.env.PORT||5000;



app.use(cors({
    origin: 'http://localhost:5173' // Add your frontend's origin here
}));
  app.use(express.json());


  const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qmgfwvr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const productsCollection = client.db("jobtaskDB").collection("products");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.get('/products',async(req,res)=>{
        const page = parseInt(req.query.page) || 1; // Default to 1 if not provided
        const limit = parseInt(req.query.limit) || 9;

        const skip = (page-1)*limit;
        const searchQuery = req.query.searchItem || ''; // Get the search query
        const categoryName = req.query.category || '';
        const brandNameQuery =req.query.brand || '';
        try {
            const query = {
                ...(searchQuery && { productName: { $regex: searchQuery, $options: 'i' } }),
                ...(brandNameQuery && { brand: { $regex: brandNameQuery, $options: 'i' } }),
                ...(categoryName && { category: { $regex: categoryName, $options: 'i' } }),
                // price: { $gte: minPrice, $lte: maxPrice }
              };
            const products = await productsCollection.find(query).skip(skip).limit(limit).toArray();
            console.log(products.length)
            // Count the total number of products
    const totalProducts = await productsCollection.estimatedDocumentCount(query);
    console.log('totalproducts:',totalProducts)
    res.json({
        products,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        totalProducts
      });
    
        } catch (error) {
            res.status(500).send('Error fetching products');
        }
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

  app.get('/',(req,res)=>{
    res.send('jobtask is sitting')
  })
  app.listen(port,()=>{
    console.log(`jobtask is sitting on port:${port}`)
  })