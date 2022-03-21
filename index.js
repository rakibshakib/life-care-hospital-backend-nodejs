const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8000;
const ObjectID = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const res = require('express/lib/response');

require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

// connecting to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_CLUSER}/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const lifeCareHospital = client.db('life_care_hospital');
        const hospitalServices = lifeCareHospital.collection('service_data');
        const patientAppoinment =
            lifeCareHospital.collection('patientAppoinment');
        const userData = lifeCareHospital.collection('userData');
        const feedback = lifeCareHospital.collection('feedback');

        // get all data from service collection
        app.get('/all-services', async (req, res) => {
            const cursor = hospitalServices.find({});
            const allServices = await cursor.toArray();
            res.send(allServices);
        });
        // get a single service details
        app.get('/all-service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const service = await hospitalServices.findOne(query);
            res.send(service);
        });
        // delete a seervice from website
        app.delete('/all-service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await hospitalServices.deleteOne(query);
            res.json(result);
        });

        // post patien appoinment order to database
        app.post('/add-appoinments', async (req, res) => {
            const appoinment = req.body;
            const result = await patientAppoinment.insertOne(appoinment);
            res.json(result);
        });
        // get all appoinemnt data for admin
        app.get('/all-appoinments', async (req, res) => {
            const cursor = patientAppoinment.find({});
            const allApoinment = await cursor.toArray();
            res.send(allApoinment);
        });
        // user appoinment
        app.post('/my-appoinment', async (req, res) => {
            try {
                const email = req.body.email;
                const cursor = patientAppoinment.find({ email: email });
                const myOrder = await cursor.toArray();
                res.status(200).json(myOrder);
            } catch (error) {
                res.status(404).json({
                    message: error.message,
                });
            }
        });
        // delete appoinments 
        // delete one order by admin || Delete method
        app.delete('/all-appoinments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await patientAppoinment.deleteOne(query);
            res.json(result);
        });
        // post user data from ui
        app.post('/users-data', async (req, res) => {
            const user = req.body;
            const result = await userData.insertOne(user);
            res.json(result);
        });
        // update data for google login user
        app.put('/users-data', async (req, res) => {
            const user = req.body;
            const filterUser = { email: user.email };
            const options = { upsert: true };
            const updateUser = { $set: user };
            const result = await userData.updateOne(
                filterUser,
                updateUser,
                options
            );
            res.json(result);
        });
        // check user admin or not
        // get user data for verifying if he/she is admin
        app.get('/users-data/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email: email };
            const user = await userData.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // add review form user
        app.post('/feedback', async (req, res) => {
            const userReview = req.body;
            const result = await feedback.insertOne(userReview);
            res.json(result);
        });
        // get review for ui
        app.get('/all-feedback', async (req, res) => {
            const cursor = feedback.find({});
            const allReviews = await cursor.toArray();
            res.send(allReviews);
        });
        // update feedback
        // update status data from manageORder
        app.patch('/update-feedback', async (req, res) => {
            const { _id } = req.body;
      
            const updateFeedback = await feedback.findOneAndUpdate(
                { _id: ObjectID(_id) },
                { $set: { status: 'approved' } },
                { returnOriginal: false }
            );
            res.status(200).json(updateFeedback);
        });
        // // update a service
        // app.patch('/update-service', async(req, res)=> {

        // })
        console.log('connteting to database......');
    } finally {
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hospital management server is running...');
});
app.listen(port, () => {
    console.log(`Listening server at: `, port);
});
