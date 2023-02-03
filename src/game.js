//var input = document.getElementById("prompt");

function makeListOf(map){ return Array.from(map.keys()); }

document.addEventListener("keydown", (event) => { keyPressed(event); });

//vypise text do div hra
function println(text, delay = 0){
    delay = 0; 
    if(delay != 0){
        setTimeout(()=> { println(text)}, delay * 1000); 
    }
    else{
        var obj = document.getElementById('game');
        for(var i = 0; i < text.length; i++){
            if(text[i] == '<'){ obj.innerHTML += '<br>'; i += 3; }
            else obj.innerHTML += text[i];
        }
    }    
}

function delContent(){
    var obj = document.getElementById('game');
    obj.innerHTML = "";  
}

//za time milisekund nastavi game.action na true
function heldUp(time){ setTimeout(() => { game.action = false; }, 1000*time); }

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

    //word1 je slovo od uzivatele
    longestSubstring(word1, word2){
        var l1 = word1.length;
        var l2 = word2.length;

        var max = 0;
        //pro vsechny zacatky word1
        for(var i = 0; i < l1; i++){
            for(var j = 0; j < l2; j++){
                var pole = [];
                var l = 0; //delka shody
                for(var k = 0; k < Math.min(l1 - i, l2 - j); k++){
                    if(word1[i+k] != word2[j+k]) break;
                    l++;
                }
                pole.push(l);
                max = Math.max(l, max);
            }
        }
        //word1 je obraz
        return max/Math.max(word1.length, word2.length); 
    }
    
    handleCommand(sep, listOfPoss){

        var max = 0;
        for(var j = 0; j < listOfPoss.length; j++){
            var sp = listOfPoss[j].split(" ");
            var done = false;
            var mx = 0;
            var id = -1;
            var info = [];
            for(var i = 0; i < sp.length; i++){
                var actMax = 0;
                var mxId = -1; 
                var l = 0; 
                for(var k = 0; k < sep.length; k++){
                    var act = this.longestSubstring(sep[k], sp[i]);
                    if(act > mx){ mx = act; id = k; }
                    //if(act > actMax){ actMax = act; mxId = k; l = sep[k].length; }
                } 
                
                if(mx > 0.5 ){
                    done = true;
                    sep.splice(id, 1); //vymaz prvek z pole     
                } 
                /*info.push({
                    max: actMax,
                    id: mxId,
                    l: l
                }); */
            }
            /*info.sort((a, b) => { if(id > 
            for(var i = 0; i < info.length; i++){
                if(info[i].l >= 3 && info[i].max > 0.5){
                }
            }
                //nejaka konstanta 
                if(mx > 0.6 && sep[id].length > 2){
                    done = true;
                    sep.splice(id, 1); //vymaz prvek z pole     
                } 
            } */
            //neco je odmazano
            if(done == true) return {command: listOfPoss[j], sep: sep};
        }
        return {command: "" , sep: sep}; 
    }
}

class Objects{
    constructor(name , description, helpMsg = "", immutable = false){
        this.name = name;
        this.description = description;
        this.immutable = immutable; 
        this.helpMsg = helpMsg; //zobrazi se pri zadani napovedy k predmetu

        this.mapFn = new Map(); //implementace funkci  
        this.fnMap = new Map();
        this.objMap = new Map(); 
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
}

class Room{

    constructor(name, description = "", helpMsg = ""){
        this.objMap = new Map(); //mapa objektů
        this.fnMap = new Map();  //mapa funkcí
        this.description = description;
        this.objMessage = "";
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
        this.fnMap.set("command", this.command); //zakladni funkce 

        //funkce, ktere volame na objekty
    }

    //prikazy, ktere prijimaji objekty
    command(sep, _this){
        var res = 0;
        for(let [key, obj] of _this.objMap){
            var comm = parser.handleCommand(sep, makeListOf(obj.mapFn));
            sep = comm.sep; 
            if(comm.command == "") continue;
            if(obj.mapFn.get(comm.command)(sep, obj, _this) == true) {return true;} //kdyz je prvni uspesny, tak
        } 
        return false; 
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
    }
   

