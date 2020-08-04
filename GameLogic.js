class GridManager
{
    constructor(canvas_width, canvas_height, grid_size, spacing, brush)
    {
        this.grid_size = grid_size;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.block_height = Math.floor(canvas_height / (grid_size) - spacing);
        this.block_width = Math.floor(canvas_width / (grid_size) - spacing);
        this.spacing = spacing;
        this.ctx = brush;
    }

    drawBlock(x, y, color)
    {
        if (x >= grid_size || x < 0 || y >= grid_size || y < 0) return;
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(x * (this.block_width + this.spacing), y * (this.block_height + this.spacing), this.block_width, this.block_height);
        this.ctx.fill();
    }

    drawAll(color)
    {
        for (let x = 0; x < this.grid_size; x++)
        {
            for (let y = 0; y < this.grid_size; y++)
            {
                this.drawBlock(x, y, color);
            }
        }
    }

    gridCoordsByPosition(position)
    {
        return [Math.floor(position[0] / (this.block_width + this.spacing)), Math.floor(position[1] / (this.block_height + this.spacing))];
    }
}

function should_be_alive(matrix, cell_coords) // 1 if should be revived, 0 if no change, -1 if should die.
{
    let num_active_neighbors = 0;
    for (let y_axis = -1;  y_axis < 2; y_axis++)
    {
        if (is_looping)
        {
            for (let x_axis = -1; x_axis < 2; x_axis++) {

                if (x_axis === 0 && y_axis === 0) continue;
                let indexes = [(cell_coords[0] + x_axis) % grid.grid_size, (cell_coords[1] + y_axis) % grid.grid_size];
                if (matrix[indexes[0] < 0? matrix.length + indexes[0]: indexes[0]][indexes[1] < 0? matrix[0].length + indexes[1]: indexes[1]])
                    num_active_neighbors++;
            }
        }
        else {
            if (cell_coords[1] + y_axis < 0 || cell_coords[1] + y_axis >= matrix.length) continue;
            for (let x_axis = -1; x_axis < 2; x_axis++) {
                if (x_axis === 0 && y_axis === 0) continue;
                if (cell_coords[0] + x_axis >= 0 && cell_coords[0] + x_axis < matrix[0].length && matrix[cell_coords[0] + x_axis][cell_coords[1] + y_axis])
                    num_active_neighbors++;
            }
        }
    }
    return cell_rules.reviving_neighbors.includes(num_active_neighbors)? 1: cell_rules.neutral_neighbors.includes(num_active_neighbors)? 0 : -1;
}

function turn()
{
    console.log(is_looping);
    const old_activation_matrix = []
    for (let x = 0; x < grid.grid_size; x++)
    {
        let activation_row = []
        for (let y = 0; y < grid.grid_size; y++)
        {
            activation_row.push(activation_matrix[x][y])
        }
        old_activation_matrix.push(activation_row)
    }
    for (let x = 0; x < grid.grid_size; x++)
    {
        for (let y = 0; y < grid.grid_size; y++)
        {
            let result = should_be_alive(old_activation_matrix, [x, y])
            if (result === 1)
            {
                activation_matrix[x][y] = true;
                grid.drawBlock(x, y, active_color);

            }
            if (result === -1)
            {
                grid.drawBlock(x, y, default_color);
                activation_matrix[x][y] = false;
            }
        }
    }
}

function reset()
{
    activation_matrix = []
    for (let x = 0; x < grid_size; x++)
    {
        let activation_row = [];
        for (let y = 0; y < grid_size; y++)
        {
            activation_row.push(false);
        }
        activation_matrix.push(activation_row);
    }
    grid.drawAll(default_color);
}

function reverseActivation(x, y)
{
    if (activation_matrix[x][y] === false)
    {
        activation_matrix[x][y] = true;
        grid.drawBlock(x, y, active_color)
    }
    else
    {
        activation_matrix[x][y] = false;
        grid.drawBlock(x, y, default_color)
    }
    return activation_matrix;
}

function switch_rules()
{
    let selector = document.getElementById("CellChange");
    if (selector.value >= basic_rulesets.length)
    {
        document.getElementById("CustomGameProps").hidden = false;
        cell_rules.name = "custom";
        document.getElementById("NeutralNeighbors").value = "1";
        document.getElementById("BirthingNeighbors").value = "1";
        cell_rules.reviving_neighbors = [1]
        cell_rules.neutral_neighbors = [1];
    }
    else{
        document.getElementById("CustomGameProps").hidden = true;
        cell_rules = basic_rulesets[selector.value];
    }
}

function changeCustomRules()
{
    let born_obj = document.getElementById("BirthingNeighbors");
    let neutral_obj = document.getElementById("NeutralNeighbors");
    let new_neutral_int = [];
    let new_born_int = [];
    try
    {
        let new_born_string = born_obj.value.split(",");
        for (let i = 0; i < new_born_string.length; i++)
        {
            let res = parseInt(new_born_string[i]);
            if (res < 0 || res > 8) continue;
            new_born_int.push(res);
        }
        let new_neutral_string = neutral_obj.value.split(",");
        for (let i = 0; i < new_neutral_string.length; i++)
        {
            let res = parseInt(new_neutral_string[i]);
            if (res < 0 || res > 8) continue;
            new_neutral_int.push(res);
        }
    } catch (e)
    {
        console.log(e);
    }
    cell_rules.neutral_neighbors = new_neutral_int;
    cell_rules.reviving_neighbors = new_born_int;
    born_obj.value = new_born_int;
    neutral_obj.value = new_neutral_int;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let auto_interval = 1;
let is_looping = false;
let is_auto = false;
let ctx = document.getElementById('grid').getContext('2d');
let canvas = document.getElementById('grid');
let canvas_width = canvas.width;
let canvas_height = canvas.height;
let default_color = "rgb(245,245,245)";
let active_color = "rgb(64,64,64)";

const grid_size = 10;
const spacing = 5;

let grid = new GridManager(canvas_width, canvas_height, grid_size, spacing, ctx);
grid.drawAll(default_color);


let basic_rulesets = [{
    "name":"Conway's game of life",
    "reviving_neighbors":[3],
    "neutral_neighbors": [2, 3]
},
    {
        "name":"Highlife",
        "reviving_neighbors":[3, 6],
        "neutral_neighbors":[2, 3]
    },
    {
        "name":"Seeds",
        "reviving_neighbors": [2],
        "neutral_neighbors": []
    }]
let cell_rules = {
    "name":"Conway's game of life",
    "reviving_neighbors":[3],
    "neutral_neighbors": [2, 3]
};

let activation_matrix = []
for (let x = 0; x < grid_size; x++)
{
    let activation_row = []
    for (let y = 0; y < grid_size; y++)
    {
        activation_row.push(false)
    }
    activation_matrix.push(activation_row)
}
// document.getElementById("iterateButton").onclick = turn;
canvas.addEventListener('click', function (event)
{
    let mouse_position = [event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop]
    let grid_pos = grid.gridCoordsByPosition([mouse_position[0], mouse_position[1]])
    reverseActivation(grid_pos[0], grid_pos[1])
});

document.onkeypress = function (e) {
    // use e.keyCode
    if (e.key === "n")
    {
        turn();
    }
};