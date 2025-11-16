from PIL import Image

img = Image.open("monopolyboard.jpg")

# Suppose board is 768x768px and each side has N cells, say 10 per side
cell_width = 153  # adjust as needed
cell_height = 246  # for corners maybe wider
const = 249
# Example: extract top row
for i in range(9):
    x = i * cell_width + const

    y = 0
    cell = img.crop((x, y, x + cell_width, y + cell_height))
    if i == 1:
        cell = img.crop((x, y, x + 148, y + cell_height))
        const -= 5
    cell.save(f"cells/cell_top_{i}.png")
# Repeat for other sides (bottom, left, right), adjusting x/y accordingly
