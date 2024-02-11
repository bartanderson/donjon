'use strict';
((global, init) => init(global))(window, global => {
	function generateDungeonName() {
		let name = generate_text("Dungeon Name");
		$("dungeon_name").setValue(name);
		updateDungeonTitle()
	}

	function updateDungeonTitle() {
		let name = $("dungeon_name").getValue();
		$("dungeon_title").update(name);
		updateDungeonConfig()
	}

	function updateDungeonConfig() {
		let dungeon = generateDungeon(); 
		{
			let dungeonConfig = dungeon;
			let roomSizeConfig = getConfig("room_size", dungeonConfig),
				roomLayoutConfig = getConfig("room_layout", dungeonConfig);
			dungeonConfig.huge_rooms = roomSizeConfig.huge;
			dungeonConfig.complex_rooms = roomLayoutConfig.complex;
			dungeonConfig.n_rooms = 0;
			dungeonConfig.room = [];
			if ("dense" == dungeonConfig.room_layout) {
				let denseDungeon = dungeonConfig;
				let i;
				for (i = 0; i < denseDungeon.n_i; i++) {
					let row = 2 * i + 1,
						j;
					for (j = 0; j < denseDungeon.n_j; j++) {
						let col = 2 * j + 1;
						denseDungeon.cell[row][col] & 2 || (0 == i || 0 == j) && 0 < random(2) ||
							(denseDungeon = addRoom(denseDungeon, {
								i: i,
								j: j
							}), !denseDungeon.huge_rooms || denseDungeon.cell[row][col] & 2 || (denseDungeon = addRoom(denseDungeon, {
								i: i,
								j: j,
								size: "medium"
							})))
					}
				}
				dungeonConfig = denseDungeon;
			} else {
				let scatteredDungeon = dungeonConfig;
				let roomCount = calculateRoomCount(scatteredDungeon),
					k;
				for (k = 0; k < roomCount; k++) scatteredDungeon = addRoom(scatteredDungeon);
				if (scatteredDungeon.huge_rooms) {
					let mediumRoomCount = calculateRoomCount(scatteredDungeon, "medium"),
						l;
					for (l = 0; l < mediumRoomCount; l++) scatteredDungeon = addRoom(scatteredDungeon, {
						size: "medium"
					})
				}
				dungeonConfig = scatteredDungeon;
			}
		} {
			let roomDungeon = dungeonConfig;
			let roomId;
			for (roomId = 1; roomId <= roomDungeon.n_rooms; roomId++) {
				let room = roomDungeon.room[roomId];
				let doorLocations = calculateDoorLocations(roomDungeon, room);
				if (!doorLocations.length) {
					dungeonConfig = roomDungeon;
					continue;
				} {
					let doorCount = Math.floor(Math.sqrt(((room.east - room.west) / 2 + 1) * ((room.south - room.north) / 2 + 1))) + random(doorCount);
					let maxDoors = doorCount;
					for (let i = 0; i < maxDoors; i++) {
						let doorLocation = doorLocations.splice(random(doorLocations.length), 1).shift();
						if (!doorLocation) break;
						if (!(roomDungeon.cell[doorLocation.door_r][doorLocation.door_c] & 4128768)) {
							let outId;
							if (outId = doorLocation.out_id) {
								let key = [room.id, outId].sort(N).join(",");
								W[key] || (roomDungeon = addDoor(roomDungeon, room, doorLocation), W[key] = 1)
							} else roomDungeon = addDoor(roomDungeon, room, doorLocation)
						}
					}
					dungeonConfig = roomDungeon;
				}
			} {
				let doorDungeon = dungeonConfig;
				let roomId;
				for (roomId = 1; roomId <= doorDungeon.n_rooms; roomId++) {
					let room = doorDungeon.room[roomId],
						roomIdStr = room.id.toString(),
						idLength = roomIdStr.length,
						row = Math.floor((room.north + room.south) / 2),
						col = Math.floor((room.west + room.east - idLength) / 2) + 1;
					for (let i = 0; i < idLength; i++) doorDungeon.cell[row][col + i] |= roomIdStr.charCodeAt(i) << 24
				}
			} {
				let idDungeon = dungeonConfig;
				let corridorLayoutConfig = getConfig("corridor_layout", idDungeon);
				idDungeon.straight_pct = corridorLayoutConfig.pct;
				let i;
				for (i = 1; i < idDungeon.n_i; i++) {
					let row = 2 * i + 1,
						j;
					for (j = 1; j < idDungeon.n_j; j++) idDungeon.cell[row][2 *
						j + 1
					] & 4 || (idDungeon = addCorridor(idDungeon, i, j))
				}
				dungeon = idDungeon;
			}
			if (dungeon.add_stairs) {
				let stairDungeon = dungeon;
				let stairLocations = calculateStairLocations(stairDungeon);
				if (stairLocations.length) {
					let stairCount = 0;
					"many" == stairDungeon.add_stairs ? stairCount = 3 + random(Math.floor(stairDungeon.n_cols * stairDungeon.n_rows / 1E3)) : "yes" == stairDungeon.add_stairs && (stairCount = 2);
					if (0 != stairCount) {
						let stairs = [],
							i;
						for (i = 0; i < stairCount; i++) {
							let stairLocation = stairLocations.splice(random(stairLocations.length), 1).shift();
							if (!stairLocation) break;
							let row = stairLocation.row,
								col = stairLocation.col;
							0 == (2 > i ? i : random(2)) ? (stairDungeon.cell[row][col] |= 4194304, stairLocation.key = "down") : (stairDungeon.cell[row][col] |= 8388608, stairLocation.key = "up");
							stairs.push(stairLocation)
						}
						stairDungeon.stair = stairs;
					}
				}
				dungeon = stairDungeon;
			}
		}
	}
});

var dungeonConfig = H;
if (dungeonConfig.remove_deadends) {
	var tempConfig = dungeonConfig;
	let deadendRemovalConfig = L("remove_deadends", tempConfig);
	tempConfig.remove_pct = deadendRemovalConfig.pct;
	dungeonConfig = removeDeadends(tempConfig, tempConfig.remove_pct, pa)
}
dungeonConfig.remove_deadends && ("errant" == dungeonConfig.corridor_layout ? dungeonConfig.close_arcs = dungeonConfig.remove_pct : "straight" == dungeonConfig.corridor_layout && (dungeonConfig.close_arcs = dungeonConfig.remove_pct));
dungeonConfig.close_arcs && (dungeonConfig = closeArcs(dungeonConfig));
dungeonConfig = finalizeDungeon(dungeonConfig); 
{
	var finalConfig = dungeonConfig;
	let cells = finalConfig.cell,
		row;
	for (row = 0; row <= finalConfig.n_rows; row++) {
		let col;
		for (col = 0; col <= finalConfig.n_cols; col++) cells[row][col] & 1 && (cells[row][col] = 0)
	}
	finalConfig.cell = cells
}
var finalDungeon = H = finalConfig
{
	let dungeonDetails = {
		map_style: finalDungeon.map_style,
		grid: finalDungeon.grid
	};
	dungeonDetails.cell_size = finalDungeon.cell_size;
	dungeonDetails.width = (finalDungeon.n_cols + 1) * dungeonDetails.cell_size + 1;
	dungeonDetails.height = (finalDungeon.n_rows + 1) * dungeonDetails.cell_size + 1;
	dungeonDetails.max_x = dungeonDetails.width - 1;
	dungeonDetails.max_y = dungeonDetails.height - 1;
	dungeonDetails.font = Math.floor(.75 * dungeonDetails.cell_size).toString() + "px sans-serif";
	var dungeonConfig = dungeonDetails;
}
let dungeonImage = new_image("map", dungeonConfig.width, dungeonConfig.height),
	colorPalette = getColorPalette(dungeonConfig);
