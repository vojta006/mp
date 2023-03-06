//var input = document.getElementById("prompt");

function makeListOf(map){ return Array.from(map.keys()); }

document.addEventListener("keydown", (event) => { keyPressed(event); });

//vypise text do div hra
function println(text, delay = 0){
//	delay = 0; 
	if(delay != 0){
		setTimeout(()=> { println(text)}, delay * 1000); 
	}
	else{
		var obj = document.getElementById('game');
		obj.innerHTML += text; 
		obj.innerHTML += "<br>";
	} 
}

function delContent(){
	var obj = document.getElementById('game');
	obj.innerHTML = ""; 
}

function showInput(){
	var obj = document.getElementById('prompt');
	obj.style.display = "block";
}

function hideInput(){
	var obj = document.getElementById('prompt');
	obj.style.display = "none";
}

//za time milisekund nastavi game.action na true
//function showInputIn(time){  time = 0;hideInput(); setTimeout(() => { showInput(); }, time); }
function showInputIn(time){  ;hideInput(); setTimeout(() => { showInput(); }, time); }

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
		return max;
	}

	//snazime se image nafitovat na pattern 
	test(image, pattern){
		var il = image.length;
		var pl = pattern.length;

		//je-li pattern kratsi, prilis to nepomuze
		var score = 0; 
		var i = 0, j = 0;
		var l1 = 0; 
		var l2 = 0;

		while(true){
			if(pattern[j] == image[i]){ i++, j++, l1++; }
			else{ j++; }

			if(j == pl || i == il) break;
		}
		i = 0, j = 0; 

		while(true){
			if(pattern[j] == image[i]){ i++, j++, l2++; }
			else{ i++; }

			if(j == pl || i == il) break;
		}

		var ls = this.longestSubstring(image, pattern); 
		return (Math.max(l1, l2) + ls)/Math.max(il, pl) + ls;  
	}


	//zahrnout metriku polohy v prikazu - slovesa jsou na zacatku
	//vybereme n nejlepsich hodnot - n je delka 
	handleCommand(sep, listOfPoss){
		//best option 
		var bo = { poss_id: -1, score: 0, spl: 0, id_array: []};

		for(var j = 0; j < listOfPoss.length; j++){

			var score = 0;
			var sp = listOfPoss[j].split(" ");
			var pole = []; //v poli bude tolik zaznamu, kolik je delka sp
			for(var i = 0; i < sp.length; i++){
				var mx = { k:-1, score:0}
				for(var k = 0; k < sep.length; k++){
					var act = this.test(sep[k], sp[i]);
					if(mx.score < act) mx = { k:k, score: act}
				} 
				pole.push(mx); //údaje s maximální hodnotou, mělo by se počítat nejlepších sp.length
			}
			//act score = soucet sp.length nejlepsich hodnot 
			pole.sort((a, b) => { return a.score < b.score} );  //pole setrizene podle nejlepsich hodnot 
			var soucet = 0;
			for(var i = 0; i < Math.min(sp.length, pole.length); i++){
				soucet += pole[i].score; 
			}
			soucet /= sp.length; 
			//nasli jsme nove nejlepsi score
			if(bo.score < soucet){
				bo.poss_id = j;
				bo.spl = sp.length;
				bo.score = soucet;
				bo.id_array = pole; 
			}
			//pokud je soucet pole vetsi nez nejaka hranice, muzeme zacit mazat
		}
		//zrejme jsme nic nenasli, prumerna hodnota za celou delku prikazu 
        	console.log(bo.score); 
		if(bo.score < 4){
			return {command:"", sep: sep}; 
		}

		//hodnoty jsou setridene podle podle score
		//zachovej pouze sp.length nejvyssych hodnot 
		bo.id_array.splice(bo.spl);

		//smaz od zadu sp.length nejlepsich hodnot
		bo.id_array.sort((a,b) => { return a.k < b.k});

		//z pole muzeme odstranovat, nebot odstranujeme zezadu
		for(var i = 0; i < bo.id_array.length; i++){
			if(bo.id_array[i].score > 0.6){
				sep.splice(bo.id_array[i].k, 1); //odstran 1 prvek 
				//smaz k. slovo v sep
			}
		}

		return {command:listOfPoss[bo.poss_id], sep:sep} 
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
			println("<b>" + comm.command + ":</b>"); 
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
			else{
				println("Nenachází se tu nic důležitého");
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
		this.bag = new Room("inventar", "Inventář reprezentuje věci, které máš u sebe.");
		this.room = "kokpit";
		//this.room = "prechodova komora";
		this.action = false; //nechceme prijimat dva prikazy najednou
		this.phase = 0;

		this.roomMap = new Map();
		this.fnMap = new Map();

		this.fnMap.set("jdi", this.moveTo);
		this.fnMap.set("presun se", this.moveTo);

		this.fnMap.set("popis", this.describe);
		this.fnMap.set("rozhledni se", this.describe);
		this.fnMap.set("prozkoumej", this.describe);

		this.fnMap.set("pomoc", this.help );

		this.fnMap.set("poloz", this.drop);
		this.fnMap.set("zahod", this.drop);
		this.fnMap.set("odloz", this.drop);

		//this.fnMap.set("poloz", this.drop);
		this.fnMap.set("vezmi", this.pickUp);
		this.fnMap.set("zdvihni", this.pickUp);
		this.fnMap.set("zvedni", this.pickUp);
		this.fnMap.set("seber", this.pickUp);

		this.manual = "Není k dispozici žádný manuál."; 
		this.history = [];
		this.i = 0; //ukazatel v historii
	}

	//prikazy budou ve forme - sloveso, slova mezi, (mistnost, predmet, vec);
	inputCommand(command){
		if(this.phase == 10){ println("Vrátil jsi se na zem. Už nemůžeš zadávat příkazy."); return true; }
		if(this.phase == 0) { this.phase = 1; this.intro(); return true; }
		if(command == "") return false;
		if(this.action == true) { println("Nemůžeš vykonávat dvě akce najednou. "); return false; }

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
				println("Tento příkaz tu nemůžeš na nic uplatnit. Pro vypsání nápovědy zadej příkaz <b> pomoc </b> .");
			}
		}
		else{ //zavolej funkci se zmensenym listem parametru 
			println("<b> " + retObj.command + ": </b>");
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
			println("Jsi v " + _this.room); 
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

		state = nbrRoom.fnMap.get("moveTo")(sep, thisRoom.name , nbrRoom);

		if(state == 2) return; //jsou napr. zamcene dvere 
		if(_this.bag.fnMap.has("move") == true && _this.bag.fnMap.get("move")(_this.bag, thisRoom, nbrRoom) == false){ return false; } //nepresuneme se - nejspis kvuli skafandru

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

		if(sep.length != 0){ println("Popis nepříjimá žádné parametry."); return true; }
		println(_this.manual);
		return true; 

		//bude dobré zobrazovat nápovědy k objektům? 
		//vypis vseobecnou napovedu
		if(sep.length == 0){
			println(_this.manual);
			return; 
		}
		//napoveda 
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
		rooms.push("inventar"); 
		rooms.push("batoh"); 
		var describeThisRoom = false;

		//zbavime se slova se
		var se = parser.handleCommand(sep, ["se"]);
		if(sep.length == 0) describeThisRoom = true;
		var place = parser.handleCommand(sep, rooms);

		if(place.command == _this.room || describeThisRoom == true){
			var thisRoom = _this.roomMap.get(_this.room);
			thisRoom.fnMap.get("describe")(sep, thisRoom, true);
			return;
		}
		if(place.command == "inventar" || place.command == "batoh"  ){
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
		hideInput(); 
		println("Jsi připraven na kolosální vesmírné dobrodružství? <br> Pokud ano, stiskni enter."); 
		game.phase = 0; 
	}

	intro(){
		delContent(); //smaz predchozi obsah
		println("Hluk z raketomotorů přehlušil nervydrásající ticho. Zmocnila se tě nervozita, přestože máš za sebou tvrdý několikaletý výcvik. Za pár chvil konečně odstartuješ ke své první vesmírné misi na palubě rakety Shumaker-Levi 9.", 1);
		println("Teď teprve si začínáš uvědomovat plnou důležitost této mise - je nutné dostat se do vesmíru jako první a předčít nepřátelskou supervelmoc. <br> Už jen pár sekund do startu", 5);
		println("Odpočítávání je připraveno", 10);
		for(let i = 10; i > 0; i--){
			println(String(i), (10 - i) + 11);
		}
		println("Je odstartováno. Ohromná síla motorů tě tlačí do sedačky silou 10G. Na tohle jsi celé ty roky trénoval a mezi nejlepšími vybrali právě tebe.", 21);
		println("Zatím jde vše podle plánu, hlásí ti z řídicího střediska.", 23); 
		println("Najednou se ozve tlumená rána. To není dobré - co to jen mohlo být?", 26); 
		println("Z řidicího střediska ti hlásí, že nejspíš došlo k poškození vnějšího pláště rakety.", 29);
		println("Další zpráva ze střediska - za chvíli s tebou nejspíš ztratí spojení - poškození pláště je většiho rozsahu, než se původně zdálo a zasáhlo i komunikační zařízení.", 32);
		println("Středisko: <br> Jakmile se raketa vzdálí na více než 300 km, spojení pravděpodobně vypadne.", 35);
		println("Je to tu. Z vysílačky už se ozvývá jen neurčité šumění. Co teď? Tvou jedinou pomocí asi bude jen palubní manuál a nabyté znalosti z výcviku.", 40);
		println("Nyní už je to jen na tobě, aby sis zachránil holý život.", 45);
		println("Raketa mezitím už vystoupala na oběžnou dráhu a nyní krouží kolem Země", 50);
		println("Dokážeš raketoplán opravit a vrátit se ve zdraví na Zemi?", 53);
		showInputIn(55*1000); 
		init(); //nadeklaruj vse 

	}
}