    //funkce, ktere vraci true, pokud lze objekt zvednout a odebrat
    pickUp(sep, _this){
        var object = parser.handleCommand(sep, makeListOf(_this.objMap));
        if(object.command == ""){
            println("Tento objekt bohužel nemáš po ruce.");
            return { obj: undefined, res: 1 };
        }

        var obj = _this.objMap.get(object.command);
        var stat = obj.fnMap.get("pickUp")(sep, obj);
        //uspesne sebrani
        if(stat == 0){
            _this.objMap.delete(object.command); //smaze zaznam
            return{ obj: obj, res: 0 }
        }
        //neuspesne sebrani
        return { obj: undefined, res: 1 };
    }

    //v teto mistnosti chceme odlozit dany objekt
    drop(object, _this, force = false){
        var state = object.fnMap.get("drop")(_this, object); 
        if(state == true || force){
            _this.objMap.set(object.name, object); 
            return true;
        }
        return false;
    }
    

    describe(sep,_this, room = false){
        if(room) {
            println(_this.description);
            if(_this.objMap.size != 0){
                if(_this.objMessage == "")
                    println("Kolem vidíš nejrůznější předměty - ", 0, ""); //no new line
                else println(_this.objMessage, 0, ""); 
                for(var [k, v] of _this.objMap){
                    println(v.name + ", ", 0, ""); 
                } 
                println(""); //novy radek 
            }
            return true;
        }
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
        this.bag = new Room("batoh", "Batoh reprezentuje věci, které máš u sebe.");
        this.room = "velin";
        this.action = false; //nechceme prijimat dva prikazy najednou
        this.phase = -1;
       
        this.roomMap = new Map();
        this.fnMap = new Map();

        this.fnMap.set("jdi", this.moveTo);
        this.fnMap.set("presun", this.moveTo);

        this.fnMap.set("popis", this.describe);
        this.fnMap.set("rozhledni se", this.describe);

        this.fnMap.set("pomoc", this.help );
        this.fnMap.set("manual", this.help );

        this.fnMap.set("poloz", this.drop);
        this.fnMap.set("odloz", this.drop);

        //this.fnMap.set("poloz", this.drop);
        this.fnMap.set("vezmi", this.pickUp);
        this.fnMap.set("seber", this.pickUp);
        this.fnMap.set("uchop", this.pickUp);
        
        this.manual = "Není k dispozici žádný manuál."; 
    }

    //prikazy budou ve forme - sloveso, slova mezi, (mistnost, predmet, vec);
    inputCommand(command){
        if(this.phase == 0) { this.phase = 1; this.intro(); return; }
        if(command == "") return;
        if(this.action == true) { println("Nemůžeš vykonávat dvě akce najednou. "); return; }

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
            
            //command se ujal
            if(thisRoom.fnMap.get("command")(sep, thisRoom) == true){
                return;          
            }
            if(this.bag.fnMap.get("command")(sep, this.bag) == false){
                println("Zadal jsi neznámý příkaz. Pro vypsání nápovědy zadej příkaz 'pomoc'.");
            }
        }
        else{ //zavolej funkci se zmensenym listem parametru 
            this.fnMap.get(retObj.command)(sep, this);
        }
    }