dungeonConfig.palette = colorPalette; 
{
	let canvasElement = new Element("canvas");
	canvasElement.width = dungeonConfig.width;
	canvasElement.height = dungeonConfig.height;
	let context = canvasElement.getContext("2d"),
		max_x = dungeonConfig.max_x,
		max_y = dungeonConfig.max_y,
		palette = dungeonConfig.palette,
		color;
	if (color = palette.open) {
		fill_rect(context, 0, 0, max_x, max_y, color);
	} else {
		fill_rect(context, 0, 0, max_x, max_y, palette.white);
	}
	if (color = palette.open_grid) {
		drawGrid(finalDungeon, dungeonConfig, color, context);
	} else if (color = palette.grid) {
		drawGrid(finalDungeon, dungeonConfig, color, context);
	}
	var baseLayer = canvasElement;
}
dungeonConfig.base_layer = baseLayer; 
{
	let max_x = dungeonConfig.max_x,
		max_y = dungeonConfig.max_y,
		palette = dungeonConfig.palette,
		color;
	cache_pixels(true);
	let row;
	for (row = 0; row <= finalDungeon.n_rows; row++) {
		let y = row * dungeonConfig.cell_size,
			bottom = y + dungeonConfig.cell_size,
			col;
		for (col = 0; col <= finalDungeon.n_cols; col++) {
			if (!(finalDungeon.cell[row][col] & 6)) continue;
			let x = col * dungeonConfig.cell_size,
				right = x + dungeonConfig.cell_size;
			if (color = palette.bevel_nw) {
				if (finalDungeon.cell[row][col - 1] & 6 || draw_line(dungeonImage, x - 1, y, x - 1, bottom, color), finalDungeon.cell[row - 1][col] & 6 || draw_line(dungeonImage, x, y - 1, right, y - 1, color), color = palette.bevel_se) finalDungeon.cell[row][col + 1] & 6 || draw_line(dungeonImage, right + 1, y + 1, right + 1, bottom, color), finalDungeon.cell[row + 1][col] & 6 || draw_line(dungeonImage, x + 1, bottom + 1, right, bottom + 1, color)
			} else if (color = palette.wall_shading) finalDungeon.cell[row - 1][col - 1] & 6 || drawShadedRect(dungeonImage, x - dungeonConfig.cell_size / 4, y - dungeonConfig.cell_size / 4, x - 1, y - 1, color), finalDungeon.cell[row - 1][col] & 6 || drawShadedRect(dungeonImage, x, y - dungeonConfig.cell_size / 4, right, y - 1, color), finalDungeon.cell[row - 1][col + 1] & 6 || drawShadedRect(dungeonImage, right + 1, y - dungeonConfig.cell_size / 4, right + dungeonConfig.cell_size / 4, y - 1, color), finalDungeon.cell[row][col - 1] & 6 || drawShadedRect(dungeonImage, x - dungeonConfig.cell_size / 4, y, x - 1, bottom, color), finalDungeon.cell[row][col + 1] & 6 || drawShadedRect(dungeonImage, right + 1, y, right + dungeonConfig.cell_size / 4, bottom, color), finalDungeon.cell[row + 1][col - 1] & 6 || drawShadedRect(dungeonImage, x - dungeonConfig.cell_size / 4, bottom + 1, x - 1, bottom + dungeonConfig.cell_size / 4, color), finalDungeon.cell[row + 1][col] & 6 || drawShadedRect(dungeonImage, x, bottom + 1, right, bottom + dungeonConfig.cell_size / 4, color), finalDungeon.cell[row + 1][col + 1] & 6 || drawShadedRect(dungeonImage, right + 1, bottom + 1, right + dungeonConfig.cell_size / 4, bottom + dungeonConfig.cell_size / 4, color);
			if (color = palette.wall) finalDungeon.cell[row - 1][col] & 6 || draw_line(dungeonImage, x, y, right, y, color), finalDungeon.cell[row][col - 1] & 6 || draw_line(dungeonImage, x, y, x, bottom, color), finalDungeon.cell[row][col + 1] & 6 || draw_line(dungeonImage, right, y, right, bottom, color), finalDungeon.cell[row + 1][col] & 6 || draw_line(dungeonImage, x, bottom, right, bottom, color)
		}
	}
	draw_pixels(dungeonImage);
}

if (finalDungeon.door) {
	drawDoor(finalDungeon, dungeonConfig, dungeonImage);
}
var finalImage = dungeonImage;
let cellSize = dungeonConfig.cell_size,
	halfCellSize = Math.floor(cellSize / 2),
	font = dungeonConfig.font,
	labelColor = getColor(dungeonConfig.palette, "label"),
	row;
for (row = 0; row <= finalDungeon.n_rows; row++) {
	let col;
	for (col = 0; col <= finalDungeon.n_cols; col++) {
		if (!(finalDungeon.cell[row][col] & 6)) continue;
		let cellValue = finalDungeon.cell[row][col] >> 24 & 255;
		if (0 == cellValue) {
			var label = false;
		} else {
			let charCode = String.fromCharCode(cellValue);
			label = !/^\w/.test(charCode) || /[hjkl]/.test(charCode) ? false : charCode;
		}
		let labelValue = label;
		labelValue && draw_string(finalImage, labelValue, col * cellSize + halfCellSize, row * cellSize + halfCellSize + 1, font, labelColor);
	}
}
if (finalDungeon.stair) {
	drawStair(finalDungeon, dungeonConfig, dungeonImage);
}

