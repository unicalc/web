function importData(data) {
	for (key in data) this[key] = data[key];
	this.image = (this.name.toLowerCase() + '.png').replace('-', '_').replace(' ', '_');
}


function basicUnit(data) {
	this.armorPiercing = { GL: 0, GH: 0, AIR: 0, AQUA: 0, AMPHI: 0};
	this.minRange = 1;
	this.maxRange = 1;
	this.canCapture = false;
	this.cannotBeBuilt = false;
	this.canPopup = false;
	this.attackAfterMove = true;
	this.moveAfterAttack = 0;
	this.repair = 1;
	this.repairBonus = 0;
	this.actions = 1;
}

function groundLightUnit(data) {
	basicUnit.call(this, data);
	this.class = 'GL';
	this.canCapture = true;
	this.terrain =
		{mountain: [6, 2, 4],
		forest: [4, 2, 3],
		base: [4, 2, 2],
		harbor: [3, 2, 2],
		plain: [3, 0, 0],
		medical: [3, 0, 0],
		desert: [5, -1, -1],
		bridge: [3, 0, -1],
		road: [3, 0, -1],
		city: [5, -2, -2],
		reef: [6, -2, -3],
		chasm: [6, -3, -4],
		swamp: [6, -1, -2]}
	importData.call(this, data);
}

function groundHeavyUnit(data) {
	basicUnit.call(this, data);
	this.class = 'GH';
	this.terrain =
		{forest: [6, 0, -3],
		base: [4, 0, -1],
		harbor: [3, 0, -1],
		plain: [3, 0, 0],
		medical: [3, 0, 0],
		desert: [4, 0, 0],
		bridge: [2, 0, -2],
		road: [2, 0, -2],
		city: [5, -3, -3],
		swamp: [6, -1, -2]}
	importData.call(this, data);
}

function airUnit(data) {
	basicUnit.call(this, data);
	this.class = 'AIR';
	this.terrain =
		{mountain: [3, 0, 0],
		forest: [3, 0, 0],
		base: [4, 0, 0],
		harbor: [3, 0, 0],
		plain: [3, 0, 0],
		medical: [3, 0, 0],
		desert: [3, 0, 0],
		bridge: [3, 0, 0],
		road: [3, 0, 0],
		city: [5, -2, -2],
		reef: [3, 0, 0],
		chasm: [4, 0, 0],
		swamp: [3, 0, 0],
		water: [3, 0, 0]}
	importData.call(this, data);
}

function aquaUnit(data) {
	basicUnit.call(this, data);
	this.class = 'AQUA';
	this.terrain =
		{water: [3, 0, 0],
		bridge: [4, 0, -2],
		reef: [5, -3, -4],
		ocean: [3, 0, 0],
		harbor: [3, 0, -1]};
	importData.call(this, data);
}

function amphibianUnit(data) {
	basicUnit.call(this, data);
	this.class = 'AMPHI';
	this.terrain =
		{forest: [4, 1, 1],
		base: [4, 1, 1],
		plain: [3, 0, 0],
		medical: [3, 0, 0],
		desert: [5, -3, -4],
		road: [3, 0, -1],
		city: [5, -2, -2],
		swamp: [3, 2, 3],
		water: [3, 0, 0],
		bridge: [3, 0, -1],
		reef: [3, 2, 2],
		ocean: [4, -1, -1],
		harbor: [3, 1, 1]};
	importData.call(this, data);
}


function supportUnit(data) {
	groundLightUnit.call(this, data);
	this.attack = { GL: 0, GH: 0, AIR: 0, AQUA: 0, AMPHI: 0};
	this.minRange = 0;
	this.maxRange = 0;
	this.defense = 0;
	this.attackAfterMove = false;
	// attack bonus = 0
	for (var i in this.terrain) this.terrain[i][1] = 0;
} 

marine = new groundLightUnit(
	{name: 'Marine', 
	cost: 100,
	mobility: 9,
	vision: 4,
	attack: { GL: 6, GH: 3, AIR: 3, AQUA: 2, AMPHI: 6},
	defense: 5
	});

mecha2 = new groundLightUnit(
	{name: 'Mecha 2', 
	cost: 100,
	mobility: 8,
	vision: 3,
	attack: { GL: 7, GH: 4, AIR: 3, AQUA: 2, AMPHI: 7},
	defense: 8,
	cannotBeBuilt: true
	});

engineer = new supportUnit( 
	{name: 'Engineer',
	cost: 200,
	mobility: 6,
	vision: 3,
	repairBonus: 2,
	unitConversion: ['mecha', 'mecha2'],
	specialAttack: 'EMP'
	});

marauder = new groundHeavyUnit(
	{name: 'Marauder',
	cost: 250,
	mobility: 12,
	vision: 5,
	attack: { GL: 8, GH: 4, AIR: 4, AQUA: 4, AMPHI: 7},
	defense: 7,
	actions: 2});

