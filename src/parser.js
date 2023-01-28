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
    constructor(name , description, helpMsg = "", immutable = false){
        this.name = name;
        this.description = description;
        this.immutable = immutable; 
        this.helpMsg = helpMsg; //zobrazi se pri zadani napovedy k predmetu
        this.fnMap = new Map();
        this.objMap = new Map(); 
        this.callFn = new Map(); //mapa funkci, ktere lze zavolat na objekt
    
        this.fnMap.set("pickUp", this.pickUp);
        this.fnMap.set("drop", this.drop);
        this.fnMap.set("describe", this.describe);
        this.fnMap.set("help", this.help);
         
    }

    describe(_this){
        println(_this.description);
    }

    //command from a to
    pickUp(where, _this){
        if(_this.immutable == true){
            println(_this.name + " nemůžeš vzít.");
            return 1;
        }
        return 0;
    }

    drop(where, _this){
        return true;
    }

    //zobrazi napovedu k predmetu
    help(_this){
        println(_this.helpMsg);
    }

     //nejake specialni predmety budou mit vlasnti funkci na dropnuti
    drop(sep, command, _this){ return true; }
}

class Room{

    constructor(name, description = "", helpMsg = ""){
        this.objMap = new Map(); //mapa objektů
        this.fnMap = new Map();  //mapa funkcí
        this.description = description;
        this.name = name;
        this.nbrs = []; //seznam sousedu
        this.helpMsg = helpMsg;
        if(this.helpMsg == "")
            this.helpMsg = "Pro " + this.name + " neexisuje nápověda.";
            
        this.fnMap.set("describe", this.describe);
        this.fnMap.set("moveTo", this.moveTo); //zakladni funkce 
        this.fnMap.set("moveFrom", this.moveFrom); //zakladni funkce 
        this.fnMap.set("pickUp", this.pickUp); //zakladni funkce 
        this.fnMap.set("drop", this.drop); //zakladni funkce 
        this.fnMap.set("help", this.help); //zakladni funkce 

        //funkce, ktere volame na objekty
    }
    
    moveFrom(sep, where, _this){
        if(_this.nbrs.includes(where)){
            return 0; //muzeme se presunout
        }
        return 1;
    }
    
    help(sep, _this){
        
        //zobraz napovedu k mistnosti
        if(sep.length == 0){
            println(_this.helpMsg);
            return;
        }

        var obj = parser.handleCommand(sep, makeListOf(_this.objMap));

        //neznamy objekt
        if(obj.command == ""){
            return false;
        }

        //vypis napovedu pro objekt 
        var object = _this.objMap.get(obj.command);
        object.fnMap.get("help")(object);
        return true;
    }

    moveTo(sep,command, _this){
        return 1;
        /*
        if(_this.nbrs.includes(command)){
            return 1;        
        }
        return 0; //neni v seznamu sousedu, nelze se presunout  
        */
    }
   

    //funkce, ktere vraci true, pokud lze objekt zvednout a odebrat
    pickUp(sep, _this){
        var object = parser.handleCommand(sep, makeListOf(_this.objMap));
        if(object.command == ""){
            println("Tento objekt bohužel nemáš po ruce.");
            return {
                obj: undefined,
                res: 1
            };
        }

        var obj = _this.objMap.get(object.command);
        var stat = obj.fnMap.get("pickUp")(sep, obj);

        return {
            obj: _this.objMap.get(object.command),
            res: stat
        };
    }

    //v teto mistnosti chceme odlozit dany objekt
    drop(object, _this){
        var object = _this
        return object.fnMap.get("drop")(_this, object); 
    }

