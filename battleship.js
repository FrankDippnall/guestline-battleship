
//jQuery extension
$.fn.exists = function () {
    return this.length !== 0;
}


//constant globals
const board = {
    width: 10,
    height: 10,
    ships: {
        4: 2,
        5: 1
    },
    data: null
};
const cell = {
    BLOCKED: -1,
    EMPTY: 0,
    SHIP_VERTICAL: 1,
    SHIP_HORIZONTAL: 2,
    SHIP_TOP: 3,
    SHIP_RIGHT: 4,
    SHIP_BOTTOM: 5,
    SHIP_LEFT: 6,
    get: function (value) {
        for (let key of Object.keys(this)) {
            if (value == this[key]) return key;
        }
    }
}

//runtime globals
//...


function generateEmptyBoard() {
    let data = [];
    let html = "";
    for (let y = 0; y < board.height; y++) {
        let row_data = [];
        html += `<tr>`
        for (let x = 0; x < board.width; x++) {
            html += `<td id="${String.fromCharCode((x) + 65)}-${board.height - y}" class="unknown"></td>`
            row_data.push(cell.EMPTY);
        }
        html += `</tr>`
        data.push(row_data);
    }
    board.data = data;
    $("#game-board").html(html);
}

function spawnShips() {
    //for each ship size,
    for (let ship_size of Object.keys(board.ships)) {
        //for the number of ships specified,
        for (let s = 0; s < board.ships[ship_size]; s++) {
            //spawn a ship
            spawnShip(ship_size);
        }
    }
}

let last_start_pos;
let last_cell_number;

let last_empty_array;

function spawnShip(ship_size) {
    let start_pos;

    while ((start_pos = randomEmptyCell()) != null) {
        last_start_pos = start_pos;
        //check if blocked
        let valid = new Set(["up", "right", "down", "left"])




        for (let i = 1; i < ship_size; i++) {
            if (valid.has("up")) {
                if (!board.data[start_pos.y + i] ||
                    !validCell(board.data[start_pos.y + i][start_pos.x])) {
                    valid.delete("up");
                }
            }
            if (valid.has("right")) {
                if (!validCell(board.data[start_pos.y][start_pos.x + i])) {
                    valid.delete("right");
                }
            }
            if (valid.has("down")) {
                if (!board.data[start_pos.y - i] ||
                    !validCell(board.data[start_pos.y - i][start_pos.x])) {
                    valid.delete("down");
                }
            }
            if (valid.has("left")) {
                if (!validCell(board.data[start_pos.y][start_pos.x - i])) {
                    valid.delete("left");
                }
            }
        }
        if (valid.size == 0) {
            //no valid directions, set cell to BLOCKED
            board.data[start_pos.y][start_pos.x] = cell.BLOCKED;
        }
        else {
            //select random direction from remaining options
            let options = Array.from(valid)
            let direction = options[Math.floor(Math.random() * options.length)];



            switch (direction) {
                case "up":
                    //end piece (bottom)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_TOP;
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces (vertical)
                        board.data[start_pos.y + i][start_pos.x] = cell.SHIP_VERTICAL;
                    }
                    //end piece (top)
                    board.data[start_pos.y + (ship_size - 1)][start_pos.x] = cell.SHIP_BOTTOM;
                    break;
                case "right":
                    //end piece (left)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_LEFT;
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces (horizontal)
                        board.data[start_pos.y][start_pos.x + i] = cell.SHIP_HORIZONTAL;
                    }
                    //end piece (right)
                    board.data[start_pos.y][start_pos.x + (ship_size - 1)] = cell.SHIP_RIGHT;
                    break;
                case "down":
                    //end piece (top)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_BOTTOM;
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces (vertical)
                        board.data[start_pos.y - i][start_pos.x] = cell.SHIP_VERTICAL;
                    }
                    //end piece (bottom)
                    board.data[start_pos.y - (ship_size - 1)][start_pos.x] = cell.SHIP_TOP;
                    break;
                case "left":
                    //end piece (right)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_RIGHT;
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces (horizontal)
                        board.data[start_pos.y][start_pos.x - i] = cell.SHIP_HORIZONTAL;
                    }
                    //end piece (left)
                    board.data[start_pos.y][start_pos.x - (ship_size - 1)] = cell.SHIP_LEFT;
                    break;
            }

            break;
        }


    }
}

function validCell(value) {
    //returns true if the cell can contain a new ship section
    if (value == undefined) return false;
    else if (value > 0) return false;
    else return true;
}


function randomEmptyCell() {
    //returns a random cell's coordinates (only returns cells of type EMPTY (0))
    let empty_array = [];
    let empty_total = 0;
    for (let y in board.data) {
        empty_array.push([]);
        let empty_num = 0;
        for (let x in board.data[y]) {
            if (board.data[y][x] == cell.EMPTY) {
                empty_array[y].push(empty_num++);
                empty_total++;
            }
            else empty_array[y].push(-1);
        }
        //add count to each row.
        empty_array[y].unshift(empty_num);
    }

    last_empty_array = empty_array;

    if (empty_total == 0) return null;
    //get random cell number
    let cell_number = Math.floor(Math.random() * empty_total);
    last_cell_number = cell_number

    //get cell coordinates
    let empty_count = 0;
    for (let y in empty_array) {
        empty_count += empty_array[y][0];
        if (cell_number < empty_count) {
            //cell is in the row
            for (let x = 0; x < empty_array[y].length; x++) {
                if (empty_count - empty_array[y][0] + empty_array[y][x + 1] == cell_number) {
                    return { x: x, y: parseInt(y) }
                }
            }
            console.error("Empty cell " + cell_number + " not found.");

        }
    };
}

