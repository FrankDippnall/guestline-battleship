
const board = {
    width: 4,
    height: 4,
    ships: {
        4: 1,
    },
    data: null
};

const cell = {
    BLOCKED: -1,
    EMPTY: 0,
    SHIP_VERTICAL: 1,
    SHIP_HORIZONTAL: 2,
    SHIP_TOP: 3,
    SHIP_BOTTOM: 4,
    SHIP_LEFT: 5,
    SHIP_RIGHT: 6,
    get: function (value) {
        for (let key of Object.keys(this)) {
            if (value = this[key]) return key;
        }
    }
}

$(function () {
    //run on page load.
    generateBoard();
});



function generateBoard() {
    generateEmptyBoard();
    spawnShips();
    console.log(formatBoard(board.data));
}

function generateEmptyBoard() {
    let data = [];
    let html = "";
    for (let y = 0; y < board.height; y++) {
        let row_data = [];
        html += `<tr>`
        for (let x = 0; x < board.width; x++) {
            html += `<td id="${String.fromCharCode((x) + 65)}-${board.height - y}" class="empty"></td>`
            row_data.push(cell.EMPTY);
        }
        html += `</tr>`
        data.push(row_data);
    }
    board.data = data;
    $("#game-board").html(html);
    console.log(data);
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

function spawnShip(ship_size) {
    let start_pos;

    while ((start_pos = randomEmptyCell()) != null) {
        last_start_pos = start_pos;
        console.log("checking ", start_pos);
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
                    board.data[start_pos.y][start_pos.x] = cell.SHIP_BOTTOM;
                    for (let i = 1; i < ship_size - 1; i++) {
                        //middle pieces (vertical)
                        board.data[start_pos.y + i][start_pos.x] = cell.SHIP_VERTICAL;
                    }
                    //end piece (top)
                    board.data[start_pos.y + (ship_size - 1)][start_pos.x] = cell.SHIP_TOP;
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
            else empty_array[y].push(0);
        }
        //add count to each row.
        empty_array[y].unshift(empty_num);
    }

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
                    console.log(cell_number, x, y);
                    return { x: x, y: parseInt(y) }
                }
            }
            console.error("Empty cell " + cell_number + " not found.");

        }
    };
}


function formatBoard(data) {
    let output = [];
    for (let y = data.length - 1; y >= 0; y--) {
        output.push(data[y])
    }
    return output;
}