function getDungeonConfig() {
	let config = {
		seed: set_prng_seed($("dungeon_name").getValue())
	};
	Object.keys(J).forEach(key => {
		config[key] = $(key).getValue();
	});
	var sizeConfig = getDungeonSize(config);
	let layoutConfig = getDungeonLayout(config);
	var size = sizeConfig.size;
	sizeConfig = sizeConfig.cell;
	config.n_i = Math.floor(size * layoutConfig.aspect / sizeConfig);
	config.n_j = Math.floor(size / sizeConfig);
	config.cell_size = sizeConfig;
	config.n_rows = 2 * config.n_i;
	config.n_cols = 2 * config.n_j;
	config.max_row = config.n_rows - 1;
	config.max_col = config.n_cols - 1;
	config.cell = [];
	for (size = 0; size <= config.n_rows; size++)
		for (config.cell[size] = [], sizeConfig = 0; sizeConfig <= config.n_cols; sizeConfig++) config.cell[size][sizeConfig] = 0;
	let mask;
	if (mask = layoutConfig.mask) {
		config = applyMask(config, mask);
	} else if ("saltire" == config.dungeon_layout) {
		config = applySaltire(config);
	} else if ("hexagon" == config.dungeon_layout) {
		config = applyHexagon(config);
	} else if ("round" == config.dungeon_layout) {
		config = applyRound(config);
	}
	return config;
}

function getDungeonSize(config) {
	return J["dungeon_size"][config["dungeon_size"]];
}

function applyMask(config, mask) {
	let rowScale = mask.length / (config.n_rows + 1),
		colScale = mask[0].length / (config.n_cols + 1),
		row;
	for (row = 0; row <= config.n_rows; row++) {
		let maskRow = mask[Math.floor(row * rowScale)],
			col;
		for (col = 0; col <= config.n_cols; col++) maskRow[Math.floor(col * colScale)] || (config.cell[row][col] = 1);
	}
	return config;
}

function applySaltire(config) {
	let quarterRows = Math.floor(config.n_rows / 4),
		row;
	for (row = 0; row < quarterRows; row++) {
		var midRow = quarterRows + row;
		let maxCol = config.n_cols - midRow;
		for (; midRow <= maxCol; midRow++) config.cell[row][midRow] = 1, config.cell[config.n_rows - row][midRow] = 1, config.cell[midRow][row] = 1, config.cell[midRow][config.n_cols - row] = 1;
	}
	return config;
}

function applyHexagon(config) {
	let halfRows = Math.floor(config.n_rows / 2),
		row;
	for (row = 0; row <= config.n_rows; row++) {
		let midRow = Math.floor(.57735 * Math.abs(row - halfRows)) + 1,
			maxCol = config.n_cols - midRow,
			col;
		for (col = 0; col <= config.n_cols; col++)
			if (col < midRow || col > maxCol) config.cell[row][col] = 1;
	}
	return config;
}

function applyRound(config) {
	let halfRows = config.n_rows / 2,
		halfCols = config.n_cols / 2,
		row;
	for (row = 0; row <= config.n_rows; row++) {
		let rowFactor = Math.pow(row / halfRows - 1, 2),
			col;
		for (col = 0; col <= config.n_cols; col++) 1 < Math.sqrt(rowFactor + Math.pow(col / halfCols - 1, 2)) && (config.cell[row][col] = 1);
	}
	return config;
}

function getRoomCount(config, roomSize) {
	roomSize = J.room_size[roomSize || config.room_size];
	roomSize = (roomSize.size || 2) + (roomSize.radix || 5) + 1;
	roomSize = 2 * Math.floor(config.n_cols * config.n_rows / (roomSize * roomSize));
	"sparse" == config.room_layout && (roomSize /= 13);
	return roomSize;
}

function createRoom(dungeon, roomConfig) {
	if (999 == dungeon.n_rooms) return dungeon;
	var tempConfig = roomConfig || {};
	roomConfig = tempConfig;
	roomConfig.size || (roomConfig.size = dungeon.room_size);
	var roomSizeConfig = J.room_size[roomConfig.size],
		roomSize = roomSizeConfig.size || 2;
	roomSizeConfig = roomSizeConfig.radix || 5;
	if (!("height" in roomConfig))
		if ("i" in roomConfig) {
			var roomHeight = dungeon.n_i - roomSize - roomConfig.i;
			0 > roomHeight && (roomHeight = 0);
			roomConfig.height = random(roomHeight < roomSizeConfig ? roomHeight : roomSizeConfig) + roomSize
		} else roomConfig.height = random(roomSizeConfig) + roomSize;
	"width" in roomConfig || ("j" in roomConfig ? (roomWidth = dungeon.n_j - roomSize - roomConfig.j, 0 > roomWidth && (roomWidth = 0), roomConfig.width = random(roomWidth < roomSizeConfig ? roomWidth : roomSizeConfig) + roomSize) : roomConfig.width = random(roomSizeConfig) + roomSize);
	"i" in roomConfig || (roomConfig.i = random(dungeon.n_i - roomConfig.height));
	"j" in roomConfig || (roomConfig.j = random(dungeon.n_j - roomConfig.width));
	tempConfig = roomConfig;
	roomConfig = 2 * tempConfig.i + 1;
	roomSize = 2 * tempConfig.j + 1;
	roomSizeConfig = 2 * (tempConfig.i + tempConfig.height) - 1;
	roomHeight = 2 * (tempConfig.j + tempConfig.width) - 1;
	var row, col;
	if (1 > roomConfig || roomSizeConfig > dungeon.max_row || 1 > roomSize || roomHeight > dungeon.max_col) return dungeon;
	a: {
		var roomDetails = {};
		for (row = roomConfig; row <= roomSizeConfig; row++)
			for (col = roomSize; col <= roomHeight; col++) {
				if (dungeon.cell[row][col] & 1) {
					roomDetails = {
						blocked: 1
					};
					break a
				}
				dungeon.cell[row][col] & 2 && (roomDetails[(dungeon.cell[row][col] & 65472) >> 6] += 1)
			}
	}
	if (roomDetails.blocked) return dungeon;
	roomDetails = $H(roomDetails).keys();
	row = roomDetails.length;
	if (0 == row) roomDetails = dungeon.n_rooms + 1, dungeon.n_rooms = roomDetails;
	else if (1 == row)
		if (dungeon.complex_rooms) {
			if (roomDetails = roomDetails[0], roomDetails != tempConfig.complex_id) return dungeon
		} else return dungeon;
	else return dungeon;
	for (row = roomConfig; row <= roomSizeConfig; row++)
		for (col = roomSize; col <= roomHeight; col++) dungeon.cell[row][col] & 32 ? dungeon.cell[row][col] &= 12648415 :
			dungeon.cell[row][col] & 16 && (dungeon.cell[row][col] &= -17), dungeon.cell[row][col] = dungeon.cell[row][col] | 2 | roomDetails << 6;
	tempConfig = {
		id: roomDetails,
		size: tempConfig.size,
		row: roomConfig,
		col: roomSize,
		north: roomConfig,
		south: roomSizeConfig,
		west: roomSize,
		east: roomHeight,
		height: 10 * (roomSizeConfig - roomConfig + 1),
		width: 10 * (roomHeight - roomSize + 1),
		door: {
			north: [],
			south: [],
			west: [],
			east: []
		}
	};
	(row = dungeon.room[roomDetails]) ? row.complex ? row.complex.push(tempConfig) : (complex = {
		complex: [row, tempConfig]
	}, dungeon.room[roomDetails] = complex): dungeon.room[roomDetails] = tempConfig;
	for (row = roomConfig - 1; row <= roomSizeConfig + 1; row++) dungeon.cell[row][roomSize - 1] & 34 || (dungeon.cell[row][roomSize - 1] |= 16), dungeon.cell[row][roomHeight + 1] & 34 || (dungeon.cell[row][roomHeight + 1] |= 16);
	for (col = roomSize - 1; col <= roomHeight + 1; col++) dungeon.cell[roomConfig - 1][col] & 34 || (dungeon.cell[roomConfig - 1][col] |= 16), dungeon.cell[roomSizeConfig + 1][col] & 34 || (dungeon.cell[roomSizeConfig + 1][col] |= 16);
	return dungeon;
}


