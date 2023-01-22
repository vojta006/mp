//var input = document.getElementById("prompt");

function makeListOf(map){
    return Array.from(map.keys());
    /*
    var keys = [];
    for(const key in map){
        keys.push(key);
    }
    return keys;*/
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
        this.length = length;
        this.command = command;
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



    //najdeme nejlepsi vyraz 
    handleCommand(sep, listOfPoss){
        
        var l = sep.length;
        var max_score = 0;

/*        for(var poss in listOfPoss){
            
            var splt = poss.split();
            var score = 0;
            for(var i = 0; i < l; i++){ //pro vsechny pocatecni pozice 
                
                for(
                score +=  
            }    
        }*/

        //vyber vhodny prikaz 
        //var command = mostApropriate(command, listOfPoss);
        //zatim budeme uvazovat jednoslovne prikazy

        //zatim uvazujeme jen jednoslovne prikazy
        var length = 0;
        var command = "";

        if(sep.length != 0){
            command = sep[0];
            length = 1;
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
        //this.immutable = immutability; 
        this.fnMap = new Map();
        this.objMap = new Map(); 
        this.fnMap.set("pickUp", this.pickUp);
        this.fnMap.set("drop", this.drop);
        this.fnMap.set("describe", this.describe);
        
    }
    describe(sep){
        println(this.description);
    }

    //navratova hodnota, jestli se zvednuti podarilo - treba jestli neni moc tezka vec
    //standardni funkce pro pickup a drop
    /*pickUp(){
        println("Zvedl jsi " + this.name);
        if(this.pickUpErrorMessage != ''){ println(errorMessage); }
        return true;
    }

    drop(){
        println("Položil jsi " + this.name);
        if(this.varMap.has('dropErrorMessage')){ println(errorMessage); }
        return true;
    }*/
}
class Room{

    constructor(name, description = ""){
        this.objMap = new Map(); //mapa objektů
        this.fnMap = new Map();  //mapa funkcí
        this.description = description;
        this.name = name;
        //this.nbrs = nbrs;
        
        this.fnMap.set("describe", this.describe);

        //funkce, ktere volame na objekty
    }
    
    moveTo(sep, _this){
        var command = sep[0];
        if(neighbours.includes(command)){
            
        }
    }
    
    describe(sep,_this){
        println(_this.description);
    }
    /* listOfObjects(){
        return Array.from(this.mapOfObjects.keys());
    } */
}

//deklarace hry
class Game{

    constructor(){
       // this.parser = new Parser();
        var bag = new Room("batoh");
        this.room = "velin";
       
        this.roomMap = new Map();

        this.fnMap = new Map();

        this.fnMap.set("jdi", this.moveTo);
        this.fnMap.set("popis", this.describe);
        this.fnMap.set("pomoc", this.help );
        this.fnMap.set("poloz", this.drop);
        this.fnMap.set("zvedni", this.pickUp);

    }

    //prikazy budou ve forme - sloveso, slova mezi, (mistnost, predmet, vec);
    inputCommand(text){
        console.log(this);
        if(text == "") return;
        var command = parser.removePunctuation(text);
        var sep = command.split(" ");
        //najdi nejlepsi prikaz
        var retObj = parser.handleCommand(sep, makeListOf(this.fnMap));
        sep = retObj.sep; //novy, zmenseny seznam prikazu 

        if(retObj.command == ""){
            println("Zadal jsi neznámý příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            return;
        }
        console.log(retObj.command);
        //zavolej funkci se zmensenym listem parametru 
        (this.fnMap.get(retObj.command))(sep, this);
        //if(this.fnMap[retObj.command](sep)) println("command se zdařil"); 
    }

    moveTo(sep, _this){
        console.log(_this);
        var toRoom = parser.handleCommand(sep, makeListOf(_this.roomMap));
        
        if(toRoom.length == 0){
            println("Do takové místnosti nemůžeš jít."); 
        } 
    }

    //rovnou presmerovat na room
    pickUp(sep, _this){
        //zvedat objekty budeme v mistnosti
        var obj = parser.handleCommand(sep, makeListOf((_this.roomMap[_this.room]).objMap)); //vrati predmety, ktere se nachazeji v mistnosti 
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

    help(sep, _this){
        println("Tady se časem objeví výpis manuálu.");
        return true; 
    }

    dropObject(sep, _this){
        println("Objetky ještě nejdou brát."); 
    }

    //vypis popis lokality
    describe(sep, _this){
        console.log(_this);
        var rooms = makeListOf(_this.roomMap); 
        var place = parser.handleCommand(sep, rooms);

        //vyzadnovan popis mistnosti, ktery neni
        if(rooms.includes(place.command) && place.command != _this.room){
            println("Jejda, nemáš kouzelné brýle, abys viděl skrz zdi."); 
        }
        if(place.command == "") place.command = _this.room;
        console.log(_this.roomMap.get(place.command));
        var room = _this.roomMap.get(place.command);
        room.fnMap.get('describe')(sep, room);
        //(_this.roomMap.get(place.command)).fnMap.get('describe')(sep);
        //(this.roomMap[command]).fnMap["describe"](sep);
    }

    intro(){
        println("Všude kolem je slyšet hluk z rozehřívání motorů.");
        println("Odpočítávání je připraveno");
        for(let i = 10; i > 0; i--){
            println(i, (10 - i) * 1000);
        }
        println("Je odstartováno.", 11 * 1000);
        println("Najednou se ozve tlumená rána.", 15 * 1000); 
        init(); //nadeklaruj vse 
    }

}



var game = new Game();
var parser = new Parser(); 
//document.addEventListener("keydown", keyPressed);
window.addEventListener("load", game.intro);

function init(){

    game.roomMap.set('velin',new Room("velin", "nejaky popis super husty velina"));
    game.roomMap.set('nakladovy_prostor',new Room('nakladovy_prostor', "nejaky popis nakladoveho prostoru"));
   
    var naklad = game.roomMap.get('nakladovy_prostor');
    naklad.objMap.set("sroubovak", new Objects("sroubovak", "popis sroubovaku")); 

    game.roomMap.get('velin').objMap.set('jablko', new Objects("jablko", "nejaky husty popis jablka"));


    //this.roomMap['velin'].description = " Nějaký super hustý popis velína."; 
    //this.roomMap['dolni pauba'] = " Dalši popis paluby";
    //(game.roomMap.get('velin')).objMap.set("jablko", new Objects("jablko", "Maličkaté kulaťoučké červeňoučké jablíčko.")); 
    //(game.roomMap['velin']).objMap.set("jablko", new Objects("jablko", "Maličkaté kulaťoučké červeňoučké jablíčko.")); 
    //game.roomMap['velin'].objMap.set("hruška", new Objects("hruška", "Maličkaté kulaťoučké červeňoučké hruška.")); 
    //game.roomMap['velin'].objMap.set("ovladač", new Objects("ovladač", "Maličkaté kulaťoučké červeňoučké hruška.")); 

    //game.roomMap['velin'].fnMap.set
}

function keyPressed(e){

    if(e.keyCode == 13){
        var input = document.getElementById('input');
        game.inputCommand(input.value);
        input.value = "";
    }
}
