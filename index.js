const express = require('express');
const path=require('path');
const fs = require('fs');
const sharp = require('sharp')

obGlobal={
    errors:[],
    obImages:[]
}

app=express();

console.log('(Directorul curent) Calea folderului in care se gaseste fisierul index.js:', __dirname);//o sa vrem sa concatenam mereu cu dirname
console.log('Calea fisierului curent:', __filename);
console.log('Folderul curent de lucru:', process.cwd()); // folderul la care sunt caile relativ. daca rulez index.js din alt folder, toate caile for fi relative la acel folder

//creare foldere

vFolders=["temp"];
for(let folder of vFolders){
let rpath =  path.join(__dirname, folder);
if(!fs.existsSync(rpath)){
    fs.mkdirSync(rpath);
}
}

app.set("view engine","ejs");
app.use("/resurse",express.static(path.join(__dirname,"resurse")))

// app.get("/ceva", function(req,res){
// res.send("altceva")
// }); 
//post pt formulare si de trimitere de date
//put pt editare si delete pt stergere


app.get(["/index", "/", "/home"], function(req, res){
    res.render("pagini/index", {ip:req.ip, images: obGlobal.obImages.images});
});
//pentru erori 

function initErrors(){
    let errorInput = fs.readFileSync(path.join(__dirname,"resurse/json/errors.json").toString("utf8"));
    let obJson=JSON.parse(errorInput);
    for(let error of obJson.info_errors){
        error.image=obJson.base_path + "/"+ error.image;
    }
    obGlobal.errors = obJson;
    obJson.default_error.image=obJson.base_path + "/"+ obJson.default_error.image;
}

function displayError(res, _identifier=-1, {_title, _text, _image}={}){
    let vErrors = obGlobal.errors.info_errors
    let error = vErrors.find(function(elem){
        return elem.identifier==_identifier
    })
    if(error){
        let title1 = _title || error.title;
        let text1 = _text || error.text;
        let image1 = _image || error.image;
        if(error.status){
            res.status(_identifier).render("pagini/error",{title:title1,text:text1,image:image1})
        } else {
            res.render("pagini/error",{title:title1,text:text1,image:image1})
        }
    } else {
        let errDefault = obGlobal.errors.default_error
        let title1 = _title || errDefault.title;
        let text1 = _text || errDefault.text;
        let image1 = _image || errDefault.image;
        res.render("pagini/error",{title:title1,text:text1,image:image1})
    }

}

initErrors();

//Pentru galeria statica

function initImages(){
    var imagesInput = fs.readFileSync(__dirname+"/resurse/json/gallery.json").toString("utf-8");
    
    obGlobal.obImages = JSON.parse(imagesInput);
    let vImages =  obGlobal.obImages.images;

    // d = new Date("25 April 2023 12:00:00");

    // for(let imag of obGlobal.obImages.imagini){
    //     if(imag.timp && (d.getHours() >= 5 && d.getHours() < 12 && imag.timp.includes("dimineata")) ||
    //         (d.getHours() >= 12 && d.getHours() < 20 && imag.timp.includes("zi")) ||
    //         ((d.getHours() >= 20 || d.getHours() < 5) && imag.timp.includes("noapte"))) {
    //         vImagini.push(imag);
    //     }
    // }

    let absPath = path.join(__dirname, obGlobal.obImages.gallery_path);
    let absPathMedium = path.join(absPath, "medium");
    let absPathSmall = path.join(absPath, "small");

    if(!fs.existsSync(absPathMedium))
        fs.mkdirSync(absPathMedium);
    
    if(!fs.existsSync(absPathSmall))
        fs.mkdirSync(absPathSmall);

    
    for(let img of vImages) {
        [imageName, ext] = img.image_path.split(".");
        let imageAbsPath = path.join(absPath, img.image_path);
        let imageAbsPathMedium = path.join(absPathMedium, imageName+".webp");
        let imageAbsPathSmall = path.join(absPathSmall, imageName+".webp");
        sharp(imageAbsPath).resize(400).toFile(imageAbsPathMedium);
        sharp(imageAbsPath).resize(200).toFile(imageAbsPathSmall);

        img.image_path_medium = "/" + path.join(obGlobal.obImages.gallery_path, "medium" ,imageName+".webp");
        img.image_path_small = "/" + path.join(obGlobal.obImages.gallery_path, "small" ,imageName+".webp");
        img.image_path =path.join(obGlobal.obImages.gallery_path, img.image_path);
    }
}
initImages();

app.get("/favicon.ico",function(req,res){
    res.sendFile(path.join(__dirname, "resurse/ico/favicon.ico"))
})

app.get("/*.ejs", function(req, res){ 
    displayError(res, 400);
})


//not working well /^\/resurse(\/[a-zA-Z0-9]*)*$/
app.use("/resurse/:subfolder*?", function(req, res){ 
    displayError(res, 403);
}) 

/* err = eroare, output = rezultatRandare */
app.get("/*",function(req,res){
    res.render("pagini"+req.url, function (err, output){
        if(err){
            console.log("Error",err)
            if(err.message.startsWith("Failed to lookup view")){
                displayError(res,404);
            } else
                displayError(res);
        } else {
            res.send(output)
        }
    });
})


app.listen(8080, () => {
    console.log('The app is running on 8080');
  });