var game = new Game();
var parser = new Parser(); 

//deklarace hry
//window.addEventListener("load", game.begining);
window.addEventListener("load", game.begining);

function init(){
	//zprava
	game.manual = "Pro pohyb mezi místnostmi použij příkaz <b>'jdi' </b>. <br> Pokud máš po ruce manuál, můžeš ho číst příkazem <b>'čti manual'</b>. <br> Aby ses rozhlédl po místnosti, zadej příkaz <b>'rozhlédni se'</b>. <br> Dále můžeš brát některé předměty, které taky můžeš prozkoumat. <br> Pro vypsání předmětů, které si neseš s sebou zadej <b>'popiš inventář'</b>."; 
	game.bag.objMessage = "Věci, které si neseš s sebou - ";

	//mistnosti 
	game.roomMap.set('kokpit',new Room("kokpit", "Nacháziš se v kokpitu rakety. Není tu příliš prostoru. Všude kolem je jedna velká palubní deska. Ještě štěstí, že přesně víš, co který knoflík i kontrolka dělá - hodiny nudné teorie ti teď přijdou vhod. Za tebou se nachází nákladový prostor a průlez do přechodové komory.", "Vedle své sedačky vidíš "));

	game.roomMap.set('nakladovy prostor',new Room('nakladovy prostor', "Nákladový prostor je určen ke skladování zásob na let a drobného nářadí, kdyby se něco pokazilo. Můžeš jít do kokpitu rakety.", "Na magnetické stěně jsou silnými magnety připevněny nástroje - " ));
	game.roomMap.set('prechodova komora',new Room('prechodova komora', "Místnost tvaru koule o poloměru asi 1,5 metru. Kolem sebe vidíš tlačítka na otevření dveří vedoucí do kokpitu a do volného vesmíru."));
	game.roomMap.set('vesmir',new Room('vesmir', "Naskytne se ti nádherný výhled na planetu Zemi. Kéž už bys tam byl. Pod tebou je však černočerná tma - asi Tichý oceán", "Ve vesmíru, jak známo, je výslednice sil působící na tělesa často nulová. Proto stačí malý impulz a odletí do nenávratna. Není radno mít věci nepřivázané."));

	//velin
	var gm = game.roomMap.get('kokpit');
	gm.objMap.set("manual", new Objects("manual", "V manuálu se nachází návody snad úplně na všechno. Stačí si ho přečíst.", "Napoveda k manualu."));
	gm.objMap.set("nabijecka", new Objects("nabijecka", "Nabíječka na vysílačku s univerzálním NASA konektorem." , "Protože má nabíječka univerzální NASA konektor, půjde použít i k nabíjení jiných věcí."));
	gm.objMap.set("ovladaci panel", new Objects("ovladaci panel", "Při bližším pohledu na hlavní kontrolní panel na něm vidíš tlačítka.", "", true));
	gm.objMap.set("prulez kokpit", new Objects("prulez mezi kokpitem a prechodovou komorou", "Průlez do přechodové komory.", "", true));
	gm.nbrs = ["nakladovy prostor", "prechodova komora"];
	gm.objMap.get("prulez kokpit").opened = false; //prulez je zavreny

	var vv = game.roomMap.get('vesmir');
	//nakladovy prostor
	var np = game.roomMap.get('nakladovy prostor');
	//np.objMap.set("pilnik", new Objects("pilnik", "Jemný pilník na železo.", "Možná by šel použít k upravení nějakého tvaru."));
	np.objMap.set("aku vrtacka", new Objects("aku vrtacka", "Vratčka, kterou jde použít jako elektrický šroubovák. Je poháněná elektřinou z baterie.")); //neni nabita
	np.objMap.set("sroubky", new Objects("sroubky", "Šroubky s hvězdičkouvitou hlavou, sloužící k uchycení keramických destiček.", "")); //neni nabita
	np.objMap.set("keramicke desticky", new Objects("keramicke desticky", "Destičky slouží jako vnější ochrana rakety proti vysoké teplotě při přistání. Jsou-li někde poškozené, dojde ke katasrofě. "));
	np.objMap.get("keramicke desticky").attached = false; //jestli jsou prisroubovane 
	np.nbrs = ["kokpit"];

	//volny vesmir 
	vv.objMap.set("raketa", new Objects("raketa", "Raketa Shumaker Levi 9 se blyští v zapadajícím slunečním svitu.", "",  true));
	vv.objMap.set("prulez vesmir", new Objects("prulez mezi prechodovou komorou a vesmirem", "Průlez mezi vesmírem a přechodovou komorou.", "", true));
	vv.objMap.set("poskozene misto", new Objects("poskozene misto", "Na přídi u návratového modulu je v keramickém obložení velká díra. To se musí opravit, nebo raketa ", "" ,true)); //posledni parametr je immutable
	vv.objMap.get("prulez vesmir").stat = false; 

	vv.nbrs = ["prechodova komora"];
	//prechodova komora
	var pk = game.roomMap.get('prechodova komora');
	pk.objMap.set("skafandr", new Objects("skafandr", "Vesmírný skafandr, sloužící k pohybu ve volném prostoru."));
	pk.objMap.set("prulez vesmir", vv.objMap.get("prulez vesmir"));
	pk.objMap.set("prulez kokpit", gm.objMap.get("prulez kokpit"));
	pk.objMap.set("tlacitko", new Objects("tlacitko", "Tlačítko na přidání nebo odčerpání vzduchu z přechodové komory.", "", true));
	pk.objMap.get("skafandr").on = false; //je skafandr sundaný 
	//pk.objMap.get("skafandr").on = true; //je skafandr nasazen
	pk.vacuum = false; 

	pk.nbrs = ["kokpit", "vesmir"];
	pk.fnMap.set("moveTo", moveToPK);
	pk.fnMap.set("moveFrom", moveFromPK);

	//akce
	game.bag.fnMap.set("move", bagMove); 
	vv.objMap.get("prulez vesmir").mapFn.set("zavri", zavri);
	gm.objMap.get("prulez kokpit").mapFn.set("zavri", zavri);
	pk.objMap.get("tlacitko").mapFn.set("zmackni", zmackni);
	pk.objMap.get("tlacitko").mapFn.set("stiskni", zmackni);

	vv.objMap.get("prulez vesmir").mapFn.set("otevri", otevri);
	gm.objMap.get("prulez kokpit").mapFn.set("otevri", otevri);

	gm.objMap.get("manual").mapFn.set("cti", cti);
	gm.objMap.get("manual").mapFn.set("manual", cti);
	gm.objMap.get("manual").mapFn.set("listuj", cti);
	gm.objMap.get("manual").mapFn.set("vypis", cti);

	//aktivuj autopilota 
	gm.objMap.get("ovladaci panel").mapFn.set("aktivuj", aktivuj);
	gm.objMap.get("nabijecka").mapFn.set("nabij", nabijAku);

	pk.objMap.get("skafandr").mapFn.set("oblec si", oblec);
	pk.objMap.get("skafandr").mapFn.set("oblekni si", oblec);
	pk.objMap.get("skafandr").mapFn.set("nasad", oblec);
	pk.objMap.get("skafandr").fnMap.set("move", skafandrMoveTo); //skafandr brani v prechodu do kokpitu 

	pk.objMap.get("skafandr").mapFn.set("svlec", sundej);
	pk.objMap.get("skafandr").mapFn.set("sundej", sundej);

	np.objMap.get("keramicke desticky").mapFn.set("priloz", priloz);
	np.objMap.get("keramicke desticky").fnMap.set("move", destickyMove);
	np.objMap.get("keramicke desticky").fnMap.set("pickUp", destickyPickUp);

	np.objMap.get("aku vrtacka").mapFn.set("sroubuj", zasroubuj);
	np.objMap.get("aku vrtacka").mapFn.set("odsroubuj", odsroubuj);

	//zapoj nabijecku 
	gm.objMap.get("nabijecka").mapFn.set("zapoj", zapoj);
	gm.objMap.get("nabijecka").mapFn.set("zastrc", zapoj);
	gm.objMap.get("nabijecka").plugged = false; 

	//prerusime nabijeni 
	gm.objMap.get("nabijecka").fnMap.set("pickUp", takeAku);
	np.objMap.get("aku vrtacka").fnMap.set("pickUp", takeAku);
}

