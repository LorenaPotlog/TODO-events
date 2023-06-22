const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');
require("dotenv").config();
const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const user = `${process.env.USER}`;
const pass = `${process.env.PASS}`;


class Utilizator {
    static tipConexiune = "local"; //conexiune
    static tabel = "utilizatori" //de unde luam datele
    static parolaCriptare = "tehniciweb"; //cu ce criptam parolele
    static emailServer = "test.proiecttw.lorena@gmail.com";
    static lungimeCod = 64; //lungime parola
    static numeDomeniu = "localhost:8080";
    #eroare;
/**

Creaza instanta unui utilizator

@constructor

@param {string} id - The user ID.
@param {string} username - The username.
@param {string} nume - The last name.
@param {string} prenume - The first name.
@param {string} email - The email address.
@param {string} parola - The password.
@param {string} rol - The role.
@param {string} [culoare_chat="black"] - The chat color.
@param {string} poza - The profile picture.
*/
    constructor({ id, username, nume, prenume, email, parola, rol, culoare_chat = "black", poza } = {}) {
        this.id = id;

        //optional sa facem asta in constructor
        try {
            if (this.checkUsername(username))
                this.username = username;
        }
        catch (e) { this.#eroare = e.message }

        for (let prop in arguments[0]) {
            this[prop] = arguments[0][prop]
        } //seteaza toate prop pt user this.username etc
        if (this.rol)
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol); //fie obiect de tip rol (cod), sau dupa string
        console.log(this.rol);

        this.#eroare = "";
    }

    /**

Verifica daca numele este valid
@param {string} nume - Numele verificat
@returns {boolean} - Daca este valid returneaza TRUE, altfel retunreaza FALSE
    */

    checkName(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    /**
Seteaza numele userului.
@param {string} nume - Numele setat
@throws {Error} Arunca eroare daca numele este invalid
    */
    set setareNume(nume) {
        if (this.checkName(nume)) this.nume = nume
        else {
            throw new Error("Nume gresit")
        }
    }

    checkUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    /*
    * folosit doar la inregistrare si modificare profil
    */
   /**
Seteaza username  userului.
@param {string} username - username setat
@throws {Error} Arunca eroare daca username este invalid
    */
    set setareUsername(username) {
        if (this.checkUsername(username)) this.username = username
        else {
            throw new Error("Username gresit")
        }
    }

/**

Metoda pentru criptarea parolei
@param {string} parola - Parola introdusa de user
@returns {string} - Parola criptata
*/
    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex"); //hexazecimale
    }

    /**

Salveaza userul in baza de date
*/

    salvareUtilizator() {
        let parolaCriptata = Utilizator.criptareParola(this.parola);
        let utiliz = this;
        let token = parole.genereazaToken(100);
        AccesBD.getInstanta(Utilizator.tipConexiune).insert({
            tabel: Utilizator.tabel,
            campuri: {
                username: this.username,
                nume: this.nume,
                prenume: this.prenume,
                parola: parolaCriptata,
                email: this.email,
                culoare_chat: this.culoare_chat,
                cod: token,
                // poza: this.poza
            }
        }, function (err, rez) {
            if (err)
                console.log(err);

            utiliz.trimiteMail("Te-ai inregistrat cu succes", "Username-ul tau este " + utiliz.username,
                `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`,
            ) //text in html vs text in mail
        });
    }
    //xjxwhotvuuturmqm
/**

Trimite email userului daca s-a inregistrat cu succes
@async

@param {string} subiect - Subiectul email-ului

@param {string} mesajText -  Mesajul text al email-ului

@param {string} mesajHtml -  Mesajul HTML al email-ului

@param {Array} [atasamente=[]] -  Atasamente email-ului
*/

    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {//date login 
                user: Utilizator.emailServer,
                pass: "zkxruxxjyddhmvcp"
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        //genereaza html
        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email, //TO DO
            subject: subiect,//"Te-ai inregistrat cu succes",
            text: mesajText, //"Username-ul tau este "+username
            html: mesajHtml,// `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
            attachments: atasamente
        })
        console.log("trimis mail");
    }
/**

Gaseste un utilizator dupa username asincron 
@static
@async
@param {string} username - usernameul cautat
@returns {Utilizator|null} - Returneaza utilizatorul sau null daca nu este gasit
*/
    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync(
                {
                    tabel: "utilizatori",
                    campuri: ['*'],
                    conditiiAnd: [`username='${username}'`]
                });
            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0])
            }
            else {
                console.log("getUtilizDupaUsernameAsync: Nu am gasit utilizatorul");
                return null;
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }

    }
    /**
Gaseste un utilizator dupa username
@static
@param {string} username - usernameul cautat
@param {Object} obparam - Parametrii ? 
@param {Function} proceseazaUtiliz - Functia care proceseaza utilizatorii (callback function)
*/
    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;
        let eroare = null;
        AccesBD.getInstanta(Utilizator.tipConexiune).select({ tabel: "utilizatori", campuri: ['*'], conditiiAnd: [`username='${username}'`] }, function (err, rezSelect) {
            let u = null;
            if (err) {
                console.error("Utilizator:", err);
                // console.log("Utilizator", rezSelect.rows.length);
                //throw new Error()
                eroare = -2;
            }
            else if (rezSelect.rowCount == 0) {
                eroare = -1;
            }
            //constructor({id, username, nume, prenume, email, rol, culoare_chat="black", poza}={})
            else {
                console.log(rezSelect.rows[0])
                u = new Utilizator(rezSelect.rows[0])
            }
            console.log(u)

            proceseazaUtiliz(u, obparam, eroare); //u - utilizator creat, obparam - suplimentar, eroare in caz de eroare
        });
    }

    /**

Verifica daca userul are anumite drepturi
@param {string} drept - Drepturile verificate
@returns {boolean} - Returneaza TRUE daca are dreptul respectiv si FALSE in caz contrar
*/

    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}
module.exports = { Utilizator: Utilizator }