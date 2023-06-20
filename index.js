const express = require('express');
const path=require('path');
const fs = require('fs');
const sharp = require('sharp')
const sass = require('sass')
const ejs = require('ejs')
const {Client} = require('pg')
const { randomInt } = require("crypto");

const AccesBD = require('./resurse/js/module_proprii/accesbd.js');
const { Utilizator } = require("./resurse/js/module_proprii/utilizator.js");
const session = require('express-session');
const Drepturi = require("./resurse/js/module_proprii/drepturi.js");
const formidable = require("formidable");

const request = require("request");

// const QRCode= require('qrcode');
// const puppeteer=require('puppeteer');
// const mongodb=require('mongodb');

AccesBD.getInstanta().select({
        tabel: "evenimente",
        campuri: ["denumire", "cost_organizare", "marime"],
        conditiiAnd: ["cost_organizare>150"]
    }, function (err, rez) {
        console.log(err);
        console.log(rez);
    }
)

AccesBD.getInstanta()

var client= new Client({database:"proiect_web",
    user:"lorena",
    password:"lorena",
    host:"localhost",
    port:5432});
client.connect();

obGlobal={
    errors:[],
    obImages:[],
    folderScss: path.join(__dirname, "resurse/scss"),
    folderCss: path.join(__dirname, "resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
    menuOptions: []
}

const app=express();//construim practic app prin express(), de acolo ne luam metodele din express.js
app.use(session({ // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: 'abcdefg',//folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false
  }));
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

let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
if(!fs.existsSync(caleBackup)) {
    fs.mkdirSync(caleBackup, {recursive: true});
}

// ../ urc un nivel, ajung la folderul care il cuprinde, ./folderul curent

//compilare Scss

function compileazaScss(caleScss, caleCss) {
    console.log("cale:", caleCss);
    if(!caleCss){
        // let vectorCale = caleScss.split("\\");
        // let numeFisExt = vectorCale[vectorCale.length - 1];
        let numeFisExt = path.basename(caleScss);
        let numeFis = numeFisExt.split(".")[0];
        caleCss = numeFis + ".css";
    }
    if (!path.isAbsolute(caleScss))
        caleScss = path.join(obGlobal.folderScss, caleScss); //incerc sa il caut in locul unde stiu ca avem toate sassurile
    if (!path.isAbsolute(caleCss))
        caleCss = path.join(obGlobal.folderCss, caleCss);
    // let vectorCale = caleCss.split("\\");
    // numeFisCss = vectorCale[vectorCale.length - 1];

    let numeFisCss = path.basename(caleCss);
    if(fs.existsSync(caleCss)) {
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, numeFisCss)) //verific daca nu cumva e in folderul css, ii fac copie in backup ca sa nu suprascriu ceva important
    }
    rez = sass.compile(caleScss, {sourceMap: true}); //transforma scss in css. am obtinut stringul css
    fs.writeFileSync(caleCss, rez.css)
}

vFisiere = fs.readdirSync(obGlobal.folderScss); //citeste fisierele din folderul scss (vectorul de fisiere)
for(let numeFis of vFisiere) {
    if(path.extname(numeFis) === ".scss") {
        compileazaScss(numeFis); //daca e scss, atunci compilam scss (aici putem adauga data modificarii)
    }
}

//daca modific un fisier scss, el verific incontinuu daca sunt modificate - "watch it"
fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
    console.log(eveniment, numeFis);
    // if(numeFis[numeFis.length - 1] === "~" || path.extname(numeFis) !== "scss")
    //     return;
    if(eveniment === "change" || eveniment === "rename") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if(fs.existsSync(caleCompleta)) {
            compileazaScss(caleCompleta);
        }
    }
})