function subtractNumbers(num1, num2) {
	return num1 - num2;
}

function getDoorLocations(dungeon, room) {
	let cellGrid = dungeon.cell,
		doorLocations = [];
	if (room.complex) {
		room.complex.forEach(subRoom => {
			let subRoomDoors = getDoorLocations(dungeon, subRoom);
			subRoomDoors.length && (doorLocations = doorLocations.concat(subRoomDoors));
		});
	} else {
		let northBoundary = room.north;
		let southBoundary = room.south;
		let westBoundary = room.west;
		let eastBoundary = room.east;
		if (3 <= northBoundary) {
			for (let col = westBoundary; col <= eastBoundary; col += 2) {
				let potentialDoor = validateDoorLocation(cellGrid, room, northBoundary, col, "north");
				potentialDoor && doorLocations.push(potentialDoor);
			}
		}
		if (southBoundary <= dungeon.n_rows - 3) {
			for (let col = westBoundary; col <= eastBoundary; col += 2) {
				let potentialDoor = validateDoorLocation(cellGrid, room, southBoundary, col, "south");
				potentialDoor && doorLocations.push(potentialDoor);
			}
		}
		if (3 <= westBoundary) {
			for (let row = northBoundary; row <= southBoundary; row += 2) {
				let potentialDoor = validateDoorLocation(cellGrid, room, row, westBoundary, "west");
				potentialDoor && doorLocations.push(potentialDoor);
			}
		}
		if (eastBoundary <= dungeon.n_cols - 3) {
			for (let row = northBoundary; row <= southBoundary; row += 2) {
				let potentialDoor = validateDoorLocation(cellGrid, room, row, eastBoundary, "east");
				potentialDoor && doorLocations.push(potentialDoor);
			}
		}
	}
	return doorLocations;
}

function validateDoorLocation(cellGrid, room, row, col, direction) {
	let adjacentRow = row + directionRowOffset[direction],
		adjacentCol = col + directionColOffset[direction],
		adjacentCell = cellGrid[adjacentRow][adjacentCol];
	if (!(adjacentCell & 16) || adjacentCell & 4128769) return false;
	let furtherCell = cellGrid[adjacentRow + directionRowOffset[direction]][adjacentCol + directionColOffset[direction]];
	if (furtherCell & 1) return false;
	let furtherRoomId = (furtherCell & 65472) >> 6;
	return furtherRoomId == room.id ? false : {
		sill_r: row,
		sill_c: col,
		dir: direction,
		door_r: adjacentRow,
		door_c: adjacentCol,
		out_id: furtherRoomId
	};
}

function addDoorToDungeon(dungeon, room, door) {
	let doorTypes = getDoorTypes(dungeon).table;
	let doorRow = door.door_r,
		doorCol = door.door_c;
	let sillRow = door.sill_r,
		sillCol = door.sill_c,
		direction = door.dir;
	door = door.out_id;
	let doorIndex;
	for (doorIndex = 0; 3 > doorIndex; doorIndex++) {
		let offsetRow = sillRow + directionRowOffset[direction] * doorIndex,
			offsetCol = sillCol + directionColOffset[direction] * doorIndex;
		dungeon.cell[offsetRow][offsetCol] &= -17;
		dungeon.cell[offsetRow][offsetCol] |= 32;
	}
	doorTypes = selectFromTable(doorTypes);
	let doorInfo = {
		row: doorRow,
		col: doorCol
	};
	65536 == doorTypes ? (dungeon.cell[doorRow][doorCol] |= 65536, doorInfo.key = "arch", doorInfo.type = "Archway") :
		131072 == doorTypes ? (dungeon.cell[doorRow][doorCol] |= 131072, doorInfo.key = "open", doorInfo.type = "Unlocked Door") :
		262144 == doorTypes ? (dungeon.cell[doorRow][doorCol] |= 262144, doorInfo.key = "lock", doorInfo.type = "Locked Door") :
		524288 == doorTypes ? (dungeon.cell[doorRow][doorCol] |= 524288, doorInfo.key = "trap", doorInfo.type = "Trapped Door") :
		1048576 == doorTypes ? (dungeon.cell[doorRow][doorCol] |= 1048576, doorInfo.key = "secret", doorInfo.type = "Secret Door") :
		2097152 == doorTypes && (dungeon.cell[doorRow][doorCol] |= 2097152, doorInfo.key = "portc", doorInfo.type = "Portcullis");
	door && (doorInfo.out_id = door);
	room.door[direction].push(doorInfo);
	room.last_door = doorInfo;
	return dungeon;
}

function createCorridor(dungeon, row, col, direction) {
	let cellGrid = dungeon.cell,
		corridorCell = 2,
		corridorStart = [{
			row: row,
			col: col
		}],
		corridorCells = [{
			row: row,
			col: col
		}],
		corridorLength = 0,
		corridorEnd = corridorStart.length;
	for (corridorLength = 0; corridorLength < corridorEnd && !(corridorCell = corridorStart[corridorLength], corridorCell.row == row && corridorCell.col == col); corridorLength++) corridorCell.row == row && corridorCell.col == col && corridorCells++;
	if (0 == corridorCells) return dungeon;
	var corridorPath = [{
		row: row,
		col: col
	}];
	for (corridorLength = 0; corridorLength < corridorPath.length; corridorLength++)
		if (corridorCell = corridorPath[corridorLength], corridorCell.row == row && corridorCell.col == col) return dungeon;
		else {
			var currentRow = corridorCell.row,
				currentCol = corridorCell.col;
			if (currentRow > 0 && !(cellGrid[currentRow - 1][currentCol] & corridorCell)) {
				var nextCell = {
					row: currentRow - 1,
					col: currentCol
				};
				cellGrid[nextCell.row][nextCell.col] |= corridorCell;
				corridorPath.push(nextCell)
			}
			currentCol > 0 && !(cellGrid[currentRow][currentCol - 1] & corridorCell) && (nextCell = {
				row: currentRow,
				col: currentCol - 1
			}, cellGrid[nextCell.row][nextCell.col] |= corridorCell, corridorPath.push(nextCell));
			currentRow < dungeon.max_row && !(cellGrid[currentRow + 1][currentCol] & corridorCell) && (nextCell = {
				row: currentRow + 1,
				col: currentCol
			}, cellGrid[nextCell.row][nextCell.col] |= corridorCell, corridorPath.push(nextCell));
			currentCol < dungeon.max_col && !(cellGrid[currentRow][currentCol + 1] & corridorCell) && (nextCell = {
				row: currentRow,
				col: currentCol + 1
			}, cellGrid[nextCell.row][nextCell.col] |= corridorCell, corridorPath.push(nextCell))
		}
	return dungeon;
}

