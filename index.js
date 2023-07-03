const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const {Schema} = require("mongoose")
const app=express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://ukm0z4ujtnlro2iuzy5y:34ydCMV2JyQmtE4BsZ6u@n1-c2-mongodb-clevercloud-customers.services.clever-cloud.com:27017,n2-c2-mongodb-clevercloud-customers.services.clever-cloud.com:27017/bqe4uesqcrbfxgp?replicaSet=rs0",{
    useNewUrlParser: "true",
})
mongoose.connection.on("error", err => {
    console.log("err", err)
  })
  mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected")
  })

app.listen(4000,()=>{
    console.log("Port is Conneced to 4000")
})

const registerSchema=new Schema({
    userid:Number,
    fullname:String,
    city:String,
    State:String,
    pincode:String,
    email:String,
    password:String,
    mobilenumber:String,
    address:String,
    profile_pic:String,
    role:String
},{versionKey:false})

const productSchema={
    productid:Number,
    productName:String,
    productDescription:String,
    productPrice:String, 
    productsize:String,
    productImage1:String,
    productImage2:String,
    productImage3:String,
    keywords:String
}

const cartSchema={
    userid:Number,
    cartid:Number,
    productid:Number,
    productName:String,
    productDescription:String,
    productPrice:String,
    productsize:Number,
    productImage1:String,
    keywords:String
}

const OrderConfirmSchema={
    date:String,
    orderid:String,
    ordereddata:Object,
    userid:Number
}

const placeOrderSchema={
    userid:Number,
    date:String,
    orderid:String,
    ordereddata:Object,
    userDetails:Object,
    orderstatus:String,
    totalamount:Number
}

const registerModel=mongoose.model('register',registerSchema);
const productModel=mongoose.model('products',productSchema);
const cartModel=mongoose.model('cart',cartSchema);
const orderconfirmModel=mongoose.model('orderconfirm',OrderConfirmSchema);
const orderPlacedModel=mongoose.model('orderedproducts',placeOrderSchema);

app.post("/register",async function(req,res){
    const data=new registerModel({
        userid:Math.floor(Math.random() * 10000)+1,
        email:req.body.email,
        password:req.body.password,
        confirmpassword:req.body.confirmpassword,
        mobilenumber:req.body.mobilenumber,
        fullname:'',
        city:'',
        State:'',
        pincode:'',
        address:'',
        profile_pic:"https://res.cloudinary.com/duv7a3tgn/image/upload/v1681654488/pinkdp_vq4l6z.jpg"
    })

    if(req.body.password==req.body.confirmpassword){
        registerModel.find({$or:[{email:req.body.email},{mobilenumber:req.body.mobilenumber}]}).then(async (resp)=>{
            if(resp.length==0){
                await data.save();
                res.json({status:true,message:"Registration was successful !!"});
            }else{
                res.json({status:false,message:"Email or Mobile Number is already registered !!"});
            }
        })
    }else{
        res.json({status:false,message:"Password is not equal to confirm password !!"});
    }
})

app.post("/login",function(req,res){
    registerModel.findOne({$and:[{email:req.body.email},{password:req.body.password}]}).then((resp)=>{
        if(!resp){
            res.json({status:false,message:"Email or password is invalid !!"});
        }else{
            res.json({status:true,userid:resp.userid,message:"Login Successful !"});
        }
    })
})

app.post("/profile",function(req,res){
    registerModel.findOne({userid:req.body.userid}).then((resp)=>{
        if(!resp){
            res.json({status:false,message:"Profile was failed to fetch !!"});
        }else{
            res.json({status:true,data:resp,message:"Profile was fetched Successfully !"});
        }
    })
})

app.post("/changepassword",function(req,res){
    if(req.body.data.newpassword==req.body.data.confirmpassword){
        registerModel.findOne({userid:req.body.userid}).then(async(resp)=>{
            if(resp){
                if(resp.password==req.body.data.oldpassword){
                  const data= await registerModel.findOneAndUpdate({password:req.body.data.oldpassword},{password:req.body.data.newpassword})
                  if(data){
                    res.json({status:true,message:"Password Changed Successfully !!"})
                  }else{
                    res.json({status:false,message:"Failed to change password !!"})
                  }
                }else{
                    res.json({status:false,message:"Old Password Doesn't Match !!"})
                }
            }else{
                res.json({status:false,message:"User Not Found !!"})
            }
        })
    }else{
        res.json({status:false,message:"New password and confrm password doesn't match !!"});
    }
    
})

app.post("/updateprofile",async(req,res)=>{
    var data=await registerModel.findOneAndUpdate({userid:req.body.userid},{$set:{
        fullname:req.body.payload.fullname,
        city:req.body.payload.city,
        State:req.body.payload.State,
        pincode:req.body.payload.pincode,
        email:req.body.payload.email,
        password:req.body.payload.password,
        mobilenumber:req.body.payload.mobilenumber,
        address:req.body.payload.address,
        role:"user",
        profile_pic:req.body.payload.profile_pic,
    }},{new:true})
        if(!data){
            res.json({status:false,message:"Data not found !"})
        }else{
            res.json({status:true,message:"Data was updated successfully !"})
        }
})

app.post("/addproducts",async(req,res)=>{
    const data=new productModel({
        productid:Math.floor(Math.random() * 10000)+1,
        productName:req.body.productName,
        productDescription:req.body.productDescription,
        productPrice:req.body.productPrice,
        productsize:req.body.productsize,
        productImage1:req.body.productImage1,
        productImage2:req.body.productImage2,
        productImage3:req.body.productImage3,
        keywords:req.body.keywords,
    })

    await data.save().then((resp)=>{
        if(resp){
            res.json({status:true,message:"Product Added Successfully !!"});
        }else{
            res.json({status:false,message:"Product was failed to Add !!"});
        }
    })
})

