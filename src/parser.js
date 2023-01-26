//var input = document.getElementById("prompt");

function makeListOf(map){ return Array.from(map.keys()); }

document.addEventListener("keydown", (event) => { keyPressed(event); });

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


    //funkce spočítá, jak moc si odpovídají slova
    fits(word1, word2){
        var score = 0;
        //word1 je vstup, word2 je slovo ze hry
        var l = word1.length;
        
        for(var i = 0; i < l - 2; i++){
            if(word2.includes(word1.substring(i, i + 4)) == true){
                return 0;
            }
        }
        return Number.POSITIVE_INFINITY;
    }


    //najdeme nejlepsi vyraz 
    handleCommand(sep, listOfPoss){
        
        var l = sep.length;
        var max_score = 0;
        var minScore =  Number.POSITIVE_INFINITY;//nejaka hodnota pro infinity
        var minInfo;

        for(var j = 0; j < listOfPoss.length; j++){
            var sp = listOfPoss[j].split(" "); //splitneme prikaz mezerami
            for(var i = 0; i < sep.length - sp.length + 1; i++){
                var val = this.fits(sep[i], sp[0]); //testujeme jenom prvni slovo
                if(val < minScore){
                    minScore = val;
                    minInfo = {
                        i: i, //zacatek commandu
                        j: j, //index commandu
                        l: sp.length, //delka prikazu
                    } 
                }
            }
        }
        
        //nejaka konstanta 
        if(minInfo === undefined || minScore > 1000){
            return new ReturnObject(-1, "", sep); //nepovedlo se nic najit
        }
        
        //odstrani vsechna slova, vcetne provedeneho prikazu
        sep = sep.slice(minInfo.i + minInfo.l);

        return new ReturnObject(minInfo.l, listOfPoss[minInfo.j], sep);
    }
}

class Objects{
    constructor(name , description, immutable = false){
        this.name = name;
        this.description = description;
        this.immutable = immutable; 
        this.fnMap = new Map();
        this.objMap = new Map(); 
        this.fnMap.set("pickUp", this.pickUp);
        this.fnMap.set("drop", this.drop);
        this.fnMap.set("describe", this.describe);
        
    }

    describe(sep){
        println(this.description);
    }

    //je zavolano, pokud dany objekt nema nejakou metodu
    errorMessage(sep, _this, command){
        println("Na " + _this.name + "nemůžeš zavolat tento příkaz");
    }

    pickUp(sep, command, _this){
        if(_this.immutable == true){
            println(_this.name + " nemůžeš vzít.");
            return false;
        }
        return true;
    }

     //nejake specialni predmety budou mit vlasnti funkci na dropnuti
    drop(sep, command, _this){ return true; }
}

class Room{

    constructor(name, description = ""){
        this.objMap = new Map(); //mapa objektů
        this.fnMap = new Map();  //mapa funkcí
        this.description = description;
        this.name = name;
        this.nbrs = []; //seznam sousedu
        
        this.fnMap.set("describe", this.describe);
        this.fnMap.set("moveTo", this.moveTo); //zakladni funkce 
        this.fnMap.set("pickUp", this.moveTo); //zakladni funkce 
        this.fnMap.set("drop", this.moveTo); //zakladni funkce 

        //funkce, ktere volame na objekty
    }
    
    moveTo(sep,command, _this){

        if(_this.nbrs.includes(command)){
            return 1;        
        }
        return 0; //neni v seznamu sousedu, nelze se presunout  
    }
   

    //funkce, ktere vraci true, pokud lze objekt zvednout a odebrat
    pickUp(sep, command, _this){
        var object = parser.handleCommand(sep, makeListOf(_this.objMap));
        if(object.command == ""){
            println("Tento objekt bohužel nemáš po ruce.");
            return false;
        }
        return true;
    }
    
    drop(sep,obj, _this){
        return true;    
    }

    describe(sep,_this){
        println(_this.description);
    }
}

//deklarace hry
class Game{

    constructor(){
       // this.parser = new Parser();
        this.bag = new Room("batoh");
        this.room = "velin";
       
        this.roomMap = new Map();
        this.fnMap = new Map();

        this.fnMap.set("jdi", this.moveTo);
        this.fnMap.set("rozhledni se", this.describe);
        this.fnMap.set("pomoc", this.help );
        this.fnMap.set("poloz", this.drop);
        this.fnMap.set("vezmi", this.pickUp);

    }

