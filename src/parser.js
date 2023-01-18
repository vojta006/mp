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
       // this.directions = dir;
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
}

class Game{

    //deklarace hry
    init(){
        // this.errorMsg.set('jdi', {missing_argument: "Jdi očekával 3 argumenty."});
    }
    constructor(){
        this.rooms = ["velin", "dolni pauba", "nakladovy prostor", "horni paluba"];
        this.commands = ['jdi', 'zvedni', 'pomoc', 'poloz', 'rozhledni se', 'prozkoumej'];
        this.parser = new Parser();
        this.room = "velin"; 
        var roomMap = new Map();
        const bag_size = 5;
        var bag = 0;
        //this.intro();

        for(let room in this.rooms){
            roomMap.set(room, new Room); 
        } 

        this.fnMap = {
            "jdi": this.changeRoom,
            "zvedni": this.pickUp,
            "pomoc": this.help,
            "poloz": this.drop,
            "rozhledni se": this.describe //mozna tu ma byt carka
        }
    }



    //posledni slova by měla být 
    changeRoom(command){

    }

    pickUp(sep){
        var length = sep.length;
        if(this.bag == bag_size){
            println("Máš plné ruce. Nemůžeš brát další předměty.");
            return;
        }
        //spust parser na veci, ktere jsou okolo
    }

    help(separated){
        println("Tady se časem objeví výpis manuálu.");
    }

    drop(){
        
    }

    //vypis popis lokality
    describe(){}

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
    handleCommand(command){
        command = this.parser.removePunctuation(command);
        
        const sep = command.split(" ");
        var size = sep.length;
        if(!game.commands.includes(sep[0])){
            println("Zadal jsi neplatný příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            return;
        }
        this.fnMap[sep[0]](sep); 
    }
}



var game = new Game(); 
//document.addEventListener("keydown", keyPressed);
window.addEventListener("load", game.intro);

function keyPressed(e){

    if(e.keyCode == 13){
        var input = document.getElementById('input');
        //println(input.value);
        //parse
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
