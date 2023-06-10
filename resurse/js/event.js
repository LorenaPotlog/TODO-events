//de explicat
class Event{

    constructor({denumire,descriere,cost_organizare,cost_total,marime,categorie,servicii_incluse,meniu,plata_vouchere,imagine,anotimp}={}) {

        for(let prop in arguments[0]){
            this[prop]=arguments[0][prop]
        }

    }

}