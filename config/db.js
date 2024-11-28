const mongoose=require("mongoose")
async function connectDb() {
    try{
        await mongoose.connect(process.env.MONGO_DB_URI)
         
    }
    catch(err){
        console.log(err)
    }
}
module.exports=connectDb;