app.set("view engine","ejs"); //setam view engine ul sa fie EJS
app.use("/resurse",express.static(path.join(__dirname,"resurse")))
app.use("/node_modules",express.static(path.join(__dirname,"node_modules"))) //am facut node_modules static


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
    let errorInput = fs.readFileSync(path.join(__dirname,"resurse/json/errors.json")).toString("utf8");
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
    let vImages = []; 
    
    let count = 0
    let d = new Date();
    for (let img of obGlobal.obImages.images){
        function check_time(time) {
        let startTime = time.split("-")[0].split(":")
        let endTime = time.split("-")[1].split(":")

        return (
                (d.getHours() > startTime[0] || d.getHours() == startTime[0] && d.getMinutes() >= startTime[1]) &&
                (d.getHours() < endTime[0] || d.getHours() == endTime[0] && d.getMinutes() <= endTime[1])
            );
        }

        if ((img.time && check_time(img.time) || !img.time) && count++ <= 10){
            vImages.push(img);
        }
    }
    
    obGlobal.obImages.images = vImages;

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

//galerie animata
app.get("/portfolio", function (req, res) {

    // la fiecare request al paginii generam un nr random de imagini
    let nrImagini = randomInt(6, 12);
    if (nrImagini % 2 == 0) nrImagini++;

    // vectorul cu imaginile de la sfarsit la inceput
    let imgInv = [...obGlobal.obImages.images].reverse();

    // citim fisierul scss si il impartim in linii
    let fisScss = path.join(__dirname, "resurse/scss/animated-gallery.scss");
    let liniiFisScss = fs.readFileSync(fisScss).toString().split("\n");

    let stringImg = "$nrImg: " + nrImagini + ";";

    // stergem prima linie ( cea cu nr vechi de imagini )
    liniiFisScss.shift();

    // scriem pe prima linie numarul nou de imagini
    liniiFisScss.unshift(stringImg);

    // scriem in fisierul scss
    // se va compila automat din functia compileaza_scss cand se schimba
    fs.writeFileSync(fisScss, liniiFisScss.join("\n"));

    res.render("pagini/portfolio.ejs", {
        imagini: obGlobal.obImages.images,
        nrImagini: nrImagini,
        imgInv: imgInv
    });
});

//baza de date
app.get("/events", function(req, res){
    let restComanda="where 1=1";
    if(req.query.category){
        restComanda+=` and categorie='${req.query.category}'`
    }
    console.log(restComanda);
    client.query(`select * from evenimente ${restComanda}`, function(err, rezEvents){
        if (err) {
            console.log(err);
            displayError(res, 400);
        } else {
            client.query('SELECT DISTINCT categorie FROM evenimente;', function(err, rezCategories) {
                if (err) {
                    console.log(err);
                    displayError(rezCategories, 400);
                } else {
                    client.query('SELECT DISTINCT meniu FROM evenimente;', function(err, rezMeniu) {
                        if (err) {
                            console.log(err);
                            displayError(rezMeniu, 400);
                        } else {
                            client.query('SELECT DISTINCT marime FROM evenimente;', function(err, rezMarime) {
                                if (err) {
                                    console.log(err);
                                    displayError(rezMarime, 400);
                                } else {
                                    client.query('SELECT MIN(cost_total) as minV, MAX(cost_total) as maxV FROM evenimente;', function(err, rezCost) {
                                        if (err) {
                                            console.log(err);
                                            displayError(rezCost, 400);
                                        } else {
                                            client.query('SELECT DISTINCT plata_vouchere FROM evenimente;', function(err, rezVouchere) {
                                                if (err) {
                                                    console.log(err);
                                                    displayError(maxrezVouchereCost, 400);
                                                } else {
                                                    console.log(rezVouchere.rows.map(item => item.plata_vouchere));
                                                    res.render("pagini/events", {
                                                        events: rezEvents.rows, options:rezEvents.rows,
                                                        categories: rezCategories.rows.map(item => item.categorie), 
                                                        menuItems: rezMeniu.rows.map(item => item.meniu),
                                                        eventSizes: rezMarime.rows.map(item => item.marime),
                                                        minCost: rezCost.rows[0].minv,
                                                        maxCost: rezCost.rows[0].maxv,
                                                        voucherOptions: rezVouchere.rows.map(item => item.plata_vouchere)
                                                    });       
                                                }
                                            })          
                                        }
                                    })     
                                }
                            })     
                        }
                    })
                }
            })
        }
    })
})

