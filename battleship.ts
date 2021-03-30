

//ts classes
class Position {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class Ship {
    pos: Position;
    size: number;
    cells: string[];
    constructor(pos: Position, size: number, cells: string[]) {
        this.pos = pos;
        this.size = size;
        this.cells = cells;
    }
}

class Ships {
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    constructor(len2: number, len3: number, len4: number, len5: number, len6: number, len7: number) {
        this[2] = len2;
        this[3] = len3;
        this[4] = len4;
        this[5] = len5;
        this[6] = len6;
        this[7] = len7;
    }
}
class Board {
    width: number;
    height: number;
    ships: Ships;
    data: number[][];
    constructor(width: number, height: number, ships: Ships) {
        this.width = width;
        this.height = height;
        this.ships = ships;
        this.data = null;
    }
}

class RevealResult {
    repeat: boolean;
    hit: boolean;
    constructor(repeat: boolean, hit: boolean) {
        this.repeat = repeat;
        this.hit = hit;
    }
}

//constant globals
const cell = {
    BLOCKED: -1,
    EMPTY: 0,
    SHIP_BODY: 1,
    SHIP_TOP: 2,
    SHIP_RIGHT: 3,
    SHIP_BOTTOM: 4,
    SHIP_LEFT: 5,
    get: function (value: string) {
        for (let key of Object.keys(this)) {
            if (value == this[key]) return key;
        }
    }
}

const board_default = new Board(10, 10, new Ships(0, 0, 2, 1, 0, 0));


//runtime globals
var board: Board;
var shots: number;
var hits: number;
var all_ships: Ship[];



$(function () {
    $("button#fire").prop("disabled", true);
    $("input#target").on("keydown", formatInput);
    $("body").on("keydown", function (e) { if (e.keyCode == 13) fire() });
    $("input#target").on("input", updateFireButton);
    $("input#target").on("keypress", function (e) { e.preventDefault() });
    $("button#fire").on("click", fire);
    $("#new_board").on("click", createGame);
    $("#new_game").on("click", createGame)
    $("#reset_default").on("click", resetDefaultOptions);
    $("#show_advanced").on("click", toggleAdvanced);

    $(".advanced").hide();
    $("#win_screen").hide();


    resetDefaultOptions();
    createGame();
});

var show_advanced_options = false;
function toggleAdvanced() {
    show_advanced_options = !show_advanced_options;
    if (show_advanced_options) {
        $(".advanced").show()
        $("#show_advanced").text("Hide advanced options");
    }
    else {
        $(".advanced").hide()
        $("#show_advanced").text("Show advanced options");
    }
}



function resetDefaultOptions() {
    board = board_default;
    //instantiate options to default
    $("#board_width").val(board_default.width);
    $("#board_height").val(board_default.height);
    $("#ship_size_2").val(board_default.ships[2]);
    $("#ship_size_3").val(board_default.ships[3]);
    $("#ship_size_4").val(board_default.ships[4]);
    $("#ship_size_5").val(board_default.ships[5]);
    $("#ship_size_6").val(board_default.ships[6]);
    $("#ship_size_7").val(board_default.ships[7]);
}
function updateOptions() {
    board.width = parseInt($("#board_width").val().toString());
    board.height = parseInt($("#board_height").val().toString());
    board.ships[2] = parseInt($("#ship_size_2").val().toString());
    board.ships[3] = parseInt($("#ship_size_3").val().toString());
    board.ships[4] = parseInt($("#ship_size_4").val().toString());
    board.ships[5] = parseInt($("#ship_size_5").val().toString());
    board.ships[6] = parseInt($("#ship_size_6").val().toString());
    board.ships[7] = parseInt($("#ship_size_7").val().toString());
}

function updateLog() {
    $("#shots").text(shots);
    $("#hits").text(hits);
}
function initLog() {
    $("#shots").text(0);
    $("#hits").text(0);
    $("#sunk").text("0/" + all_ships.length);
}

var game_start_time: number;

function createGame() {
    let startTime: number = new Date().getTime();
    $("#win_screen").hide();

    shots = 0;
    hits = 0;
    all_ships = [];


    updateOptions();
    cleanUp();
    generateBoard();
    addEventHandlers();
    initLog();


    console.log("Game created in " + ((new Date().getTime() - startTime) / 1000) + "s");
    game_start_time = new Date().getTime();
}

function cleanUp() {
    $("#game_board td.unknown").off("click")
    generateEmptyBoard();
}

function addEventHandlers() {


    $("#game_board td.unknown").click(function () {
        let coords = $(this).attr("id")
        selectCell(coords);
        $("input#target").val(coords);
        updateFireButton();

        //whatis(coords)
    });
}



function formatInput(e) {
    e.preventDefault();


    let input: string = String.fromCharCode(e.keyCode).toUpperCase();
    let code: number = input.charCodeAt(0);

    let current: string = $(e.target).val().toString();

    if (code == 8) {
        //backspace
        $(e.target).val(current.substr(0, current.length - 1));
    }
    else if (code == 13) {
        //enter
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
    let coords: string = $("input#target").val().toString();
    if (coords.length > 0) {
        if ($("#" + coords).length > 0) {
            selectCell(coords);
            return true;
        }
        else if (coords.length == 2) {
            selectColumn(coords)
        }
        else {
            selectCell(null);
            return false;
        }
    }
}



function updateFireButton() {
    if (updateSelectedCell() && $("input#target").val().toString().length >= 3)
        $("button#fire").prop("disabled", false);
    else
        $("button#fire").prop("disabled", true);
}
function selectCell(coords) {
    $("#game_board td").removeClass("selected");
    $("#game_board td").removeClass("column_selected");
    if (coords) $("#" + coords).addClass("selected");
}
function selectColumn(col) {
    $("#game_board td").removeClass("selected");
    $("#game_board td").removeClass("column_selected");
    if (col) $("td[id*='" + col + "']").addClass("column_selected");
}




function generateEmptyBoard() {
    var data: number[][] = [];
    let html: string = "";
    let column_key_html: string = "";

    for (let y = 0; y < board.height; y++) {
        let row_data: number[] = [];
        html += `<tr><th class="key key_row">${board.height - y}</th>`;
        for (let x = 0; x < board.width; x++) {
            html += `<td id="${String.fromCharCode((x) + 65)}-${board.height - y}" class="unknown"></td>`
            row_data.push(cell.EMPTY);
            if (y == 0) {
                column_key_html += `<th class="key key_column">${String.fromCharCode((x) + 65)}</th>`;
            }
        }

        html += `</tr>`;
        data.push(row_data);
    }
    html += `<tr class="keys"><th class="key key_column"></th>${column_key_html}</tr>`
    board.data = data;
    $("#game_board").html(html);
}

function spawnShips() {
    //for each ship size,
    for (let ship_size of Object.keys(board.ships)) {
        //for the number of ships specified,
        for (let s = 0; s < board.ships[ship_size]; s++) {
            //spawn a ship
            all_ships.push(spawnShip(parseInt(ship_size)));
        }
    }
}

function spawnShip(ship_size: number): Ship {
    let start_pos: Position;

    while ((start_pos = randomEmptyCell()) != null) {
        //check if blocked
        let valid: Set<string> = new Set(["up", "right", "down", "left"])

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
            let options: string[] = Array.from(valid)
            let direction: string = options[Math.floor(Math.random() * options.length)];

            let cells_array: string[] = [];


            switch (direction) {
                case "up":
                    //end piece (bottom)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_TOP;
                    cells_array.push(toCoords(start_pos.x, start_pos.y));
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces
                        board.data[start_pos.y + i][start_pos.x] = cell.SHIP_BODY;
                        cells_array.push(toCoords(start_pos.x, start_pos.y + i));
                    }
                    //end piece (top)
                    board.data[start_pos.y + (ship_size - 1)][start_pos.x] = cell.SHIP_BOTTOM;
                    cells_array.push(toCoords(start_pos.x, start_pos.y + (ship_size - 1)));
                    break;
                case "right":
                    //end piece (left)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_LEFT;
                    cells_array.push(toCoords(start_pos.x, start_pos.y));
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces
                        board.data[start_pos.y][start_pos.x + i] = cell.SHIP_BODY;
                        cells_array.push(toCoords(start_pos.x + i, start_pos.y));
                    }
                    //end piece (right)
                    board.data[start_pos.y][start_pos.x + (ship_size - 1)] = cell.SHIP_RIGHT;
                    cells_array.push(toCoords(start_pos.x + (ship_size - 1), start_pos.y));
                    break;
                case "down":
                    //end piece (top)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_BOTTOM;
                    cells_array.push(toCoords(start_pos.x, start_pos.y));
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces
                        board.data[start_pos.y - i][start_pos.x] = cell.SHIP_BODY;
                        cells_array.push(toCoords(start_pos.x, start_pos.y - i));
                    }
                    //end piece (bottom)
                    board.data[start_pos.y - (ship_size - 1)][start_pos.x] = cell.SHIP_TOP;
                    cells_array.push(toCoords(start_pos.x, start_pos.y - (ship_size - 1)));
                    break;
                case "left":
                    //end piece (right)
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_RIGHT;
                    cells_array.push(toCoords(start_pos.x, start_pos.y));
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces
                        board.data[start_pos.y][start_pos.x - i] = cell.SHIP_BODY;
                        cells_array.push(toCoords(start_pos.x - i, start_pos.y));
                    }
                    //end piece (left)
                    board.data[start_pos.y][start_pos.x - (ship_size - 1)] = cell.SHIP_LEFT;
                    cells_array.push(toCoords(start_pos.x - (ship_size - 1), start_pos.y));
                    break;
            }

            //return ship details
            return new Ship(start_pos, ship_size, cells_array);
        }

    }


}