function getDirectionOrder(dungeon, direction) {
	var directionOrder = directionOffsets.concat();
	let index;
	for (index = directionOrder.length - 1; 0 < index; index--) {
		let randomIndex = random(index + 1),
			temp = directionOrder[index];
		directionOrder[index] = directionOrder[randomIndex];
		directionOrder[randomIndex] = temp;
	}
	direction && dungeon.straight_pct && random(100) < dungeon.straight_pct && directionOrder.unshift(direction);
	return directionOrder;
}

function getJunctionLocations(dungeon) {
	let cellGrid = dungeon.cell,
		junctionLocations = [],
		row;
	for (row = 0; row < dungeon.n_i; row++) {
		let currentRow = 2 * row + 1,
			col;
		for (col = 0; col < dungeon.n_j; col++) {
			let currentCol = 2 * col + 1;
			if (4 == cellGrid[currentRow][currentCol]) {
				if (cellGrid[currentRow][currentCol] & 12582912) continue;
				Object.keys(junctionPatterns).forEach(direction => {
					if (validateJunction(cellGrid, currentRow, currentCol, junctionPatterns[direction])) {
						let junction = {
							row: currentRow,
							col: currentCol,
							dir: direction
						};
						direction = junctionPatterns[direction].next;
						junction.next_row = junction.row + direction[0];
						junction.next_col = junction.col + direction[1];
						junctionLocations.push(junction);
					}
				});
			}
		}
	}
	return junctionLocations;
}

function validateJunction(cellGrid, row, col, junctionPattern) {
	let isValid = true,
		corridorCells;
	if (corridorCells = junctionPattern.corridor) {
		corridorCells.forEach(cellOffset => {
			if (cellGrid[row + cellOffset[0]] && 4 != cellGrid[row + cellOffset[0]][col + cellOffset[1]]) {
				isValid = false;
			}
		});
		if (!isValid) return false;
	}
	if (junctionPattern = junctionPattern.walled) {
		junctionPattern.forEach(cellOffset => {
			if (cellGrid[row + cellOffset[0]] && cellGrid[row + cellOffset[0]][col + cellOffset[1]] & 6) {
				isValid = false;
			}
		});
		if (!isValid) return false;
	}
	return true;
}

function closeArcsInDungeon(dungeon) {
	return closeArcs(dungeon, dungeon.close_arcs, closeArcsInDungeon);
}

function modifyDungeonCells(dungeon, percentage, cellModificationFunc) {
	let isPercentage100 = 100 == percentage;
	for (let i = 0; i < dungeon.n_i; i++) {
		let row = 2 * i + 1;
		for (let j = 0; j < dungeon.n_j; j++) {
			let col = 2 * j + 1;
			if (dungeon.cell[row][col] & 6 && !(dungeon.cell[row][col] & 12582912) && (isPercentage100 || random(100) < percentage)) {
				dungeon = cellModificationFunc(dungeon, row, col);
			}
		}
	}
	return dungeon;
}

function modifyCell(dungeon, row, col, modificationRules) {
	let cellGrid = dungeon.cell;
	if (!(dungeon.cell[row][col] & 6)) return dungeon;
	Object.keys(modificationRules).forEach(ruleKey => {
		if (validateCellModification(cellGrid, row, col, modificationRules[ruleKey])) {
			let cellsToClose, cellsToOpen, recurseDirection;
			if (cellsToClose = modificationRules[ruleKey].close) {
				cellsToClose.forEach(cellOffset => {
					cellGrid[row + cellOffset[0]][col + cellOffset[1]] = 0;
				});
			}
			if (cellsToOpen = modificationRules[ruleKey].open) {
				cellGrid[row + cellsToOpen[0]][col + cellsToOpen[1]] |= 4;
			}
			if (recurseDirection = modificationRules[ruleKey].recurse) {
				dungeon = modifyCell(dungeon, row + recurseDirection[0], col + recurseDirection[1], modificationRules);
			}
		}
	});
	dungeon.cell = cellGrid;
	return dungeon;
}

function updateDoorsInRooms(dungeon) {
	let doorMap = {},
		allDoors = [];
	dungeon.room.forEach(room => {
		let roomId = room.id;
		Object.keys(room.door).forEach(direction => {
			let validDoors = [];
			room.door[direction].forEach(door => {
				let doorRow = door.row,
					doorCol = door.col;
				if (dungeon.cell[doorRow][doorCol] & 6) {
					let doorKey = [doorRow, doorCol].join();
					if (doorMap[doorKey]) {
						validDoors.push(door);
					} else {
						if (outRoomId = door.out_id) {
							let outRoom = dungeon.room[outRoomId],
								oppositeDirection = oppositeDirections[direction];
							door.out_id = {};
							door.out_id[roomId] = outRoomId;
							door.out_id[outRoomId] = roomId;
							outRoom.door[oppositeDirection].push(door);
						}
						validDoors.push(door);
						doorMap[doorKey] = true;
					}
				}
			});
			validDoors.length ? (room.door[direction] = validDoors, allDoors = allDoors.concat(validDoors)) : room.door[direction] = [];
		});
	});
	dungeon.door = allDoors;
	return dungeon;
}

function getDungeonPalette(dungeon) {
	let palette;
	if (dungeon.palette) {
		palette = dungeon.palette;
	} else {
		let mapStyle;
		palette = (mapStyle = dungeon.map_style) ? colorPalettes[mapStyle] ? colorPalettes[mapStyle] : colorPalettes.standard : colorPalettes.standard;
	}
	let colors;
	(colors = palette.colors) && Object.keys(colors).forEach(colorKey => {
		palette[colorKey] = colors[colorKey];
	});
	palette.black || (palette.black = "#000000");
	palette.white || (palette.white = "#ffffff");
	return palette;
}

function getColorFromPalette(palette, colorKey) {
	while (colorKey) {
		if (palette[colorKey]) return palette[colorKey];
		colorKey = colorHierarchy[colorKey];
	}
	return "#000000";
}