app.get("/event/:id", function(req, res){
    console.log(req.params)
    client.query(`select * from evenimente where id=${req.params.id}`, function(err, rez){
        if(err){
            displayError(res,404)
        }
        res.render("pagini/event", {event: rez.rows[0]})
    })
})

client.query("select * from unnest(enum_range(null::categ_eveniment))", function(err, rezCategorie) {
    if (err) {
        console.log(err);
    }
    else{
        let vOptions = [];
        for(let categ of rezCategorie.rows) {
            vOptions.push(categ.unnest);
        }
        obGlobal.menuOptions = vOptions;
    }
});

///////////////////////// Utilizatori

app.post("/inregistrare",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm();
    formular.parse(req, function(err, campuriText, campuriFisier ){//4
        console.log("Inregistrare:",campuriText);

        console.log(campuriFisier);
        var eroare="";

        var utilizNou=new Utilizator();
        try{
            utilizNou.setareNume=campuriText.nume;
            //utilizNou.setareUsername=campuriText.username;
            utilizNou.username=campuriText.username;
            utilizNou.email=campuriText.email
            utilizNou.prenume=campuriText.prenume
            
            utilizNou.parola=campuriText.parola;
            utilizNou.culoare_chat=campuriText.culoare_chat;
            utilizNou.poza= campuriFisier.poza.originalFilename;
            Utilizator.getUtilizDupaUsername(campuriText.username, {}, function(u, parametru ,eroareUser ){
                if (eroareUser==-1){//nu exista username-ul in BD
                    utilizNou.salvareUtilizator();
                }
                else{
                    eroare+="Mai exista username-ul";
                }

                if(!eroare){
                    res.render("pagini/inregistrare", {raspuns:"Inregistrare cu succes!"})
                    
                }
                else
                    res.render("pagini/inregistrare", {err: "Eroare: "+eroare});
            })
            

        }
        catch(e){ 
            console.log(e.message);
            eroare+= "Eroare site; reveniti mai tarziu";
            console.log(eroare);
            res.render("pagini/inregistrare", {err: "Eroare: "+eroare})
        }
    



    });
    formular.on("field", function(nume,val){  // 1 
	
        console.log(`--- ${nume}=${val}`);
		
        if(nume=="username")
            username=val;
    }) 
    formular.on("fileBegin", function(nume,fisier){ //2
        console.log("fileBegin");
		
        console.log(nume,fisier);
		//TO DO in folderul poze_uploadate facem folder cu numele utilizatorului
        // let folderUser=path.join(__dirname, "poze_uploadate",username);
        folderUser=__dirname+"/poze_uploadate/"+username
        console.log(folderUser);
        if (!fs.existsSync(folderUser))
            fs.mkdirSync(folderUser);
        // fisier.filepath=path.join(folderUser, fisier.originalFilename)
        fisier.filepath=folderUser+"/"+fisier.originalFilename

    })    
    formular.on("file", function(nume,fisier){//3
        console.log("file");
        console.log(nume,fisier);
    }); 
});


app.post("/login",function(req, res){
    var username;
    console.log("ceva");
    var formular= new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier ){
        Utilizator.getUtilizDupaUsername (campuriText.username,{
            req:req,
            res:res,
            parola:campuriText.parola
        }, function(u, obparam ){
            let parolaCriptata=Utilizator.criptareParola(obparam.parola);
            if(u.parola==parolaCriptata && u.confirmat_mail ){
                // u.poza=u.poza?path.join("poze_uploadate",u.username, u.poza):"";
                debugger
                obparam.req.session.utilizator=u;
                obparam.res.locals.utilizator=u;
                
                obparam.req.session.succesLogin="Bravo! Te-ai logat!";
                obparam.res.redirect("/index");
                // obparam.res.render("/login");
            }
            else{
                obparam.req.session.succesLogin="Date logare incorecte sau nu a fost confirmat mailul!";
                obparam.res.redirect("/index");
            }
        })
    });
});