bopper = new groundLightUnit(
	{name: 'Bopper',
	cost: 300,
	mobility: 7,
	vision: 3,
	attack: { GL: 3, GH: 5, AIR: 2, AQUA: 5, AMPHI: 3},
	armorPiercing: { GL: 0, GH: 0.3, AIR: 0.35, AQUA: 0.5, AMPHI: 0},
	minRange: 3,
	maxRange: 3,
	defense: 0,
	attackAfterMove: true});

tank = new groundHeavyUnit(
	{name: 'Tank',
	cost: 400,
	mobility: 8,
	vision: 3,
	attack: { GL: 10, GH: 10, AIR: 0, AQUA: 9, AMPHI: 10},
	defense: 13,
	repair: 2});

helicopter = new airUnit(
	{name: 'Helicopter',
	cost: 500,
	mobility: 12,
	vision: 5,
	attack: { GL: 12, GH: 7, AIR: 9, AQUA: 8, AMPHI: 12},
	defense: 10,
	moveAfterAttack: 6});

battery = new groundHeavyUnit(
	{name: 'Battery',
	cost: 650,
	mobility: 7,
	vision: 4,
	attack: { GL: 12, GH: 10, AIR: 12, AQUA: 10, AMPHI: 12},
	minRange: 2,
	maxRange: 4,
	defense: 4,
	attackAfterMove: false,
	moveAfterAttack: 7});

destroyer = new aquaUnit(
	{name: 'Destroyer',
	cost: 800,
	mobility: 12,
	vision: 5,
	attack: { GL: 10, GH: 10, AIR: 12, AQUA: 16, AMPHI: 10},
	maxRange: 3,
	defense: 12,
	repair: 2});

fuze = new amphibianUnit(
	{name: 'Fuze',
	cost: 200,
	mobility: 11,
	vision: 4,
	attack: { GL: 5, GH: 4, AIR: 3, AQUA: 4, AMPHI: 6},
	armorPiercing: { GL: 0.25, GH: 0, AIR: 0, AQUA: 0.2, AMPHI: 0},
	maxRange: 2,
	defense: 2});

mecha = new groundLightUnit(
	{name: 'Mecha',
	cost: 100,
	mobility: 7,
	vision: 4,
	attack: { GL: 6, GH: 3, AIR: 4, AQUA: 2, AMPHI: 6},
	defense: 6});

cyberUnderling = new groundLightUnit(
	{name: 'Cyber-Underling',
	cost: 100,
	cannotBeBuilt: true,
	canPopup: true,
	mobility: 10,
	vision: 4,
	attack: { GL: 7, GH: 4, AIR: 2, AQUA: 2, AMPHI: 7},
	defense: 6});

assimilator = new supportUnit( 
	{name: 'Assimilator',
	cost: 200,
	mobility: 6,
	vision: 3,
	repairBonus: 2,
	unitConversion: ['underling', 'cyberUnderling'],
	specialAttack: 'UV',
	specialAttackRange: 5,
	specialAttackRecharge: 11,
	});

speeder = new groundHeavyUnit(
	{name: 'Speeder',
	cost: 250,
	mobility: 16,
	vision: 5,
	attack: { GL: 10, GH: 5, AIR: 5, AQUA: 5, AMPHI: 10},
	defense: 8,
	moveAfterAttack: 6,
	repair: 2});

guardian = new groundLightUnit(
	{name: 'Guardian',
	cost: 350,
	mobility: 10,
	vision: 2,
	attack: { GL: 7, GH: 7, AIR: 8, AQUA: 7, AMPHI: 7},
	armorPiercing: { GL: 0, GH: 0.45, AIR: 0, AQUA: 0.45, AMPHI: 0},
	minRange: 1,
	maxRange: 2,
	defense: 3,
	repair: 0});
	
plasmaTank = new groundHeavyUnit(
	{name: 'Plasma Tank',
	cost: 500,
	mobility: 6,
	vision: 3,
	attack: { GL: 10, GH: 11, AIR: 5, AQUA: 11, AMPHI: 10},
	defense: 14});
	
eclipse = new groundHeavyUnit(
	{name: 'Eclipse',
	cost: 400,
	mobility: 10,
	vision: 4,
	attack: { GL: 10, GH: 4, AIR: 12, AQUA: 9, AMPHI: 10},
	minRange: 1,
	maxRange: 2,
	defense: 9});
	
walker = new groundHeavyUnit(
	{name: 'Walker',
	cost: 750,
	mobility: 6,
	vision: 5,
	attack: { GL: 10, GH: 10, AIR: 11, AQUA: 10, AMPHI: 10},
	minRange: 3,
	maxRange: 5,
	defense: 5,
	attackAfterMove: false});
	
hydronaut = new aquaUnit(
	{name: 'Hydronaut',
	cost: 800,
	mobility: 11,
	vision: 6,
	attack: { GL: 12, GH: 10, AIR: 12, AQUA: 13, AMPHI: 12},
	minRange: 2,
	maxRange: 4,
	defense: 10,
	repair: 2});

