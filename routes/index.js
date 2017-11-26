var express = require('express');
var router = express.Router();
const snake = require("../snakeSolve");

function sendFail(res){
    res.status(400);
    res.send("FAIL");
}

router.get('/', function(req, res, next) {
    var result = snake.startAllTheProcess();
    if(result && result.total > 0) {
        res.send({
            explanation : "The items have the following struct: rIcJ|rIcJ, where rI is the row number, cJ is the column number, and" +
            " pipe is to split the rows/columns.\n I'm showing only the first item, but you can see all items in this URL path: /all",
            total: result.total,
            pair : result.items[0]
        });
    } else {
        sendFail(res);
    }
});

router.get('/all', function(req, res, next) {
    var result = snake.startAllTheProcess();
    if(result && result.total > 0) {
        res.send({
            explanation : "The items have the following struct: rIcJ|rIcJ, where rI is the row number, cJ is the column number, and" +
            " pipe is to split the rows/columns.",
            total: result.total,
            items : result.items
        });
    } else {
        sendFail(res);
    }
});

module.exports = router;
