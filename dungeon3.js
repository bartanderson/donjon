// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dungeon.js // version 1.0.4
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';
((windowObject, initHandler) => initHandler(windowObject))(window, windowObject => {
	function initHandler() {
		let a = generate_text("Dungeon Name");
		$("dungeon_name").setValue(a);
		updateDungeonTitle()
	}

	function updateDungeonTitle() {
		{
			let a = $("dungeon_name").getValue();
			$("dungeon_title").update(a)
		}
		updateDungeonConfiguration()
	}

	function updateDungeonConfiguration() {
		{
			let dungeonDimensions = stairDimensions(); {
				var dungeonConfig = dungeonDimensions;
				let roomSizeConfig = getDungeonConfigConstant("room_size", dungeonConfig),
					roomLayoutConfig = getDungeonConfigConstant("room_layout", dungeonConfig);
				dungeonConfig.isHugeRoomEnabled = roomSizeConfig.huge;
				dungeonConfig.isComplexRoomEnabled = roomLayoutConfig.complex;
				dungeonConfig.n_rooms = 0;
				dungeonConfig.room = [];
				if ("dense" == dungeonConfig.room_layout) {
					{
						var dungeonConfig = dungeonConfig;
						let rowNum;
						for (rowNum = 0; rowNum < dungeonConfig.n_i; rowNum++) {
							let w = 2 * rowNum + 1,
								colNum;
							for (colNum = 0; colNum < dungeonConfig.n_j; colNum++) {
								let r = 2 * colNum + 1;
								dungeonConfig.cell[w][r] & 2 || (0 == rowNum || 0 == colNum) && 0 < random(2) ||
									(dungeonConfig = addRoomToDungeon(dungeonConfig, {
										i: rowNum,
										j: colNum
									}), !dungeonConfig.isHugeRoomEnabled || dungeonConfig.cell[w][r] & 2 || (dungeonConfig = addRoomToDungeon(dungeonConfig, {
										i: rowNum,
										j: colNum,
										size: "medium"
									})))
							}
						}
						dungeonConfig = dungeonConfig
					}
				} else {
					{
						// not dense
						var adjacentRoomId = dungeonConfig;
						let numRoomsToAdd = calculateRoomCount(adjacentRoomId),
							currentRoomToAdd;
						for (currentRoomToAdd = 0; currentRoomToAdd < numRoomsToAdd; currentRoomToAdd++) adjacentRoomId = addRoomToDungeon(adjacentRoomId);
						if (adjacentRoomId.isHugeRoomEnabled) {
							let numMediumSizeRoomsToAdd = calculateRoomCount(adjacentRoomId, "medium"),
								currentMediumSizeRoomBeingAdded;
							for (currentMediumSizeRoomBeingAdded = 0; currentMediumSizeRoomBeingAdded < numMediumSizeRoomsToAdd; currentMediumSizeRoomBeingAdded++) adjacentRoomId = addRoomToDungeon(adjacentRoomId, {
								size: "medium"
							})
						}
						dungeonConfig = adjacentRoomId
					}
				}
			} {
				var currentDungeonConfig = dungeonConfig;
				mappedRoomConnections = {};
				let roomIdIterator;
				for (roomIdIterator = 1; roomIdIterator <= currentDungeonConfig.n_rooms; roomIdIterator++) a: {
					let numberOfDoors;
					var dungeonState = currentDungeonConfig,
						currentRoom = currentDungeonConfig.room[roomIdIterator];
					let potentialDoorConnections = calculatePotentialDoorConnections(dungeonState, currentRoom);
					if (!potentialDoorConnections.length) {
						currentDungeonConfig = dungeonState;
						break a
					} {
						let roomIndex = Math.floor(Math.sqrt(((currentRoom.east - currentRoom.west) / 2 + 1) * ((currentRoom.south - currentRoom.north) / 2 + 1)));
						var e = roomIndex + random(roomIndex)
					}
					let w = e;
					for (numberOfDoors = 0; numberOfDoors < w; numberOfDoors++) {
						let p = potentialDoorConnections.splice(random(potentialDoorConnections.length), 1).shift();
						if (!p) break;
						if (!(dungeonState.cell[p.door_r][p.door_c] & 4128768)) {
							let r;
							if (r = p.out_id) {
								let x = [currentRoom.id, r].sort(N).join(",");
								mappedRoomConnections[x] || (dungeonState = da(dungeonState, currentRoom, p), mappedRoomConnections[x] = 1)
							} else dungeonState = da(dungeonState, currentRoom, p)
						}
					}
					currentDungeonConfig = dungeonState
				}
			} {
				var h = currentDungeonConfig;
				let roomIdIterator;
				// iterate over each room in the dungeon
				for (roomIdIterator = 1; roomIdIterator <= h.n_rooms; roomIdIterator++) {
					let l = h.room[roomIdIterator],
						q = l.id.toString(),
						w = q.length,
						middleRow = Math.floor((l.north + l.south) / 2),
						middleColumn = Math.floor((l.west + l.east - w) / 2) + 1,
						x;
					for (x = 0; x < w; x++) h.cell[middleRow][middleColumn + x] |= q.charCodeAt(x) << 24
				}
			} {
				var k = h;
				let layoutType = getDungeonConfigConstant("corridor_layout", k);
				k.straight_pct = layoutType.pct;
				let l;
				for (l = 1; l < k.n_i; l++) {
					let q = 2 * l + 1,
						w;
					for (w = 1; w < k.n_j; w++) k.cell[q][2 *
						w + 1
					] & 4 || (k = generateCorridors(k, l, w))
				}
				dungeonDimensions = k
			}
			if (dungeonDimensions.add_stairs) {
				{
					var m = dungeonDimensions;
					let B = calculatePotentialStairLocations(m);
					if (B.length) {
						{
							let l = 0;
							"many" == m.add_stairs ? l = 3 + random(Math.floor(m.n_cols * m.n_rows / 1E3)) : "yes" == m.add_stairs && (l = 2);
							var t = l
						}
						if (0 != t) {
							var z = [],
								y;
							for (y = 0; y < t; y++) {
								let l = B.splice(random(B.length), 1).shift();
								if (!l) break;
								let q = l.row,
									w = l.col;
								0 == (2 > y ? y : random(2)) ? (m.cell[q][w] |= 4194304, l.key = "down") : (m.cell[q][w] |= 8388608, l.key = "up");
								z.push(l)
							}
							m.stair = z
						}
					}
					dungeonDimensions = m
				}
			}
			var A = dungeonDimensions;
			if (A.remove_deadends) {
				{
					var dungeonStateWithStairs = A;
					let B = getDungeonConfigConstant("remove_deadends", dungeonStateWithStairs);
					dungeonStateWithStairs.remove_pct = B.pct;
					A = removeDeadEnds(dungeonStateWithStairs, dungeonStateWithStairs.remove_pct, deadEndRemovalRules)
				}
			}
			A.remove_deadends && ("errant" == A.corridor_layout ? A.close_arcs = A.remove_pct : "straight" == A.corridor_layout && (A.close_arcs = A.remove_pct));
			A.close_arcs && (A = ha(A));
			A = ensureConsistentRoomConnections(A); {
				var u = A;
				let B = u.cell,
					l;
				for (l = 0; l <= u.n_rows; l++) {
					let q;
					for (q = 0; q <= u.n_cols; q++) B[l][q] & 1 && (B[l][q] = 0)
				}
				u.cell = B
			}
			var v = dungeonDimensions = u
		} {
			{
				let l = {
					map_style: v.map_style,
					grid: v.grid
				};
				l.cell_size = v.cell_size;
				l.width = (v.n_cols + 1) * l.cell_size + 1;
				l.height = (v.n_rows + 1) * l.cell_size + 1;
				l.max_x = l.width - 1;
				l.max_y = l.height - 1;
				l.font = Math.floor(.75 *
					l.cell_size).toString() + "px sans-serif";
				var n = l
			}
			let dungeon = new_image("map", n.width, n.height),
				B = getColorPalette(n);
			n.palette = B; {
				let l = new Element("canvas");
				l.width = n.width;
				l.height = n.height;
				let q = l.getContext("2d"),
					w = n.max_x,
					p = n.max_y,
					r = n.palette,
					x;
				(x = r.open) ? fill_rect(q, 0, 0, w, p, x): fill_rect(q, 0, 0, w, p, r.white);
				(x = r.open_grid) ? drawMap(v, n, x, q): (x = r.grid) && drawMap(v, n, x, q);
				var sa = l
			}
			n.base_layer = sa; {
				var compositeMapLayer = dungeon;
				let l = n.max_x,
					q = n.max_y,
					w = n.palette,
					p;
				(p = w.fill) ? fill_rect(compositeMapLayer, 0, 0, l, q, p): fill_rect(compositeMapLayer, 0, 0, l, q, w.black);
				(p = w.fill) && fill_rect(compositeMapLayer,
					0, 0, l, q, p);
				(p = w.fill_grid) ? drawMap(v, n, p, compositeMapLayer): (p = w.grid) && drawMap(v, n, p, compositeMapLayer)
			} {
				var ta = dungeon;
				let l = n.cell_size,
					q = n.base_layer,
					w;
				for (w = 0; w <= v.n_rows; w++) {
					let p = w * l,
						r;
					for (r = 0; r <= v.n_cols; r++)
						if (v.cell[w][r] & 6) {
							let x = r * l;
							ta.drawImage(q, x, p, l, l, x, p, l, l)
						}
				}
			} {
				var applyWallShading = dungeon;
				let l = n.cell_size,
					q = Math.floor(l / 4);
				3 > q && (q = 3);
				let w = n.palette,
					p;
				cache_pixels(!0);
				let r;
				for (r = 0; r <= v.n_rows; r++) {
					let x = r * l,
						E = x + l,
						C;
					for (C = 0; C <= v.n_cols; C++) {
						if (!(v.cell[r][C] & 6)) continue;
						let D = C * l,
							G = D + l;
						if (p = w.bevel_nw) {
							if (v.cell[r][C - 1] & 6 || draw_line(applyWallShading, D - 1, x, D - 1,
									E, p), v.cell[r - 1][C] & 6 || draw_line(applyWallShading, D, x - 1, G, x - 1, p), p = w.bevel_se) v.cell[r][C + 1] & 6 || draw_line(applyWallShading, G + 1, x + 1, G + 1, E, p), v.cell[r + 1][C] & 6 || draw_line(applyWallShading, D + 1, E + 1, G, E + 1, p)
						} else if (p = w.wall_shading) v.cell[r - 1][C - 1] & 6 || applyShading(applyWallShading, D - q, x - q, D - 1, x - 1, p), v.cell[r - 1][C] & 6 || applyShading(applyWallShading, D, x - q, G, x - 1, p), v.cell[r - 1][C + 1] & 6 || applyShading(applyWallShading, G + 1, x - q, G + q, x - 1, p), v.cell[r][C - 1] & 6 || applyShading(applyWallShading, D - q, x, D - 1, E, p), v.cell[r][C + 1] & 6 || applyShading(applyWallShading, G + 1, x, G + q, E, p), v.cell[r + 1][C - 1] & 6 || applyShading(applyWallShading, D - q, E + 1, D - 1, E + q, p), v.cell[r + 1][C] & 6 || applyShading(applyWallShading, D, E + 1, G, E + q, p), v.cell[r + 1][C + 1] & 6 || applyShading(applyWallShading, G + 1, E + 1, G + q, E + q, p);
						if (p = w.wall) v.cell[r - 1][C] & 6 || draw_line(applyWallShading, D, x, G, x, p), v.cell[r][C - 1] & 6 || draw_line(applyWallShading, D, x, D, E, p), v.cell[r][C + 1] & 6 || draw_line(applyWallShading, G, x, G, E, p), v.cell[r + 1][C] & 6 || draw_line(applyWallShading, D, E, G, E, p)
					}
				}
				draw_pixels(applyWallShading)
			}
			v.door && drawDoorsOrFeaturesBetweenAdjacentRooms(v, n, dungeon); {
				var va = dungeon;
				let l = n.cell_size,
					q = Math.floor(l / 2),
					w = n.font,
					p = getColorFromPalette(n.palette, "label"),
					r;
				for (r = 0; r <= v.n_rows; r++) {
					let x;
					for (x = 0; x <= v.n_cols; x++) {
						if (!(v.cell[r][x] & 6)) continue;
						a: {
							let C = v.cell[r][x] >> 24 & 255;
							if (0 == C) {
								var ia = !1;
								break a
							}
							let D = String.fromCharCode(C);ia = !/^\w/.test(D) || /[hjkl]/.test(D) ? !1 : D
						}
						let E = ia;
						E && draw_string(va, E, x * l + q, r * l + q + 1, w, p)
					}
				}
			}
			v.stair && drawStairs(v, n, dungeon)
		}
	}

	function stairDimensions() {
		let a = {
			seed: set_prng_seed($("dungeon_name").getValue())
		};
		Object.keys(dungeonConfigConstants).forEach(c => {
			a[c] = $(c).getValue()
		});
		var b = getDungeonConfigConstant("dungeon_size", a);
		let f = getDungeonConfigConstant("dungeon_layout", a);
		var d = b.size;
		b = b.cell;
		a.n_i = Math.floor(d * f.aspect / b);
		a.n_j = Math.floor(d / b);
		a.cell_size = b;
		a.n_rows = 2 * a.n_i;
		a.n_cols = 2 * a.n_j;
		a.max_row = a.n_rows - 1;
		a.max_col = a.n_cols - 1;
		a.cell = [];
		for (d = 0; d <= a.n_rows; d++)
			for (a.cell[d] = [], b = 0; b <= a.n_cols; b++) a.cell[d][b] = 0;
		let g;
		(g = f.mask) ? a = xa(a, g): "saltire" == a.dungeon_layout ? a = ya(a) : "hexagon" == a.dungeon_layout ? a = za(a) : "round" == a.dungeon_layout && (a = Aa(a));
		return a
	}

	function getDungeonConfigConstant(a, b) {
		return dungeonConfigConstants[a][b[a]]
	}

	function xa(a, b) {
		let f = b.length / (a.n_rows + 1),
			d = b[0].length / (a.n_cols + 1),
			g;
		for (g = 0; g <= a.n_rows; g++) {
			let c = b[Math.floor(g * f)],
				e;
			for (e = 0; e <= a.n_cols; e++) c[Math.floor(e * d)] || (a.cell[g][e] = 1)
		}
		return a
	}

	function ya(a) {
		let b = Math.floor(a.n_rows / 4),
			f;
		for (f = 0; f < b; f++) {
			var d = b + f;
			let g = a.n_cols - d;
			for (; d <= g; d++) a.cell[f][d] = 1, a.cell[a.n_rows -
				f][d] = 1, a.cell[d][f] = 1, a.cell[d][a.n_cols - f] = 1
		}
		return a
	}

	function za(a) {
		let b = Math.floor(a.n_rows / 2),
			adjacentRoomId;
		for (adjacentRoomId = 0; adjacentRoomId <= a.n_rows; adjacentRoomId++) {
			let d = Math.floor(.57735 * Math.abs(adjacentRoomId - b)) + 1,
				g = a.n_cols - d,
				c;
			for (c = 0; c <= a.n_cols; c++)
				if (c < d || c > g) a.cell[adjacentRoomId][c] = 1
		}
		return a
	}

	function Aa(a) {
		let b = a.n_rows / 2,
			adjacentRoomId = a.n_cols / 2,
			selectedDoorStyle;
		for (selectedDoorStyle = 0; selectedDoorStyle <= a.n_rows; selectedDoorStyle++) {
			let g = Math.pow(selectedDoorStyle / b - 1, 2),
				c;
			for (c = 0; c <= a.n_cols; c++) 1 < Math.sqrt(g + Math.pow(c / adjacentRoomId - 1, 2)) && (a.cell[selectedDoorStyle][c] = 1)
		}
		return a
	}

	function calculateRoomCount(a, b) {
		b = dungeonConfigConstants.room_size[b || a.room_size];
		b = (b.size || 2) + (b.radix || 5) + 1;
		b = 2 * Math.floor(a.n_cols * a.n_rows / (b * b));
		"sparse" == a.room_layout && (b /= 13);
		return b
	}

	function addRoomToDungeon(a, b) {
		if (999 == a.n_rooms) return a;
		var f = b || {};
		b = f;
		b.size || (b.size = a.room_size);
		var d = dungeonConfigConstants.room_size[b.size],
			g = d.size || 2;
		d = d.radix || 5;
		if (!("height" in b))
			if ("i" in b) {
				var c = a.n_i - g - b.i;
				0 > c && (c = 0);
				b.height = random(c < d ? c : d) + g
			} else b.height = random(d) + g;
		"width" in b || ("j" in b ? (c = a.n_j - g - b.j, 0 > c && (c = 0), b.width = random(c < d ? c : d) + g) : b.width = random(d) + g);
		"i" in b || (b.i = random(a.n_i - b.height));
		"j" in b || (b.j = random(a.n_j - b.width));
		f = b;
		b = 2 * f.i + 1;
		g = 2 * f.j + 1;
		d = 2 * (f.i + f.height) - 1;
		c = 2 * (f.j + f.width) - 1;
		var e, h;
		if (1 > b || d > a.max_row || 1 > g || c > a.max_col) return a;
		a: {
			var k = {};
			for (e = b; e <= d; e++)
				for (h = g; h <= c; h++) {
					if (a.cell[e][h] & 1) {
						k = {
							blocked: 1
						};
						break a
					}
					a.cell[e][h] & 2 && (k[(a.cell[e][h] & 65472) >> 6] += 1)
				}
		}
		if (k.blocked) return a;
		k = $H(k).keys();
		e = k.length;
		if (0 == e) k = a.n_rooms + 1, a.n_rooms = k;
		else if (1 == e)
			if (a.isComplexRoomEnabled) {
				if (k = k[0], k != f.complex_id) return a
			} else return a;
		else return a;
		for (e = b; e <= d; e++)
			for (h = g; h <= c; h++) a.cell[e][h] & 32 ? a.cell[e][h] &= 12648415 :
				a.cell[e][h] & 16 && (a.cell[e][h] &= -17), a.cell[e][h] = a.cell[e][h] | 2 | k << 6;
		f = {
			id: k,
			size: f.size,
			row: b,
			col: g,
			north: b,
			south: d,
			west: g,
			east: c,
			height: 10 * (d - b + 1),
			width: 10 * (c - g + 1),
			door: {
				north: [],
				south: [],
				west: [],
				east: []
			}
		};
		(e = a.room[k]) ? e.complex ? e.complex.push(f) : (complex = {
			complex: [e, f]
		}, a.room[k] = complex): a.room[k] = f;
		for (e = b - 1; e <= d + 1; e++) a.cell[e][g - 1] & 34 || (a.cell[e][g - 1] |= 16), a.cell[e][c + 1] & 34 || (a.cell[e][c + 1] |= 16);
		for (h = g - 1; h <= c + 1; h++) a.cell[b - 1][h] & 34 || (a.cell[b - 1][h] |= 16), a.cell[d + 1][h] & 34 || (a.cell[d + 1][h] |=
			16);
		return a
	}

	function N(a, b) {
		return a - b
	}

	function calculatePotentialDoorConnections(dungeonLayout, roomCriteria) {
		let grid = dungeonLayout.cell,
			potentialDoorLocations  = [];
		if (roomCriteria.complex) roomCriteria.complex.forEach(subCriteria => {
			subCriteria = calculatePotentialDoorConnections(dungeonLayout, subCriteria);
			subCriteria.length && (potentialDoorLocations  = potentialDoorLocations .concat(subCriteria))
		});
		else {
			var northBoundary = roomCriteria.north;
			let southBoundary = roomCriteria.south,
				westBoundary = roomCriteria.west,
				eastBoundary = roomCriteria.east;
			if (3 <= northBoundary) {
				var c;
				for (c = westBoundary; c <= eastBoundary; c += 2) {
					let potentialDoor;
					(potentialDoor = canDoorBePLaced(grid, roomCriteria, northBoundary, c, "north")) && potentialDoorLocations .push(potentialDoor)
				}
			}
			if (southBoundary <= dungeonLayout.n_rows - 3)
				for (c = westBoundary; c <= eastBoundary; c += 2) {
					let potentialDoor;
					(potentialDoor = canDoorBePLaced(grid, roomCriteria, southBoundary, c, "south")) && potentialDoorLocations .push(potentialDoor)
				}
			if (3 <= westBoundary)
				for (c = northBoundary; c <= southBoundary; c += 2) {
					let potentialDoor;
					(potentialDoor = canDoorBePLaced(grid, roomCriteria, c, westBoundary, "west")) && potentialDoorLocations .push(potentialDoor)
				}
			if (eastBoundary <= dungeonLayout.n_cols - 3)
				for (; northBoundary <= southBoundary; northBoundary += 2) {
					let potentialDoor;
					(potentialDoor = canDoorBePLaced(grid, roomCriteria, northBoundary, eastBoundary, "east")) && potentialDoorLocations .push(potentialDoor)
				}
		}
		return potentialDoorLocations 
	}

	function canDoorBePLaced(dungeonLayout2DGrid, doorData, rowIndex, colIndex, doorDirection) {
		let c = rowIndex + directionRowOffsets[doorDirection],
			e = colIndex + directionColumnOffsets[doorDirection],
			h = dungeonLayout2DGrid[c][e];
		if (!(h & 16) || h & 4128769) return !1; // if not a wall '16'or is a door, or has an adjacent door '4128769' it returns false
		dungeonLayout2DGrid = dungeonLayout2DGrid[c + directionRowOffsets[doorDirection]][e + directionColumnOffsets[doorDirection]];
		if (dungeonLayout2DGrid & 1) return !1;  // if the direction its looking is a door already, it returns false
		dungeonLayout2DGrid = (dungeonLayout2DGrid & 65472) >> 6; // extracts id of adjacent room if it exists by shifing 6 bits right
		return dungeonLayout2DGrid == doorData.id ? !1 : { // if the id matches the id of the room it returns false
			sill_r: rowIndex,
			sill_c: colIndex,
			dir: doorDirection,
			door_r: c,
			door_c: e,
			out_id: dungeonLayout2DGrid
		}
	}

	function da(a, b, f) {
		var d = getDungeonConfigConstant("doors", a).table;
		let g = f.door_r,
			c = f.door_c;
		var e = f.sill_r;
		let h = f.sill_c,
			k = f.dir;
		f = f.out_id;
		let m;
		for (m = 0; 3 > m; m++) {
			let t = e + directionRowOffsets[k] * m,
				z = h + directionColumnOffsets[k] * m;
			a.cell[t][z] &= -17;
			a.cell[t][z] |= 32
		}
		d = select_from_table(d);
		e = {
			row: g,
			col: c
		};
		65536 == d ? (a.cell[g][c] |= 65536, e.key = "arch", e.type = "Archway") :
			131072 == d ? (a.cell[g][c] |= 131072, e.key = "open", e.type = "Unlocked Door") : 262144 == d ? (a.cell[g][c] |= 262144, e.key = "lock", e.type = "Locked Door") : 524288 == d ? (a.cell[g][c] |= 524288, e.key = "trap", e.type = "Trapped Door") : 1048576 == d ? (a.cell[g][c] |= 1048576, e.key = "secret", e.type = "Secret Door") : 2097152 == d && (a.cell[g][c] |= 2097152, e.key = "portc", e.type = "Portcullis");
		f && (e.out_id = f);
		b.door[k].push(e);
		b.last_door = e;
		return a
	}

	function generateCorridors(dungeonLayoutObject, currentRowIndex, currentColumnIndex, configSettingsForDungeonGeneration) {
		shuffleDirections(dungeonLayoutObject, configSettingsForDungeonGeneration).forEach(g => {
			var currentDungeonLayoutObj = dungeonLayoutObject,
				rowIdxForCurrDirection = 2 * currentRowIndex + 1,
				colIndexForCurrentDirection = 2 * currentColumnIndex + 1,
				newRowIdxAfterMovingCurrDir = 2 * (currentRowIndex + directionRowOffsets[g]) + 1,
				newColIdxAfterMovingCurrDir = 2 * (currentColumnIndex + directionColumnOffsets[g]) + 1;
			corridorCreationConditions: {
				var midpointRowCoord =
					(colIndexForCurrentDirection + newColIdxAfterMovingCurrDir) / 2,
					midpointColCoord = newColIdxAfterMovingCurrDir;
				if (0 > newRowIdxAfterMovingCurrDir || newRowIdxAfterMovingCurrDir > currentDungeonLayoutObj.n_rows || 0 > midpointColCoord || midpointColCoord > currentDungeonLayoutObj.n_cols) var bCorridorCanBeCreatedCurrDir = !1;
				else {
					bCorridorCanBeCreatedCurrDir = [(rowIdxForCurrDirection + newRowIdxAfterMovingCurrDir) / 2, newRowIdxAfterMovingCurrDir].sort(N);
					midpointRowCoord = [midpointRowCoord, midpointColCoord].sort(N);
					for (midpointColCoord = bCorridorCanBeCreatedCurrDir[0]; midpointColCoord <= bCorridorCanBeCreatedCurrDir[1]; midpointColCoord++) {
						let CurrColIndex;
						for (CurrColIndex = midpointRowCoord[0]; CurrColIndex <= midpointRowCoord[1]; CurrColIndex++)
							if (currentDungeonLayoutObj.cell[midpointColCoord][CurrColIndex] & 21) {
								bCorridorCanBeCreatedCurrDir = !1;
								break corridorCreationConditions
							}
					}
					bCorridorCanBeCreatedCurrDir = !0
				}
			}
			if (bCorridorCanBeCreatedCurrDir) {
				rowIdxForCurrDirection = [rowIdxForCurrDirection, newRowIdxAfterMovingCurrDir].sort(N);
				newRowIdxAfterMovingCurrDir = [colIndexForCurrentDirection, newColIdxAfterMovingCurrDir].sort(N);
				for (newColIdxAfterMovingCurrDir = rowIdxForCurrDirection[0]; newColIdxAfterMovingCurrDir <= rowIdxForCurrDirection[1]; newColIdxAfterMovingCurrDir++)
					for (colIndexForCurrentDirection = newRowIdxAfterMovingCurrDir[0]; colIndexForCurrentDirection <= newRowIdxAfterMovingCurrDir[1]; colIndexForCurrentDirection++) currentDungeonLayoutObj.cell[newColIdxAfterMovingCurrDir][colIndexForCurrentDirection] &= -33, currentDungeonLayoutObj.cell[newColIdxAfterMovingCurrDir][colIndexForCurrentDirection] |= 4;
				currentDungeonLayoutObj = !0
			} else currentDungeonLayoutObj = !1;
			currentDungeonLayoutObj && (dungeonLayoutObject = generateCorridors(dungeonLayoutObject, currentRowIndex + directionRowOffsets[g], currentColumnIndex + directionColumnOffsets[g], g))
		});
		return dungeonLayoutObject
	}

	function shuffleDirections(dungeonConfigSettings, optionalPreferredDirection) {
		{
			var f = allDirectionsList.concat();
			let d;
			for (d = f.length - 1; 0 < d; d--) {
				let g = random(d + 1),
					c = f[d];
				f[d] = f[g];
				f[g] = c
			}
		}
		optionalPreferredDirection && dungeonConfigSettings.straight_pct && random(100) <
			dungeonConfigSettings.straight_pct && f.unshift(optionalPreferredDirection);
		return f
	}

	function calculatePotentialStairLocations(a) {
		let b = a.cell,
			f = [],
			d;
		for (d = 0; d < a.n_i; d++) {
			let g = 2 * d + 1,
				c;
			for (c = 0; c < a.n_j; c++) {
				let e = 2 * c + 1;
				4 == a.cell[g][e] && (a.cell[g][e] & 12582912 || Object.keys(stairPlacementRules).forEach(h => {
					if (ja(b, g, e, stairPlacementRules[h])) {
						let k = {
							row: g,
							col: e,
							dir: h
						};
						h = stairPlacementRules[h].next;
						k.next_row = k.row + h[0];
						k.next_col = k.col + h[1];
						f.push(k)
					}
				}))
			}
		}
		return f
	}

	function ja(a, b, f, d) {
		let g = !0,
			c;
		if (c = d.corridor)
			if (c.forEach(e => {
					a[b + e[0]] && 4 != a[b + e[0]][f + e[1]] && (g = !1)
				}), !g) return !1;
		if (d = d.walled)
			if (d.forEach(e => {
					a[b + e[0]] && a[b + e[0]][f +
						e[1]
					] & 6 && (g = !1)
				}), !g) return !1;
		return !0
	}

	function ha(a) {
		return removeDeadEnds(a, a.close_arcs, ha)
	}

	function removeDeadEnds(a, b, f) {
		let d = 100 == b,
			g;
		for (g = 0; g < a.n_i; g++) {
			let c = 2 * g + 1,
				e;
			for (e = 0; e < a.n_j; e++) {
				let h = 2 * e + 1;
				a.cell[c][h] & 6 && !(a.cell[c][h] & 12582912) && (d || random(100) < b) && (a = removeDeadEnd(a, c, h, f))
			}
		}
		return a
	}

	function removeDeadEnd(dungeonObject, rowIndex, colIndex, deadEndRemovalRules) { // removes deadend specifiec by rowIndex
		let g = dungeonObject.cell;
		if (!(dungeonObject.cell[rowIndex][colIndex] & 6)) return dungeonObject;
		Object.keys(deadEndRemovalRules).forEach(c => {
			if (ja(g, rowIndex, colIndex, deadEndRemovalRules[c])) {
				var e;
				(e = deadEndRemovalRules[c].close) && e.forEach(h => {
					g[rowIndex + h[0]][colIndex + h[1]] = 0
				});
				if (e = deadEndRemovalRules[c].open) g[rowIndex + e[0]][colIndex + e[1]] |= 4;
				if (c = deadEndRemovalRules[c].recurse) dungeonObject = removeDeadEnd(dungeonObject,
					rowIndex + c[0], colIndex + c[1], deadEndRemovalRules)
			}
		});
		dungeonObject.cell = g;
		return dungeonObject
	}

	function ensureConsistentRoomConnections(inputDungeon) {
		//It ensures that each door in the dungeon correctly connects to another room or to a corridor.
		// This is important for the functionality of the dungeon, as it ensures that all rooms are accessible
		// and that the dungeon layout is consistent.
		let roomConnections = {},
			allDoors = [];
		inputDungeon.room.forEach(room => {
			let roomId = room.id;
			Object.keys(room.door).forEach(doorType => {
				let connectedDoors = [];
				room.door[doorType].forEach(door => {
					var rowIndex = door.row,
						colIndex = door.col;
					if (inputDungeon.cell[rowIndex][colIndex] & 6)
						if (rowIndex = [rowIndex, colIndex].join(), roomConnections[rowIndex]) connectedDoors.push(door);
						else {
							if (colIndex = door.out_id) {
								let targetRoom = inputDungeon.room[colIndex],
									oppositeDirection = oppositeDirectionsMap[doorType];
								door.out_id = {};
								door.out_id[roomId] = colIndex;
								door.out_id[colIndex] = roomId;
								targetRoom.door[oppositeDirection].push(door)
							}
							connectedDoors.push(door);
							roomConnections[rowIndex] = !0
						}
				});
				connectedDoors.length ? (room.door[doorType] = connectedDoors, allDoors = allDoors.concat(connectedDoors)) : room.door[doorType] = []
			})
		});
		inputDungeon.door = allDoors;
		return inputDungeon
	}

	function getColorPalette(inputObject) {
		let palette;
		if (inputObject.palette) palette = inputObject.palette;
		else {
			let style;
			palette = (style = inputObject.map_style) ?
				colorPalettes[style] ? colorPalettes[style] : colorPalettes.standard : colorPalettes.standard
		}
		let colors;
		(colors = palette.colors) && Object.keys(colors).forEach(style => {
			palette[style] = colors[style]
		});
		palette.black || (palette.black = "#000000");
		palette.white || (palette.white = "#ffffff");
		return palette
	}

	function getColorFromPalette(palette, colorKey) {
		for (; colorKey;) {
			if (palette[colorKey]) return palette[colorKey];
			colorKey = colorFallbackChain[colorKey]
		}
		return "#000000"
	}

	function drawMap(dungeonConfigObject, dungeonDimensions, colorPalette, canvasDrawingContext) {
		if ("none" != dungeonConfigObject.grid)
			if ("hex" == dungeonConfigObject.grid) {
				var g = dungeonDimensions.cell_size;
				dungeonConfigObject = g / 3.4641016151;
				g /= 2;
				var c = dungeonDimensions.width / (3 * dungeonConfigObject);
				dungeonDimensions = dungeonDimensions.height / g;
				var e;
				for (e = 0; e < c; e++) {
					var h = 3 * e * dungeonConfigObject,
						k = h + dungeonConfigObject,
						m = h + 3 * dungeonConfigObject,
						t = void 0;
					for (t = 0; t < dungeonDimensions; t++) {
						var z = t * g,
							y = z + g;
						0 != (e + t) % 2 ? (draw_line(canvasDrawingContext, h, z, k, y, colorPalette), draw_line(canvasDrawingContext, k, y, m, y,
							colorPalette)) : draw_line(canvasDrawingContext, k, z, h, y, colorPalette)
					}
				}
			} else if ("vex" == dungeonConfigObject.grid)
			for (g = dungeonDimensions.cell_size, dungeonConfigObject = g / 2, g /= 3.4641016151, c = dungeonDimensions.width / dungeonConfigObject, dungeonDimensions = dungeonDimensions.height / (3 * g), e = 0; e < dungeonDimensions; e++)
				for (h = 3 * e * g, k = h + g, m = h + 3 * g, t = 0; t < c; t++) z = t * dungeonConfigObject, y = z + dungeonConfigObject, 0 != (e + t) % 2 ? (draw_line(canvasDrawingContext, z, h, y, k, colorPalette), draw_line(canvasDrawingContext, y, k, y, m, colorPalette)) : draw_line(canvasDrawingContext, z, k, y, h, colorPalette);
		else {
			dungeonConfigObject = dungeonDimensions.cell_size;
			for (g = 0; g <= dungeonDimensions.max_x; g += dungeonConfigObject) draw_line(canvasDrawingContext, g, 0, g, dungeonDimensions.max_y, colorPalette);
			for (g = 0; g <= dungeonDimensions.max_y; g += dungeonConfigObject) draw_line(canvasDrawingContext, 0, g, dungeonDimensions.max_x, g, colorPalette)
		}
		return !0
	}

	function applyShading(canvasDrawingContext, b, f, d, g, c) {
		for (; b <= d; b++) {
			let e;
			for (e = f; e <= g; e++) 0 != (b + e) % 2 && set_pixel(canvasDrawingContext, b, e, c)
		}
		return !0
	}

	function drawDoorsOrFeaturesBetweenAdjacentRooms(dungeonStateConfiguration,
		cellSizeRoomHeightDimensions, adjacentRoomId) {
		let d = dungeonStateConfiguration.door,
			dungeonState  = cellSizeRoomHeightDimensions.cell_size,
			c = Math.floor(dungeonState  / 6),
			roomHeight = Math.floor(dungeonState  / 4),
			h = Math.floor(dungeonState  / 3);
		cellSizeRoomHeightDimensions = cellSizeRoomHeightDimensions.palette;
		let roomId = getColorFromPalette(cellSizeRoomHeightDimensions, "wall"),
			m = getColorFromPalette(cellSizeRoomHeightDimensions, "door");
		d.forEach(doorRow => {
			var z = doorRow.row,
				y = z * dungeonState ,
				stairColumn = doorRow.col;
			let dungeonStateWithStairs = stairColumn * dungeonState ;
			if ("arch" == doorRow.key) var u = {
				arch: 1
			};
			else "open" == doorRow.key ? u = {
				arch: 1,
				door: 1
			} : "lock" == doorRow.key ? u = {
				arch: 1,
				door: 1,
				lock: 1
			} : "trap" == doorRow.key ? (u = {
				arch: 1,
				door: 1,
				trap: 1
			}, /Lock/.test(doorRow.desc) && (u.lock = 1)) : "secret" == doorRow.key ? u = {
				wall: 1,
				arch: 1,
				secret: 1
			} : "portc" == doorRow.key && (u = {
				arch: 1,
				portc: 1
			});
			doorRow = u;
			let dungeonStateWithoutWallFlags = dungeonStateConfiguration.cell[z][stairColumn - 1] & 6;
			z = y + dungeonState ;
			stairColumn = dungeonStateWithStairs + dungeonState ;
			u = Math.floor((y + z) / 2);
			let mapStyleInfo = Math.floor((dungeonStateWithStairs + stairColumn) / 2);
			doorRow.wall && (dungeonStateWithoutWallFlags ? draw_line(adjacentRoomId, mapStyleInfo, y, mapStyleInfo, z, roomId) : draw_line(adjacentRoomId, dungeonStateWithStairs, u, stairColumn, u, roomId));
			doorRow.arch && (dungeonStateWithoutWallFlags ? (fill_rect(adjacentRoomId, mapStyleInfo - 1, y, mapStyleInfo + 1, y + c, roomId), fill_rect(adjacentRoomId, mapStyleInfo - 1, z - c, mapStyleInfo + 1, z, roomId)) : (fill_rect(adjacentRoomId, dungeonStateWithStairs, u - 1, dungeonStateWithStairs + c, u + 1, roomId), fill_rect(adjacentRoomId, stairColumn - c, u - 1, stairColumn, u + 1, roomId)));
			doorRow.door && (dungeonStateWithoutWallFlags ? stroke_rect(adjacentRoomId, mapStyleInfo - roomHeight, y + c + 1, mapStyleInfo + roomHeight, z - c - 1, m) : stroke_rect(adjacentRoomId, dungeonStateWithStairs + c + 1, u - roomHeight, stairColumn - c - 1, u + roomHeight, m));
			doorRow.lock && (dungeonStateWithoutWallFlags ? draw_line(adjacentRoomId, mapStyleInfo, y + c + 1, mapStyleInfo, z - c - 1, m) : draw_line(adjacentRoomId, dungeonStateWithStairs + c + 1, u, stairColumn - c - 1, u, m));
			doorRow.trap && (dungeonStateWithoutWallFlags ? draw_line(adjacentRoomId, mapStyleInfo - h, u, mapStyleInfo + h, u, m) : draw_line(adjacentRoomId, mapStyleInfo, u - h, mapStyleInfo, u + h, m));
			doorRow.secret && (dungeonStateWithoutWallFlags ? (draw_line(adjacentRoomId, mapStyleInfo - 1, u - roomHeight, mapStyleInfo + 2, u - roomHeight, m), draw_line(adjacentRoomId, mapStyleInfo -
				2, u - roomHeight + 1, mapStyleInfo - 2, u - 1, m), draw_line(adjacentRoomId, mapStyleInfo - 1, u, mapStyleInfo + 1, u, m), draw_line(adjacentRoomId, mapStyleInfo + 2, u + 1, mapStyleInfo + 2, u + roomHeight - 1, m), draw_line(adjacentRoomId, mapStyleInfo - 2, u + roomHeight, mapStyleInfo + 1, u + roomHeight, m)) : (draw_line(adjacentRoomId, mapStyleInfo - roomHeight, u - 2, mapStyleInfo - roomHeight, u + 1, m), draw_line(adjacentRoomId, mapStyleInfo - roomHeight + 1, u + 2, mapStyleInfo - 1, u + 2, m), draw_line(adjacentRoomId, mapStyleInfo, u - 1, mapStyleInfo, u + 1, m), draw_line(adjacentRoomId, mapStyleInfo + 1, u - 2, mapStyleInfo + roomHeight - 1, u - 2, m), draw_line(adjacentRoomId, mapStyleInfo + roomHeight, u - 1, mapStyleInfo + roomHeight, u + 2, m)));
			if (doorRow.portc)
				if (dungeonStateWithoutWallFlags)
					for (y = y + c + 2; y < z - c; y += 2) set_pixel(adjacentRoomId, mapStyleInfo, y, m);
				else
					for (y = dungeonStateWithStairs + c + 2; y < stairColumn - c; y += 2) set_pixel(adjacentRoomId, y, u, m)
		});
		return !0
	}

	function drawStairs(stairsConfig, dungeonDimensions, adjacentRoomId) {
		stairsConfig = stairsConfig.stair;
		let stairInfo = initializeStairInfo(dungeonDimensions.cell_size),
			dungeonState = getColorFromPalette(dungeonDimensions.palette, "stair");
		stairsConfig.forEach(stairObject => {
			if (stairObject.next_row != stairObject.row) { //does the stair extends vertically? If so it's connecting two different rows of rooms.
				var roomHeight =
					Math.floor((stairObject.col + .5) * stairInfo.cell);
			    
				// set of offsets that determine the positions of each step of the stairs
				var calculatedStairOffsets = calculateStairOffsets(stairObject.row, stairObject.next_row, stairInfo),
					k = calculatedStairOffsets.shift(); // removes each offset as it is processed in the forEach loop
				roomHeight = {
					xc: roomHeight, // list of horizontal center positions of stairs
					y1: k,          // starting vertical position of the stairs
					list: calculatedStairOffsets // remaining stair offsets
				}
			} else roomHeight = Math.floor((stairObject.row + .5) * stairInfo.cell), calculatedStairOffsets = calculateStairOffsets(stairObject.col, stairObject.next_col, stairInfo), k = calculatedStairOffsets.shift(), roomHeight = {
				yc: roomHeight,     // list of vertical center positions of stairs
				x1: k,              // starting horizontal position of the stairs
				list: calculatedStairOffsets // remaining stair offsets
			};
			roomHeight.side = stairInfo.side;
			roomHeight.down = stairInfo.down;
			// stair direction determined by the stair object key
			"up" == stairObject.key ? drawUpStairs(roomHeight, dungeonState, adjacentRoomId) : drawDownStairs(roomHeight, dungeonState, adjacentRoomId)
		});
		return !0
	}

	function initializeStairInfo(a) {
		a = {
			cell: a,
			len: 2 * a,
			side: Math.floor(a / 2),
			tread: Math.floor(a / 20) + 2,
			down: {}
		};
		let dungeonConfig;
		for (dungeonConfig = 0; dungeonConfig < a.len; dungeonConfig += a.tread) a.down[dungeonConfig] = Math.floor(dungeonConfig / a.len * a.side);
		return a
	}

	function calculateStairOffsets(a, dungeonConfig, adjacentRoomId) {
		let selectedDoorStyle = [];
		if (dungeonConfig > a)
			for (a *= adjacentRoomId.cell, selectedDoorStyle.push(a), dungeonConfig = (dungeonConfig + 1) * adjacentRoomId.cell; a <
				dungeonConfig; a += adjacentRoomId.tread) selectedDoorStyle.push(a);
		else if (dungeonConfig < a)
			for (a = (a + 1) * adjacentRoomId.cell, selectedDoorStyle.push(a), dungeonConfig *= adjacentRoomId.cell; a > dungeonConfig; a -= adjacentRoomId.tread) selectedDoorStyle.push(a);
		return selectedDoorStyle
	}

	function drawUpStairs(stairObject, dungeonConfig, adjacentRoomId) { // stairObject with xc, yc side and list, c stands for center
		if (stairObject.xc) {
			let selectedDoorStyle = stairObject.xc - stairObject.side,
				dungeonState = stairObject.xc + stairObject.side;
			stairObject.list.forEach(c => {
				//           context        x1               y1       x2      y2     color
				draw_line(adjacentRoomId, selectedDoorStyle, c, dungeonState, c, dungeonConfig) // constant y
			})
		} else {
			let selectedDoorStyle = stairObject.yc - stairObject.side,
				dungeonState = stairObject.yc + stairObject.side;
			stairObject.list.forEach(c => {
				//           context      x1         y1         x2      y2           color
				draw_line(adjacentRoomId, c, selectedDoorStyle, c, dungeonState, dungeonConfig) // constant x
			})
		}
		return !0
	}

	function drawDownStairs(a, dungeonConfig, adjacentRoomId) {
		if (a.xc) {
			let selectedDoorStyle = a.xc;
			a.list.forEach(dungeonState => {
				let c = a.down[Math.abs(dungeonState - a.y1)];
				draw_line(adjacentRoomId, selectedDoorStyle - c, dungeonState, selectedDoorStyle + c, dungeonState, dungeonConfig)
			})
		} else {
			let selectedDoorStyle = a.yc;
			a.list.forEach(dungeonState => {
				let c = a.down[Math.abs(dungeonState - a.x1)];
				draw_line(adjacentRoomId, dungeonState, selectedDoorStyle -
					c, dungeonState, selectedDoorStyle + c, dungeonConfig)
			})
		}
		return !0
	}

	function exportMapImage() {
		let a = $("dungeon_name").getValue();
		save_canvas($("map"), `${a}.png`)
	}
	let dungeonConfigConstants = {
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
		},
		defaultDungeonConfig = {
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
		},
		directionRowOffsets = {
			north: -1,
			south: 1,
			west: 0,
			east: 0
		},
		directionColumnOffsets = {
			north: 0,
			south: 0,
			west: -1,
			east: 1
		},
		allDirectionsList = $H(directionColumnOffsets).keys().sort(),
		oppositeDirectionsMap = {
			north: "south",
			south: "north",
			west: "east",
			east: "west"
		};
	document.observe("dom:loaded", () => {
		Object.keys(dungeonConfigConstants).forEach(a => {
			Object.keys(dungeonConfigConstants[a]).forEach(b => {
				let f = dungeonConfigConstants[a][b].title;
				var d = $(a),
					g = d.insert;
				b = (new Element("option", {
					value: b
				})).update(f);
				g.call(d, b)
			})
		});
		Object.keys(defaultDungeonConfig).forEach(a => {
			$(a).setValue(defaultDungeonConfig[a])
		});
		initHandler();
		$("dungeon_name").observe("change", updateDungeonTitle);
		$("new_name").observe("click", initHandler);
		Object.keys(dungeonConfigConstants).forEach(a => {
			$(a).observe("change", updateDungeonConfiguration)
		});
		$("save_map").observe("click", exportMapImage);
		$("print_map").observe("click", () => {
			window.print()
		})
	});
	let mappedRoomConnections = {};
	dungeonConfigConstants.doors.none.table = {
		"01-15": 65536 // Bit position: 0 arch/Archway - the first part percentage occurence
	};
	dungeonConfigConstants.doors.basic.table = {
		"01-15": 65536, // Bit position: 0 arch/Archway
		"16-60": 131072 // Bit position: 1 open/Unlocked Door
	};
	dungeonConfigConstants.doors.secure.table = {
		"01-15": 65536,  // Bit position: 0 arch/Archway
		"16-60": 131072, // Bit position: 1 open/Unlocked Door
		"61-75": 262144  // Bit position: 2 lock/Locked Door
	};
	dungeonConfigConstants.doors.standard.table = { // bitmasks relate the type of door
		"01-15": 65536,    // Bit position: 0 arch/Archway
		"16-60": 131072,   // Bit position: 1 open/Unlocked Door
		"61-75": 262144,   // Bit position: 2 lock/Locked Door
		"76-90": 524288,   // Bit position: 3 trap/Trapped Door
		"91-100": 1048576, // Bit position: 4 secret/Secret Door
		"101-110": 2097152 // Bit position: 5 portc/Portcullis
	};
	dungeonConfigConstants.doors.deathtrap.table = {
		"01-15": 65536,  // Bit position: 0 arch/Archway
		"16-30": 524288, // Bit position: 3 trap/Trapped Door
		"31-40": 1048576 // Bit position: 4 secret/Secret Door
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
});