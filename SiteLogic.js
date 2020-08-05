const theme = document.getElementById("themeLink");
let is_light = true;

function switchCanvasTheme()
{
    if (is_light)
    {
        default_color = "rgb(235,235,235)";
        active_color = "rgb(96,96,96)";
        background_color = "rgb(255, 255, 255)";
    } else{
        default_color = "rgb(33,33,33)";
        active_color = "rgb(64, 64, 64)";
        background_color = ("rgb(0, 0, 0)")
    }

    grid.resize(canvas, grid_size, default_color, background_color);

    for (let x = 0; x < grid_size[0]; x++)
    {
        for (let y = 0; y < grid_size[1]; y++)
        {
            if (activation_matrix[x][y]) grid.drawBlock(x, y, active_color);
            else grid.drawBlock(x, y, default_color);
        }
    }
}

function switchThemes()
{
    is_light = !is_light;
    if (is_light)
    {
        theme.href = "indexLightTheme.css";
    } else
    {
        theme.href = "indexDarkTheme.css";
    }
    switchCanvasTheme();
}