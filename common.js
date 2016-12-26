webix.Touch.limit(true);

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
	if (damage == attackerHealth) return prob(6*attackerHealth,6*damage,p);
	var result = 0;
	for (var i=0; i<6; ++i) result+=prob(6*attackerHealth,i+6*damage,p);
	return result;
}		

var terrainData = [];
var tList = ["plain", "base", "city", "medical", "forest", "mountain", "desert", "swamp", "abyss", "road", "bridge", "harbor", "water", "reef", "ocean"];
for (var i = 0; i<tList.length; ++i) terrainData.push({id: tList[i], value: capitalize(tList[i])});

function processAttack(attacker, attackerTerrain, attackerHealth, attackerBonus, defender, defenderTerrain, defenderHealth, probability) {
	var Aa = attacker.attack[defender.class];
	var Dd = defender.defense;
	var result = [];
	
	var attTerrainValues = attacker.terrain[attackerTerrain];
	var attAttBonus = attTerrainValues[1] + attackerBonus;
	if (Aa) Aa += attAttBonus ;
	
	var defTerrainValues = defender.terrain[defenderTerrain];
	var defDefBonus = defTerrainValues[2];
	Dd += defDefBonus;
	
	var pierce = attacker.armorPiercing[defender.class];
	if (pierce) {
		Dd *= 1 - pierce;
	}
	
	var p1 = Aa ? 0.5 + 0.05 * (Aa-Dd) : 0;
	p1 = Math.min(Math.max(p1, 0), 1);
	
	var dmgLimit = Math.min(attackerHealth, defenderHealth);
	var coll1=0;
	for (var i = 0; i<=dmgLimit; ++i) {
		var dmg1 = (chanceOfDamage(attackerHealth, i, p1));
		if (i == defenderHealth) dmg1 = 1-coll1;
		else if (i > defenderHealth) dmg1 = 0;
		else coll1 += dmg1;
		result.push(dmg1 * probability);
	}
	return result;
}

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
		unit.bonusText = 'A: '+unit.rule.terrain[unit.terrain][1]+ ' D: '+unit.rule.terrain[unit.terrain][2];
		
		unit.levelText = ['', '&#65087;', '&#65085;', '???', '&#8593;', '&#65087;&#8593;', '&#65085;&#8593;'][unit.vet];
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
		
		
		for (var attH = 0; attH <= att.initialHealth; ++attH) {
			for (var defH = 0; defH <= def.initialHealth; ++defH) {
				var prob = att.healthProb[attH] * def.healthProb[defH];
				var res = processAttack(att.rule, battle.attTerrain, attH, battle.attBonus + att.vet, def.rule, battle.defTerrain, defH, prob);
				for (var j=0; j<res.length; ++j) {
					battle.attackerDamage[j] += res[j];
					defHp[defH-j]+=res[j];
				}
				if (battle.strikeBack) {
					var res = processAttack(def.rule, battle.defTerrain, defH, def.vet, att.rule, battle.attTerrain, attH, prob);
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