//vezmi objekt z batohu do prostoru
function moveObjToRoom(objName, roomName){
	if(game.roomMap.has(roomName) == false) return false; //mistno není
	if(game.bag.objMap.has(objName) == false) return false; //objekt tam není

	var room = game.roomMap.get(roomName);
	var objm = game.bag.objMap; 
	room.objMap.set(objName, objm.get(objName));
	objm.delete(objName);
	return true;
}

//se skafandrem nepůjde projít do kokpitu

//jestli se nejaky predmet brani prenosu
function bagMove(_this, from, to){
	for(var [k, v] of _this.objMap){
		//nejaky objekt se brani prenosu
		if(v.fnMap.has("move") && v.fnMap.get("move")(v, from, to) == false) return false;
	}
	return true;
}

//pokud držíme skafandr, nemůžeme se přesunout do kokpitu
function skafandrMoveTo(_this, from, to){ if(to.name == "kokpit") { println("Jejda, se skafandrem se nevejdeš do průlezu."); return false;  } return true; }

//oblec si skafandr
function oblec(sep, _this, parametr){

	if(game.bag.objMap.has("skafandr") == false) {println("Aby sis mohl nasadit skafandr, musíš ho vzít do ruky"); return true;}
	if(game.bag.objMap.size != 1) { println("Aby sis nasadil skafandr, musíš nejprve odložit všechny ostatní věci. Takhle bys je měl pod skafandrem a nemohl bys je používat."); return true;  }
	if(game.room != "prechodova komora") { println("Tato situace by neměla nastat."); return true;}
	if(_this.on == true) { println("Skafandr už máš nasazený."); return true; }

	println("Nasazuješ si skafandr. Nejprve ses nasoukal do veškerého oblečení - kalhot, 'bundy'."); 
	println(" Nyní sis nasadil helmu.", 5);
	println("Tak, a jsi oblečený.", 10); 
	showInputIn(10000);
	_this.on = true;
	return true;
}

