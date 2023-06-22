/**
 * Modulul de drepturi introdus pentru diferite roluri generate mai jos.
 * @typedef {import('./drepturi.js')} Drepturi
 */
const Drepturi = require('./drepturi.js');
/**
 * Clasa de baza (parinte) pentru toate rolurile
 */
class Rol {
    /**
     * Returneaza un rol
     * @returns {string} Rolul este de tip string
     */
    static get tip() {
        return "generic"; //nu va fi returnat niciodata, va fi suprascris de copiii care extind clasa parinte
    }

    /**
     * Returneaza drepturile asociate unui rol
     * @returns {Symbol[]} Un rol poate avea mai multe drepturi, deci se va returna un array cu toate drepturile unui rol
     */
    static get drepturi() {
        return [];
    }

    /**
     * Creaza instanta unui rol
     */
    constructor() {
        this.cod = this.constructor.tip;
    }

    /**
     * Verifica daca rolul are un drept specific
     * @param {Symbol} drept - Dreptul verificat
     * @returns {boolean} Returneaza true daca il are si false daca nu
     */
    areDreptul(drept) {
        console.log("In metoda lui Rol");
        return this.constructor.drepturi.includes(drept); //verifica daca dreptul dat in metoda apartine vectorului de drepturi de mai sus
    }
}

/**
 * Clasa pentru rolul de admin
 * @extends Rol
 */
class RolAdmin extends Rol {
    /**
     * Returneaza tipul unui rol
     * @returns {string} Rolul este String
     */
    static get tip() {
        return "admin";
    }

    /**
     * Creaza o instanta pentru rolul de admin
     */
    constructor() {
        super();
    }

    /**
     * Verifica daca admin are drepturi
     * @returns {boolean} Deoarece adminul are toate drepturile, returneaza mereu true
     */
    areDreptul() {
        return true;
    }
}

/**
 * Clasa pentru rolul de moderator
 * @extends Rol
 */
    class RolModerator extends Rol {

        /**
     * Returneaza tipul unui rol
     * @returns {string} Rolul este String
     */
    
   static get tip() {
        return "moderator";
    }

   
    static get drepturi() {
        return [
            Drepturi.vizualizareUtilizatori,
            Drepturi.stergereUtilizatori
        ];
    }

    /**
     * Creaza o instanta pentru rolul de moderator
     */
    constructor() {
        super();
    }
}

/**
 * Clasa pentru rolul de client
 * @extends Rol
 */
class RolClient extends Rol {
   /**
     * Returneaza tipul unui rol
     * @returns {string} Rolul este String
     */
    static get tip() {
        return "common";
    }

    static get drepturi() {
        return [Drepturi.cumparareProduse]; //putem verifica cu metoda de areDreptul daca (drept) se afla in acest array
    }

    /**
     * Creaza o instanta pentur rolul de client
     */
    constructor() {
        super();
    }
}

/**
 * Factory Class pentru a crea mai multe roluri
 */
class RolFactory {
    /**
     * Creaza un rol bazat pe un tip primit ca argument
     * @param {string} tip - asociat unui rol
     * @returns {RolAdmin|RolModerator|RolClient} creaza instanta specifica rolului
     */
    static creeazaRol(tip) {
        switch (tip) {
            case RolAdmin.tip:
                return new RolAdmin(); //drept temporar
            case RolModerator.tip:
                return new RolModerator();
            case RolClient.tip:
                return new RolClient();
        }
    }
}

module.exports = {
    RolFactory: RolFactory,
    RolAdmin: RolAdmin,
    RolModerator: RolModerator,
    RolClient: RolClient
};