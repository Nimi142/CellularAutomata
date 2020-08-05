class GridManager
{
    constructor(canvas_width, canvas_height, grid_size, spacing_factor, background_color,brush)
    {
        this.background_color = background_color;
        this.grid_size = grid_size;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.block_height = canvas_height / grid_size[1];
        this.block_width = canvas_width / grid_size[0];
        this.spacing = [spacing_factor / (1 + spacing_factor) *this.block_width, spacing_factor / (1 + spacing_factor) *this.block_height];
        this.block_height -= this.spacing[1];
        this.block_width -= this.spacing[0];
        this.ctx = brush;
    }

    drawBlock(x, y, color)
    {
        if (x >= grid_size[0] || x < 0 || y >= grid_size[1] || y < 0) return;
        let coordinates = [this.spacing[0] / 2 + x * (this.block_width + this.spacing[0]), + this.spacing[1] / 2 + y * (this.block_height + this.spacing[1])]
        this.ctx.beginPath();
        this.ctx.fillStyle = this.background_color;
        this.ctx.rect(coordinates[0] - this.spacing[0] /2, coordinates[1] - this.spacing[1] /2, this.block_width + this.spacing[0] , this.block_height + this.spacing[1] );
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.rect(coordinates[0], coordinates[1], this.block_width, this.block_height);
        this.ctx.fill();
    }

    drawAll(color)
    {
        for (let x = 0; x < this.grid_size[0]; x++)
        {
            for (let y = 0; y < this.grid_size[1]; y++)
            {
                this.drawBlock(x, y, color);
            }
        }
    }

    gridCoordsByPosition(position)
    {
        return [Math.floor(position[0] / (this.block_width + this.spacing[0])), Math.floor(position[1] / (this.block_height + this.spacing[1]))];
    }

    resize(canvas, new_grid_size, def_color, background_color)
    {
        this.grid_size = new_grid_size;
        this.canvas_width = canvas.width;
        this.canvas_height = canvas.height;
        this.block_height = canvas_height / this.grid_size[1];
        this.block_width = canvas_width / this.grid_size[0];
        this.spacing = [spacing_factor / (1 + spacing_factor) *this.block_width, spacing_factor / (1 + spacing_factor) *this.block_height];
        this.block_height -= this.spacing[1];
        this.block_width -= this.spacing[0];
        this.ctx.beginPath()
        this.ctx.fillStyle = background_color;
        this.ctx.rect(0, 0, canvas_width, canvas_height);
        this.ctx.fill();
        this.drawAll(def_color);
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
                let indexes = [(cell_coords[0] + x_axis) % grid.grid_size[0], (cell_coords[1] + y_axis) % grid.grid_size[1]];
                if (matrix[indexes[0] < 0? matrix.length + indexes[0]: indexes[0]][indexes[1] < 0? matrix[0].length + indexes[1]: indexes[1]])
                    num_active_neighbors++;
            }
        }
        else {
            if (cell_coords[1] + y_axis < 0 || cell_coords[1] + y_axis >= matrix[0].length) continue;
            for (let x_axis = -1; x_axis < 2; x_axis++) {
                if (x_axis === 0 && y_axis === 0) continue;
                if (cell_coords[0] + x_axis >= 0 && cell_coords[0] + x_axis < matrix.length && matrix[cell_coords[0] + x_axis][cell_coords[1] + y_axis])
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
    for (let x = 0; x < grid.grid_size[0]; x++)
    {
        let activation_row = []
        for (let y = 0; y < grid.grid_size[1]; y++)
        {
            activation_row.push(activation_matrix[x][y])
        }
        old_activation_matrix.push(activation_row)
    }
    for (let x = 0; x < grid.grid_size[0]; x++)
    {
        for (let y = 0; y < grid.grid_size[1]; y++)
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
    for (let x = 0; x < grid_size[0]; x++)
    {
        let activation_row = [];
        for (let y = 0; y < grid_size[1]; y++)
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

function resizeGrid()
{
    let max_grid_size = 100;
    let new_width_string = document.getElementById("gridWidth");
    let new_height_string = document.getElementById("gridHeight");
    let new_width;
    let new_height;
    try
    {
        new_height = Math.round(parseInt(new_height_string.value));
        new_width = Math.round(parseInt(new_width_string.value));
        if (new_height < 1 || new_height > max_grid_size || new_width < 0 || new_width > max_grid_size)
        {
            new_height = grid.grid_size[1];
            new_width = grid.grid_size[0];
        }
    } catch (e) {
        console.log(e);
        new_height = grid.grid_size[1];
        new_width = grid.grid_size[0];
    }
    finally
    {
        grid.resize(canvas, [new_width, new_height], default_color, "rgb(255, 255, 255)");
        grid_size = [new_width, new_height];
        let new_activation_matrix = []
        for (let x = 0; x < grid.grid_size[0]; x++)
        {
            let activation_row = []
            for (let y = 0; y < grid.grid_size[1]; y++)
            {
                if (x < activation_matrix.length && y < activation_matrix[0].length)
                activation_row.push(activation_matrix[x][y])
                else activation_row.push(false);
            }
            new_activation_matrix.push(activation_row)
        }
        activation_matrix = new_activation_matrix;
        for (let x = 0; x < grid_size[0]; x++)
        {
            for (let y = 0; y < grid_size[1]; y++)
            {
                if (activation_matrix[x][y]) grid.drawBlock(x, y, active_color);
                else grid.drawBlock(x, y, default_color);
            }
        }
        new_width_string.value = new_width;
        new_height_string.value = new_height;

    }
}

function manageAutoplay()
{
    is_autoplay = !is_autoplay;
    if (!is_autoplay)
    {
        clearInterval(autoplay_id);
    }
    else{
        autoplay_id = setInterval(turn, autoplay_interval * 1000);
    }
}

function autoplayInterval()
{
    let new_value;
    let text_box;
    try
    {
        text_box = document.getElementById("autoInterval");
        new_value = parseFloat(document.getElementById("autoInterval").value);
        if (new_value < 0.01 || new_value > 3600) new_value = autoplay_interval;
    } catch (e)
    {
        text_box.value = new_value;
    }
    finally {
        autoplay_interval = new_value;
        text_box.value = new_value;
    }
    if (is_autoplay)
    {
        clearInterval(autoplay_id);
        autoplay_id = setInterval(turn, autoplay_interval * 1000);
    }
}

let autoplay_id = 0;
let autoplay_interval = 1;
let is_autoplay = false;

let is_looping = false;
let ctx = document.getElementById('grid').getContext('2d');
ctx.imageSmoothingEnabled = false;
let canvas = document.getElementById('grid');
let canvas_width = canvas.width;
let canvas_height = canvas.height;
let default_color = "rgb(245,245,245)";
let active_color = "rgb(64,64,64)";

let grid_size = [10, 10];
const spacing_factor = 0.3;

let grid = new GridManager(canvas_width, canvas_height, grid_size, spacing_factor, "rgb(255, 255, 255)",ctx);
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
    },
    {
        "name": "Rule 90",
        "reviving_neighbors":[1],
        "neutral_neighbors":[1]
    }];
let cell_rules = {
    "name":"Conway's game of life",
    "reviving_neighbors":[3],
    "neutral_neighbors": [2, 3]
};

let activation_matrix = []
for (let x = 0; x < grid_size[0]; x++)
{
    let activation_row = []
    for (let y = 0; y < grid_size[1]; y++)
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