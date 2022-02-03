const { find } = require("../models/postModel");

class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr
    }

    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex : this.queryStr.keyword,
                $options: "i",
            },
        }:{};
        // console.log({...keyword.name})
      
       

        // this.query=this.query.post.filter((rev)=>console.log(rev));
        this.query=this.query.post.filter((rev)=>{
            if({...keyword}){return true};
        });
        // this.query=this.query.post.filter((rev)=>rev.find({...keyword}));
        // this.query=this.query.post.filter((rev)=>rev.name ==={...keyword.name});
        return this;
    }


    filter(){
        const queryCopy = {...this.queryStr};
        // removing some fields for 
        const removeFields=["keyword","page","limit","id"];

        removeFields.forEach((key)=> delete queryCopy[key]);
        //  console.log(queryCopy);
        // console.log(this.query.post)
        if(queryCopy.category){
        this.query.post=this.query.post.filter((rev)=>rev.category === queryCopy.category)}
        // console.log(this);
        return this;
     
    }
    pagignation(resultPerPage){
        
        // console.log( this)
        function limit(c){
            return this.filter((x,i)=>{
            if(i<=(c-1)){return true}
            })
            }
            Array.prototype.limit=limit;
            function skip(c){
                return this.filter((x,i)=>{
                if(i>(c-1)){return true}
                })
                }
                Array.prototype.skip=skip;
        const currentPage=Number(this.queryStr.page)||1;
            
        const skipValue = resultPerPage*(currentPage-1);
        
        // let arr=[1,2,3,4,5,6,7,8]
        // console.log(arr.skip(skipValue).limit(resultPerPage));
        this.query=this.query.post.skip(skipValue).limit(resultPerPage);
        // console.log(this.query.post.limit(resultPerPage));
        return this
    }
}

module.exports = ApiFeatures