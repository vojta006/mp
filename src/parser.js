
//var input = document.getElementById("prompt");

function makeListOf(map){
    var keys = [];
    for(const key in map){
        keys.push(key);
    }
    return keys;
}

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
    constructor(length, command, sep){
        game.length = length;
        game.command = command;
        game.sep = sep; 
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

    handleCommand(sep, listOfPoss){

        //vyber vhodny prikaz 
        //var command = mostApropriate(command, listOfPoss);
        //zatim budeme uvazovat jednoslovne prikazy

        //zatim uvazujeme jen jednoslovne prikazy
        var length = 0;
        var command = "";

        if(sep.length != 0){
            command = sep[0];
        }

        sep = sep.slice(length);
        //zmensi command list o 
        return new ReturnObject(length, command, sep);
    }
}

class Objects{
    constructor(name , description, immutability = false){
        this.name = name;
        this.description = description;
        this.immutable = immutability; 
        //tady jsou uvedeny defaultni funkce, pro predefinovani je nutne u konkretniho objektu funk      
        this.fnMap = {
            "pickUp": this.pickUp,
            "drop": this.drop,
            "describe": this.describe,
        }
        //prommenne lze podle potreby pridavat ke konkretnim objektum 
        this.varMap = {
            //"pickUpErrorMessage" : "Nějak se ti nedaří objekt zvednout.",
            //"dropErrorMessage":  "Nějak se ti nedaří objekt položit."
        }
    }
    describe(sep){
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
        if(this.varMap.has('dropErrorMessage')){ println(errorMessage); }
        return true;
    }

}
class Room{

    constructor(name, description = ""){
        this.mapOfObjects = new Map();
        this.description = description;
        this.name = name;
        this.neighbours = [];

        //funkce, ktere volame na objekty
        this.fnMap = {}

        this.objMap = {}
    }
    
    moveTo(sep){
        var command = sep[0];
        if(neighbours.includes(command)){
            
        }
    }

    /* listOfObjects(){
        return Array.from(this.mapOfObjects.keys());
    } */
}

//deklarace hry
function init(){
    //this.roomMap['velin'].description = " Nějaký super hustý popis velína."; 
    //this.roomMap['dolni pauba'] = " Dalši popis paluby";
    this.roomMap['velin'].objMap.set("jablko", new Objects("jablko", "Maličkaté kulaťoučké červeňoučké jablíčko.")); 
    this.roomMap['velin'].objMap.set("hruška", new Objects("hruška", "Maličkaté kulaťoučké červeňoučké hruška.")); 
    this.roomMap['velin'].fnMap.set
}

class Game{


    constructor(){
        this.parser = new Parser();
        var roomMap = new Map();
        var bag = new Room("batoh");
        //var hand = new Room("
        this.room = "dolni paluba";


        this.roomMap = {
            "velin": new Room("velin", "nejaky popis"),
            "dolni paluba": new Room("dolni paluba", "popis dolni paluby")
        }

        this.fnMap = {
            "jdi": this.changeRoom,
            "zvedni": this.pickUp,
            "pomoc": this.help,
            "poloz": this.drop,
            "prozkoumej": this.describe 
        }
        init();
    }

    //posledni slova by měla být 
    moveTo(sep){
        var toRoom = parser.mostApropriate(sep, makeListOf(this.roomMap));
        if(toRoom.length == 0){
            println("Do takové místnosti nemůžeš jít."); 
        } 
    }

    //rovnou presmerovat na room
    pickUp(sep){
        //zvedat objekty budeme v mistnosti
        var obj = parser.mostApropriate(sep, makeListOf((this.roomMap[this.room]).objMap)); //vrati predmety, ktere se nachazeji v mistnosti 
        sep = obj.sep;

        if(obj.command == ""){
            println("Musíš uvést, jaký předmět chceš zvednout.");
            return;
        }

        //mozna by mohlo nastavit nejakou promennou stav, jestli se zvednuti podarilo
        this.roomMap[this.room].fnMap["pickUp"](sep); 
        //jestli se podarilo umisteni do batohu
        this.roomMap[this.bag].fnMap["drop"](sep); 

        //pokud se podarilo predmet zvednou i polozit
        if(true){
            var element = this.roomMap[this.room].objMap[obj.command]; 
        }

        var length = sep.length;
        if(this.bag == bag_size){
            println("Máš plné ruce. Nemůžeš brát další předměty.");
            return;
        }
        //spust parser na veci, ktere jsou okolo
    }

    help(sep){
        println("Tady se časem objeví výpis manuálu.");
        return true; 
    }

    dropObject(sep){
        println("Objetky ještě nejdou brát."); 
    }

    //vypis popis lokality
    describe(sep){
        var rooms = makeListOf(this.roomMap); 
        var place = parser.mostApropriate(sep, rooms);

        //vyzadnovan popis mistnosti, ktery neni
        if(rooms.includes(place.command) && place.command != this.room){
            println("Jejda, nemáš kouzelné brýle, abys viděl skrz zdi."); 
        }
        (this.roomMap[command]).fnMap["describe"](sep);
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
        var retObj = parser.handleCommand(sep, makeListOf(this.fnMap));
        sep = retObj.sep; //novy, zmenseny seznam prikazu 

        if(retObj.command = ""){
            println("Zadal jsi neznámý příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            return;
        }
        //zavolej funkci se zmensenym listem parametru 
        if(this.fnMap[retObj.command](sep)) println("command se zdařil"); 
    }
}



var game = new Game();
var parser = new Parser(); 
//document.addEventListener("keydown", keyPressed);
window.addEventListener("load", game.intro);

function keyPressed(e){

    if(e.keyCode == 13){
        var input = document.getElementById('input');
        game.inputCommand(input.value);
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