//sundej si skafandr 
function sundej(sep, _this, parametr){
	if(game.room != "prechodova komora") { println("Není dobrý nápad sundavat si skafandr mimo přechodovou komoru"); return true; }

	if(game.roomMap.get("prechodova komora").vacuum == true){ println("To není dobrý nápad, je tu stále vakuum. Začala by ti vřít krev a konec by byl rychlý"); return true; }

	//veci ze skafandru nechame "spadnout"

	_this.on = false;

	if(game.bag.objMap.size != 0){
		//prekopiruj veci do pk
		for(var [k,v] of game.bag.objMap){
			game.roomMap.get("prechodova komora").objMap.set(k, v);
		}
		game.bag.objMap.clear(); 
		println("Všechny věci, které jsi měl s sebou si tu jen tak lítají.");
	}

	println("Sundaváš si skafandr. Nejprve je třeba odmontovat helmu.");
	println("Teď sis sundal kalhoty a vrchní část skafandr.", 5);
	println("Tak a je to. Skafandr máš sundaný.", 10); 
	showInputIn(10000); 
	return true;
}

//TODO nastavit u akcí delay
//TODO sjednotit navratove kody - zacit pouzivat vic nez 2
//TODO pri popisu prulezu vypisovat jejich stav
//TODO pruchod do vesmiru nelze zavrit povelem zavri prulez mezi prechodovou komorou a vesmirem 