app.post("/profil", function(req, res){
    console.log("profil");
    if (!req.session.utilizator){
        randeazaEroare(res,403,)
        res.render("pagini/eroare_generala",{text:"Nu sunteti logat."});
        return;
    }
    var formular= new formidable.IncomingForm();
 
    formular.parse(req,function(err, campuriText, campuriFile){
       
        var parolaCriptata=Utilizator.criptareParola(campuriText.parola);
        // AccesBD.getInstanta().update(
        //     {tabel:"utilizatori",
        //     campuri:["nume","prenume","email","culoare_chat"],
        //     valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
        //     conditiiAnd:[`parola='${parolaCriptata}'`]
        // },  
        AccesBD.getInstanta().updateParametrizat(
            {tabel:"utilizatori",
            campuri:["nume","prenume","email","culoare_chat"],
            valori:[`${campuriText.nume}`,`${campuriText.prenume}`,`${campuriText.email}`,`${campuriText.culoare_chat}`],
            conditiiAnd:[`parola='${parolaCriptata}'`]
        },          
        function(err, rez){
            if(err){
                console.log(err);
                randeazaEroare(res,2);
                return;
            }
            console.log(rez.rowCount);
            if (rez.rowCount==0){
                res.render("pagini/profil",{mesaj:"Update-ul nu s-a realizat. Verificati parola introdusa."});
                return;
            }
            else{            
                //actualizare sesiune
                console.log("ceva");
                req.session.utilizator.nume= campuriText.nume;
                req.session.utilizator.prenume= campuriText.prenume;
                req.session.utilizator.email= campuriText.email;
                req.session.utilizator.culoare_chat= campuriText.culoare_chat;
                res.locals.utilizator=req.session.utilizator;
            }
 
 
            res.render("pagini/profil",{mesaj:"Update-ul s-a realizat cu succes."});
 
        });
       
 
    });
});



/******************Administrare utilizatori */
app.get("/useri", function(req, res){
   
    if(req?.utilizator?.areDreptul?.(Drepturi.vizualizareUtilizatori)){
        AccesBD.getInstanta().select({tabel:"utilizatori", campuri:["*"]}, function(err, rezQuery){
            console.log(err);
            res.render("pagini/useri", {useri: rezQuery.rows});
        });
    }
    else{
        displayError(res, 403);
    }
});


app.post("/sterge_utiliz", function(req, res){
    if(req?.utilizator?.areDreptul?.(Drepturi.stergereUtilizatori)){
        var formular= new formidable.IncomingForm();
 
        formular.parse(req,function(err, campuriText, campuriFile){
           
                AccesBD.getInstanta().delete({tabel:"utilizatori", conditiiAnd:[`id=${campuriText.id_utiliz}`]}, function(err, rezQuery){
                console.log(err);
                res.redirect("/useri");
            });
        });
    }else{
        displayError(res,403);
    }
})




app.get("/logout", function(req, res){
    req.session.destroy();
    res.locals.utilizator=null;
    res.render("pagini/logout");
});



