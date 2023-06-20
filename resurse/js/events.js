window.addEventListener("DOMContentLoaded", function () {

    // To check which works best for range
    document.getElementById("inp-pret").onchange = function () {
      document.getElementById("val_select").innerHTML = `(${this.value})`;
    }
  
    // Filtrarea
    document.getElementById("filter").onclick = function () {
  
      // Inputs
      if (confirm("Are you sure you chose your filters right?")) {
  
        let val_denumire = document.getElementById("inp-denumire").value.toLowerCase();
        let val_pret_total = document.getElementById("inp-pret").value;
        let val_meniu = document.getElementById("inp-event-menu").value.toLowerCase();
  
        let val_pret_org;
        let radioButtons = document.getElementsByName("org-cost");
        for (let rButton of radioButtons) {
          if (rButton.checked) {
            val_pret_org = rButton.value;
            break;
          }
        }
        if (val_pret_org !== "Select all") {
          [cost_a, cost_b] = val_pret_org.split(":");
          var cost_a = parseInt(cost_a);
          var cost_b = parseInt(cost_b);
        }
  
        let val_marime = [];
        let sizes = document.getElementsByName("ev_size");
        for (let size of sizes) {
          if (size.checked) {
            val_marime.push(size.value.toLowerCase());
          }
        }
  
        let val_categorie = document.getElementById("inp-categorie").value;
  
        let val_servicii = "";
        let val_serviciu_selectat = document.getElementById("inp-services").selectedOptions;
        for (let i = 0; i < val_serviciu_selectat.length; i++) {
          val_servicii += val_serviciu_selectat[i].value + ' ';
        }
  
        let val_vouchere;
        let vouc = document.getElementsByName("v_rad");
        for (let v of vouc) {
          if (v.checked) {
            val_vouchere = v.value;
            break;
          }
        }

        debugger
        let inputElement = document.getElementById("inp-descriere");
        let val_descriere = inputElement ? inputElement.value : "";
        var events = document.getElementsByClassName("event");
        console.log(events);
  
        for (let event of events) {
          event.style.display = "none";
          // Values of displayed events
          let denumire = event.getElementsByClassName("val_denumire")[0].innerHTML.toLowerCase();
          let pret_total = parseFloat(event.getElementsByClassName("val_pret_total")[0].innerHTML);
          let meniu = event.getElementsByClassName("val_meniu")[0].innerHTML.toLowerCase();
          let marime = event.getElementsByClassName("val_marime")[0].innerHTML.toLowerCase();
          let categorie = event.getElementsByClassName("val_categorie")[0].innerHTML;
          let pret_org = parseFloat(event.getElementsByClassName("val_pret_org")[0].innerHTML);
          let servicii = event.getElementsByClassName("val_servicii")[0].innerHTML.toLowerCase();
          let vouchere = event.getElementsByClassName("val_vouchere")[0].innerHTML;
          let descriere = event.getElementsByClassName("val_descriere")[0].innerHTML.toLowerCase();
  
          pret_total = parseInt(pret_total);
          pret_org = parseInt(pret_org);
  
          let cond_denumire = (denumire.includes(val_denumire));
          let cond_pret_total = (pret_total > val_pret_total);
          let cond_meniu = (val_meniu === "" || val_meniu === meniu);
          let cond_pret_org = (val_pret_org === "all" || (cost_a <= pret_org && pret_org < cost_b));
          let cond_marime = (val_marime.includes('all')|| val_marime.includes(marime));
          let cond_categorie = (val_categorie === "all" || categorie === val_categorie);
          let cond_servicii = (val_servicii.includes(servicii) || val_servicii.includes("All"));
          let cond_descriere = (descriere.includes(val_descriere));
          let cond_vouchere = (val_vouchere === "all" || vouchere === val_vouchere);
          debugger

          //cond_descriere 

          if (cond_pret_total && cond_meniu && cond_marime && cond_denumire &&
            cond_pret_org && cond_categorie
            && cond_servicii && cond_vouchere) {
            event.style.display = "block";
          } 
        }
      }
    }
  
    // Resetarea filtrelor
    document.getElementById("reset").onclick= function(){
      if(confirm("Are you sure you want to reset the filters?") == true){
        document.getElementById("inp-denumire").value="";
  
        document.getElementById("inp-pret").value=document.getElementById("inp-pret").min;
        document.getElementById("val_select").innerHTML = "(300)";
  
        document.getElementById("inp-event-menu").value = "";
  
        document.getElementById("radio-all").checked=true;
  
        document.getElementById("small").checked = false;
        document.getElementById("medium").checked = false;
        document.getElementById("large").checked = false;
        document.getElementById("x-large").checked = false;
        document.getElementById("any-size").checked = true;
  
        document.getElementById("inp-categorie").value = "Show all";
  
        document.getElementById("inp-services").value="All";
        document.getElementById("inp-services").value="All";
  
        document.getElementById("voucher-radio-1").checked=false;
        document.getElementById("voucher-radio-2").checked=false;
        document.getElementById("voucher-radio-all").checked=true;
        
        document.getElementById("inp-description").value = "";
  
        resetSort();
        
        var events=document.getElementsByClassName("event");
        for (let event of events){
            event.style.display="block";
        }
      }
    }
  
    // Sortare, reset sortare, cresc, descresc
    function sorting(semn) {
      var events = document.getElementsByClassName("event");
      var v_events = Array.from(events);
      v_events.sort(function (a, b) {
        let organization_cost_a = parseInt(a.getElementsByClassName("val_pret_org")[0].innerHTML);
        let organization_cost_b = parseInt(b.getElementsByClassName("val_pret_org")[0].innerHTML);
        
        
        //aici nu se face corect compararea pe marime

        // if (organization_cost_a == organization_cost_b){
        //   let size_a = a.getElementsByClassName("val_marime")[0].innerHTML;
        //   let size_b = b.getElementsByClassName("val_marime")[0].innerHTML;
        //   return semn * size_a.localeCompare(size_b);
        // }


        //dupa ambele costuri
        if (organization_cost_a == organization_cost_b){
          let total_cost_a = parseInt(a.getElementsByClassName("val_pret_total")[0].innerHTML);
          let total_cost_b = parseInt(b.getElementsByClassName("val_pret_total")[0].innerHTML);
          return semn * (total_cost_a - total_cost_b) ;
        }
        
        //dupa denumire
        // if (organization_cost_a == organization_cost_b){
        //   let name_a = a.getElementsByClassName("val_denumire")[0].innerHTML;
        //   let name_b = b.getElementsByClassName("val_denumire")[0].innerHTML;
        //   return semn * name_a.localeCompare(name_b);
        // }
        
        return semn * (organization_cost_a - organization_cost_b);
      })
      for (let event of v_events) {
        event.parentElement.appendChild(event); // luam parentNode care este gridul, si adaugam in el articolul la final. 
        //daca v_products sortat crescator, atunci primul va fi pus la final, al doilea la final, si tot asa
      }
    }
  
    function resetSort() {
      var events = document.getElementsByClassName("event");
      var v_events = Array.from(events);
      v_events.sort(function (a, b) {
        let id_a = parseInt(a.getElementsByClassName("event-id")[0].innerHTML);
        let id_b = parseInt(b.getElementsByClassName("event-id")[0].innerHTML);
        return id_a - id_b;
      })
  
      for (let event of v_events) {
        event.parentElement.appendChild(event);
      }
    }
  
    document.getElementById("sortCresc").onclick = function () {
      sorting(1);
    }
    document.getElementById("sortDescresc").onclick = function () {
      sorting(-1);
    }
  
    //Functie pentru calculul sumei - de facut asta
    window.onkeydown = function(e) {
      if(e.key === "c" && e.altKey) {
        if(document.getElementById("info-sum"))
          return;
        var events = document.getElementsByClassName("event");
        let suma = 0;
        for(let event of events) {
          if(event.style.display !== "none"){
            let org_price = parseFloat(event.getElementsByClassName("val_pret_org")[0].innerHTML);
            suma += org_price;
          }
        }
        suma = suma.toFixed(2);
        let p = document.createElement("p");
        p.innerHTML = suma;
        p.id = "info-sum";
        ps = document.getElementById("sum-total");
        container = ps.parentNode;
        frate = ps.nextElementSibling;
        container.insertBefore(p, frate);
        setTimeout(function(){
          let info = document.getElementById("info-sum");
          if(info)
            info.remove();
        }, 1000);
      }
    }
  });