app.post("/getproducts",function(req,res){
    let page=req.body.page;
    let limit=req.body.limit;

    productModel.find().skip(page*limit).limit(limit).then((resp)=>{
        if(resp){
            productModel.find().then((resp)=>{
                res.json({status:true,data:resp,totalcount:resp.length,message:"Product fetched successfully !!"});
            })
        }else{
            res.json({status:false,message:"Products was failed to fetch !!"});
        }
    })
})

app.post("/searchProduct",async (req,res)=>{
    let payload=req.body.search.trim();
    let search = await productModel.find({keywords:{$regex:new RegExp('^'+payload+'.*','i')}}).exec();
    if(search){
        res.json({status:true,data:search,message:"Search Data Fetched !!"})
    }else{
        res.json({status:false,message:"Data was not found !!"})
    }
})

app.post("/getproduct",function(req,res){
    var productid=req.body.productid;
    productModel.findOne({productid:productid}).then((resp)=>{
        if(resp){
            res.json({status:true,data:resp,message:"Product fetched successfully !"});
        }else{
            res.json({status:false,message:"Failed to fetch !!"});
        }
    })
})

app.post("/updateproduct",async(req,res)=>{
    var upddata=await productModel.findOneAndUpdate({productid:req.body.productid},{$set:{
        productName:req.body.data.productName,
        productDescription:req.body.data.productDescription,
        productPrice:req.body.data.productPrice,
        productsize:req.body.data.productsize,
        keywords:req.body.data.keywords,
    }},{new:true})
    if(!upddata){
        res.json({status:false,message:"Product not found !"})
    }else{
        res.json({status:true,message:"Product was updated successfully !"})
    }
})

app.delete("/deleteproduct/:id",async(req,res)=>{
    var deldata=await productModel.findOneAndDelete({productid:req.params.id});
    if(deldata){
        res.json({status:true,message:"Product has been deleted !!"});
    }else{
        res.json({status:false,message:"Product is failed to delete !!"});
    }
})

app.post("/addtocart",function(req,res){
    productModel.findOne({productid:req.body.productid}).then(async(resp)=>{
        if(resp){
            const data=new cartModel({
                userid:req.body.userid,
                cartid:Math.floor(Math.random() * 10000)+1,
                productName:resp.productName,
                productDescription:resp.productDescription,
                productPrice:resp.productPrice,
                productImage1:resp.productImage1,
                productsize:resp.productsize,
                keyword:resp.keyword
            })

            await data.save().then((dbres)=>{
                if(dbres){
                    res.json({status:true,message:"Product Added to the cart !"});
                }else{
                    res.json({status:false,message:"Product was failed to add cart !"});
                }
            })
        }
    })
})

app.post("/cartlist",function(req,res){
    cartModel.find({userid:req.body.userid}).then((resp)=>{
        if(resp){
           res.json({status:true,data:resp,totalCart:resp.length,message:"Cart fetched successfully !!"})
        }else{
            res.json({status:false,message:"Cart was failed to fetch !!"});
        }
    })
})

app.post("/allorderlist",function(req,res){
    orderPlacedModel.find().then((resp)=>{
        if(resp){
            res.json({status:true,data:resp.reverse()})
        }else{
            res.json({status:false,message:"Order Lists Fetching Failed !!"})
        }
    })
})

app.post("/updateorderstatus",async(req,res)=>{
    var update=await orderPlacedModel.findOneAndUpdate({orderid:req.body.orderid},{$set:{orderstatus:req.body.orderstatus}},{new:true});
    if(update){
        res.json({status:true,message:"Status Updated Successfully !"})
    }else{
        res.json({status:false,message:"Status was failed to update !"});
    }
})

app.delete("/removecart/:id",async (req,res)=>{
 const delresp=await cartModel.findOneAndDelete({cartid:req.params.id})
    if(delresp){
        res.json({status:true,message:"Product removed from cart successfully !!"});
    }else{
        res.json({status:false,message:"Product was failed remove from cart !!"});
    }
})

app.post("/orderconfirm",async(req,res)=>{
    const data=new orderconfirmModel({
        date:new Date().toJSON().slice(0,10),
        orderid:Math.floor(Math.random() * 100000000)+1,
        ordereddata:req.body.data,
        userid:req.body.userid
    })

    await data.save().then((resp)=>{
       if(resp){
        res.json({status:true})
       }else{
        res.json({data:false,message:"Something went wrong !"});
       }
    })
})

app.post("/viewdetail",function(req,res){
    orderconfirmModel.findOne({userid:req.body.userid}).then((resp)=>{
        if(resp){
            res.json({status:true,data:resp,message:"Product details fetched successfully !"})
        }else{
            res.json({status:false,message:"Failed to fetch !"})
        }
    })
})

app.post("/placeorder",async (req,res)=>{
    const data=new orderPlacedModel({
        userid:req.body.userid,
        date:req.body.data.date,
        orderid:req.body.data.orderid,
        ordereddata:req.body.data.ordereddata,
        userDetails:req.body.details,
        totalamount:req.body.totalamount,
        orderstatus:"Order Placed Successfully !!"
    })

    await data.save().then(async(resp)=>{
        if(resp){
            res.json({status:true,message:"Your Order has been placed !"})
            await orderconfirmModel.deleteMany();
            await cartModel.deleteMany();
        }else{
            res.json({status:false,message:"Failed !!"});
        }
    })
})

app.post("/myorders",function(req,res){
    orderPlacedModel.find({userid:req.body.userid}).then((resp)=>{
        if(resp){
            res.json({status:true,data:resp.reverse(),message:"Oreders fetched successfully !"})
        }else{
            res.json({status:false,data:resp,message:"Your order list is empty !"})
        }
    })
})