function generateBoard() {

    spawnShips();


    if ($("#reveal-board").prop("checked")) revealAllCells();
}

function revealCell(coords) {

    //get index values
    let x = coords.split("-")[0].charCodeAt(0) - 65;
    let y = board.height - coords.split("-")[1];

    let cellType = board.data[y][x];


    let cellElem = $("#" + coords)
    switch (cellType) {
        case cell.EMPTY: case cell.BLOCKED:
            cellElem.addClass("miss");
            break;
        case cell.SHIP_VERTICAL:
            cellElem.addClass("ship-vertical");
            break;
        case cell.SHIP_HORIZONTAL:
            cellElem.addClass("ship-horizontal");
            break;
        case cell.SHIP_TOP:
            cellElem.addClass("ship-top");
            break;
        case cell.SHIP_RIGHT:
            cellElem.addClass("ship-right");
            break;
        case cell.SHIP_BOTTOM:
            cellElem.addClass("ship-bottom");
            break;
        case cell.SHIP_LEFT:
            cellElem.addClass("ship-left");
            break;
        default:
            console.error("cell contains invalid value: " + coords);
    }
    cellElem.addClass("revealed");
    cellElem.removeClass("unknown");
}

function fire() {
    let coords = $("input#target").val();
    if ($("#" + coords).exists()) {
        console.log("fire!");
    }
    else {
        console.warn("Cell with coordinates " + coords + " does not exist.");
    }

}





$(function () {
    createGame();
});

function createGame() {
    let startTime = new Date().getTime();
    cleanUp();
    generateBoard();
    addEventHandlers();
    console.log("Game created in " + ((new Date().getTime() - startTime) / 1000) + "s");
}

function cleanUp() {
    $("#game-board td.unknown").off("click")
    $("input#target").off("keypress");
    $("input#target").off("keydown");
    $("button#fire").off("click");
    $("input#target").off("input");
    $("#new-board").off("click");
    generateEmptyBoard();
}

function addEventHandlers() {


    $("#game-board td.unknown").click(function () {
        let coords = $(this).attr("id")
        selectCell(coords);
        $("input#target").val(coords);
        updateFireButton();

        whatis(coords)
    });


    $("button#fire").prop("disabled", true);

    $("input#target").on("keydown", formatInput);

    $("input#target").on("input", updateFireButton);


    $("input#target").on("keypress", function (e) { e.preventDefault() });

    $("button#fire").click(fire);



    $("#new-board").click(createGame);
}

function formatInput(e) {
    e.preventDefault();

    console.log(e.keyCode, e);

    let input = String.fromCharCode(e.keyCode).toUpperCase();
    let code = input.charCodeAt(0);

    let current = $(e.target).val();

    if (code == 8) {
        //backspace
        $(e.target).val(current.substr(0, current.length - 1));
    }
    else if (code == 13) {
        //enter
        fire();
        return;
    }
    else {

        //if valid letter
        if (code >= 65 /*A*/ && code <= (65 + board.width - 1)) {
            $(e.target).val(input + "-")
        }
        else if (current.length < 4 && (
            (code >= 49 /*1*/ && code <= 57 /*9*/) ||
            (code == 48 /*0*/ && current.length >= 3))) {
            $(e.target).val(current + input)
        }
    }
    updateFireButton();

}




function updateSelectedCell() {
    let coords = $("input#target").val();
    if (coords.length > 0) {
        if ($("#" + coords).exists()) {
            selectCell(coords);
            return true;
        }
        else if (coords.length == 2) {
            selectColumn(coords)
        }
        else {
            selectCell();
            return false;
        }
    }
}



function updateFireButton() {
    if (updateSelectedCell() && $("input#target").val().length >= 3)
        $("button#fire").prop("disabled", false);
    else
        $("button#fire").prop("disabled", true);
}
function selectCell(coords) {
    $("#game-board td").removeClass("selected");
    $("#game-board td").removeClass("column_selected");
    if (coords) $("#" + coords).addClass("selected");
}
function selectColumn(col) {
    $("#game-board td").removeClass("selected");
    $("#game-board td").removeClass("column_selected");
    if (col) $("td[id*='" + col + "']").addClass("column_selected");
}




//debug functions
function formatBoard(data) {

    return data;
}

function revealAllCells() {
    $("#game-board td").each(function () {
        revealCell($(this).attr("id"));
    });
}

function whatis(id) {
    let x = id.split("-")[0].charCodeAt(0) - 65;
    let y = board.height - id.split("-")[1];

    console.log(id, x, y, board.data[y][x], `board.data[${y}][${x}]`);
}