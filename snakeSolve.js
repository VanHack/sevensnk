'use strict';

const fs = require('fs')
var patternsGlobal = new Map();
var snakes = new Map();
var startedCells = new Set();
var snakesSumKey = {};
var stopExecution = false;
var itemsDifferents = {};
var defaultCSV = "";
// if True, print the result cells in sequence to make a snake; if False, print the result cells sorted by row and col.
// if True: It makes the performance worst.
var isShowInSequenceCells = true;
fs.readFile('resources/7snake.csv', 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    defaultCSV = data;
});
//var csvTest = "227,191,234,67,43,13,48,211,253,243\n36,95,229,209,49,230,46,16,190,49\n206,130,85,67,104,93,128,243,38,173\n234,82,191,153,170,99,124,60,12,31\n192,9,24,127,183,241,139,21,244,66\n93,200,66,16,189,42,209,113,215,4\n182,141,153,64,229,55,115,139,12,187\n133,241,35,255,126,39,110,147,24,241\n2,202,191,159,223,128,154,109,6,200\n173,44,163,196,159,232,135,159,117,175";

function csvToArray (csv) {
    let rows  = csv.split("\n");
    return rows.map(function (row) {
        return row.split(",");
    });
};

function getPatterns(csv){
    let matrix = csvToArray(csv);
    let patterns=new Map();
    let totalR = matrix.length;
    let totalC = matrix[0].length;


    for(var i = 1; i <= totalR; i++){
        for(var j = 1; j <= totalC; j++){
            let pattern = "r" + i + "c" + j;
            let adjacentPoints = [];
            if(i - 1 > 0){
                adjacentPoints.push("r" + (i-1) + "c" + j);
            }
            if(i + 1 <= totalR){
                adjacentPoints.push("r" + (i+1) + "c" + j);
            }
            if(j - 1 > 0){
                adjacentPoints.push("r" + i + "c" + (j-1));
            }
            if(j + 1 <= totalC){
                adjacentPoints.push("r" + i + "c" + (j+1));
            }
            let cell = { "pattern" : pattern, "value" : matrix[i-1][j-1], "adjacentPoints" : adjacentPoints };
            patterns.set(pattern, cell);
        }
    }

    patternsGlobal = patterns;
}

function getItemCellFromMap(cell){
    return patternsGlobal.get(cell);
}

function getAdjacentPointsFromCell(cell){
    return getItemCellFromMap(cell).adjacentPoints;
}

function getValueByCellName(cell){
    return parseInt(getItemCellFromMap(cell).value);
}

function checkEqualsSum(snake){
    if(snakesSumKey[snake["sum"]].length > 1){
        let itemsNewSnake = snake["name"].split("|");
        snakesSumKey[snake["sum"]].forEach((item)=>{

            let isDifferent = true;
            for(let x = 0; x < itemsNewSnake.length; x++){
                if(item.indexOf(itemsNewSnake[x]) > -1){
                    isDifferent = false;
                }
            }
            if(isDifferent){
                itemsDifferents["items"].push(
                    {
                        "sum" : snake["sum"],
                        "item1" : item,
                        "item2" : isShowInSequenceCells ? snake["sequence"] : snake["name"]
                    }
                )
                /*itemsDifferents[snake["sum"]] = {
                    "sum" : snake["sum"],
                    "itemsSum" : item,
                    "differentItem" : snake
                };*/
                itemsDifferents["total"] = parseInt((itemsDifferents["total"]) + 1);
                return true;
            }
        });
    }
    return false;
}

function addItemToGlobalSnake(snake){
    let sortedName = snake["items"].sort((a, b)=>{return a > b}).join("|");
    snakes.set(sortedName, snake);
    snake["sequence"] = snake["name"];
    snake["name"] = sortedName;
    if(!snakesSumKey[snake["sum"]]) snakesSumKey[snake["sum"]] = [];

    if(snakesSumKey[snake["sum"]].indexOf(sortedName) == -1){
        if(checkEqualsSum(snake)){
            stopExecution = true;
        }
        snakesSumKey[snake["sum"]].push(isShowInSequenceCells ? snake["sequence"] : sortedName);
    }
}

function startNewSnake(snake, limitSize){
    if(snake["name"].split("|").length < limitSize && !stopExecution){
        let adjacentList = getAdjacentPointsFromCell(snake["lastCell"]);

        for(let idx = 0; idx < adjacentList.length; idx++){
            let adjacentCell = adjacentList[idx];
            if(snake["name"].indexOf(adjacentCell) == -1){
                let newSnake = {};
                let total = parseInt(snake["sum"] || 0);
                total += getValueByCellName(adjacentCell);
                newSnake["sum"] = total;
                newSnake["lastCell"] = adjacentCell;
                newSnake["name"] = snake["name"] + "|" + adjacentCell;
                newSnake["items"] = newSnake["name"].split("|");
                startNewSnake(newSnake, limitSize);
            }

            if(!startedCells.has(adjacentCell) && !stopExecution){
                startedCells.add(adjacentCell);
                startNewSnake(getStartedItem(adjacentCell), limitSize);
            }
        }
    } else {
        addItemToGlobalSnake(snake);
    }
}

function getStartedItem(name){
    return {
        "name" : name,
        "sum" : getValueByCellName(name),
        "lastCell" : name,
        "items" : [name]
    };
}

function resetVariables(){
    patternsGlobal = new Map();
    snakes = new Map();
    startedCells = new Set();
    snakesSumKey = {};
    stopExecution = false;
    itemsDifferents = {
        "total" : 0,
        "items" : []
    };
}

module.exports.startAllTheProcess = function(csv){
    resetVariables();
    getPatterns(csv || defaultCSV);
    let startCellName = "r1c1";
    startedCells.add(startCellName);
    startNewSnake(getStartedItem(startCellName), 7);
    return itemsDifferents;
}