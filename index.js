const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.shu503b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();

    // DB_USER=career_db_Admin
    // DB_PASSWORD=2iXkpXCPVHMCfvFi
    const jobsCollection = client.db("careerCode").collection("jobs");
    const applicationsCollection = client
      .db("careerCode")
      .collection("applications");
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.get("/applications", async (req, res) => {
      const email = req.query.email;
      const query = { applicant: email };
      const result = await applicationsCollection.find(query).toArray();
      // bad ways
      for (const application of result) {
        const jobId = application.jobId;
        const jobQuery = { _id: new ObjectId(jobId) };
        const job = await jobsCollection.findOne(jobQuery);
        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo;
        application.location = job.location;
      }
      res.send(result);
    });
    app.post("/applications", async (req, res) => {
      const application = req.body;
      const result = await applicationsCollection.insertOne(application);
      res.send(result);
    });

    app.delete("/applications/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await applicationsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Career Code Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
