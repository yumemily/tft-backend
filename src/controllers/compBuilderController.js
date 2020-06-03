const catchAsync = require("../utils/catchAsync")
const CompBuild = require("../models/compBuild")
const mongoose = require("mongoose")

exports.createComp = catchAsync(async function (req, res, next) {
    const { comp, title } = req.body
    const id = req.user._id
    console.log(id)
    const data = await CompBuild.create({ comp, title, user: id });
    res.status(201).json({ status: "success", data: data });
});

exports.getComps = catchAsync(async (req,res)=>{
    const comps = await CompBuild.find({}).sort("-createdAt")
    .populate("user", "-password -__v -tokens -createdAt -updatedAt")
    .sort("-createdAt")

    res.json({status: "success", data: comps})
});

exports.readComps = catchAsync(async function (req, res, next) {
    function testing(query) {
      query.populate("user", "-password -__v -tokens -createdAt -updatedAt")
      return query
    }
    const filters = { ...req.query };
    delete filters.page;
    delete filters.size;
    delete filters.sort;
    console.log(filters)
  
    // building query
    let querys = CompBuild.find(filters) // most important line in this function
    let query = testing(querys)
    console.log("query", req.query)
    if (req.query.sort) {
      query.sort(req.query.sort) //
    };
  
    // pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.size * 1 || 10;  // query.size
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit); // skip 1, limit 1
  
  
    // checking if the page user provided out of range of the results
    const countComps = await CompBuild.find(filters).countDocuments()
  
    if (req.query.page && skip > countComps)
      return next(new AppError(400, "Page number out of range"))
  
    // execute
    const comps = await query.sort(req.query.sort); //????
    res.json({ status: "success", data: comps , total:countComps}); // add countTours as well
  
  });

exports.getComp = catchAsync(async(req,res)=>{
    const id = req.params.id
    const comp = await CompBuild.findById(id)
    res.json({status: "success", data: comp})
})

exports.createFavorite = catchAsync( async(req,res)=>{
    const id = req.params.id
    const check  = await CompBuild.exists({_id:id, favorited: req.user._id})
    let response
    if (!check){
         response = await CompBuild.updateOne({_id: id}, {
             $addToSet: {favorited: req.user._id},
             $inc :{ count: 1}
            })
    } else {
         response = await CompBuild.updateOne({_id: id}, {
             $pull: {favorited: req.user._id},
            $inc :{ count: -1}
           })
    }
    
    console.log(response)
    // if !response.ok
    res.json({status: "success", data:response})
    
})

exports.getFavorites = catchAsync( async(req,res)=>{
    console.log("sadasdsa");
    // console.log(req.user.id)
    const favorites = await CompBuild.find({favorited: (req.user._id)})
    .populate("user", "-password -__v -tokens -createdAt -updatedAt")
    console.log(favorites);
      
    res.json({status: "success", data: favorites});
})

//count and users
//everytime you save, increase count by 1 and then push user id to users
//if user is already in array, remove from array

//user: req.user._id