function validCell(value: number): boolean {
    //returns true if the cell can contain a new ship section
    if (value == undefined) return false;
    else if (value > 0) return false;
    else return true;
}


function randomEmptyCell(): Position {
    //returns a random cell's coordinates (only returns cells of type EMPTY (0))
    let empty_array: number[][] = [];
    let empty_total: number = 0;
    for (let y in board.data) {
        empty_array.push([]);
        let empty_num: number = 0;
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

    if (empty_total == 0) return null;
    //get random cell number
    let cell_number: number = Math.floor(Math.random() * empty_total);

    //get cell coordinates
    let empty_count: number = 0;
    for (let y in empty_array) {
        empty_count += empty_array[y][0];
        if (cell_number < empty_count) {
            //cell is in the row
            for (let x = 0; x < empty_array[y].length; x++) {
                if (empty_count - empty_array[y][0] + empty_array[y][x + 1] == cell_number) {
                    return new Position(x, parseInt(y))
                }
            }
            console.error("Empty cell " + cell_number + " not found.");

        }
    };
}

function generateBoard() {
    spawnShips();

    if ($("#reveal_board").prop("checked")) revealAllCells();
}

function revealCell(coords): RevealResult {

    //get index values
    let i: Position = toPosition(coords);

    let cellType: number = board.data[i.y][i.x];
    let cellElem = $("#" + coords)
    if (cellElem.hasClass("revealed")) return { repeat: true, hit: false };
    let hit: boolean = true;
    switch (cellType) {
        case cell.EMPTY: case cell.BLOCKED:
            cellElem.addClass("miss");
            hit = false;
            break;
        case cell.SHIP_BODY:
            cellElem.addClass("ship_body");
            break;
            break;
        case cell.SHIP_TOP:
            cellElem.addClass("ship_top");
            break;
        case cell.SHIP_RIGHT:
            cellElem.addClass("ship_right");
            break;
        case cell.SHIP_BOTTOM:
            cellElem.addClass("ship_bottom");
            break;
        case cell.SHIP_LEFT:
            cellElem.addClass("ship_left");
            break;
        default:
            hit = false;
            console.error("cell contains invalid value: " + coords);
    }
    cellElem.addClass("revealed");
    cellElem.removeClass("unknown");
    return { repeat: false, hit };
}

function fire() {
    let coords: string = $("input#target").val().toString();
    if (coords && coords.length >= 3) {
        if ($("#" + coords).length > 0) {
            //fire at selected cell.
            let result: RevealResult = revealCell(coords);

            if (!result.repeat) {
                shots++;
                if (result.hit) {
                    hits++;
                    //check if sunk
                    $("#sunk").text(sunkShips());

                }
            }

            updateLog();
        }
        else {
            console.warn("Cell with coordinates " + coords + " does not exist.");
        }
    }


}

function sunkShips() {
    let number_sunk: number = 0;
    for (let s in all_ships) {
        let ship: Ship = all_ships[s];
        let sunk_ship: boolean = true;
        for (let c in ship.cells) {
            if ($("#" + ship.cells[c]).hasClass("unknown")) {
                //ship cell NOT hit
                sunk_ship = false;
            }
        }
        if (sunk_ship) number_sunk++;
    }
    if (number_sunk == all_ships.length) {
        $("#win_screen").fadeIn();
    }
    return `${number_sunk}/${all_ships.length}`;
}


function toPosition(coords: string): Position {
    let x: number = coords.split("-")[0].charCodeAt(0) - 65;
    let y: number = board.height - parseInt(coords.split("-")[1]);
    return new Position(x, y);
}
function toCoords(x: number, y: number): string {
    let c: string = String.fromCharCode(x + 65)
    let r: number = board.height - y;
    return c.toString() + "-" + r;
}







function revealAllCells() {
    $("#game_board td").each(function () {
        revealCell($(this).attr("id"));
    });
}