    //prikazy budou ve forme - sloveso, slova mezi, (mistnost, predmet, vec);
    inputCommand(command){
        if(command == "") return;

        //uprav prikaz
        command = parser.removePunctuation(command);
        command = command.replace(/\s\s+/g, ' '); //odstrani mezery, nahradi za jednu
        var sep = command.split(" "); 
        sep = sep.filter((str) => (str) != ""); //odstranime prazdne stringy

        //najdi nejlepsi funkci
        var retObj = parser.handleCommand(sep, makeListOf(this.fnMap));
        sep = retObj.sep; //novy, zmenseny seznam prikazu 

        if(retObj.command == ""){
            println("Zadal jsi neznámý příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            return;
        }

        //zavolej funkci se zmensenym listem parametru 
        (this.fnMap.get(retObj.command))(sep, this);
    }

    moveTo(sep, _this){
        var toRoom = parser.handleCommand(sep, makeListOf(_this.roomMap));
        
        if(toRoom.length == 0 && sep.length != 0){
            println("Do takové místnosti nemůžeš jít."); 
            return false;
        } 
        //zkontroluj, ze se muzeme presunout do dane mistnosti
        var room = _this.roomMap.get(_this.room);
        console.log(room.name);

        //zachytit navratovy kod
        //presun je mozny
        var state = room.fnMap.get("moveTo")(sep, toRoom.command, room);

        if(toRoom.command == _this.room){
            println("Jsi ve " + _this.room); 
            return; 
        }
        if(state == 1){
            _this.room = toRoom.command;     
            println("Jdeš do " + _this.room);
        }
        else{
            println("To je moc daleko"); 
        }
        console.log(toRoom.command);
    }

    //rovnou presmerovat na room
    pickUp(sep, _this){
        
        if(sep.length == 0){
            println("Musíš uvést, co chceš zvednout");
            return false;
        }

        //zvedat objekty budeme v mistnosti
        var room = _this.roomMap.get(_this.room);
        var state = room.fnMap.get("pickUp")(sep, "", room);
        //var place = parser.handleCommand(sep, rooms);
        state = Math.max(state, _this.bag.fnMap.get("drop")(sep, "", _this.bag));
        

        if(state == true){
            println("Zvedl jsi objekt");
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
    //mistnosti 
    game.roomMap.set('velin',new Room("velin", "Nacháziš se ve velíně raketoplánu. Na palubní desce před tebou červeně blikají nejrůznější přepínače a kontrolky. Alarm poškození levého křídla se rozhoukal vysokým tónem."));
    game.roomMap.set('nakladovy prostor',new Room('nakladovy prostor', "Kolem vidíš sklad nejrůznějšího nářadí. Bohudík je upevněné a nepoletuje si tu jen tak. Po bližším průzkumu se ti uleví. Technici NASA počítali skoro se vším. Na pravé straně se nachází magnetická stěna, na které jsou připevněny veškeré nástroje, které by se mohly hodit - aku vrtačka, plazmová svářečka, dokonce i náhradní keramické destičky."));
    game.roomMap.set('prechodova komora',new Room('prechodova komora', "Místnost tvaru koule o poloměru asi 1,5 metru. Kolem sebe vidíš tlačítka na otevření dveří vedoucí do velína a do volného vesmíru."));
    game.roomMap.set('volny vesmir',new Room('volný vesmír', "Naskytne se ti nádherný výhled na planetu Zemi. Jsou také vidět hvězdy, neboť je zrovna noc. Nejspíš zrovna přelétme nad Tichým oceánem, protože nejsou na Zemi vidět skoro žádná světla."));

    //velin
    game.roomMap.get('velin').objMap.set("vysilacka", new Objects("vysilacka", "Dlouhovnná vysílačka, která slouží ke komunikaci s odletovým střediskem."));
    game.roomMap.get('velin').objMap.set("nabijecka", new Objects("vysilacka", "Nabíječka na vysílačku s univerzálním NASA konektorem."));
    game.roomMap.get('velin').objMap.set("ovládací panel", new Objects("ovládací panel", "Při bližším pohledu na hlavní kontrolní panel na něm vidíš tlačítka.", true));
    game.roomMap.get('velin').nbrs = ["nakladovy prostor", "prechodova komora"];

    //nakladovy prostor
    game.roomMap.get('nakladovy prostor').objMap.set("aku vrtacka", new Objects("aku vrtacka", "Vratčka, kterou jde použít jako elektrický šroubovák. Je poháněná elektřinou z baterie.")); //neni nabita
    game.roomMap.get('nakladovy prostor').objMap.set("pilnik", new Objects("pilnik", "Jemný pilník na železo."));
    game.roomMap.get('nakladovy prostor').objMap.set("sverak", new Objects("sverak", "Jednoduchý svěrák na železo, do kterého jde něco upnout."));
    game.roomMap.get('nakladovy prostor').objMap.set("keramicke desticky", new Objects("keramicke desticky", "Destičky slouží jako vnější ochrana raketoplánu proti vysoké teplotě při přistání."));
    game.roomMap.get('nakladovy prostor').nbrs = ["velin"];
    //game.roomMap.get('nakladovy prostor').objMap.set("skafandr", new Objects("skafandr", "Vesmírný skafandr, sloužící k volného prostoru."));
    
    //prechodova komora
    game.roomMap.get('prechodova komora').objMap.set("skafandr", new Objects("skafandr", "Vesmírný skafandr, sloužící k pohybu ve volném prostoru."));
    game.roomMap.get('prechodova komora').nbrs = ["velin", "volny vesmir"];

    //volny vesmir 
    game.roomMap.get('volny vesmir').objMap.set("raketoplan", new Objects("raketoplán", "Raketoplán v celé své kráse. Jenom křídlo nevypadá dobře.", true));
    game.roomMap.get('volny vesmir').objMap.set("poskozene kridlo", new Objects("poškozené křídlo", "V pravém křídle zeje velká díra - to nevypadá dobře. Takhle by při přistání raketoplán shořel v atmosféře.",true)); //posledni parametr je immutable
    game.roomMap.get('volny vesmir').nbrs = ["prechodova komora"];
}

function keyPressed(e){
    if(e.keyCode == 13){
        var input = document.getElementById('input');
        game.inputCommand(input.value);
        input.value = "";
    }
}