function drawGrid(a, b, f, d) {
	if ("none" != a.grid)
		if ("hex" == a.grid) {
			var g = b.cell_size;
			a = g / 3.4641016151;
			g /= 2;
			var c = b.width / (3 * a);
			b = b.height / g;
			var e;
			for (e = 0; e < c; e++) {
				var h = 3 * e * a,
					k = h + a,
					m = h + 3 * a,
					t = void 0;
				for (t = 0; t < b; t++) {
					var z = t * g,
						y = z + g;
					0 != (e + t) % 2 ? (draw_line(d, h, z, k, y, f), draw_line(d, k, y, m, y,
						f)) : draw_line(d, k, z, h, y, f)
				}
			}
		} else if ("vex" == a.grid)
			for (g = b.cell_size, a = g / 2, g /= 3.4641016151, c = b.width / a, b = b.height / (3 * g), e = 0; e < b; e++)
				for (h = 3 * e * g, k = h + g, m = h + 3 * g, t = 0; t < c; t++) z = t * a, y = z + a, 0 != (e + t) % 2 ? (draw_line(d, z, h, y, k, f), draw_line(d, y, k, y, m, f)) : draw_line(d, z, k, y, h, f);
		else {
			a = b.cell_size;
			for (g = 0; g <= b.max_x; g += a) draw_line(d, g, 0, g, b.max_y, f);
			for (g = 0; g <= b.max_y; g += a) draw_line(d, 0, g, b.max_x, g, f)
		}
	return !0
}

function setPixelsInArea(a, b, f, d, g, c) {
	for (; b <= d; b++) {
		let e;
		for (e = f; e <= g; e++) 0 != (b + e) % 2 && set_pixel(a, b, e, c)
	}
	return !0
}


function drawDoors(dungeon, mapConfig, canvasContext) {
	let doors = dungeon.door,
		cellSize = mapConfig.cell_size,
		oneSixthCellSize = Math.floor(cellSize / 6),
		oneFourthCellSize = Math.floor(cellSize / 4),
		oneThirdCellSize = Math.floor(cellSize / 3);
	mapConfig = mapConfig.palette;
	let wallColor = getColorFromPalette(mapConfig, "wall"),
		doorColor = getColorFromPalette(mapConfig, "door");
	doors.forEach(door => {
		let doorRow = door.row,
			doorRowPixel = doorRow * cellSize,
			doorCol = door.col,
			doorColPixel = doorCol * cellSize;
		let doorAttributes;
		if ("arch" == door.key) {
			doorAttributes = {
				arch: 1
			};
		} else if ("open" == door.key) {
			doorAttributes = {
				arch: 1,
				door: 1
			};
		} else if ("lock" == door.key) {
			doorAttributes = {
				arch: 1,
				door: 1,
				lock: 1
			};
		} else if ("trap" == door.key) {
			doorAttributes = {
				arch: 1,
				door: 1,
				trap: 1
			};
			/Lock/.test(door.desc) && (doorAttributes.lock = 1);
		} else if ("secret" == door.key) {
			doorAttributes = {
				wall: 1,
				arch: 1,
				secret: 1
			};
		} else if ("portc" == door.key) {
			doorAttributes = {
				arch: 1,
				portc: 1
			};
		}
		door = doorAttributes;
		let adjacentCellHasWall = dungeon.cell[doorRow][doorCol - 1] & 6;
		doorRowPixel = doorRowPixel + cellSize;
		doorColPixel = doorColPixel + cellSize;
		let middleRowPixel = Math.floor((doorRowPixel + doorRowPixel) / 2),
			middleColPixel = Math.floor((doorColPixel + doorColPixel) / 2);
		if (door.wall) {
			adjacentCellHasWall ? draw_line(canvasContext, middleColPixel, doorRowPixel, middleColPixel, doorRowPixel, wallColor) : draw_line(canvasContext, doorColPixel, middleRowPixel, doorColPixel, middleRowPixel, wallColor);
		}
		if (door.arch) {
			adjacentCellHasWall ? (fill_rect(canvasContext, middleColPixel - 1, doorRowPixel, middleColPixel + 1, doorRowPixel + oneSixthCellSize, wallColor), fill_rect(canvasContext, middleColPixel - 1, doorRowPixel - oneSixthCellSize, middleColPixel + 1, doorRowPixel, wallColor)) : (fill_rect(canvasContext, doorColPixel, middleRowPixel - 1, doorColPixel + oneSixthCellSize, middleRowPixel + 1, wallColor), fill_rect(canvasContext, doorColPixel - oneSixthCellSize, middleRowPixel - 1, doorColPixel, middleRowPixel + 1, wallColor));
		}
		if (door.door) {
			adjacentCellHasWall ? stroke_rect(canvasContext, middleColPixel - oneFourthCellSize, doorRowPixel + oneSixthCellSize + 1, middleColPixel + oneFourthCellSize, doorRowPixel - oneSixthCellSize - 1, doorColor) : stroke_rect(canvasContext, doorColPixel + oneSixthCellSize + 1, middleRowPixel - oneFourthCellSize, doorColPixel - oneSixthCellSize - 1, middleRowPixel + oneFourthCellSize, doorColor);
		}
		if (door.lock) {
			adjacentCellHasWall ? draw_line(canvasContext, middleColPixel, doorRowPixel + oneSixthCellSize + 1, middleColPixel, doorRowPixel - oneSixthCellSize - 1, doorColor) : draw_line(canvasContext, doorColPixel + oneSixthCellSize + 1, middleRowPixel, doorColPixel - oneSixthCellSize - 1, middleRowPixel, doorColor);
		}
		if (door.trap) {
			adjacentCellHasWall ? draw_line(canvasContext, middleColPixel - oneThirdCellSize, middleRowPixel, middleColPixel + oneThirdCellSize, middleRowPixel, doorColor) : draw_line(canvasContext, middleColPixel, middleRowPixel - oneThirdCellSize, middleColPixel, middleRowPixel + oneThirdCellSize, doorColor);
		}
		if (door.secret) {
			if (adjacentCellHasWall) {
				draw_line(canvasContext, middleColPixel - 1, middleRowPixel - oneFourthCellSize, middleColPixel + 2, middleRowPixel - oneFourthCellSize, doorColor);
				draw_line(canvasContext, middleColPixel - 2, middleRowPixel - oneFourthCellSize + 1, middleColPixel - 2, middleRowPixel - 1, doorColor);
				draw_line(canvasContext, middleColPixel - 1, middleRowPixel, middleColPixel + 1, middleRowPixel, doorColor);
				draw_line(canvasContext, middleColPixel + 2, middleRowPixel + 1, middleColPixel + 2, middleRowPixel + oneFourthCellSize - 1, doorColor);
				draw_line(canvasContext, middleColPixel - 2, middleRowPixel + oneFourthCellSize, middleColPixel + 1, middleRowPixel + oneFourthCellSize, doorColor);
			} else {
				draw_line(canvasContext, middleColPixel - oneFourthCellSize, middleRowPixel - 2, middleColPixel - oneFourthCellSize, middleRowPixel + 1, doorColor);
				draw_line(canvasContext, middleColPixel - oneFourthCellSize + 1, middleRowPixel + 2, middleColPixel - 1, middleRowPixel + 2, doorColor);
				draw_line(canvasContext, middleColPixel, middleRowPixel - 1, middleColPixel, middleRowPixel + 1, doorColor);
				draw_line(canvasContext, middleColPixel + 1, middleRowPixel - 2, middleColPixel + oneFourthCellSize - 1, middleRowPixel - 2, doorColor);
				draw_line(canvasContext, middleColPixel + oneFourthCellSize, middleRowPixel - 1, middleColPixel + oneFourthCellSize, middleRowPixel + 2, doorColor);
			}
		}
		if (door.portc) {
			if (adjacentCellHasWall) {
				for (let pixelRow = doorRowPixel + oneSixthCellSize + 2; pixelRow < doorRowPixel - oneSixthCellSize; pixelRow += 2) {
					set_pixel(canvasContext, middleColPixel, pixelRow, doorColor);
				}
			} else {
				for (let pixelCol = doorColPixel + oneSixthCellSize + 2; pixelCol < doorColPixel - oneSixthCellSize; pixelCol += 2) {
					set_pixel(canvasContext, pixelCol, middleRowPixel, doorColor);
				}
			}
		}
	});
	return true;
}

