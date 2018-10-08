var NUMBEROFROLLS=12;

if(typeof webix !== 'undefined')webix.Touch.disable();

function capitalize(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

// binomial coefficient "n over k"
function binomial(n, k) {
	var coeff = 1;
	for (var x = n-k+1; x <= n; x++) coeff *= x;
	for (x = 1; x <= k; x++) coeff /= x;
	return coeff;
}

// returns the probability of k hits with n trials if each try has a chance of p to hit
function prob(n,k,p) { return binomial(n,k)*Math.pow(p,k)*Math.pow(1-p, n-k);}

function chanceOfDamage(attackerHealth, damage, p) {
	if (damage > attackerHealth) return 0;
	if (damage == attackerHealth) return prob(NUMBEROFROLLS*attackerHealth,NUMBEROFROLLS*damage,p);
	var result = 0;
	for (var i=0; i<NUMBEROFROLLS; ++i) result+=prob(NUMBEROFROLLS*attackerHealth,i+NUMBEROFROLLS*damage,p);
	return result;
}

var terrainData = [];
var tList = ["plain", "base", "city", "medical", "forest", "mountain", "desert", "swamp", "chasm", "road", "bridge", "harbor", "water", "reef", "ocean"];
for (var i = 0; i<tList.length; ++i) terrainData.push({id: tList[i], value: capitalize(tList[i])});

RuleSet.Unit["Cyber Underling"].cost=100;
RuleSet.Unit["Infected Marine"].cost=100;
RuleSet.Unit["Mecha II"].cost=100;

for (var unit in RuleSet.Unit) {
	RuleSet.Unit[unit].image = (RuleSet.Unit[unit].name.toLowerCase() + '.png').replace(" (under water)", "_sub").replace('-', '_').replace(' ', '_').replace('ii', '2');
}

function getTerrainData(unit, terrain) {
	return RuleSet.ClassData[unit.class].data[terrain];
}

function isTerrainAllowed(unit, terrain) {
	var z = getTerrainData(unit, terrain);
	return z && z[0]<20;
}


function processAttack(pValue, attackerHealth, defenderHealth, probability) {
	var result = [];
	var dmgLimit = Math.min(attackerHealth, defenderHealth);
	var coll1=0;
	for (var i = 0; i<=dmgLimit; ++i) {
		var dmg1 = (chanceOfDamage(attackerHealth, i, pValue));
		if (i == defenderHealth) dmg1 = 1-coll1;
		else if (i > defenderHealth) dmg1 = 0;
		else coll1 += dmg1;
		result.push(dmg1 * probability);
	}
	return result;
}

var model = {
	units: [
			{ id: 1, rule: RuleSet.Unit.Marauder, initialHealth: 10, terrain: 'plain', vet: 1 },
			{ id: 2, rule: RuleSet.Unit.Mecha, initialHealth: 10, terrain: 'base', vet: 2},
		],
	battles: [
			{ attId: 1, defId: 2, attTerrain: 'plain', defTerrain: 'base', attBonus: 0, strikeBack: true }
		]
};

function pvalue(attacker, attackerTerrain, attackerBonus, defender, defenderTerrain, attUnder, defUnder) {
	//if (!attacker.name.endsWith(" (under water)") && defender.name.endsWith(" (under water)")) return 0;
	var Aa = attacker.attack[defender.class];
	if (!Aa) return 0;
	// Uniwar is buggy and applies attackFromUnderWaterBonus also against diving units
	if (attUnder) {
		if (!attacker.canAttackNonWaterFromUnderWater && (defender.class == 'AIR' || RuleSet.ClassData.AQUA.data[defenderTerrain][0]>20)) return 0;
		/*if (!defUnder )*/ Aa += attacker.attackFromUnderWaterBonus;
	} else {
		if (defUnder) Aa += attacker.bonusVersusUnderWater;
	}
	var attTerrainValues = RuleSet.ClassData[attacker.class].data[attackerTerrain];
	//var attTerrainValues = attacker.terrain[attackerTerrain];	
	var attAttBonus = attTerrainValues[1] + attackerBonus;
	Aa += attAttBonus;
	//console.log(attackerBonus);
	var Dd = defUnder ? defender.defenseUnder : defender.defense;
	var defTerrainValues = RuleSet.ClassData[defender.class].data[defenderTerrain];
	//var defTerrainValues = defender.terrain[defenderTerrain];
	var defDefBonus = defTerrainValues[2];
	Dd += defDefBonus;

	var pierce = attacker.armorPiercing[defender.class];
	if (pierce) {
		Dd *= 1 - pierce;
		//Dd = Math.round(Dd);
	}
	var p1 = 0.5 + 0.05 * (Aa-Dd);
	return Math.min(Math.max(p1, 0), 1);
};


function processData() {
	for (var i=0; i<model.units.length; ++i) {
		var unit = model.units[i];
		var hp = [];
		unit.health = unit.initialHealth;
		unit.unit = unit.rule.name;
		unit.image = unit.rule.image;
		for (var j=0; j<unit.health; ++j) hp.push(0);
		hp.push(1);
		unit.healthProb=hp;
		unit.healthString = unit.health;
		unit.bonusText = 'A: '+RuleSet.ClassData[unit.rule.class].data[unit.terrain][1]+ ' D: '+RuleSet.ClassData[unit.rule.class].data[unit.terrain][2];
		//unit.bonusText = 'A: '+unit.rule.terrain[unit.terrain][1]+ ' D: '+unit.rule.terrain[unit.terrain][2];

		unit.levelText = ['', '&#65087;', '&#65085;', '???', '&#8593;', '&#65087;&#8593;', '&#65085;&#8593;'][unit.vet];
		unit.realVet = unit.vet;
		if (unit.vet > 3) unit.vet += unit.rule.popupBonus - 4;
	}

	for (var i=0; i<model.battles.length; ++i) {
		var battle = model.battles[i];
		var att;
		var def;
		for (var j=0; j < model.units.length; ++j) {
							var unit=model.units[j];
							if (unit.id == battle.attId) att = unit;
							if (unit.id == battle.defId) def = unit;
		}
		//battle.att = battle.attId + ": " + att.unit + '(' + att.health + ')';
		battle.attImg = att.image;
		battle.attUnit = att.unit;
		battle.attHealth = att.health;
		battle.attBonusText = (battle.attBonus) ? " +"+battle.attBonus : "";
		//battle.def = battle.defId + ": " + def.unit + '(' + def.health + ')';
		battle.defImg = def.image;
		battle.defUnit = def.unit;
		battle.defHealth = def.health;

		battle.attackerDamage = [];
		battle.defenderDamage = [];
		for (var j=Math.min(att.initialHealth, def.initialHealth); j>=0; --j) {
			battle.attackerDamage.push(0);
			battle.defenderDamage.push(0);
		}

		var attHp = [];
		for (var j=0; j<=att.initialHealth; ++j) attHp.push(0);
		var defHp = [];
		for (var j=0; j<=def.initialHealth; ++j) defHp.push(0);

		battle.p1 = pvalue(att.rule, battle.attTerrain, battle.attBonus + att.vet, def.rule, battle.defTerrain, battle.attUnder, battle.defUnder);
		battle.p2 = (battle.strikeBack) ? pvalue(def.rule, battle.defTerrain, def.vet, att.rule, battle.attTerrain, battle.defUnder, battle.attUnder) : 0;


		for (var attH = 0; attH <= att.initialHealth; ++attH) {
			for (var defH = 0; defH <= def.initialHealth; ++defH) {
				var prob = att.healthProb[attH] * def.healthProb[defH];
				var res = processAttack(battle.p1, attH, defH, prob);
				for (var j=0; j<res.length; ++j) {
					battle.attackerDamage[j] += res[j];
					defHp[defH-j]+=res[j];
				}
				if (battle.strikeBack) {
					var res = processAttack(battle.p2, defH, attH, prob);
					for (var j=0; j<res.length; ++j) {
						battle.defenderDamage[j] += res[j];
						attHp[attH-j]+=res[j];
					}
				}
			}
		}
		if (battle.strikeBack) att.healthProb=attHp;
		def.healthProb=defHp;
		var attH = 0;
		for (var j = 0; j<att.healthProb.length; ++j) attH += j*att.healthProb[j];
		var defH = 0;
		for (var j = 0; j<defHp.length; ++j) defH += j*defHp[j];
		attHOld = att.health;
		defHOld = def.health;
		att.health = Math.round(10*attH)/10;
		def.health = Math.round(10*defH)/10;
		battle.credits = Math.round((defHOld - def.health) * def.rule.cost - (attHOld - att.health) * att.rule.cost) / 10;
		battle.attLoss = Math.round(10*(att.health - attHOld))/10;
		battle.defLoss = Math.round(10*(def.health - defHOld))/10;
		if (att.health < att.initialHealth) att.healthString = att.initialHealth + " -> " +  att.health;
		if (def.health < def.initialHealth) def.healthString = def.initialHealth + " -> " +  def.health;

	}
}