//prejmenovat po opraveni poskozene misto na opravene misto

//zmen stav v prechodove komore
function zmackni(sep, _this, parametr){
	//nasazeny skafandr, oba prulezy zavreny, skafandr by mel byt v bagu
	println("Zmáčknutím tlačítka dojde k odčerpání vzduchu nebo naplnění přechodové komory vzduchem."); 
	if(parametr.objMap.get("prulez kokpit").opened == true) { println("Musíš nejprve zavřít průlez do kokpitu."); return true; }
	if(parametr.objMap.get("prulez vesmir").opened == true) { println("Musíš nejprve zavřít průlez do vesmíru."); return true; }

	if(game.bag.objMap.has("skafandr") == false || game.bag.objMap.get("skafandr").on == false) {   println("Musíš si nasadit skafandr"); return true; }

	if(parametr.vacuum == true){
		println("Započal proces přidávání vzduchu.");
		parametr.vacuum = false;
	}else{
		println("Vysávání vzduchu započalo."); 
		parametr.vacuum = true;
	}
	println("Proces dokončen.", 5); 
	showInputIn(5*1000); 	
	return true;
}

//akucka je vybita, nku abijecka 
function nabijAku(sep, _this, parr){
	var pole = ["aku vrtacka"];
	var obj = parser.handleCommand(sep, pole);

	if(obj.command == ""){ println("Musíš zadat, co chceš nabít."); return true; }

	if(_this.plugged == false){
		println("Musíš nejprve zapojit nabíječku do zásuvky."); 
		return true; 
	}

	if(obj.command == "aku vrtacka"){
		println("Zapojil aku vrtačku do nabíječky. Zhruba za minutu by měla být dobitá. Na nabíječce se rozsvítí zelená ledka.");
		//setTimeout(()=> { nabito(game.roomMap.get("kokpit").objMap.get("nabijecka"))} , 1000 * 60);  //za 120 sekund bude nabito
		setTimeout(()=> { nabito(game.roomMap.get("kokpit").objMap.get("nabijecka"))} , 1000 * 20);  //za 120 sekund bude nabito

		if(game.bag.objMap.has("aku vrtacka") == true)
			moveObjToRoom("aku vrtacka", "kokpit");
	}
	return true; 
	//akucka je zatím nabitá 
}

//zapoj nabijecku do konektoru, premisti do kokpitu
function zapoj(sep, _this, parr){
	var pole = ["nabijecka"];
	var obj = parser.handleCommand(sep, pole);
	if(obj.command == ""){ println("Musíš specifikovat, co chceš zapojit. Asi jsi myslel nabíječku."); return true; }

	if(game.room != "kokpit"){ println("Konektor pro zapojení nabíječky se nacházi pouze v kokpitu."); return true; }

	//nabijecka je v ruce nebo kokpitu 
	if(game.bag.objMap.has("nabijecka") == false){ println("Abys mohl zapojit nabíječku do zásuvky, musíš ji vzít do ruky."); return true; }

	game.bag.objMap.get("nabijecka").plugged = true; 

	println("Zapojil jsi nabíječku do zásuvky.");
	//prendej nabijecku do kokpitu
	moveObjToRoom("nabijecka", "kokpit"); 
	return true;
}

function moveFromPK(sep, where, _this){ 
	//nejprve zavolame std move
	if(_this.moveFrom(sep, where, _this) == 1) return 1; //nemuzeme se presunout
	if(_this.objMap.get("prulez " + where).opened == true){
		return 0;
	}
	else println("Musíš nejdřív otevřít průlez do " + where + ".");
	return 2;
}

function moveToPK(sep, where, _this){
	if(_this.objMap.get("prulez " + where).opened == true){
		return 0;
	}
	else println("Musíš nejdřív otevřít průlez do " + _this.name + ".");
	return 2;
}