function drawStairs(dungeon, mapConfig, canvasContext) {
	let stairs = dungeon.stair,
		stairConfig = getStairConfig(mapConfig.cell_size),
		stairColor = getColorFromPalette(mapConfig.palette, "stair");
	stairs.forEach(stair => {
		if (stair.next_row != stair.row) {
			let colPixel = Math.floor((stair.col + .5) * stairConfig.cell);
			let stairPixelRows = getStairPixelRows(stair.row, stair.next_row, stairConfig),
				firstStairPixelRow = stairPixelRows.shift();
			let stairInfo = {
				xc: colPixel,
				y1: firstStairPixelRow,
				list: stairPixelRows
			};
			if ("up" == stair.key) {
				drawUpStair(stairInfo, stairColor, canvasContext);
			} else {
				drawDownStair(stairInfo, stairColor, canvasContext);
			}
		} else {
			let rowPixel = Math.floor((stair.row + .5) * stairConfig.cell);
			let stairPixelCols = getStairPixelRows(stair.col, stair.next_col, stairConfig),
				firstStairPixelCol = stairPixelCols.shift();
			let stairInfo = {
				yc: rowPixel,
				x1: firstStairPixelCol,
				list: stairPixelCols
			};
			if ("up" == stair.key) {
				drawUpStair(stairInfo, stairColor, canvasContext);
			} else {
				drawDownStair(stairInfo, stairColor, canvasContext);
			}
		}
	});
	return true;
}

function getStairConfig(cellSize) {
	let stairConfig = {
		cell: cellSize,
		len: 2 * cellSize,
		side: Math.floor(cellSize / 2),
		top: Math.floor(cellSize / 4),
		bottom: Math.floor(3 * cellSize / 4)
	};
	return stairConfig;
}

		
function drawDownStair(stairInfo, stairColor, canvasContext) {
	if (stairInfo.xc) {
		let middleColPixel = stairInfo.xc;
		stairInfo.list.forEach(pixelRow => {
			let sideOffset = stairInfo.down[Math.abs(pixelRow - stairInfo.y1)];
			draw_line(canvasContext, middleColPixel - sideOffset, pixelRow, middleColPixel + sideOffset, pixelRow, stairColor);
		});
	} else {
		let middleRowPixel = stairInfo.yc;
		stairInfo.list.forEach(pixelCol => {
			let sideOffset = stairInfo.down[Math.abs(pixelCol - stairInfo.x1)];
			draw_line(canvasContext, pixelCol, middleRowPixel - sideOffset, pixelCol, middleRowPixel + sideOffset, stairColor);
		});
	}
	return true;
}

function saveDungeonAsImage() {
	let dungeonName = $("dungeon_name").getValue();
	save_canvas($("map"), `${dungeonName}.png`);
}


let dungeonConfigOptions = {
	map_style: {
		standard: {
			title: "Standard"
		},
		classic: {
			title: "Classic"
		},
		graph: {
			title: "GraphPaper"
		}
	},
	grid: {
		none: {
			title: "None"
		},
		square: {
			title: "Square"
		},
		hex: {
			title: "Hex"
		},
		vex: {
			title: "VertHex"
		}
	},
	dungeon_layout: {
		square: {
			title: "Square",
			aspect: 1
		},
		rectangle: {
			title: "Rectangle",
			aspect: 1.3
		},
		box: {
			title: "Box",
			aspect: 1,
			mask: [
				[1, 1, 1],
				[1, 0, 1],
				[1, 1, 1]
			]
		},
		cross: {
			title: "Cross",
			aspect: 1,
			mask: [
				[0, 1, 0],
				[1, 1, 1],
				[0, 1, 0]
			]
		},
		dagger: {
			title: "Dagger",
			aspect: 1.3,
			mask: [
				[0, 1, 0],
				[1, 1, 1],
				[0, 1, 0],
				[0, 1, 0]
			]
		},
		saltire: {
			title: "Saltire",
			aspect: 1
		},
		keep: {
			title: "Keep",
			aspect: 1,
			mask: [
				[1, 1, 0, 0, 1, 1],
				[1, 1, 1, 1, 1, 1],
				[0, 1, 1, 1, 1, 0],
				[0, 1, 1, 1, 1, 0],
				[1, 1, 1, 1, 1, 1],
				[1, 1, 0, 0, 1, 1]
			]
		},
		hexagon: {
			title: "Hexagon",
			aspect: .9
		},
		round: {
			title: "Round",
			aspect: 1
		}
	},
	dungeon_size: {
		fine: {
			title: "Fine",
			size: 200,
			cell: 18
		},
		dimin: {
			title: "Diminiutive",
			size: 252,
			cell: 18
		},
		tiny: {
			title: "Tiny",
			size: 318,
			cell: 18
		},
		small: {
			title: "Small",
			size: 400,
			cell: 18
		},
		medium: {
			title: "Medium",
			size: 504,
			cell: 18
		},
		large: {
			title: "Large",
			size: 635,
			cell: 18
		},
		huge: {
			title: "Huge",
			size: 800,
			cell: 18
		},
		gargant: {
			title: "Gargantuan",
			size: 1008,
			cell: 18
		},
		colossal: {
			title: "Colossal",
			size: 1270,
			cell: 18
		}
	},
	add_stairs: {
		no: {
			title: "No"
		},
		yes: {
			title: "Yes"
		},
		many: {
			title: "Many"
		}
	},
	room_layout: {
		sparse: {
			title: "Sparse"
		},
		scattered: {
			title: "Scattered"
		},
		dense: {
			title: "Dense"
		}
	},
	room_size: {
		small: {
			title: "Small",
			size: 2,
			radix: 2
		},
		medium: {
			title: "Medium",
			size: 2,
			radix: 5
		},
		large: {
			title: "Large",
			size: 5,
			radix: 2
		},
		huge: {
			title: "Huge",
			size: 5,
			radix: 5,
			huge: 1
		},
		gargant: {
			title: "Gargantuan",
			size: 8,
			radix: 5,
			huge: 1
		},
		colossal: {
			title: "Colossal",
			size: 8,
			radix: 8,
			huge: 1
		}
	},
	doors: {
		none: {
			title: "None"
		},
		basic: {
			title: "Basic"
		},
		secure: {
			title: "Secure"
		},
		standard: {
			title: "Standard"
		},
		deathtrap: {
			title: "Deathtrap"
		}
	},
	corridor_layout: {
		labyrinth: {
			title: "Labyrinth",
			pct: 0
		},
		errant: {
			title: "Errant",
			pct: 50
		},
		straight: {
			title: "Straight",
			pct: 90
		}
	},
	remove_deadends: {
		none: {
			title: "None",
			pct: 0
		},
		some: {
			title: "Some",
			pct: 50
		},
		all: {
			title: "All",
			pct: 100
		}
	}
};

