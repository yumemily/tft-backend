const data = require("./data")
const path = require("path")
const fs = require("fs")
const pathToChampions = path.join(__dirname, "champions.json");
const pathToItems = path.join(__dirname, "items.json");

function convertDataToChampionMap(){
    var result = data.sets["3"].champions.reduce(function(map, obj) {
        map[obj.apiName] = obj;
        return map;
    }, {});
    fs.writeFileSync(pathToChampions, JSON.stringify(result))
}

function convertDataToItemMap(){
    var result = data.items.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
    }, {});
    fs.writeFileSync(pathToItems, JSON.stringify(result))
}

// convertDataToChampionMap()
convertDataToItemMap()