    describe(sep,_this){
        if(sep.length == 0) {println(_this.description); return;}
        var object = parser.handleCommand(sep, makeListOf(_this.objMap));
        if(object.command == ""){
            return false;
        }
        var obj = _this.objMap.get(object.command);
        obj.fnMap.get("describe")(obj);
        return true;
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
        this.fnMap.set("popis", this.describe);
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

        //nestandardni prikazy na veci, ktere mame v ruce - v batohu
        if(retObj.command == ""){
            //pokud bag umi prijimat prikazy 
            var thisRoom = this.roomMap.get(this.room);

            if(this.bag.fnMap.has("command") && this.bag.fnMap("command")(sep, this.bag) == false){
                println("Zadal jsi neznámý příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            }
        }
        else{ //zavolej funkci se zmensenym listem parametru 
            this.fnMap.get(retObj.command)(sep, this);
        }
    }

    moveTo(sep, _this){
        
        if(sep.length == 0){
            println("Musíš zadat parametr.");
            return false;
        } 
        var toRoom = parser.handleCommand(sep, makeListOf(_this.roomMap));
        if(toRoom == ""){
            println("Nenašli jsme odpovídající místnost");
        }

        if(toRoom.command == _this.room){
            println("Jsi ve " + _this.room); 
            return; 
        }

        //zkontroluj, ze se muzeme presunout do dane mistnosti
        var thisRoom = _this.roomMap.get(_this.room);
        
        //zachytit navratovy kod
        //presun je mozny
        var state = thisRoom.fnMap.get("moveFrom")(sep, toRoom.command, thisRoom);
        //není sousední 
        if(state == 1){ println("Můžeš se přesovat pouze do sousedních místností."); return; }

        //chyba vznikla nekde v objektu - napr jsou zamcene dvere 
        if(state == 2){ return; }
        
        var nbrRoom = _this.roomMap.get(toRoom.command); 
        
        state = nbrRoom.fnMap.get("moveTo")(sep, toRoom.command, nbrRoom);

        if(state == 2) return; //jsou napr. zamcene dvere 
        
        _this.room = toRoom.command;     
        println("Jdeš do " + _this.room);
    }

    //rovnou presmerovat na room
    pickUp(sep, _this){
        
        if(sep.length == 0){
            println("Musíš uvést, co chceš vzít.");
            return false;
        }

        //zvedat objekty budeme v mistnosti
        var room = _this.roomMap.get(_this.room);
        var stateObj = room.fnMap.get("pickUp")(sep, "", room);

        if(stateObj.res == 1){
            //chybová hláška by měla být už vypsána
            return; 
        }
        //bag bude mít speciálně implementovanou funkci drop
        var state = _this.bag.fnMap.get("drop")(stateObj.obj, _this.bag);

        if(state == false) return;
        
        //premisti vec
        var obj = room.objMap.get(stateObj.obj);
        room.objMap.delete(stateObj.obj);
        _this.bag.objMap.set(stateObj.obj, obj);
        println("Objekt sebrán.");
    }

    help(sep, _this){

        //vypis vseobecnou napovedu
        if(sep.length == 0){
            println("Tady se časem objeví výpis manuálu.");
            return; 
        }
        var room = parser.handleCommand(sep, makeListOf(_this.roomMap));
        sep = room.sep;

        /*if(room.command == "batoh"){
            _this.bag.fnMap.get("help")(sep, _this.bag);
            return;
        }*/
        var thisRoom = _this.roomMap.get(_this.room);
        if(room.command == _this.room){
            thisRoom.fnMap.get("help")(sep, thisRoom); 
            return;
        }
        //napoveda pro nejaky pokoj, ktery neni v dosahu
        if(room.command != ""){
            println("Nápovědu můžeš zobrazit jen pro místo, na kterém jsi."); 
            return;
        }

        //zkusime zavolat na objekty batohu a aktualniho pokoje
        if(thisRoom.fnMap.get("help")(sep, _this.bag) == true){ //podarilo se vypsat napovedu na nejaky objekt
            return;
        }
        //zkusime predmety z batohu
        if(_this.bag.fnMap.get("help")(sep, _this.bag) == true){ return; }
        println("Žádný takový objekt jsme nenašli.");
    }

    drop(sep, _this){

        if(sep.length == 0){
            println("Musíš uvést, co chceš položit.");
            return false;
        }
        
        var result = _this.bag.fnMap.get("pickUp")(sep, _this.bag);
        if(state == 1) return; //z nejakeho duvodu nejde objekt polozit
        
        //zvedat objekty budeme v mistnosti
        var room = _this.roomMap.get(_this.room);
        var stateObj = room.fnMap.get("drop")(sep, "", room); //jestli muzeme objekt odlozit

        if(stateObj.res == 1){
            //chybová hláška by měla být už vypsána
            return; 
        }
        //bag bude mít speciálně implementovanou funkci drop

        //objekt nejde odlozit
        if(state.res == 1)
            return; 
        if(state == 2) return;
        
        //premisti vec
        var obj = _this.bag.objMap.get(stateObj.obj);
        _this.bag.objMap.delete(stateObj.obj);
        room.objMap.set(stateObj.obj, obj);
        println("Odložil jsi objekt."); 
    }

    //vypis popis lokality
    describe(sep, _this){
        var rooms = makeListOf(_this.roomMap); 
        var place = parser.handleCommand(sep, rooms);

        if(place.command == _this.room || sep.length == 0){
            sep = place.sep; 
            var thisRoom = _this.roomMap.get(_this.room);
            thisRoom.fnMap.get("describe")(sep, thisRoom);
            return;
        }
        //vyzadnovan popis mistnosti, ktery neni
        if(rooms.includes(place.command)){
            println("Jejda, nemáš kouzelné brýle, abys viděl skrz zdi."); 
        }
        
        //popsat veci v batohu, nebo v mistnosti
        if(_this.bag.fnMap.get('describe')(sep, _this.bag)) return; //došlo k vypsani
        var thisRoom = _this.roomMap.get(_this.room);
        if(thisRoom.fnMap.get('describe')(sep, thisRoom) == true) return; //došlo k vypsani

        println("Takový předmět v okolí nevidíš.");
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
    game.roomMap.set('velin',new Room("velin", "Nacháziš se ve velíně raketoplánu. Na palubní desce před tebou červeně blikají nejrůznější přepínače a kontrolky. Alarm poškození levého křídla se rozhoukal vysokým tónem.", "pomocna zprava."));
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
    

/*
    //bag zpracovava prikazy
    game.bag.fnMap.set("command", function (sep, _this) => { 
        for(let [key, obj] of _this.objMap){
            //funkce, ktere muzeme zavolat na objekt 
            var fn = makeListOf(obj.callFn);
            if(
        }
        //pro vsechny objekty
        var list = makeListOf(_this.objMap); 
        for(var fn 

    
    }); //implementace funkce command */
}

function keyPressed(e){
    if(e.keyCode == 13){
        var input = document.getElementById('input');
        game.inputCommand(input.value);
        input.value = "";
    }
}
