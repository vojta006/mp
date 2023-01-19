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


//pomocna trida, kterou vracime jako vyhodnoceni priakzu
class ReturnObject{
    constructor(length, sep){
        this.length = length;
        this.sep = sep;
    }
}

class Parser{

     removePunctuation(text){
        const chars = 'áčďéěíňóřšťůúýž';
        const replace = 'acdeeinorstuuyz';

        for(var i = 0; i < chars.length; i++){
            var re = new RegExp(chars[i], 'gi');
            text = text.replace(re, replace[i]);
        }
        return text;
    }
    
    score_word(obraz, vzor){
        var score = 0;
    }

    //vybereme nejvhodnejsi slova
    mostApropriate(sep, set_of_words){
        var command = "";
        for(var word in set_of_words){
            var splitted = word.split(" ");
            for(var i = 0; i < splitted.length; i++){
                if(splitted);          
            }
        }
        //vrati 
        return 
    }

    handleCommand(separatedCommand, listOfPoss){

        //vyber vhodny prikaz 
        //var command = mostApropriate(command, listOfPoss);
        //zatim budeme uvazovat jednoslovne prikazy

        var length = 1;
        var command = separatedCommand[0];

        return new ReturnObject(length, command);
        
    }
}

class Objects{
    constructor(name , description, immutability = false){
        this.name = name;
        this.description = description;
        this.immutable = immutability; 
        //tady jsou uvedeny defaultni funkce, pro predefinovani je nutne u konkretniho objektu funkce prepsat 
        this.fnMap = {
            "pickUp": this.pickUp;
            "drop": this.drop;
            "describe": this.describe;
        }
        //prommenne lze podle potreby pridavat ke konkretnim objektum 
        this.varMap = {
            //"pickUpErrorMessage" : "Nějak se ti nedaří objekt zvednout.",
            //"dropErrorMessage":  "Nějak se ti nedaří objekt položit."
        }
    }
    describe(){
        println(this.description);
    }
    
    //navratova hodnota, jestli se zvednuti podarilo - treba jestli neni moc tezka vec
    //standardni funkce pro pickup a drop
    pickUp(){
        println("Zvedl jsi " + this.name);
        if(this.pickUpErrorMessage != ''){ println(errorMessage); }
        return true;
    }
    
    drop(){
        println("Položil jsi " + this.name);
        if(this.varMap.has('pickUpErrorMessage')){ println(errorMessage); }
        return true;
    }

}
class Room{

    constructor(name, description = ""){
        this.mapOfObjects = new Map();
        this.description = description;
        this.name = name;

        //funkce, ktere volame na objekty
        this.fnMap = { }

        this.mapOfObjects = {}
    }
    listOfObjects(){
        return Array.from(this.mapOfObjects.keys());
    }
}


class Game{

    //deklarace hry
    init(){
        this.roomMap['velin'].description = " Nějaký super hustý popis velína."; 
        this.roomMap['dolni pauba'] = " Dalši popis paluby";
    }

    constructor(){
        this.parser = new Parser();
        this.room = "velin";
        var roomMap = new Map();
        const bag_size = 5;
        var bag = 0;

        for(let room in this.rooms){
            roomMap.set(room, new Room);
        }

        this.fnMap = {
            "jdi": this.changeRoom,
            "zvedni": this.pickUp,
            "pomoc": this.help,
            "poloz": this.drop,
            "prozkoumej": this.describe 
        }
        this.init();
    }
    
    returnCommandList(){ return Array.from(this.fnMap.keys()); }
    returnRoomsList(){ return Array.from(this.roomMap.keys()); }

    //posledni slova by měla být 
    changeRoom(sep){
        var toRoom = parser.mostApropriate(sep, this.returnRoomsList()); 
        if(toRoom.length == 0){
            println("Do takové místnosti nemůžeš jít."); 
        } 
    }

    pickUp(sep){
        var obj = parser.mostApropriate(sep, this.returnRoomsList()); 
        var length = sep.length;
        if(this.bag == bag_size){
            println("Máš plné ruce. Nemůžeš brát další předměty.");
            return;
        }
        //spust parser na veci, ktere jsou okolo
    }

    help(sep){
        println("Tady se časem objeví výpis manuálu.");
    }

    dropObject(sep){
        println("Objetky ještě nejdou brát."); 
    }

    //vypis popis lokality
    describe(sep){
         
        var place = parser.mostApropriate(sep, this.returnCommandList()); 
        if(place.command == "" || place.command == this.room){
            (roomMap[room](sep.slice(place.length))).describe(sep); 
        }
        this.roomMap[this.room]
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

    //prikazy budou ve forme - sloveso, slova mezi, (mistnost, predmet, vec);
    inputCommand(text){
        if(text == "") return;
        var command = parser.removePunctuation(text);
        var sep = command.split(" ");
        //najdi nejlepsi prikaz
        var retObj = parser.handleCommand(sep,this.returnCommandList());
        
        if(command = ""){
            println("Zadal jsi neznámý příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            return;
        }
        //zavolej funkci se zmensenym listem parametru 
        this.fnMap[retObj.command](sep.slice(retObj.length));
    }
}



var game = new Game();
var parser = new Parser(); 
//document.addEventListener("keydown", keyPressed);
window.addEventListener("load", game.intro);

function keyPressed(e){

    if(e.keyCode == 13){
        var input = document.getElementById('input');
        game.handleCommand(input.value);
        input.value = "";
        /*const newDiv = document.createElement('div');
        newDiv.setAttribute("class", "text");
        const newContent = document.createTextNode("tady je super text");
        newDiv.appendChild(newContent);
        document.body.div.insertBefore(newDiv, game);
        */
    }
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