function zavri(sep, _this, parametr){

	var pole = ["prulez", "dvere"]; 
	var obj = parser.handleCommand(sep, pole);
	if(obj.command == "") { println("Musíš zadat, co chceš zavřít."); return true; }
	if(obj.command == "dvere") { println("Zkus raději zavřít průlez"); return true; }

	var rooms = ["prechodova komora", "vesmir", "kokpit"];
	var res = parser.handleCommand(sep, rooms);

	if(res.command == ""){
		println("Musíš zadat, který průlez chceš zavřít.");
		return true;
	}
	//otevirame z kokpitu
	if(parametr.name == "kokpit"){
		if(res.command == "prechodova komora"){
			if( parametr.objMap.get("prulez kokpit").opened == false){ println("Průlez je již zavřen."); return true;}
			println("Zavřel jsi průlez do přechodové komory"); 
			parametr.objMap.get("prulez kokpit").opened = false;
		}
		else{
			println("Jejda, takový průlez tu není.");
		}
		return true;
	}
	if(parametr.name == "prechodova komora"){
		if(parametr.objMap.has("prulez " + res.command) == false){ println("Takový průlez tu není"); return true; }
		if(parametr.objMap.get("prulez " + res.command).opened == false){ println("Průlez je již zavřen"); return true; }
		parametr.objMap.get("prulez " + res.command).opened = false;
		println("Zavřel jsi průlez mezi přechodovou komorou a " + res.command);
	}
	//z vesmiru do prechodove komory
	if(parametr.name == "vesmir"){
		if(res.command == "prechodova komora"){
			if( parametr.objMap.get("prulez").opened == false){ println("Průlez je již zavřen."); return true;}
			println("Zavřel jsi průlez mezi přechodovou komorou a vesmírem."); 
			parametr.objMap.get("prulez").opened = false;
		}
		else{
			println("Jejda, takový průlez tu není.");
		}
		return true;
	}
	return true; 
}

//otevri prulez
function otevri(sep, _this, parametr){
	var pole = ["prulez", "dvere"]; 
	var obj = parser.handleCommand(sep, pole);
	if(obj.command == "") { println("Musíš zadat, co chceš otevřít."); return true; }
	if(obj.command == "dvere") { println("Zkus raději otevřít průlez"); return true; }

	var rooms = ["vesmir", "kokpit", "prechodova komora"];
	if(sep.length == 0){
		println("Musíš zadat, co chceš otevřít."); 
		return 0;
	}
	var res = parser.handleCommand(sep, rooms);

	if(res.command == ""){
		println("Takový průlez tu není.");
		return true;
	}
	//otevirame z kokpitu
	if(parametr.name == "kokpit"){
		//
		var prulez = parametr.objMap.get("prulez kokpit");

		if(res.command == "prechodova komora"){
			if(prulez.opened == true) {println("Průlez mezi kokpitem a přechodovou komorou je již otevřený"); }
			else{
				println("Otevřel jsi průlez do přechodové komory."); 
				prulez.opened = true; 
			}
		}
		else{
			println("Jejda, takový průlez tu není.");
		}
		return true;
	}
	//vzdy mohou byt otevreny pouze jedny dvere
	if(parametr.name == "prechodova komora"){
		if(res.command ==  "prechodova komora" ) { println("Takový průlez tu není"); return true; }
		var to = res.command;  

		if(parametr.vacuum == true && to == "kokpit"){ println("V přechodové komoře je vakuum, které se nesmí dostat do kokpitu. Musíš nejdřív přidat vzduch."); return true; }
		if(parametr.vacuum == false && to == "vesmir"){ println("V přechodové komoře je vzduch, kdybys teď otevřel průlez do vesmíru, došlo by k dekompresi."); return true; }

		var prulez = parametr.objMap.get("prulez " + res.command);
		if(prulez.opened == true){println("Průlez do " + res.command + "je již otevřen"); return true; }

		var name = "kokpitem";
		if(to == "vesmir") name = "vesmírem";
		println("Otevřel jsi půlez mezi přechodovou komorou a " + name);
		prulez.opened = true;
	}
	//z vesmiru do prechodove komory
	if(parametr.name == "vesmir"){
		if(res.command == "prechodova komora"){
			if(parametr.objMap.get("prulez vesmir").opened == true){
				println("Průlez už je otevřený");
			}else{
				println("Otevřel jsi průlez do přechodové komory");
				parametr.objMap.get("prulez").opened = true;
			} 
		}else{
			println("Takový průlez nemůžeš otevřít");
		}
	}
	return true; 
}

//cti o nejakem tematu 
//podle fáze hry se tu budou zobrazovat nápovědy 
function cti(sep, _this, parametr){
	if(parametr.name != "inventar"){ println("Manuál musíš nejprve vzít do ruky, aby sis ho mohl číst."); return true; }

	//odfiltruj manual 
	var manual = ["manual"];
	parser.handleCommand(sep, manual); //odfiltruj manual 


	//temata
	var topics = ["obsah", "prechodova komora", "ovladaci panel", "oprava plaste" ]; 
	var phase = [1, 1, 1, 1]; //v jake fázi můžeme tuto nápovědu poskytnout 
	var obj = parser.handleCommand(sep, topics);

	if(obj.command == "") {println("Musíš zadat, o čem si chceš číst. Pro začátek si přečti obsah."); return true; }
	if(obj.command == "obsah") {
		println("V manuálu můžeš číst o nejrůznějších tématech. Tak například na něm najdeš stránky s tématy :"); 
		for(var i = 0; i < topics.length; i++){
			if(phase[i] <= game.phase){ //muzeme vypsat
				println(topics[i]);
			}
		}
		return true;
	}
	var ph = topics.find(e => e == obj.command); 

	//hrac by o tom jeste nemel vedet
	if(game.phase < ph){
		println("S touto nápovědou trochu předbíháš. Zkus nejprve udělat jiné kroky.");   
		return true;
	}

	println("Na stránkách manálu ses dočetl:"); 
	//poskytni napovedu o pk
	if(obj.command == "prechodova komora"){
		println("Pro vstup do vesmíru je nutné projít přechodovou komorou. To je místnost, kde se nachází skafandr, nutný pro výstup do volného vesmíru. Po nasazení skafandru a uzavření obou průlezů, je nutné odčerpat vzduch. To se provede stisknutím příslušného tlačítka.");
	}


	if(obj.command == "ovladaci panel"){
		println("Na ovládacím panelul můžeš aktivovat autopilota.Na ovládacím panelul můžeš aktivovat autopilota. Autopilot slouží k automatickému nastavení přistání. Po jeho aktivaci bude zkontrolován stav raketoplánu, a pokud proběhnou všechny testy úspěšně, bude zahájeno automatické přistání."); 
	}

	if(obj.command == "oprava plaste"){
		println("Vyskytne-li se někde na raktetě místo s poškozenými keramickými destičkami, je nutné jej opravit. To je provedeno při výstupu do volného vesmíru. Nejprve je nutné přiložit keramické destičky na poškozené místo, a poté přišroubovat šroubky aku vrtačkou."); 
	}

	return true;
}

