//import * as mujsoubor from 'game.js';



//var input = document.getElementById("prompt");

document.addEventListener("keydown", (event) => {
    keyPressed(event); 
});

//vypise text do div hra
function println(text, delay = 0){
    delay = 0; 
    if(delay != 0){
        setTimeout(()=> { println(text)}, delay); 
    }
    else{
        var obj = document.getElementById('game');
        obj.innerHTML += text + "<br>";
    }    
}

class Objects{
    constructor(name , description){
        this.name = name;
        this.description = description;
    }
    
}

class Room{

    constructor(name, description, items){
        this.description = description;
        this.name = name; 
        this.items = items;
        this.directions = dir;
    }
}

class Game{
    
    constructor(){
        this.rooms = ["velin", "dolni pauba", "nakladovy prostor", "horni paluba"];
        this.commands = ['jdi', 'zvedni', 'pomoc', 'polož', 'rozhlédni se'];
       // this.state = false;//nelze prijimat prikazy 
    }
    
    intro(){
        println("Všude kolem je slyšet hluk z rozehřívání motorů.");
        println("Odpočítávání je připraveno");
        for(let i = 10; i > 0; i--){
            println(i, (10 - i) * 1000);
        }
        println("Je odstartováno.", 11 * 1000);
        println("Najednou se ozve tlumená rána.", 15 * 1000); 
    }

    command(text){
        text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
        console.log(text);
        const sep = text.split(" ");
        var size = sep.length;
    }    

}



var game = new Game(); 
//document.addEventListener("keydown", keyPressed);
window.addEventListener("load", game.intro);

function mojefunkce(){

    var promenna = document.getElementById('game');
    promenna.innerHTML = 'posílám zprávu';
}


//document.body.onload = addElement;
//window.addEventListener("load", init);
//document.addEventListener("submit", validate);

// var input = document.getElementById("input").value;
// console.log(input);
/*
function insert_before(before_div, text){
    const currentDiv = document.getElementById(before_div);
    const section = document.getElementById("console");
    const newDiv = document.createElement('div');
    newDiv.setAttribute("class", "text");
    const newContent = document.createTextNode(text);
    newDiv.appendChild(newContent);
    section.insertBefore(newDiv, currentDiv);
} */



function keyPressed(e){
//    var game = document.getElementById("game");

    if(e.keyCode == 13){
        var input = document.getElementById('input');
        println(input.value);
        //parse
        game.command(input.value); 
        input.value = "";
        /*const newDiv = document.createElement('div');
        newDiv.setAttribute("class", "text");
        const newContent = document.createTextNode("tady je super text");
        newDiv.appendChild(newContent);
        document.body.div.insertBefore(newDiv, game);
        */
    }

    /*if(e.keyCode == 8){
        game.innerHTML = game.innerHTML.slice(0, game.innerHTML.length - 1);
    }
    else{
    
        var  cont = document.getElementById("game");
        cont.innerHTML += event.key; 
    }*/
}
/*function init(){

    //check if cookie exists
    //pokud ne - vypis uvodni informace 
    //vypsat nejake nove informace
    //document.getElementById("console").innerHTML = "novy text";
    insert_before("prompt", "Vitej v textove hre.");
}

function validate(){
    //let x = document.forms["user_input"]["input"].value;
        insert_before("prompt", x);
}

*/
/*
    var hodnota = document.getElementById("string").value;
    document.getElementById("prompt").innerHTML = hodnota;
    //var data = new FormData();
    //data.append("neco", document.getElementById("string").value);
    //for (let [k, v] of data.entries()) { console.log(k, v); }

    //insert_before("prompt", user_input);
    //parse
    //actions
}*/