let defaultDungeonConfig = {
	map_style: "standard",
	grid: "square",
	dungeon_layout: "rectangle",
	dungeon_size: "medium",
	add_stairs: "yes",
	room_layout: "scattered",
	room_size: "medium",
	doors: "standard",
	corridor_layout: "errant",
	remove_deadends: "some"
};

let directionRowOffset = {
	north: -1,
	south: 1,
	west: 0,
	east: 0
};

let directionColOffset = {
	north: 0,
	south: 0,
	west: -1,
	east: 1
};

let sortedDirectionKeys = Object.keys(directionColOffset).sort();

let oppositeDirections = {
	north: "south",
	south: "north",
	west: "east",
	east: "west"
};


document.observe("dom:loaded", () => {
	Object.keys(dungeonConfigOptions).forEach(configCategory => {
		Object.keys(dungeonConfigOptions[configCategory]).forEach(configOption => {
			let optionTitle = dungeonConfigOptions[configCategory][configOption].title;
			let configElement = $(configCategory),
				insertFunc = configElement.insert;
			let optionElement = (new Element("option", {
				value: configOption
			})).update(optionTitle);
			insertFunc.call(configElement, optionElement);
		})
	});
	Object.keys(defaultDungeonConfig).forEach(configCategory => {
		$(configCategory).setValue(defaultDungeonConfig[configCategory]);
	});
	generateNewDungeonName();
	$("dungeon_name").observe("change", updateDungeonName);
	Object.keys(dungeonConfigOptions).forEach(configCategory => {
		$(configCategory).observe("change", updateDungeonConfig);
	});
	$("save_map").observe("click", saveDungeonAsImage);
	$("print_map").observe("click", () => {
		window.print();
	})
});

let doorTables = {};
dungeonConfigOptions.doors.none.table = {
	"01-15": 65536
};
dungeonConfigOptions.doors.basic.table = {
	"01-15": 65536,
	"16-60": 131072
};
dungeonConfigOptions.doors.secure.table = {
	"01-15": 65536,
	"16-60": 131072,
	"61-75": 262144
};
dungeonConfigOptions.doors.standard.table = {
	"01-15": 65536,
	"16-60": 131072,
	"61-75": 262144,
	"76-90": 524288,
	"91-100": 1048576,
	"101-110": 2097152
};
dungeonConfigOptions.doors.deathtrap.table = {
	"01-15": 65536,
	"16-30": 524288,
	"31-40": 1048576
};

let corridorDirections = {
	north: {
		walled: [
			[1, -1],
			[0, -1],
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, 1],
			[1, 1]
		],
		corridor: [
			[0, 0],
			[1, 0],
			[2, 0]
		],
		stair: [0, 0],
		next: [1, 0]
	},
	south: {
		walled: [
			[-1, -1],
			[0, -1],
			[1, -1],
			[1, 0],
			[1, 1],
			[0, 1],
			[-1, 1]
		],
		corridor: [
			[0, 0],
			[-1, 0],
			[-2, 0]
		],
		stair: [0, 0],
		next: [-1, 0]
	},
	west: {
		walled: [
			[-1, 1],
			[-1, 0],
			[-1, -1],
			[0, -1],
			[1, -1],
			[1, 0],
			[1, 1]
		],
		corridor: [
			[0, 0],
			[0, 1],
			[0, 2]
		],
		stair: [0, 0],
		next: [0, 1]
	},
	east: {
		walled: [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, 1],
			[1, 1],
			[1, 0],
			[1, -1]
		],
		corridor: [
			[0, 0],
			[0, -1],
			[0, -2]
		],
		stair: [0, 0],
		next: [0, -1]
	}
};

let wallDirections = {
	north: {
		walled: [
			[0, -1],
			[1, -1],
			[1, 0],
			[1, 1],
			[0, 1]
		],
		close: [
			[0, 0]
		],
		recurse: [-1, 0]
	},
	south: {
		walled: [
			[0, -1],
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, 1]
		],
		close: [
			[0, 0]
		],
		recurse: [1, 0]
	},
	west: {
		walled: [
			[-1, 0],
			[-1, 1],
			[0, 1],
			[1, 1],
			[1, 0]
		],
		close: [
			[0, 0]
		],
		recurse: [0, -1]
	},
	east: {
		walled: [
			[-1, 0],
			[-1, -1],
			[0, -1],
			[1, -1],
			[1, 0]
		],
		close: [
			[0, 0]
		],
		recurse: [0, 1]
	}
};

let mapStyles = {
	standard: {
		colors: {
			fill: "#000000",
			open: "#ffffff",
			open_grid: "#cccccc"
		}
	},
	classic: {
		colors: {
			fill: "#3399cc",
			open: "#ffffff",
			open_grid: "#3399cc",
			hover: "#b6def2"
		}
	},
	graph: {
		colors: {
			fill: "#ffffff",
			open: "#ffffff",
			grid: "#c9ebf5",
			wall: "#666666",
			wall_shading: "#666666",
			door: "#333333",
			label: "#333333",
			tag: "#666666"
		}
	}
};

let colorHierarchy = {
	door: "fill",
	label: "fill",
	stair: "wall",
	wall: "fill",
	fill: "black",
	tag: "white"
};