mantisse = new amphibianUnit(
	{name: 'Mantisse',
	cost: 250,
	mobility: 11,
	vision: 4,
	attack: { GL: 6, GH: 4, AIR: 4, AQUA: 4, AMPHI: 6},
	armorPiercing: { GL: 0.25, GH: 0, AIR: 0.1, AQUA: 0.2, AMPHI: 0},
	maxRange: 2,
	defense: 4});

underling = new groundLightUnit(
	{name: 'Underling',
	cost: 100,
	mobility: 11,
	vision: 3,
	attack: { GL: 6, GH: 3, AIR: 0, AQUA: 2, AMPHI: 6},
	defense: 5,
	canPopup: true});
	
infectedMarine = new groundLightUnit(
	{name: 'Infected Marine',
	cost: 100,
	cannotBeBuilt: true,
	mobility: 10,
	vision: 4,
	attack: { GL: 7, GH: 4, AIR: 4, AQUA: 2, AMPHI: 7},
	defense: 6});

infector = new supportUnit(
	{name: 'Infector',
	cost: 300,
	mobility: 8,
	vision: 3,
	repairBonus: 3,
	unitConversion: ['marine', 'infectedMarine'],
	specialAttack: 'Plague',
	specialAttackRange: 2,
	specialAttackRecharge: 0});

borfly = new airUnit(
	{name: 'Borfly',
	cost: 200,
	mobility: 6,
	vision: 3,
	armorPiercing: { GL: 0, GH: 0.5, AIR: 0.5, AQUA: 0.5, AMPHI: 0},
	attack: { GL: 4, GH: 6, AIR: 1, AQUA: 4, AMPHI: 4},
	minRange: 2,
	maxRange: 3,
	defense: 2,
	attackAfterMove: false});

swarmer = new airUnit(
	{name: 'Swarmer',
	cost: 250,
	mobility: 9,
	vision: 5,
	attack: { GL: 7, GH: 4, AIR: 3, AQUA: 6, AMPHI: 7},
	minRange: 1,
	maxRange: 2,
	defense: 4});

garuda = new airUnit(
	{name: 'Garuda',
	cost: 350,
	mobility: 12,
	vision: 5,
	attack: { GL: 7, GH: 8, AIR: 9, AQUA: 9, AMPHI: 7},
	defense: 8,
	repair: 2});

pinzer = new groundHeavyUnit(
	{name: 'Pinzer',
	cost: 450,
	mobility: 8,
	vision: 3,
	attack: { GL: 12, GH: 10, AIR: 3, AQUA: 10, AMPHI: 12},
	defense: 13,
	repair: 2});

wyrm = new groundHeavyUnit(
	{name: 'Wyrm',
	cost: 550,
	mobility: 6,
	vision: 3,
	attack: { GL: 10, GH: 9, AIR: 12, AQUA: 10, AMPHI: 10},
	minRange: 1,
	maxRange: 3,
	defense: 4});

leviathan = new aquaUnit(
	{name: 'Leviathan',
	cost: 600,
	mobility: 11,
	vision: 4,
	attack: { GL: 10, GH: 10, AIR: 9, AQUA: 12, AMPHI: 10},
	minRange: 1,
	maxRange: 3,
	defense: 12,
	repair: 2});

salamander = new amphibianUnit(
	{name: 'Salamander',
	cost: 200,
	mobility: 9,
	vision: 4,
	attack: { GL: 6, GH: 4, AIR: 0, AQUA: 6, AMPHI: 6},
	armorPiercing: { GL: 0.25, GH: 0, AIR: 0, AQUA: 0.4, AMPHI: 0},
	maxRange: 1,
	defense: 6,
	specialAttack: 'Plague',
	specialAttackRange: 2,
	specialAttackRecharge: 0});

sapiens = [marine, mecha2, engineer, marauder, bopper, tank, helicopter, battery, destroyer, fuze];
for (u in sapiens) sapiens[u].race='sapiens';
titans = [mecha, cyberUnderling, assimilator, speeder, guardian, plasmaTank, eclipse, walker, hydronaut, mantisse];
for (u in titans) titans[u].race='titans';
khraleans = [underling, infectedMarine, infector, borfly, swarmer, garuda, pinzer, wyrm, leviathan, salamander];
for (u in khraleans) khraleans[u].race='khraleans';
						 

RuleSet = {
	Unit: {
		marine: marine,
		mecha2: mecha2,
		engineer: engineer,
		marauder: marauder,
		bopper: bopper,
		tank: tank,
		helicopter: helicopter,
		battery: battery,
		destroyer: destroyer,
		fuze: fuze,
		mecha: mecha,
		cyberUnderling: cyberUnderling,
		assimilator: assimilator,
		speeder: speeder,
		guardian: guardian,
		plasmaTank: plasmaTank,
		eclipse: eclipse,
		walker: walker,
		hydronaut: hydronaut,
		mantisse: mantisse,
		underling: underling,
		infectedMarine: infectedMarine,
		infector: infector,
		borfly: borfly,
		swarmer: swarmer,
		garuda: garuda,
		pinzer: pinzer,
		wyrm: wyrm,
		leviathan: leviathan,
		salamander: salamander
	}
}