//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token",function(req,res){
    console.log(req.params);
    try {
        Utilizator.getUtilizDupaUsername(req.params.username,{res:res,token:req.params.token} ,function(u,obparam){
            AccesBD.getInstanta().update(
                {tabel:"utilizatori",
                campuri:{confirmat_mail:'true'}, 
                conditiiAnd:[`cod='${obparam.token}'`]}, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        displayError(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        displayError(res,2);
    }
})



///////////////////////////////////////////////////////////////////////////////////////////////
//////////////// Contact - de modificat contactul
caleXMLMesaje="resurse/xml/contact.xml";
headerXML=`<?xml version="1.0" encoding="utf-8"?>`;
function creeazaXMlContactDacaNuExista(){
    if (!fs.existsSync(caleXMLMesaje)){
        let initXML={
            "declaration":{
                "attributes":{
                    "version": "1.0",
                    "encoding": "utf-8"
                }
            },
            "elements": [
                {
                    "type": "element",
                    "name":"contact",
                    "elements": [
                        {
                            "type": "element",
                            "name":"mesaje",
                            "elements":[]                            
                        }
                    ]
                }
            ]
        }
        let sirXml=xmljs.js2xml(initXML,{compact:false, spaces:4});//obtin sirul xml (cu taguri)
        console.log(sirXml);
        fs.writeFileSync(caleXMLMesaje,sirXml);
        return false; //l-a creat
    }
    return true; //nu l-a creat acum
}


function parseazaMesaje(){
    let existaInainte=creeazaXMlContactDacaNuExista();
    let mesajeXml=[];
    let obJson;
    if (existaInainte){
        let sirXML=fs.readFileSync(caleXMLMesaje, 'utf8');
        obJson=xmljs.xml2js(sirXML,{compact:false, spaces:4});
        

        let elementMesaje=obJson.elements[0].elements.find(function(el){
                return el.name=="mesaje"
            });
        let vectElementeMesaj=elementMesaje.elements?elementMesaje.elements:[];// conditie ? val_true: val_false
        console.log("Mesaje: ",obJson.elements[0].elements.find(function(el){
            return el.name=="mesaje"
        }))
        let mesajeXml=vectElementeMesaj.filter(function(el){return el.name=="mesaj"});
        return [obJson, elementMesaje,mesajeXml];
    }
    return [obJson,[],[]];
}


app.get("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();

    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:mesajeXml})
});

app.post("/contact", function(req, res){
    let obJson, elementMesaje, mesajeXml;
    [obJson, elementMesaje, mesajeXml] =parseazaMesaje();
        
    let u= req.session.utilizator?req.session.utilizator.username:"anonim";
    let mesajNou={
        type:"element", 
        name:"mesaj", 
        attributes:{
            username:u, 
            data:new Date()
        },
        elements:[{type:"text", "text":req.body.mesaj}]
    };
    if(elementMesaje.elements)
        elementMesaje.elements.push(mesajNou);
    else 
        elementMesaje.elements=[mesajNou];
    console.log(elementMesaje.elements);
    let sirXml=xmljs.js2xml(obJson,{compact:false, spaces:4});
    console.log("XML: ",sirXml);
    fs.writeFileSync("resurse/xml/contact.xml",sirXml);
    
    res.render("pagini/contact",{ utilizator:req.session.utilizator, mesaje:elementMesaje.elements})
});
///////////////////////////////////////////////////////


app.use("/*", function (req, res, next) {
    res.locals.menuOptions = obGlobal.menuOptions;
    next();
});

app.get("/*.ejs", function(req, res){ 
    displayError(res, 400);
})

//use merge pentru toate tipurile de cerere
app.use(/^\/resurse(\/[a-zA-Z0-9]*)*$/, function(req, res){ 
    displayError(res, 403);
}) 

/* err = eroare, output = rezultatRandare */
app.get("/*",function(req,res){
    // if(req.url.match(/^\/resurse(\/[a-zA-Z0-9]*)*\/?/g)){
    //     displayError(res, 403);
    // }
    try { 
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
    })
    }
    catch(e){
        console.log("Error: " + e)
        if(e.message.startsWith("Cannot find module")){
            displayError(res,404);
        }else
        displayError(res);
    }
});

app.listen(8080, () => {
    console.log('The app is running on 8080');
  });