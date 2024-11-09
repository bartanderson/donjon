'use strict';

((windowObject, initHandler) => {
    //console.log("IIFE is being executed");
    initHandler(windowObject);
})(window, windowObject => {
    function initHandler() {
        //console.log("initHandler is being called");
        let dungeonName = generate_text("Dungeon Name");
        //console.log("Dungeon Name generated:", dungeonName);
        $("dungeon_name").setValue(dungeonName);
        //console.log("Dungeon Name set in DOM");
        updateDungeonTitle();
    }

    function updateDungeonTitle() {
        let dungeonName = $("dungeon_name").getValue();
        $("dungeon_title").update(dungeonName);
        updateDungeonConfiguration();
    }

    // Define the getDungeonConfigConstant function
    function getDungeonConfigConstant(key, config) {
        return dungeonConfigConstants[key][config[key]];
    }

    function getColorPalette(inputObject) {
        let palette;
        if (inputObject.palette) {
            palette = inputObject.palette;
        } else {
            let style = inputObject.map_style;
            palette = colorPalettes[style] ? colorPalettes[style] : colorPalettes.standard;
        }

        let colors = palette.colors;
        Object.keys(colors).forEach(style => {
            palette[style] = colors[style];
        });

        palette.black || (palette.black = "#000000");
        palette.white || (palette.white = "#ffffff");

        return palette;
    }

    function getColorFromPalette(palette, colorKey) {
        while (colorKey) {
            if (palette[colorKey]) {
                return palette[colorKey];
            }
            colorKey = colorFallbackChain[colorKey];
        }
        return "#000000"; // Default to black if no color is found
    }

    function drawMap(dungeonConfig, renderConfig, color, context) {
        if (renderConfig.grid === "none") return;

        let cellSize = renderConfig.cell_size;
        let maxX = renderConfig.max_x;
        let maxY = renderConfig.max_y;

        if (renderConfig.grid === "hex") {
            let hexSize = cellSize / 3.4641016151;
            let hexHeight = cellSize / 2;
            let hexWidth = 3 * hexSize;
            let hexRows = renderConfig.height / hexHeight;
            let hexCols = renderConfig.width / hexWidth;

            for (let row = 0; row < hexRows; row++) {
                let y = row * hexHeight;
                let y2 = y + hexHeight;
                for (let col = 0; col < hexCols; col++) {
                    let x = col * hexWidth;
                    let x2 = x + hexWidth;
                    if ((row + col) % 2 === 0) {
                        draw_line(context, x, y, x2, y2, color);
                        draw_line(context, x2, y2, x2, y2 + hexHeight, color);
                    } else {
                        draw_line(context, x, y2, x2, y, color);
                    }
                }
            }
        } else if (renderConfig.grid === "vex") {
            let vexSize = cellSize / 2;
            let vexHeight = cellSize / 3.4641016151;
            let vexWidth = 3 * vexSize;
            let vexRows = renderConfig.height / vexHeight;
            let vexCols = renderConfig.width / vexWidth;

            for (let row = 0; row < vexRows; row++) {
                let y = row * vexHeight;
                let y2 = y + vexHeight;
                for (let col = 0; col < vexCols; col++) {
                    let x = col * vexWidth;
                    let x2 = x + vexWidth;
                    if ((row + col) % 2 === 0) {
                        draw_line(context, x, y2, x2, y, color);
                        draw_line(context, x2, y, x2, y2 + vexHeight, color);
                    } else {
                        draw_line(context, x, y, x2, y2, color);
                    }
                }
            }
        } else {
            for (let x = 0; x <= maxX; x += cellSize) {
                draw_line(context, x, 0, x, maxY, color);
            }
            for (let y = 0; y <= maxY; y += cellSize) {
                draw_line(context, 0, y, maxX, y, color);
            }
        }
    }

    function applyShading(context, x1, y1, x2, y2, color) {
        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                if ((x + y) % 2 !== 0) {
                    set_pixel(context, x, y, color);
                }
            }
        }
    }

    function updateDungeonConfiguration() {
        let dungeonDimensions = calculateDungeonDimensions();
        let dungeonConfig = dungeonDimensions;
        let roomSizeConfig = getDungeonConfigConstant("room_size", dungeonConfig);
        let roomLayoutConfig = getDungeonConfigConstant("room_layout", dungeonConfig);
        dungeonConfig.isHugeRoomEnabled = roomSizeConfig.huge;
        dungeonConfig.isComplexRoomEnabled = roomLayoutConfig.complex;
        dungeonConfig.n_rooms = 0;
        dungeonConfig.room = [];

        if (dungeonConfig.room_layout === "dense") {
            dungeonConfig = generateDenseRooms(dungeonConfig);
        } else {
            dungeonConfig = generateSparseRooms(dungeonConfig);
        }

        dungeonConfig = connectRooms(dungeonConfig);
        dungeonConfig = addStairs(dungeonConfig);
        dungeonConfig = removeDeadEnds(dungeonConfig);
        dungeonConfig = ensureConsistentRoomConnections(dungeonConfig);
        dungeonConfig = finalizeDungeon(dungeonConfig);

        renderDungeon(dungeonConfig);
    }

    function calculateDungeonDimensions() {
        let dungeonConfig = {
            seed: set_prng_seed($("dungeon_name").getValue())
        };
        Object.keys(dungeonConfigConstants).forEach(key => {
            dungeonConfig[key] = $(key).getValue();
        });

        let sizeConfig = getDungeonConfigConstant("dungeon_size", dungeonConfig);
        let layoutConfig = getDungeonConfigConstant("dungeon_layout", dungeonConfig);
        let dungeonSize = sizeConfig.size;
        let cellSize = sizeConfig.cell;
        dungeonConfig.n_i = Math.floor(dungeonSize * layoutConfig.aspect / cellSize);
        dungeonConfig.n_j = Math.floor(dungeonSize / cellSize);
        dungeonConfig.cell_size = cellSize;
        dungeonConfig.n_rows = 2 * dungeonConfig.n_i;
        dungeonConfig.n_cols = 2 * dungeonConfig.n_j;
        dungeonConfig.max_row = dungeonConfig.n_rows - 1;
        dungeonConfig.max_col = dungeonConfig.n_cols - 1;
        dungeonConfig.cell = [];

        for (let d = 0; d <= dungeonConfig.n_rows; d++) {
            dungeonConfig.cell[d] = [];
            for (let b = 0; b <= dungeonConfig.n_cols; b++) {
                dungeonConfig.cell[d][b] = 0;
            }
        }

        if (layoutConfig.mask) {
            dungeonConfig = applyMask(dungeonConfig, layoutConfig.mask);
        } else if (dungeonConfig.dungeon_layout === "saltire") {
            dungeonConfig = applySaltireLayout(dungeonConfig);
        } else if (dungeonConfig.dungeon_layout === "hexagon") {
            dungeonConfig = applyHexagonLayout(dungeonConfig);
        } else if (dungeonConfig.dungeon_layout === "round") {
            dungeonConfig = applyRoundLayout(dungeonConfig);
        }
	    // console.log("Seed:", dungeonConfig.seed);
	    // console.log("Rows:", dungeonConfig.n_rows);
	    // console.log("Cols:", dungeonConfig.n_cols);
	    // console.log("Cell Size:", dungeonConfig.cell_size);
	    // console.log("Initial Cell Config:", dungeonConfig.cell);
        return dungeonConfig;
    }

    function applyMask(dungeonConfig, mask) {
        let maskHeight = mask.length / (dungeonConfig.n_rows + 1);
        let maskWidth = mask[0].length / (dungeonConfig.n_cols + 1);

        for (let row = 0; row <= dungeonConfig.n_rows; row++) {
            let maskRow = mask[Math.floor(row * maskHeight)];
            for (let col = 0; col <= dungeonConfig.n_cols; col++) {
                if (!maskRow[Math.floor(col * maskWidth)]) {
                    dungeonConfig.cell[row][col] = 1;
                }
            }
        }

        return dungeonConfig;
    }

    function applySaltireLayout(dungeonConfig) {
        let halfRows = Math.floor(dungeonConfig.n_rows / 4);

        for (let row = 0; row < halfRows; row++) {
            let rowNum = halfRows + row;
            let colNum = dungeonConfig.n_cols - rowNum;
            for (let col = rowNum; col <= colNum; col++) {
                dungeonConfig.cell[row][col] = 1;
                dungeonConfig.cell[dungeonConfig.n_rows - row][col] = 1;
                dungeonConfig.cell[col][row] = 1;
                dungeonConfig.cell[col][dungeonConfig.n_cols - row] = 1;
            }
        }

        return dungeonConfig;
    }

    function applyHexagonLayout(dungeonConfig) {
        let halfRows = Math.floor(dungeonConfig.n_rows / 2);

        for (let row = 0; row <= dungeonConfig.n_rows; row++) {
            let rowOffset = Math.floor(0.57735 * Math.abs(row - halfRows)) + 1;
            let colStart = rowOffset;
            let colEnd = dungeonConfig.n_cols - rowOffset;
            for (let col = 0; col <= dungeonConfig.n_cols; col++) {
                if (col < colStart || col > colEnd) {
                    dungeonConfig.cell[row][col] = 1;
                }
            }
        }

        return dungeonConfig;
    }

    function applyRoundLayout(dungeonConfig) {
        let halfRows = dungeonConfig.n_rows / 2;
        let halfCols = dungeonConfig.n_cols / 2;

        for (let row = 0; row <= dungeonConfig.n_rows; row++) {
            let rowDist = Math.pow((row / halfRows) - 1, 2);
            for (let col = 0; col <= dungeonConfig.n_cols; col++) {
                let colDist = Math.pow((col / halfCols) - 1, 2);
                if (1 < Math.sqrt(rowDist + colDist)) {
                    dungeonConfig.cell[row][col] = 1;
                }
            }
        }

        return dungeonConfig;
    }

    function generateDenseRooms(dungeonConfig) {
        for (let rowNum = 0; rowNum < dungeonConfig.n_i; rowNum++) {
            let row = 2 * rowNum + 1;
            for (let colNum = 0; colNum < dungeonConfig.n_j; colNum++) {
                let col = 2 * colNum + 1;
                if (!(dungeonConfig.cell[row][col] & 2) && (rowNum === 0 || colNum === 0 || random(2) > 0)) {
                    dungeonConfig = addRoomToDungeon(dungeonConfig, { i: rowNum, j: colNum });
                    if (dungeonConfig.isHugeRoomEnabled && !(dungeonConfig.cell[row][col] & 2)) {
                        dungeonConfig = addRoomToDungeon(dungeonConfig, { i: rowNum, j: colNum, size: "medium" });
                    }
                }
            }
        }
	    // console.log("Number of Rooms:", dungeonConfig.n_rooms);
	    // console.log("Room Sizes and Positions:", dungeonConfig.room);
	    // console.log("Complexity and Hugeness Settings:", dungeonConfig.isComplexRoomEnabled, dungeonConfig.isHugeRoomEnabled);
        return dungeonConfig;
    }

    function generateSparseRooms(dungeonConfig) {
        let numRoomsToAdd = calculateRoomCount(dungeonConfig);

        for (let currentRoomToAdd = 0; currentRoomToAdd < numRoomsToAdd; currentRoomToAdd++) {
            dungeonConfig = addRoomToDungeon(dungeonConfig);
        }

        if (dungeonConfig.isHugeRoomEnabled) {
            let numMediumSizeRoomsToAdd = calculateRoomCount(dungeonConfig, "medium");
            for (let currentMediumSizeRoomBeingAdded = 0; currentMediumSizeRoomBeingAdded < numMediumSizeRoomsToAdd; currentMediumSizeRoomBeingAdded++) {
                dungeonConfig = addRoomToDungeon(dungeonConfig, { size: "medium" });
            }
        }
	    //console.log("Number of Rooms:", dungeonConfig.n_rooms);
	    //console.log("Room Sizes and Positions:", dungeonConfig.room);
	    //console.log("Complexity and Hugeness Settings:", dungeonConfig.isComplexRoomEnabled, dungeonConfig.isHugeRoomEnabled);
        return dungeonConfig;
    }

    function calculateRoomCount(dungeonConfig, roomSize) {
        let roomSizeConfig = dungeonConfigConstants.room_size[roomSize || dungeonConfig.room_size];
        let roomSizeValue = (roomSizeConfig.size || 2) + (roomSizeConfig.radix || 5) + 1;
        let roomCount = 2 * Math.floor(dungeonConfig.n_cols * dungeonConfig.n_rows / (roomSizeValue * roomSizeValue));

        if (dungeonConfig.room_layout === "sparse") {
            roomCount /= 13;
        }

        return roomCount;
    }

    function addRoomToDungeon(dungeonConfig, roomOptions) {
        if (dungeonConfig.n_rooms === 999) return dungeonConfig;

        roomOptions = roomOptions || {};
        let roomSizeConfig = dungeonConfigConstants.room_size[roomOptions.size || dungeonConfig.room_size];
        let roomSize = roomSizeConfig.size || 2;
        let roomRadix = roomSizeConfig.radix || 5;

        let roomHeight = roomOptions.height || random(dungeonConfig.n_i - roomSize - roomOptions.i) + roomSize;
        let roomWidth = roomOptions.width || random(dungeonConfig.n_j - roomSize - roomOptions.j) + roomSize;
        let roomRow = roomOptions.i || random(dungeonConfig.n_i - roomHeight);
        let roomCol = roomOptions.j || random(dungeonConfig.n_j - roomWidth);

        let startRow = 2 * roomRow + 1;
        let startCol = 2 * roomCol + 1;
        let endRow = 2 * (roomRow + roomHeight) - 1;
        let endCol = 2 * (roomCol + roomWidth) - 1;

        if (startRow < 1 || endRow > dungeonConfig.max_row || startCol < 1 || endCol > dungeonConfig.max_col) return dungeonConfig;

        let roomId = dungeonConfig.n_rooms + 1;
        dungeonConfig.n_rooms = roomId;

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                dungeonConfig.cell[row][col] |= 2 | (roomId << 6);
            }
        }

        let room = {
            id: roomId,
            size: roomOptions.size,
            row: startRow,
            col: startCol,
            north: startRow,
            south: endRow,
            west: startCol,
            east: endCol,
            height: 10 * (endRow - startRow + 1),
            width: 10 * (endCol - startCol + 1),
            door: {
                north: [],
                south: [],
                west: [],
                east: []
            }
        };

        if (dungeonConfig.room[roomId]) {
            if (dungeonConfig.room[roomId].complex) {
                dungeonConfig.room[roomId].complex.push(room);
            } else {
                dungeonConfig.room[roomId] = { complex: [dungeonConfig.room[roomId], room] };
            }
        } else {
            dungeonConfig.room[roomId] = room;
        }

        for (let row = startRow - 1; row <= endRow + 1; row++) {
            if (!(dungeonConfig.cell[row][startCol - 1] & 34)) dungeonConfig.cell[row][startCol - 1] |= 16;
            if (!(dungeonConfig.cell[row][endCol + 1] & 34)) dungeonConfig.cell[row][endCol + 1] |= 16;
        }

        for (let col = startCol - 1; col <= endCol + 1; col++) {
            if (!(dungeonConfig.cell[startRow - 1][col] & 34)) dungeonConfig.cell[startRow - 1][col] |= 16;
            if (!(dungeonConfig.cell[endRow + 1][col] & 34)) dungeonConfig.cell[endRow + 1][col] |= 16;
        }

        return dungeonConfig;
    }

    function connectRooms(dungeonConfig) {
        let mappedRoomConnections = {};

        for (let roomId = 1; roomId <= dungeonConfig.n_rooms; roomId++) {
            let room = dungeonConfig.room[roomId];
            let potentialDoorConnections = calculatePotentialDoorConnections(dungeonConfig, room);
            //console.log('Potential Door Connections for Room :', roomId, potentialDoorConnections);

            console.log('Potential Door Connections for Room ${roomId}:', potentialDoorConnections);

            if (!potentialDoorConnections.length) continue;

            let roomIndex = Math.floor(Math.sqrt(((room.east - room.west) / 2 + 1) * ((room.south - room.north) / 2 + 1)));
            let numDoors = roomIndex + random(roomIndex);

            for (let doorCount = 0; doorCount < numDoors; doorCount++) {
                let door = potentialDoorConnections.splice(random(potentialDoorConnections.length), 1).shift();
                if (!door) break;

                if (!(dungeonConfig.cell[door.door_r][door.door_c] & 4128768)) {
                    let adjacentRoomId = door.out_id;
                    if (adjacentRoomId) {
                        let connectionKey = [room.id, adjacentRoomId].sort().join(",");
                        if (!mappedRoomConnections[connectionKey]) {
                            dungeonConfig = addDoorToDungeon(dungeonConfig, room, door);
                            console.log('Added Door', door, 'between Room', roomId, 'and Adj room ', adjacentRoomId);

                            mappedRoomConnections[connectionKey] = 1;
                        }
                    } else {
                        dungeonConfig = addDoorToDungeon(dungeonConfig, room, door);
                        console.log('Added Door:',door,' in Room:', roomId);
                    }
                }
            }
        }

        return dungeonConfig;
    }

    function calculatePotentialDoorConnections(dungeonConfig, room) {
        let potentialDoorLocations = [];

        if (room.complex) {
            room.complex.forEach(subRoom => {
                let subPotentialDoors = calculatePotentialDoorConnections(dungeonConfig, subRoom);
                if (subPotentialDoors.length) {
                    potentialDoorLocations = potentialDoorLocations.concat(subPotentialDoors);
                }
            });
        } else {
            let northBoundary = room.north;
            let southBoundary = room.south;
            let westBoundary = room.west;
            let eastBoundary = room.east;

            if (northBoundary >= 3) {
                for (let col = westBoundary; col <= eastBoundary; col += 2) {
                    let door = canDoorBePlaced(dungeonConfig, room, northBoundary, col, "north");
                    if (door) potentialDoorLocations.push(door);
                }
            }

            if (southBoundary <= dungeonConfig.n_rows - 3) {
                for (let col = westBoundary; col <= eastBoundary; col += 2) {
                    let door = canDoorBePlaced(dungeonConfig, room, southBoundary, col, "south");
                    if (door) potentialDoorLocations.push(door);
                }
            }

            if (westBoundary >= 3) {
                for (let row = northBoundary; row <= southBoundary; row += 2) {
                    let door = canDoorBePlaced(dungeonConfig, room, row, westBoundary, "west");
                    if (door) potentialDoorLocations.push(door);
                }
            }

            if (eastBoundary <= dungeonConfig.n_cols - 3) {
                for (let row = northBoundary; row <= southBoundary; row += 2) {
                    let door = canDoorBePlaced(dungeonConfig, room, row, eastBoundary, "east");
                    if (door) potentialDoorLocations.push(door);
                }
            }
        }

        return potentialDoorLocations;
    }

    function canDoorBePlaced(dungeonConfig, room, row, col, direction) {
        let doorRow = row + directionRowOffsets[direction];
        let doorCol = col + directionColumnOffsets[direction];
        let cell = dungeonConfig.cell[doorRow][doorCol];

        if (!(cell & 16) || cell & 4128768) return false;

        let adjacentCell = dungeonConfig.cell[doorRow + directionRowOffsets[direction]][doorCol + directionColumnOffsets[direction]];
        if (adjacentCell & 1) return false;

        let adjacentRoomId = (adjacentCell & 65472) >> 6;
        if (adjacentRoomId === room.id) return false;

        return {
            sill_r: row,
            sill_c: col,
            dir: direction,
            door_r: doorRow,
            door_c: doorCol,
            out_id: adjacentRoomId
        };
    }

    function addDoorToDungeon(dungeonConfig, room, door) {
        let doorConfig = getDungeonConfigConstant("doors", dungeonConfig).table;
        let doorType = selectFromTable(doorConfig);
        let doorRow = door.door_r;
        let doorCol = door.door_c;
        let sillRow = door.sill_r;
        let sillCol = door.sill_c;
        let direction = door.dir;
        let adjacentRoomId = door.out_id;

        for (let i = 0; i < 3; i++) {
            let row = sillRow + directionRowOffsets[direction] * i;
            let col = sillCol + directionColumnOffsets[direction] * i;
            dungeonConfig.cell[row][col] &= -17;
            dungeonConfig.cell[row][col] |= 32;
        }

        let doorInfo = {
            row: doorRow,
            col: doorCol
        };

        if (doorType === 65536) {
            dungeonConfig.cell[doorRow][doorCol] |= 65536;
            doorInfo.key = "arch";
            doorInfo.type = "Archway";
        } else if (doorType === 131072) {
            dungeonConfig.cell[doorRow][doorCol] |= 131072;
            doorInfo.key = "open";
            doorInfo.type = "Unlocked Door";
        } else if (doorType === 262144) {
            dungeonConfig.cell[doorRow][doorCol] |= 262144;
            doorInfo.key = "lock";
            doorInfo.type = "Locked Door";
        } else if (doorType === 524288) {
            dungeonConfig.cell[doorRow][doorCol] |= 524288;
            doorInfo.key = "trap";
            doorInfo.type = "Trapped Door";
        } else if (doorType === 1048576) {
            dungeonConfig.cell[doorRow][doorCol] |= 1048576;
            doorInfo.key = "secret";
            doorInfo.type = "Secret Door";
        } else if (doorType === 2097152) {
            dungeonConfig.cell[doorRow][doorCol] |= 2097152;
            doorInfo.key = "portc";
            doorInfo.type = "Portcullis";
        }

        if (adjacentRoomId) {
            doorInfo.out_id = adjacentRoomId;
        }

        room.door[direction].push(doorInfo);
        room.last_door = doorInfo;

        return dungeonConfig;
    }

    function selectFromTable(table) {
        let randomValue = random(100);
        let cumulative = 0;

        for (let key in table) {
            let range = key.split("-").map(Number);
            if (randomValue >= range[0] && randomValue <= range[1]) {
                return table[key];
            }
        }

        return 0;
    }

    function generateCorridors(dungeonConfig) {
        for (let row = 1; row < dungeonConfig.n_i; row++) {
            let rowIndex = 2 * row + 1;
            for (let col = 1; col < dungeonConfig.n_j; col++) {
                let colIndex = 2 * col + 1;
                if (!(dungeonConfig.cell[rowIndex][colIndex] & 4)) {
                    dungeonConfig = generateCorridorSegment(dungeonConfig, row, col);
                }
            }
        }

        return dungeonConfig;
    }

    function generateCorridorSegment(dungeonConfig, row, col) {
        let directions = shuffleDirections(dungeonConfig);

        for (let direction of directions) {
            let newRow = row + directionRowOffsets[direction];
            let newCol = col + directionColumnOffsets[direction];
            let rowIndex = 2 * row + 1;
            let colIndex = 2 * col + 1;
            let newRowIndex = 2 * newRow + 1;
            let newColIndex = 2 * newCol + 1;

            if (newRow < 0 || newRow >= dungeonConfig.n_i || newCol < 0 || newCol >= dungeonConfig.n_j) continue;

            let midRow = (rowIndex + newRowIndex) / 2;
            let midCol = (colIndex + newColIndex) / 2;

            let canCreateCorridor = true;
            for (let r = midRow; r <= newRowIndex; r++) {
                for (let c = midCol; c <= newColIndex; c++) {
                    if (dungeonConfig.cell[r][c] & 21) {
                        canCreateCorridor = false;
                        break;
                    }
                }
                if (!canCreateCorridor) break;
            }

            if (canCreateCorridor) {
                for (let r = rowIndex; r <= newRowIndex; r++) {
                    for (let c = colIndex; c <= newColIndex; c++) {
                        dungeonConfig.cell[r][c] &= -33;
                        dungeonConfig.cell[r][c] |= 4;
                    }
                }
                dungeonConfig = generateCorridorSegment(dungeonConfig, newRow, newCol);
            }
        }

        return dungeonConfig;
    }

    function shuffleDirections(dungeonConfig) {
        let directions = allDirectionsList.concat();
        for (let i = directions.length - 1; i > 0; i--) {
            let j = random(i + 1);
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        if (dungeonConfig.straight_pct && random(100) < dungeonConfig.straight_pct) {
            directions.unshift(directions[0]);
        }

        return directions;
    }

    function addStairs(dungeonConfig) {
        if (dungeonConfig.add_stairs === "no") return dungeonConfig;

        let potentialStairLocations = calculatePotentialStairLocations(dungeonConfig);
        if (!potentialStairLocations.length) return dungeonConfig;

        let numStairs = dungeonConfig.add_stairs === "many" ? 3 + random(Math.floor(dungeonConfig.n_cols * dungeonConfig.n_rows / 1000)) : 2;

        let stairs = [];
        for (let i = 0; i < numStairs; i++) {
            let stair = potentialStairLocations.splice(random(potentialStairLocations.length), 1).shift();
            if (!stair) break;

            let stairRow = stair.row;
            let stairCol = stair.col;
            let stairKey = i < 2 ? (i === 0 ? "down" : "up") : (random(2) === 0 ? "down" : "up");

            if (stairKey === "down") {
                dungeonConfig.cell[stairRow][stairCol] |= 4194304;
            } else {
                dungeonConfig.cell[stairRow][stairCol] |= 8388608;
            }

            stair.key = stairKey;
            stairs.push(stair);
        }

        dungeonConfig.stair = stairs;
        return dungeonConfig;
    }

    function calculatePotentialStairLocations(dungeonConfig) {
        let potentialStairLocations = [];

        for (let row = 0; row < dungeonConfig.n_i; row++) {
            let rowIndex = 2 * row + 1;
            for (let col = 0; col < dungeonConfig.n_j; col++) {
                let colIndex = 2 * col + 1;
                if (dungeonConfig.cell[rowIndex][colIndex] & 4) {
                    Object.keys(stairPlacementRules).forEach(direction => {
                        if (isValidStairLocation(dungeonConfig.cell, rowIndex, colIndex, stairPlacementRules[direction])) {
                            let stair = {
                                row: rowIndex,
                                col: colIndex,
                                dir: direction
                            };
                            stair.next_row = stair.row + stairPlacementRules[direction].next[0];
                            stair.next_col = stair.col + stairPlacementRules[direction].next[1];
                            potentialStairLocations.push(stair);
                        }
                    });
                }
            }
        }

        return potentialStairLocations;
    }

    function isValidStairLocation(cell, row, col, rules) {
        let isValid = true;

        if (rules.corridor) {
            rules.corridor.forEach(offset => {
                if (cell[row + offset[0]] && !(cell[row + offset[0]][col + offset[1]] & 4)) {
                    isValid = false;
                }
            });
        }

        if (rules.walled) {
            rules.walled.forEach(offset => {
                if (cell[row + offset[0]] && !(cell[row + offset[0]][col + offset[1]] & 6)) {
                    isValid = false;
                }
            });
        }

        return isValid;
    }

    function removeDeadEnds(dungeonConfig) {
        if (dungeonConfig.remove_deadends === "none") return dungeonConfig;

        let removePercentage = dungeonConfigConstants.remove_deadends[dungeonConfig.remove_deadends].pct;
        let removeAll = removePercentage === 100;

        for (let row = 0; row < dungeonConfig.n_i; row++) {
            let rowIndex = 2 * row + 1;
            for (let col = 0; col < dungeonConfig.n_j; col++) {
                let colIndex = 2 * col + 1;
                if ((dungeonConfig.cell[rowIndex][colIndex] & 6) && !(dungeonConfig.cell[rowIndex][colIndex] & 12582912) && (removeAll || random(100) < removePercentage)) {
                    dungeonConfig = removeDeadEnd(dungeonConfig, rowIndex, colIndex);
                }
            }
        }

        return dungeonConfig;
    }

    function removeDeadEnd(dungeonConfig, row, col) {
        let cell = dungeonConfig.cell;

        Object.keys(deadEndRemovalRules).forEach(direction => {
            if (isValidDeadEnd(cell, row, col, deadEndRemovalRules[direction])) {
                let rules = deadEndRemovalRules[direction];
                if (rules.close) {
                    rules.close.forEach(offset => {
                        cell[row + offset[0]][col + offset[1]] = 0;
                    });
                }
                if (rules.open) {
                    cell[row + rules.open[0]][col + rules.open[1]] |= 4;
                }
                if (rules.recurse) {
                    dungeonConfig = removeDeadEnd(dungeonConfig, row + rules.recurse[0], col + rules.recurse[1]);
                }
            }
        });

        dungeonConfig.cell = cell;
        return dungeonConfig;
    }

    function isValidDeadEnd(cell, row, col, rules) {
        let isValid = true;

        if (rules.walled) {
            rules.walled.forEach(offset => {
                if (cell[row + offset[0]] && !(cell[row + offset[0]][col + offset[1]] & 6)) {
                    isValid = false;
                }
            });
        }

        return isValid;
    }

    function ensureConsistentRoomConnections(dungeonConfig) {
        let roomConnections = {};
        let allDoors = [];

        dungeonConfig.room.forEach(room => {
            let roomId = room.id;

            // Initialize the door property if it doesn't exist
            if (!room.door) {
                room.door = {
                    north: [],
                    south: [],
                    west: [],
                    east: []
                };
            }
            
            Object.keys(room.door).forEach(direction => {
                let connectedDoors = [];
                room.door[direction].forEach(door => {
                    let doorRow = door.row;
                    let doorCol = door.col;
                    if (dungeonConfig.cell[doorRow][doorCol] & 6) {
                        let doorKey = [doorRow, doorCol].join();
                        if (roomConnections[doorKey]) {
                            connectedDoors.push(door);
                        } else {
                            let adjacentRoomId = door.out_id;
                            if (adjacentRoomId) {
                                let oppositeDirection = oppositeDirectionsMap[direction];
                                door.out_id = {};
                                door.out_id[roomId] = adjacentRoomId;
                                door.out_id[adjacentRoomId] = roomId;
                                // Debug prints
                            console.log("Adjacent Room ID:", adjacentRoomId);
                            console.log("Adjacent Room:", dungeonConfig.room[adjacentRoomId]);
                            console.log("Adjacent Room Door:", dungeonConfig.room[adjacentRoomId] ? dungeonConfig.room[adjacentRoomId].door : undefined);
                            console.log("Opposite Direction:", oppositeDirection);

                            // Check if the adjacent room exists
                            if (!dungeonConfig.room[adjacentRoomId]) {
                                console.warn('Room with ID', adjacentRoomId, ' does not exist. Initializing it.');
                                dungeonConfig.room[adjacentRoomId] = {
                                    id: adjacentRoomId,
                                    door: {
                                        north: [],
                                        south: [],
                                        west: [],
                                        east: []
                                    }
                                };
                            }

                            // Initialize the door property for the adjacent room if it doesn't exist
                            if (!dungeonConfig.room[adjacentRoomId].door) {
                                dungeonConfig.room[adjacentRoomId].door = {
                                    north: [],
                                    south: [],
                                    west: [],
                                    east: []
                                };
                            }
                                dungeonConfig.room[adjacentRoomId].door[oppositeDirection].push(door);
                            }
                            connectedDoors.push(door);
                            roomConnections[doorKey] = true;
                        }
                    }
                });
                if (connectedDoors.length) {
                    room.door[direction] = connectedDoors;
                    allDoors = allDoors.concat(connectedDoors);
                } else {
                    room.door[direction] = [];
                }
            });
        });

        dungeonConfig.door = allDoors;
        return dungeonConfig;
    }

    function finalizeDungeon(dungeonConfig) {
        let dungeonState = dungeonConfig;
        let cell = dungeonState.cell;

        for (let row = 0; row <= dungeonState.n_rows; row++) {
            for (let col = 0; col <= dungeonState.n_cols; col++) {
                if (cell[row][col] & 1) {
                    cell[row][col] = 0;
                }
            }
        }

        dungeonState.cell = cell;
        return dungeonState;
    }


    function renderDungeon(dungeonConfig) {
        let renderConfig = {
            map_style: dungeonConfig.map_style,
            grid: dungeonConfig.grid,
            cell_size: dungeonConfig.cell_size,
            width: (dungeonConfig.n_cols + 1) * dungeonConfig.cell_size + 1,
            height: (dungeonConfig.n_rows + 1) * dungeonConfig.cell_size + 1,
            max_x: (dungeonConfig.n_cols + 1) * dungeonConfig.cell_size,
            max_y: (dungeonConfig.n_rows + 1) * dungeonConfig.cell_size,
            font: Math.floor(0.75 * dungeonConfig.cell_size) + "px sans-serif"
        };

        let dungeonImage = new_image("map", renderConfig.width, renderConfig.height);
        let colorPalette = getColorPalette(renderConfig);
        renderConfig.palette = colorPalette;

        let baseLayer = new Element("canvas");
        baseLayer.width = renderConfig.width;
        baseLayer.height = renderConfig.height;
        let baseContext = baseLayer.getContext("2d");

        fill_rect(baseContext, 0, 0, renderConfig.max_x, renderConfig.max_y, colorPalette.open);
        drawMap(dungeonConfig, renderConfig, colorPalette.open_grid, baseContext);
        renderConfig.base_layer = baseLayer;

        fill_rect(dungeonImage, 0, 0, renderConfig.max_x, renderConfig.max_y, colorPalette.fill);
        drawMap(dungeonConfig, renderConfig, colorPalette.fill_grid, dungeonImage);

        // Add the missing code to draw the base layer onto the composite map layer for cells that are walls
        let compositeMapLayer = dungeonImage;
        let cellSize = renderConfig.cell_size;
        for (let row = 0; row <= dungeonConfig.n_rows; row++) {
            let rowOffset = row * cellSize;
            for (let col = 0; col <= dungeonConfig.n_cols; col++) {
                if (dungeonConfig.cell[row][col] & 6) {
                    let colOffset = col * cellSize;
                    compositeMapLayer.drawImage(baseLayer, colOffset, rowOffset, cellSize, cellSize, colOffset, rowOffset, cellSize, cellSize);
                }
            }
        }

        applyWallShading(dungeonConfig, renderConfig, dungeonImage);
        drawDoorsOrFeaturesBetweenAdjacentRooms(dungeonConfig, renderConfig, dungeonImage);
        drawRoomLabels(dungeonConfig, renderConfig, dungeonImage);
        drawStairs(dungeonConfig, renderConfig, dungeonImage);
    }

    function applyWallShading(dungeonConfig, renderConfig, context) {
        let cellSize = renderConfig.cell_size;
        let shadingOffset = Math.floor(cellSize / 4);
        if (shadingOffset < 3) shadingOffset = 3;

        let colorPalette = renderConfig.palette;
        let shadingColor = colorPalette.wall_shading;

        cache_pixels(true);

        for (let row = 0; row <= dungeonConfig.n_rows; row++) {
            let rowOffset = row * cellSize;
            for (let col = 0; col <= dungeonConfig.n_cols; col++) {
                if (dungeonConfig.cell[row][col] & 6) {
                    let colOffset = col * cellSize;
                    if (dungeonConfig.cell[row - 1][col - 1] & 6) {
                        applyShading(context, colOffset - shadingOffset, rowOffset - shadingOffset, colOffset - 1, rowOffset - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row - 1][col] & 6) {
                        applyShading(context, colOffset, rowOffset - shadingOffset, colOffset + cellSize - 1, rowOffset - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row - 1][col + 1] & 6) {
                        applyShading(context, colOffset + cellSize, rowOffset - shadingOffset, colOffset + cellSize + shadingOffset - 1, rowOffset - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row][col - 1] & 6) {
                        applyShading(context, colOffset - shadingOffset, rowOffset, colOffset - 1, rowOffset + cellSize - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row][col + 1] & 6) {
                        applyShading(context, colOffset + cellSize, rowOffset, colOffset + cellSize + shadingOffset - 1, rowOffset + cellSize - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row + 1][col - 1] & 6) {
                        applyShading(context, colOffset - shadingOffset, rowOffset + cellSize, colOffset - 1, rowOffset + cellSize + shadingOffset - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row + 1][col] & 6) {
                        applyShading(context, colOffset, rowOffset + cellSize, colOffset + cellSize - 1, rowOffset + cellSize + shadingOffset - 1, shadingColor);
                    }
                    if (dungeonConfig.cell[row + 1][col + 1] & 6) {
                        applyShading(context, colOffset + cellSize, rowOffset + cellSize, colOffset + cellSize + shadingOffset - 1, rowOffset + cellSize + shadingOffset - 1, shadingColor);
                    }
                }
            }
        }

        draw_pixels(context);
    }

    function drawDoorsOrFeaturesBetweenAdjacentRooms(dungeonConfig, renderConfig, context) {
        let doors = dungeonConfig.door;
        let cellSize = renderConfig.cell_size;
        let doorWidth = Math.floor(cellSize / 6);
        let doorHeight = Math.floor(cellSize / 4);
        let doorOffset = Math.floor(cellSize / 3);
        let colorPalette = renderConfig.palette;
        let wallColor = getColorFromPalette(colorPalette, "wall");
        let doorColor = getColorFromPalette(colorPalette, "door");

        doors.forEach(door => {
            let doorRow = door.row;
            let doorCol = door.col;
            let doorX = doorCol * cellSize;
            let doorY = doorRow * cellSize;

            let doorInfo = {};
            if (door.key === "arch") {
                doorInfo = { arch: 1 };
            } else if (door.key === "open") {
                doorInfo = { arch: 1, door: 1 };
            } else if (door.key === "lock") {
                doorInfo = { arch: 1, door: 1, lock: 1 };
            } else if (door.key === "trap") {
                doorInfo = { arch: 1, door: 1, trap: 1 };
            } else if (door.key === "secret") {
                doorInfo = { wall: 1, arch: 1, secret: 1 };
            } else if (door.key === "portc") {
                doorInfo = { arch: 1, portc: 1 };
            }

            let doorWallFlags = dungeonConfig.cell[doorRow][doorCol - 1] & 6;
            let doorXCenter = doorX + cellSize;
            let doorYCenter = doorY + cellSize;
            let doorXMid = Math.floor((doorX + doorXCenter) / 2);
            let doorYMid = Math.floor((doorY + doorYCenter) / 2);

            if (doorInfo.wall) {
                if (doorWallFlags) {
                    draw_line(context, doorXMid, doorY, doorXMid, doorYCenter, wallColor);
                } else {
                    draw_line(context, doorX, doorYMid - 1, doorXCenter, doorYMid - 1, wallColor);
                }
            }

            if (doorInfo.arch) {
                if (doorWallFlags) {
                    fill_rect(context, doorXMid - 1, doorY, doorXMid + 1, doorY + doorWidth, wallColor);
                    fill_rect(context, doorXMid - 1, doorYCenter - doorWidth, doorXMid + 1, doorYCenter, wallColor);
                } else {
                    fill_rect(context, doorX, doorYMid - 1, doorX + doorWidth, doorYMid + 1, wallColor);
                    fill_rect(context, doorXCenter - doorWidth, doorYMid - 1, doorXCenter, doorYMid + 1, wallColor);
                }
            }

            if (doorInfo.door) {
                if (doorWallFlags) {
                    stroke_rect(context, doorXMid - doorHeight, doorY + doorWidth + 1, doorXMid + doorHeight, doorYCenter - doorWidth - 1, doorColor);
                } else {
                    stroke_rect(context, doorX + doorWidth + 1, doorYMid - doorHeight, doorXCenter - doorWidth - 1, doorYMid + doorHeight, doorColor);
                }
            }

            if (doorInfo.lock) {
                if (doorWallFlags) {
                    draw_line(context, doorXMid, doorY + doorWidth + 1, doorXMid, doorYCenter - doorWidth - 1, doorColor);
                } else {
                    draw_line(context, doorX + doorWidth + 1, doorYMid, doorXCenter - doorWidth - 1, doorYMid, doorColor);
                }
            }

            if (doorInfo.trap) {
                if (doorWallFlags) {
                    draw_line(context, doorXMid - doorOffset, doorYMid, doorXMid + doorOffset, doorYMid, doorColor);
                } else {
                    draw_line(context, doorXMid, doorYMid - doorOffset, doorXMid, doorYMid + doorOffset, doorColor);
                }
            }

            if (doorInfo.secret) {
                if (doorWallFlags) {
                    draw_line(context, doorXMid - 1, doorYMid - doorHeight, doorXMid + 2, doorYMid - doorHeight, doorColor);
                    draw_line(context, doorXMid - 2, doorYMid - doorHeight + 1, doorXMid - 2, doorYMid - 1, doorColor);
                    draw_line(context, doorXMid - 1, doorYMid, doorXMid + 1, doorYMid, doorColor);
                    draw_line(context, doorXMid + 2, doorYMid + 1, doorXMid + 2, doorYMid + doorHeight - 1, doorColor);
                    draw_line(context, doorXMid - 2, doorYMid + doorHeight, doorXMid + 1, doorYMid + doorHeight, doorColor);
                } else {
                    draw_line(context, doorXMid - doorHeight, doorYMid - 2, doorXMid - doorHeight, doorYMid + 1, doorColor);
                    draw_line(context, doorXMid - doorHeight + 1, doorYMid + 2, doorXMid - 1, doorYMid + 2, doorColor);
                    draw_line(context, doorXMid, doorYMid - 1, doorXMid, doorYMid + 1, doorColor);
                    draw_line(context, doorXMid + 1, doorYMid - 2, doorXMid + doorHeight - 1, doorYMid - 2, doorColor);
                    draw_line(context, doorXMid + doorHeight, doorYMid - 1, doorXMid + doorHeight, doorYMid + 2, doorColor);
                }
            }

            if (doorInfo.portc) {
                if (doorWallFlags) {
                    for (let y = doorY + doorWidth + 2; y < doorYCenter - doorWidth; y += 2) {
                        set_pixel(context, doorXMid, y, doorColor);
                    }
                } else {
                    for (let x = doorX + doorWidth + 2; x < doorXCenter - doorWidth; x += 2) {
                        set_pixel(context, x, doorYMid, doorColor);
                    }
                }
            }
        });
    }

    function drawRoomLabels(dungeonConfig, renderConfig, context) {
        let cellSize = renderConfig.cell_size;
        let labelOffset = Math.floor(cellSize / 2);
        let fontSize = renderConfig.font;
        let labelColor = getColorFromPalette(renderConfig.palette, "label");

        for (let row = 0; row <= dungeonConfig.n_rows; row++) {
            let rowOffset = row * cellSize;
            for (let col = 0; col <= dungeonConfig.n_cols; col++) {
                if (dungeonConfig.cell[row][col] & 6) {
                    let colOffset = col * cellSize;
                    let roomId = (dungeonConfig.cell[row][col] >> 24) & 255;
                    if (roomId !== 0) {
                        let roomLabel = String.fromCharCode(roomId);
                        if (/^\w/.test(roomLabel) && !/[hjkl]/.test(roomLabel)) {
                            draw_string(context, roomLabel, colOffset + labelOffset, rowOffset + labelOffset + 1, fontSize, labelColor);
                        }
                    }
                }
            }
        }
    }

    function drawStairs(dungeonConfig, renderConfig, context) {
        if (!dungeonConfig.stair) return;

        let stairs = dungeonConfig.stair;
        let stairInfo = initializeStairInfo(renderConfig.cell_size);
        let stairColor = getColorFromPalette(renderConfig.palette, "stair");

        stairs.forEach(stair => {
            if (stair.next_row !== stair.row) {
                let stairX = Math.floor((stair.col + 0.5) * stairInfo.cell);
                let stairOffsets = calculateStairOffsets(stair.row, stair.next_row, stairInfo);
                let stairY = stairOffsets.shift();
                drawUpStairs({ xc: stairX, y1: stairY, list: stairOffsets, side: stairInfo.side, down: stairInfo.down }, stairColor, context);
            } else {
                let stairY = Math.floor((stair.row + 0.5) * stairInfo.cell);
                let stairOffsets = calculateStairOffsets(stair.col, stair.next_col, stairInfo);
                let stairX = stairOffsets.shift();
                drawUpStairs({ yc: stairY, x1: stairX, list: stairOffsets, side: stairInfo.side, down: stairInfo.down }, stairColor, context);
            }
        });
    }

    function initializeStairInfo(cellSize) {
        let stairInfo = {
            cell: cellSize,
            len: 2 * cellSize,
            side: Math.floor(cellSize / 2),
            tread: Math.floor(cellSize / 20) + 2,
            down: {}
        };

        for (let i = 0; i < stairInfo.len; i += stairInfo.tread) {
            stairInfo.down[i] = Math.floor(i / stairInfo.len * stairInfo.side);
        }

        return stairInfo;
    }

    function calculateStairOffsets(start, end, stairInfo) {
        let offsets = [];
        if (end > start) {
            for (let i = start * stairInfo.cell; i <= (end + 1) * stairInfo.cell; i += stairInfo.tread) {
                offsets.push(i);
            }
        } else {
            for (let i = (start + 1) * stairInfo.cell; i >= end * stairInfo.cell; i -= stairInfo.tread) {
                offsets.push(i);
            }
        }
        return offsets;
    }

    function drawUpStairs(stairInfo, color, context) {
        if (stairInfo.xc) {
            let stairXStart = stairInfo.xc - stairInfo.side;
            let stairXEnd = stairInfo.xc + stairInfo.side;
            stairInfo.list.forEach(stairY => {
                draw_line(context, stairXStart, stairY, stairXEnd, stairY, color);
            });
        } else {
            let stairYStart = stairInfo.yc - stairInfo.side;
            let stairYEnd = stairInfo.yc + stairInfo.side;
            stairInfo.list.forEach(stairX => {
                draw_line(context, stairX, stairYStart, stairX, stairYEnd, color);
            });
        }
    }

    function drawDownStairs(stairInfo, color, context) {
        if (stairInfo.xc) {
            let stairX = stairInfo.xc;
            stairInfo.list.forEach(stairY => {
                let stairOffset = stairInfo.down[Math.abs(stairY - stairInfo.y1)];
                draw_line(context, stairX - stairOffset, stairY, stairX + stairOffset, stairY, color);
            });
        } else {
            let stairY = stairInfo.yc;
            stairInfo.list.forEach(stairX => {
                let stairOffset = stairInfo.down[Math.abs(stairX - stairInfo.x1)];
                draw_line(context, stairX, stairY - stairOffset, stairX, stairY + stairOffset, color);
            });
        }
    }

    function exportMapImage() {
        let dungeonName = $("dungeon_name").getValue();
        save_canvas($("map"), '${dungeonName}.png');
    }

    let dungeonConfigConstants = {
        map_style: {
            standard: { title: "Standard" },
            classic: { title: "Classic" },
            graph: { title: "GraphPaper" }
        },
        grid: {
            none: { title: "None" },
            square: { title: "Square" },
            hex: { title: "Hex" },
            vex: { title: "VertHex" }
        },
        dungeon_layout: {
            square: { title: "Square", aspect: 1 },
            rectangle: { title: "Rectangle", aspect: 1.3 },
            box: { title: "Box", aspect: 1, mask: [
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1]
            ] },
            cross: { title: "Cross", aspect: 1, mask: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 1, 0]
            ] },
            dagger: { title: "Dagger", aspect: 1.3, mask: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 1, 0],
                [0, 1, 0]
            ] },
            saltire: { title: "Saltire", aspect: 1 },
            keep: { title: "Keep", aspect: 1, mask: [
                [1, 1, 0, 0, 1, 1],
                [1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 0],
                [0, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1],
                [1, 1, 0, 0, 1, 1]
            ] },
            hexagon: { title: "Hexagon", aspect: 0.9 },
            round: { title: "Round", aspect: 1 }
        },
        dungeon_size: {
            fine: { title: "Fine", size: 200, cell: 18 },
            dimin: { title: "Diminiutive", size: 252, cell: 18 },
            tiny: { title: "Tiny", size: 318, cell: 18 },
            small: { title: "Small", size: 400, cell: 18 },
            medium: { title: "Medium", size: 504, cell: 18 },
            large: { title: "Large", size: 635, cell: 18 },
            huge: { title: "Huge", size: 800, cell: 18 },
            gargant: { title: "Gargantuan", size: 1008, cell: 18 },
            colossal: { title: "Colossal", size: 1270, cell: 18 }
        },
        add_stairs: {
            no: { title: "No" },
            yes: { title: "Yes" },
            many: { title: "Many" }
        },
        room_layout: {
            sparse: { title: "Sparse" },
            scattered: { title: "Scattered" },
            dense: { title: "Dense" }
        },
        room_size: {
            small: { title: "Small", size: 2, radix: 2 },
            medium: { title: "Medium", size: 2, radix: 5 },
            large: { title: "Large", size: 5, radix: 2 },
            huge: { title: "Huge", size: 5, radix: 5, huge: 1 },
            gargant: { title: "Gargantuan", size: 8, radix: 5, huge: 1 },
            colossal: { title: "Colossal", size: 8, radix: 8, huge: 1 }
        },
        doors: {
            none: { title: "None" },
            basic: { title: "Basic" },
            secure: { title: "Secure" },
            standard: { title: "Standard" },
            deathtrap: { title: "Deathtrap" }
        },
        corridor_layout: {
            labyrinth: { title: "Labyrinth", pct: 0 },
            errant: { title: "Errant", pct: 50 },
            straight: { title: "Straight", pct: 90 }
        },
        remove_deadends: {
            none: { title: "None", pct: 0 },
            some: { title: "Some", pct: 50 },
            all: { title: "All", pct: 100 }
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

    let directionRowOffsets = {
        north: -1,
        south: 1,
        west: 0,
        east: 0
    };

    let directionColumnOffsets = {
        north: 0,
        south: 0,
        west: -1,
        east: 1
    };

        let stairPlacementRules = {
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
        },
        deadEndRemovalRules = {
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
        },
        colorPalettes = {
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
        },
        colorFallbackChain = {
            door: "fill",
            label: "fill",
            stair: "wall",
            wall: "fill",
            fill: "black",
            tag: "white"
        }


    let allDirectionsList = Object.keys(directionColumnOffsets).sort();

    let oppositeDirectionsMap = {
        north: "south",
        south: "north",
        west: "east",
        east: "west"
    };

    document.addEventListener("DOMContentLoaded", () => {
        // Insert options into select elements
        Object.keys(dungeonConfigConstants).forEach(key => {
            Object.keys(dungeonConfigConstants[key]).forEach(value => {
                let title = dungeonConfigConstants[key][value].title;
                let selectElement = $(key);
                let optionElement = new Element("option", { value }).update(title);
                selectElement.insert(optionElement);
            });
        });

        // Set default values for select elements
        Object.keys(defaultDungeonConfig).forEach(key => {
            $(key).setValue(defaultDungeonConfig[key]);
        });

        // Initialize the dungeon
        initHandler();

        // Observe changes and clicks
        $("dungeon_name").observe("change", updateDungeonTitle);
        $("new_name").observe("click", initHandler);
        Object.keys(dungeonConfigConstants).forEach(key => {
            $(key).observe("change", updateDungeonConfiguration);
        });
        $("save_map").observe("click", exportMapImage);
        $("print_map").observe("click", () => {
            window.print();
        });

        // Create and insert the export button
        let controlsElement = $("form"); // Use the existing form element
        if (controlsElement) {
            let exportButton = new Element("button", { id: "export_data" }).update("Export Dungeon Data");
            controlsElement.insert(exportButton);
            $("export_data").observe("click", exportDungeonData);
        } else {
            console.error("Form element not found.");
        }
    });

    function exportDungeonData() {
        let dungeonName = $("dungeon_name").getValue();
        let dungeonData = {
            name: dungeonName,
            config: defaultDungeonConfig,
            dimensions: calculateDungeonDimensions(),
            rooms: dungeonConfig.room,
            stairs: dungeonConfig.stair,
            cells: dungeonConfig.cell,
            doors: dungeonConfig.door
        };
        let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dungeonData, null, 2));
        let downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", dungeonName + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
});