    moveTo(sep, _this){
        
        if(sep.length == 0){
            println("Musíš zadat, kam chceš jít.");
            return false;
        } 
        var toRoom = parser.handleCommand(sep, makeListOf(_this.roomMap));
        if(toRoom.command == ""){
            println("Nenašli jsme odpovídající místnost");
            return;
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
        var state = room.fnMap.get("pickUp")(sep, room);

        if(state.res == 1){
            //chybová hláška by měla být už vypsána
            return; 
        }
        //bag bude mít speciálně implementovanou funkci drop
        var drop = _this.bag.fnMap.get("drop")(state.obj, _this.bag);
        
        //musime vratit objekt 
        if(drop == false){
            room.fnMap.get("drop")(state.obj, room, true); //force drop 
            return;
        }
        println("Vzal jsi " + state.obj.name); 
    }

    help(sep, _this){

        //vypis vseobecnou napovedu
        if(sep.length == 0){
            println(_this.manual);
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
        
        var objRes = _this.bag.fnMap.get("pickUp")(sep, _this.bag);
        if(objRes.res == 1) return; //z nejakeho duvodu nejde objekt polozit
       
        //zvedat objekty budeme v mistnosti
        var room = _this.roomMap.get(_this.room);
        var stateObj = room.fnMap.get("drop")(objRes.obj, room); //jestli muzeme objekt odlozit

        if(stateObj.res == 1){
            _this.bag.fnMap.get("drop")(objRes.obj, _this.bag , true); //force drop 
            return; 
        }
        println("Položil jsi " + objRes.obj.name); 
    }

    //vypis popis lokality
    describe(sep, _this){
        var rooms = makeListOf(_this.roomMap); 
        rooms.push("batoh"); 
        var describeThisRoom = false;
        if(sep.length == 0) describeThisRoom = true;
        var place = parser.handleCommand(sep, rooms);

        if(place.command == _this.room){
            var thisRoom = _this.roomMap.get(_this.room);
            thisRoom.fnMap.get("describe")(sep, thisRoom, true);
            return;
        }
        if(place.command == "batoh" | describeThisRoom == true){
            _this.bag.fnMap.get("describe")(sep, _this.bag, true); 
            return;
        }

        //vyzadnovan popis mistnosti, ktery neni v dosahu
        if(rooms.includes(place.command)){
            println("Jejda, nemáš kouzelné brýle, abys viděl skrz zdi."); 
            return;
        }
        
        //popsat veci v batohu, nebo v mistnosti
        if(_this.bag.fnMap.get('describe')(sep, _this.bag) == true) return; //došlo k vypsani
        var thisRoom = _this.roomMap.get(_this.room);
        if(thisRoom.fnMap.get('describe')(sep, thisRoom) == true) return; //došlo k vypsani

        println("Takový předmět v okolí nevidíš.");
    }
    begining(){
        println("Jsi připraven na kolosální vesmírné dobrodružství? <br> Pokud ano, stiskni enter."); 
        game.phase = 0; 
    }

    intro(){
        delContent(); //smaz predchozi obsah
        println("Hluk z raketomotorů přehlušil nervydrásající ticho. Zmocnila se tě nervozita, přestože máš za sebou tvrdý několikaletý výcvik. Za pár chvil konečně odstartuješ ke své první vesmírné misi na palubě raktery Shumaker-Levi 9.");
        println("Teď teprve si začínáš uvědomovat plnou důležitost této mise - je nutné dostat se do vesmíru jako první a předčít nepřátelskou supervelmoc. <br> Už jen pár sekund do startu", 5);
        println("Odpočítávání je připraveno", 10);
        for(let i = 10; i > 0; i--){
            println(i, (10 - i) + 11);
        }
        println("Je odstartováno. Ohromná síla motorů tě tlačí do sedačky silou 10G. Na tohle jsi celé ty roky trénoval a mezi nejlepšími vybrali právě tebe.", 21);
        println("Zatím jde vše podle plánu, hlásí ti z řidícího střediska.", 23); 
        println("Najednou se ozve tlumená rána. To není dobré - co to jen mohlo být?", 26); 
        println("Z řidicího střediska ti hlásí, že nejspíš došlo k poškození vnějšího pláště rakety. Ajaj, to není dobré.", 29);
        println("Další zpráva ze střediska - za chvíli s tebou nejspíš ztratí spojení - poškození pláště je většiho rozsahu, než se původně zdálo a zasáhlo i komunikační zařízení.", 32);
        println("Středisko: <br> Jakmile se raketa vzdálí na více než 300 km, spojení pravděpodobně vypadne. Pokus se opravit poškození a opra..........");
        println("Je to tu. Z vysílačky už se ozvývá jen neurčité šumění. Co teď? Tvou jedinou pomocí asi bude jen palubní manuál a nabyté znalosti z výcviku.", 35);
        println("Nyní už je to jen na tobě, aby sis zachránil holý život.", 35);
        println("Raketa mezitím už vystoupala na oběžnou dráhu a nyní krouží kolem země");
        game.action = true;
        heldUp(32); //za 32 sekund bude možné vykonávat příkazy
        init(); //nadeklaruj vse 
    }

}

var game = new Game();
var parser = new Parser(); 

//deklarace hry
window.addEventListener("load", game.begining);

function init(){
    //zprava
    game.manual = "Pro vypsání nápovědy.";
    game.bag.objMessage = "Věci, které si neseš s sebou - ";
    
    //mistnosti 
game.roomMap.set('kokpit',new Room("kokpit", "Nacháziš se v kokpitu rakety. Není tu příliš prostoru. Všude kolem je jedna velká palubní deska. Ještě štěstí, že přesně víš, co který knoflík i kontrolka dělá - hodiny nudné teorie ti teď přijdou vhod. Za tebou se nachází průlez do nákladového prostoru.", "Vedle své sedačky vidíš "));

    game.roomMap.set('nakladovy prostor',new Room('nakladovy prostor', "Nákladový prostor je určen ke skladování zásob na let a drobného nářadí, kdyby se něco pokazilo.", "Na magnetické stěně jsou silnými magnety připevněny nástroje - " ));
    game.roomMap.set('prechodova komora',new Room('prechodova komora', "Místnost tvaru koule o poloměru asi 1,5 metru. Kolem sebe vidíš tlačítka na otevření dveří vedoucí do velína a do volného vesmíru."));
    game.roomMap.set('vesmir',new Room('vesmír', "Naskytne se ti nádherný výhled na planetu Zemi. Kéž už bys tam byl. Pod tebou je však černočerná tma - asi Tichý oceán", "Ve vesmíru, jak známo, je výslednice sil působící na tělesa často nulová. Proto stačí malý impulz a odletí do nenávratna. Není radno mít věci nepřivázané."));

    //velin
    var gm = game.roomMap.get('kokpit');
    gm.objMap.set("manual", new Objects("manual", "V manuálu se nachází návody snad úplně na všechno. Stačí si ho přečíst."));
    gm.objMap.set("nabijecka", new Objects("nabijecka", "Nabíječka na vysílačku s univerzálním NASA konektorem." , "Protože má nabíječka univerzální NASA konektor, půjde použít i k nabíjení jiných věcí."));
    gm.objMap.set("ovládací panel", new Objects("ovladaci panel", "Při bližším pohledu na hlavní kontrolní panel na něm vidíš tlačítka.", true));
    gm.nbrs = ["nakladovy prostor", "prechodova komora"];

    //nakladovy prostor
    var np = game.roomMap.get('nakladovy prostor');
    np.objMap.set("aku vrtacka", new Objects("aku vrtacka", "Vratčka, kterou jde použít jako elektrický šroubovák. Je poháněná elektřinou z baterie.")); //neni nabita
    np.objMap.set("pilnik", new Objects("pilnik", "Jemný pilník na železo.", "Možná by šel použít k upravení nějakého tvaru."));
    np.objMap.set("sroubky", new Objects("sroubky", "Šroubky s hvězdičkouvitou hlavou, sloužící k uchycení keramických destiček.", "")); //neni nabita
    np.objMap.set("keramicke desticky", new Objects("keramicke desticky", "Destičky slouží jako vnější ochrana rakety proti vysoké teplotě při přistání. Jsou-li někde poškozené, dojde ke katasrofě. "));
    np.nbrs = ["kokpit"];

    //game.roomMap.get('nakladovy prostor').objMap.set("skafandr", new Objects("skafandr", "Vesmírný skafandr, sloužící k volného prostoru."));
    
    //prechodova komora
    var pk = game.roomMap.get('prechodova komora');
    pk.objMap.set("skafandr", new Objects("skafandr", "Vesmírný skafandr, sloužící k pohybu ve volném prostoru."));
    pk.nbrs = ["velin", "vesmir"];

    //volny vesmir 
    var vv = game.roomMap.get('vesmir');
    vv.objMap.set("raketa", new Objects("raketa", "", true));
    vv.objMap.set("poskozene desticky", new Objects("poskozene desticky", "V pravém křídle zeje velká díra - to nevypadá dobře. Takhle by při přistání raketoplán shořel v atmosféře.",true)); //posledni parametr je immutable
    vv.nbrs = ["prechodova komora"];

    //akce
    np.objMap.get("pilnik").mapFn.set("upiluj", piluj);
}

function piluj(sep, _this, par){
    var pole = ["sroubky"];  //co vsechno se da pilovat
    if(par != game.bag) {println("Jejda, pilník nemáš v ruce. To asi nepůjde"); return true; } //akce uz probehla
    var obj = parser.handleCommand(sep, pole);
    if(obj.command == "") { println("Musíš zadat, co chceš upilovat"); return true; }
    //zmen nekde stav sroubku na true
    println("Piluješ a piluješ");
    println("Dopilovaj jsi", 4000); 
    heldUp(4000); 
    return true;
}

function keyPressed(e){
    if(e.keyCode == 13){
        var input = document.getElementById('input');
        game.inputCommand(input.value);
        input.value = "";
    }
}