//zasroubuj sroubky, funguje i na aku
function zasroubuj(sep, _this, parametr){

	if(game.bag.objMap.has("aku vrtacka") == false){ println("Abys mohl šroubovat, musíš mít v ruce aku vrtačku."); return true; }

	if(game.room != "vesmir"){ 
		var name = "";
		switch (game.room){
			case "kokpit":
				name = "kokpitu";
				break;
			case "prechodova komora":
				name = "přechodové komoře";
				break;
			case "nakladovy prostor":
				name = "nákladovém prostoru";
				break;

		}
		println("Aku vrtačka je určena pouze pro venkovní použití. Její použití v " + game.room + " by mohlo být nebezpečné!");
		return true;
	}

	//akucka musi byt v ruce, sroubky taky, akucka musi byt nabita 
	if(game.bag.objMap.has("sroubky") == false){ println("Abys měl co šroubovat, musíš mít v ruce šroubky."); return true; }

	var aku = game.bag.objMap.get("aku vrtacka");

	if(aku.battery == false) {println("Aku vrtačka je vybitá, musíš ji nejprve nabít."); return true; }

	var sroubky = ["sroubky"]; //musime prisroubovat sroubky 
	var obj = parser.handleCommand(sep, sroubky);
	
	if(obj.command == ""){
		println("Musíš zadat, co chceš šroubovat. Například šroubky."); 
	}

	showInputIn(4000); 
	println("Jemně jsi zmáčkl spoušť aku vrtačky."); 
	println("Šroubuješ a šroubuješ. Nejprve jsi zašroubovat první šroubek, pak druhý, potom třetí a čtvrý.", 1);

	//sroubky dame do vesmiru
	//var objM = game.roomMap.get("vesmir").objMap;
	var objM = game.roomMap.get(game.room).objMap;
	game.bag.objMap.get("sroubky").screwed = true; 
	objM.set("sroubky", game.bag.objMap.get("sroubky"));
	game.bag.objMap.delete("sroubky");
		
	if(game.bag.objMap.has("keramicke desticky") == false || game.bag.objMap.get("keramicke desticky").attached == false) { println("Ale poškozené místo jsi neopravil, protože jsi nepřiložil keramické destičky na poškozené místo.", 4); return true; }


	//premistime i keramicke desticky
	objM.set("keramicke desticky", game.bag.objMap.get("keramicke desticky"));
	game.bag.objMap.delete("keramicke desticky"); 
	//sroubky se ocitnou ve vesmiru
	return true;
}


//tuto funkci spust po n sekundách
function nabito(nabijecka){
	if(nabijecka.plugged == true){
		println("Zelená ledka na nabíječce se rozsvítila."); return false;
	}
}

//kdyz se vezme akucka, nabijecka nebo akucka, nabijeni se prerusi
function takeAku(where, _this){
	var objm = game.roomMap.get("kokpit").objMap;
	if(objm.has("nabijecka") && objm.get("nabijecka").plugged == true){
		objm.get("nabijecka").plugged = false;
		println("Aku vrtačka se přestala nabíjet."); 
	} 
	return 0;
}

//aku vrtacka se po n minutach vybije
function vybij(aku){
	aku.battery = false;
}

function priloz(sep, _this, parametr){
	if(sep.length == 0) {println("Musíš zadat, co a kam chceš přiložit."); return true; }
	//co 
	var pole = ["keramicke desticky"];
	var res = parser.handleCommand(sep, pole);
	if(res.command == ""){ println("To ti moc nepomůže. Zkus někam přiložit keramické destičky."); return true; }
	//kam
	if(parametr.name != "inventar") {println("Abys mohl nějakou věc někam přiložit, musíš ji držet v ruce."); return true; }
	if(game.room != "vesmir"  )  { println("Keramické destičky se hodí na opravu pláště rakety. Možná budeš muset opravit plášť."); return true; }

	if(sep.length == 0) {println("Musíš specifikovat, kam chceš destičky přiložit."); return true; }
	//jsme ve vesmiru
	var pole = ["diru", "raketu", "poskozene misto", "poskozeny plast"];
	var res = parser.handleCommand(sep, pole);

	if(res.command == ""){
		println("Dávat destičky tam ti bude k ničemu. Zkus je raději přiložit na poškozené místo pláště."); 
		return true; 
	}
	if(parametr.objMap.has("sroubky") && parametr.objMap.get("sroubky").screwed == true){
		println("Ať se snažíš, jak se snažíš, keramické destičky na poškozené místo přiložit nejde. <br> A vskutku. Jsou tam již zašroubobané šroubky.");
		return true; 
	}
	println("Přiložil jsi keramické destičky na poškozené místo pláště.");
	game.bag.objMap.get("keramicke desticky").attached = true;     
	return true;
}

//odsroubuj sroubky
function odsroubuj(sep, _this, parametr){
	
	if(game.bag.objMap.has("aku vrtacka") == false){ println("Nemáš v ruce aku vrtačku, nemůžeš nic odšroubovat."); return true; }

	if(parametr.name != "vesmir") { println("Je nebezpečné šroubovat mimo vesmír."); return true; }

	if(sep.length == 0) {println("Musíš zadat, co chceš odšroubovat."); return true; }

	var pole = ["sroubky"];
	var res = parser.handleCommand(sep, pole);

	if(res.command == ""){ println("Nic takového nemůžeš odšroubovat. Možná jsi myslel šroubky."); return true; }

	if(game.bag.objMap.get("aku vrtacka").battery == false){ println("Aku vrtačka je vybitá. Nejprve ji musíš dobít."); return true; }

	if(game.roomMap.get(game.room).objMap.get("sroubky") == false || game.roomMap.get(game.room).objMap.get("sroubky").screwed == false){
		println("Šroubky nejsou zašroubované."); 
		return true; 
	}

	//sroubky dame do bagu
	println("Odšroubováváš šroubky."); 
	var thisRoom = game.roomMap.get(game.room);
	var sroubky = thisRoom.objMap.get("sroubky"); 
	sroubky.screwed = false;
	game.bag.objMap.set("sroubky", sroubky);
	thisRoom.objMap.delete("sroubky");
	showInputIn(4000); 
	println("Šroubky odšroubovány.", 4); 
	return true;
}

function piluj(sep, _this, par){
	var pole = ["sroubky"];  //co vsechno se da pilovat
	if(par != game.bag) {println("Jejda, pilník nemáš v ruce. To asi nepůjde"); return true; } //akce uz probehla
	var obj = parser.handleCommand(sep, pole);
	if(obj.command == "") { println("Musíš zadat, co chceš upilovat"); return true; }
	//zmen nekde stav sroubku na true
	println("Piluješ a piluješ");
	println("Dopilovaj jsi", 4); 
	delay(4); 
	return true;
}

//aktivuj autopilota, nastav
function aktivuj(sep, _this, par){
	var pole = ["autopilot"];  
	var obj = parser.handleCommand(sep, pole);
	//zbav se autopilota 
 	println("Testy pro přistání spuštěny. Výpočty probíhají.");
	var vv = game.roomMap.get('vesmir');
	if(vv.objMap.has("keramicke desticky") == false || vv.objMap.get("keramicke desticky").attached == false) {  showInputIn(10*1000); println("Test přerušen. Nalezena neznámá závada v sektoru AT346. Před nastavením autopilota je nutné ji opravit.", 10); return true; }

	hideInput(); 
	println("Autopilot úspěsně aktivován.", 10); 
	println("Navádění na přistání začalo.", 15); 

	println("Výborně, právě jsi úspěšně navedl raketu na přistání a tím dokončil hru.", 15); 

	game.phase = 10;
	return true;
}

function destickyMove(_this, from, to){
	var vv = game.roomMap.get("vesmir").objMap;
	if(vv.has("sroubky") == true && vv.get("sroubky").screwed == true && _this.attached){ return true;} //desticky  zustanou prichyceny b

	_this.attached = false; 
	return true; 
}

//funkce na desticky
function destickyPickUp(where, _this){
	var vv = game.roomMap.get("vesmir").objMap;
	if(where == "vesmir" && vv.has("sroubky") == true && vv.get("sroubky").screwed == true && _this.attached){
		println("Destičky jsou přišroubované. Nepůjdou jen tak vzít."); 
		return 1; //nejde vzit
	}
	else{
		_this.attached = false; 
	}
	//uspesne sebrani
	return 0; 
} 

//jak se přidělávají keramické destičky ?
//popis místo díry - Úplně tu chybí vrchní plášť z keramických destiček. Zřejmě se odlomily  

function keyPressed(e){
	var input = document.getElementById('input');
	input.focus();
	if(e.keyCode == 13){
		game.inputCommand(input.value);
		game.history.push(input.value); 
		game.i = game.history.length;
		input.value = "";
	}
	//arrow up
	if(e.keyCode == 38){
		if(game.i == 0) return;
		game.i--;
		input.value = game.history[game.i];
	}
	//arrow down
	if(e.keyCode == 40){
		if(game.i >= game.history.length) return;
		if(game.i == game.history.length - 1){ game.i++; input.value = ""; }
		else{
			game.i++;
			input.value = game.history[game.i]; 
		}
	}
}
