// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// dungeon.js // version 1.0.4
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';
((Y, Q) => Q(Y))(window, Y => {
	function Q() {
		let a = generate_text("Dungeon Name");
		$("dungeon_name").setValue(a);
		Z()
	}

	function Z() {
		{
			let a = $("dungeon_name").getValue();
			$("dungeon_title").update(a)
		}
		aa()
	}

	function aa() {
		{
			let H = na(); {
				var a = H;
				let B = L("room_size", a),
					l = L("room_layout", a);
				a.huge_rooms = B.huge;
				a.complex_rooms = l.complex;
				a.n_rooms = 0;
				a.room = [];
				if ("dense" == a.room_layout) {
					{
						var b = a;
						let q;
						for (q = 0; q < b.n_i; q++) {
							let w = 2 * q + 1,
								p;
							for (p = 0; p < b.n_j; p++) {
								let r = 2 * p + 1;
								b.cell[w][r] & 2 || (0 == q || 0 == p) && 0 < random(2) ||
									(b = R(b, {
										i: q,
										j: p
									}), !b.huge_rooms || b.cell[w][r] & 2 || (b = R(b, {
										i: q,
										j: p,
										size: "medium"
									})))
							}
						}
						a = b
					}
				} else {
					{
						var f = a;
						let q = ba(f),
							w;
						for (w = 0; w < q; w++) f = R(f);
						if (f.huge_rooms) {
							let p = ba(f, "medium"),
								r;
							for (r = 0; r < p; r++) f = R(f, {
								size: "medium"
							})
						}
						a = f
					}
				}
			} {
				var d = a;
				W = {};
				let B;
				for (B = 1; B <= d.n_rooms; B++) a: {
					let l;
					var g = d,
						c = d.room[B];
					let q = ca(g, c);
					if (!q.length) {
						d = g;
						break a
					} {
						let p = Math.floor(Math.sqrt(((c.east - c.west) / 2 + 1) * ((c.south - c.north) / 2 + 1)));
						var e = p + random(p)
					}
					let w = e;
					for (l = 0; l < w; l++) {
						let p = q.splice(random(q.length), 1).shift();
						if (!p) break;
						if (!(g.cell[p.door_r][p.door_c] & 4128768)) {
							let r;
							if (r = p.out_id) {
								let x = [c.id, r].sort(N).join(",");
								W[x] || (g = da(g, c, p), W[x] = 1)
							} else g = da(g, c, p)
						}
					}
					d = g
				}
			} {
				var h = d;
				let B;
				for (B = 1; B <= h.n_rooms; B++) {
					let l = h.room[B],
						q = l.id.toString(),
						w = q.length,
						p = Math.floor((l.north + l.south) / 2),
						r = Math.floor((l.west + l.east - w) / 2) + 1,
						x;
					for (x = 0; x < w; x++) h.cell[p][r + x] |= q.charCodeAt(x) << 24
				}
			} {
				var k = h;
				let B = L("corridor_layout", k);
				k.straight_pct = B.pct;
				let l;
				for (l = 1; l < k.n_i; l++) {
					let q = 2 * l + 1,
						w;
					for (w = 1; w < k.n_j; w++) k.cell[q][2 *
						w + 1
					] & 4 || (k = ea(k, l, w))
				}
				H = k
			}
			if (H.add_stairs) {
				{
					var m = H;
					let B = oa(m);
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
					H = m
				}
			}
			var A = H;
			if (A.remove_deadends) {
				{
					var I = A;
					let B = L("remove_deadends", I);
					I.remove_pct = B.pct;
					A = fa(I, I.remove_pct, pa)
				}
			}
			A.remove_deadends && ("errant" == A.corridor_layout ? A.close_arcs = A.remove_pct : "straight" == A.corridor_layout && (A.close_arcs = A.remove_pct));
			A.close_arcs && (A = ha(A));
			A = qa(A); {
				var u = A;
				let B = u.cell,
					l;
				for (l = 0; l <= u.n_rows; l++) {
					let q;
					for (q = 0; q <= u.n_cols; q++) B[l][q] & 1 && (B[l][q] = 0)
				}
				u.cell = B
			}
			var v = H = u
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
			let H = new_image("map", n.width, n.height),
				B = ra(n);
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
				(x = r.open_grid) ? S(v, n, x, q): (x = r.grid) && S(v, n, x, q);
				var sa = l
			}
			n.base_layer = sa; {
				var O = H;
				let l = n.max_x,
					q = n.max_y,
					w = n.palette,
					p;
				(p = w.fill) ? fill_rect(O, 0, 0, l, q, p): fill_rect(O, 0, 0, l, q, w.black);
				(p = w.fill) && fill_rect(O,
					0, 0, l, q, p);
				(p = w.fill_grid) ? S(v, n, p, O): (p = w.grid) && S(v, n, p, O)
			} {
				var ta = H;
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
				var F = H;
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
							if (v.cell[r][C - 1] & 6 || draw_line(F, D - 1, x, D - 1,
									E, p), v.cell[r - 1][C] & 6 || draw_line(F, D, x - 1, G, x - 1, p), p = w.bevel_se) v.cell[r][C + 1] & 6 || draw_line(F, G + 1, x + 1, G + 1, E, p), v.cell[r + 1][C] & 6 || draw_line(F, D + 1, E + 1, G, E + 1, p)
						} else if (p = w.wall_shading) v.cell[r - 1][C - 1] & 6 || K(F, D - q, x - q, D - 1, x - 1, p), v.cell[r - 1][C] & 6 || K(F, D, x - q, G, x - 1, p), v.cell[r - 1][C + 1] & 6 || K(F, G + 1, x - q, G + q, x - 1, p), v.cell[r][C - 1] & 6 || K(F, D - q, x, D - 1, E, p), v.cell[r][C + 1] & 6 || K(F, G + 1, x, G + q, E, p), v.cell[r + 1][C - 1] & 6 || K(F, D - q, E + 1, D - 1, E + q, p), v.cell[r + 1][C] & 6 || K(F, D, E + 1, G, E + q, p), v.cell[r + 1][C + 1] & 6 || K(F, G + 1, E + 1, G + q, E + q, p);
						if (p = w.wall) v.cell[r - 1][C] & 6 || draw_line(F, D, x, G, x, p), v.cell[r][C - 1] & 6 || draw_line(F, D, x, D, E, p), v.cell[r][C + 1] & 6 || draw_line(F, G, x, G, E, p), v.cell[r + 1][C] & 6 || draw_line(F, D, E, G, E, p)
					}
				}
				draw_pixels(F)
			}
			v.door && ua(v, n, H); {
				var va = H;
				let l = n.cell_size,
					q = Math.floor(l / 2),
					w = n.font,
					p = T(n.palette, "label"),
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
			v.stair && wa(v, n, H)
		}
	}

	function na() {
		let a = {
			seed: set_prng_seed($("dungeon_name").getValue())
		};
		Object.keys(J).forEach(c => {
			a[c] = $(c).getValue()
		});
		var b = L("dungeon_size", a);
		let f = L("dungeon_layout", a);
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

	function L(a, b) {
		return J[a][b[a]]
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
			f;
		for (f = 0; f <= a.n_rows; f++) {
			let d = Math.floor(.57735 * Math.abs(f - b)) + 1,
				g = a.n_cols - d,
				c;
			for (c = 0; c <= a.n_cols; c++)
				if (c < d || c > g) a.cell[f][c] = 1
		}
		return a
	}

	function Aa(a) {
		let b = a.n_rows / 2,
			f = a.n_cols / 2,
			d;
		for (d = 0; d <= a.n_rows; d++) {
			let g = Math.pow(d / b - 1, 2),
				c;
			for (c = 0; c <= a.n_cols; c++) 1 < Math.sqrt(g + Math.pow(c / f - 1, 2)) && (a.cell[d][c] = 1)
		}
		return a
	}

	function ba(a, b) {
		b = J.room_size[b || a.room_size];
		b = (b.size || 2) + (b.radix || 5) + 1;
		b = 2 * Math.floor(a.n_cols * a.n_rows / (b * b));
		"sparse" == a.room_layout && (b /= 13);
		return b
	}

	function R(a, b) {
		if (999 == a.n_rooms) return a;
		var f = b || {};
		b = f;
		b.size || (b.size = a.room_size);
		var d = J.room_size[b.size],
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
			if (a.complex_rooms) {
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

	function ca(a, b) {
		let f = a.cell,
			d = [];
		if (b.complex) b.complex.forEach(h => {
			h = ca(a, h);
			h.length && (d = d.concat(h))
		});
		else {
			var g = b.north;
			let h = b.south,
				k = b.west,
				m = b.east;
			if (3 <= g) {
				var c;
				for (c = k; c <= m; c += 2) {
					let t;
					(t = U(f, b, g, c, "north")) && d.push(t)
				}
			}
			if (h <= a.n_rows - 3)
				for (c = k; c <= m; c += 2) {
					var e = void 0;
					(e = U(f, b, h, c, "south")) && d.push(e)
				}
			if (3 <= k)
				for (e = g; e <= h; e += 2) {
					let t;
					(t = U(f, b, e, k, "west")) && d.push(t)
				}
			if (m <= a.n_cols - 3)
				for (; g <= h; g += 2) {
					let t;
					(t = U(f, b, g, m, "east")) && d.push(t)
				}
		}
		return d
	}

	function U(a, b, f, d, g) {
		let c = f + P[g],
			e = d + M[g],
			h = a[c][e];
		if (!(h & 16) || h & 4128769) return !1;
		a = a[c + P[g]][e + M[g]];
		if (a & 1) return !1;
		a = (a & 65472) >> 6;
		return a == b.id ? !1 : {
			sill_r: f,
			sill_c: d,
			dir: g,
			door_r: c,
			door_c: e,
			out_id: a
		}
	}

	function da(a, b, f) {
		var d = L("doors", a).table;
		let g = f.door_r,
			c = f.door_c;
		var e = f.sill_r;
		let h = f.sill_c,
			k = f.dir;
		f = f.out_id;
		let m;
		for (m = 0; 3 > m; m++) {
			let t = e + P[k] * m,
				z = h + M[k] * m;
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

	function ea(a, b, f, d) {
		Ba(a, d).forEach(g => {
			var c = a,
				e = 2 * b + 1,
				h = 2 * f + 1,
				k = 2 * (b + P[g]) + 1,
				m = 2 * (f + M[g]) + 1;
			b: {
				var t =
					(h + m) / 2,
					z = m;
				if (0 > k || k > c.n_rows || 0 > z || z > c.n_cols) var y = !1;
				else {
					y = [(e + k) / 2, k].sort(N);
					t = [t, z].sort(N);
					for (z = y[0]; z <= y[1]; z++) {
						let A;
						for (A = t[0]; A <= t[1]; A++)
							if (c.cell[z][A] & 21) {
								y = !1;
								break b
							}
					}
					y = !0
				}
			}
			if (y) {
				e = [e, k].sort(N);
				k = [h, m].sort(N);
				for (m = e[0]; m <= e[1]; m++)
					for (h = k[0]; h <= k[1]; h++) c.cell[m][h] &= -33, c.cell[m][h] |= 4;
				c = !0
			} else c = !1;
			c && (a = ea(a, b + P[g], f + M[g], g))
		});
		return a
	}

	function Ba(a, b) {
		{
			var f = Ca.concat();
			let d;
			for (d = f.length - 1; 0 < d; d--) {
				let g = random(d + 1),
					c = f[d];
				f[d] = f[g];
				f[g] = c
			}
		}
		b && a.straight_pct && random(100) <
			a.straight_pct && f.unshift(b);
		return f
	}

	function oa(a) {
		let b = a.cell,
			f = [],
			d;
		for (d = 0; d < a.n_i; d++) {
			let g = 2 * d + 1,
				c;
			for (c = 0; c < a.n_j; c++) {
				let e = 2 * c + 1;
				4 == a.cell[g][e] && (a.cell[g][e] & 12582912 || Object.keys(X).forEach(h => {
					if (ja(b, g, e, X[h])) {
						let k = {
							row: g,
							col: e,
							dir: h
						};
						h = X[h].next;
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
		return fa(a, a.close_arcs, ha)
	}

	function fa(a, b, f) {
		let d = 100 == b,
			g;
		for (g = 0; g < a.n_i; g++) {
			let c = 2 * g + 1,
				e;
			for (e = 0; e < a.n_j; e++) {
				let h = 2 * e + 1;
				a.cell[c][h] & 6 && !(a.cell[c][h] & 12582912) && (d || random(100) < b) && (a = ka(a, c, h, f))
			}
		}
		return a
	}

	function ka(a, b, f, d) {
		let g = a.cell;
		if (!(a.cell[b][f] & 6)) return a;
		Object.keys(d).forEach(c => {
			if (ja(g, b, f, d[c])) {
				var e;
				(e = d[c].close) && e.forEach(h => {
					g[b + h[0]][f + h[1]] = 0
				});
				if (e = d[c].open) g[b + e[0]][f + e[1]] |= 4;
				if (c = d[c].recurse) a = ka(a,
					b + c[0], f + c[1], d)
			}
		});
		a.cell = g;
		return a
	}

	function qa(a) {
		let b = {},
			f = [];
		a.room.forEach(d => {
			let g = d.id;
			Object.keys(d.door).forEach(c => {
				let e = [];
				d.door[c].forEach(h => {
					var k = h.row,
						m = h.col;
					if (a.cell[k][m] & 6)
						if (k = [k, m].join(), b[k]) e.push(h);
						else {
							if (m = h.out_id) {
								let t = a.room[m],
									z = Da[c];
								h.out_id = {};
								h.out_id[g] = m;
								h.out_id[m] = g;
								t.door[z].push(h)
							}
							e.push(h);
							b[k] = !0
						}
				});
				e.length ? (d.door[c] = e, f = f.concat(e)) : d.door[c] = []
			})
		});
		a.door = f;
		return a
	}

	function ra(a) {
		let b;
		if (a.palette) b = a.palette;
		else {
			let d;
			b = (d = a.map_style) ?
				V[d] ? V[d] : V.standard : V.standard
		}
		let f;
		(f = b.colors) && Object.keys(f).forEach(d => {
			b[d] = f[d]
		});
		b.black || (b.black = "#000000");
		b.white || (b.white = "#ffffff");
		return b
	}

	function T(a, b) {
		for (; b;) {
			if (a[b]) return a[b];
			b = Ea[b]
		}
		return "#000000"
	}

	function S(a, b, f, d) {
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

	function K(a, b, f, d, g, c) {
		for (; b <= d; b++) {
			let e;
			for (e = f; e <= g; e++) 0 != (b + e) % 2 && set_pixel(a, b, e, c)
		}
		return !0
	}

	function ua(a,
		b, f) {
		let d = a.door,
			g = b.cell_size,
			c = Math.floor(g / 6),
			e = Math.floor(g / 4),
			h = Math.floor(g / 3);
		b = b.palette;
		let k = T(b, "wall"),
			m = T(b, "door");
		d.forEach(t => {
			var z = t.row,
				y = z * g,
				A = t.col;
			let I = A * g;
			if ("arch" == t.key) var u = {
				arch: 1
			};
			else "open" == t.key ? u = {
				arch: 1,
				door: 1
			} : "lock" == t.key ? u = {
				arch: 1,
				door: 1,
				lock: 1
			} : "trap" == t.key ? (u = {
				arch: 1,
				door: 1,
				trap: 1
			}, /Lock/.test(t.desc) && (u.lock = 1)) : "secret" == t.key ? u = {
				wall: 1,
				arch: 1,
				secret: 1
			} : "portc" == t.key && (u = {
				arch: 1,
				portc: 1
			});
			t = u;
			let v = a.cell[z][A - 1] & 6;
			z = y + g;
			A = I + g;
			u = Math.floor((y + z) / 2);
			let n = Math.floor((I + A) / 2);
			t.wall && (v ? draw_line(f, n, y, n, z, k) : draw_line(f, I, u, A, u, k));
			t.arch && (v ? (fill_rect(f, n - 1, y, n + 1, y + c, k), fill_rect(f, n - 1, z - c, n + 1, z, k)) : (fill_rect(f, I, u - 1, I + c, u + 1, k), fill_rect(f, A - c, u - 1, A, u + 1, k)));
			t.door && (v ? stroke_rect(f, n - e, y + c + 1, n + e, z - c - 1, m) : stroke_rect(f, I + c + 1, u - e, A - c - 1, u + e, m));
			t.lock && (v ? draw_line(f, n, y + c + 1, n, z - c - 1, m) : draw_line(f, I + c + 1, u, A - c - 1, u, m));
			t.trap && (v ? draw_line(f, n - h, u, n + h, u, m) : draw_line(f, n, u - h, n, u + h, m));
			t.secret && (v ? (draw_line(f, n - 1, u - e, n + 2, u - e, m), draw_line(f, n -
				2, u - e + 1, n - 2, u - 1, m), draw_line(f, n - 1, u, n + 1, u, m), draw_line(f, n + 2, u + 1, n + 2, u + e - 1, m), draw_line(f, n - 2, u + e, n + 1, u + e, m)) : (draw_line(f, n - e, u - 2, n - e, u + 1, m), draw_line(f, n - e + 1, u + 2, n - 1, u + 2, m), draw_line(f, n, u - 1, n, u + 1, m), draw_line(f, n + 1, u - 2, n + e - 1, u - 2, m), draw_line(f, n + e, u - 1, n + e, u + 2, m)));
			if (t.portc)
				if (v)
					for (y = y + c + 2; y < z - c; y += 2) set_pixel(f, n, y, m);
				else
					for (y = I + c + 2; y < A - c; y += 2) set_pixel(f, y, u, m)
		});
		return !0
	}

	function wa(a, b, f) {
		a = a.stair;
		let d = Fa(b.cell_size),
			g = T(b.palette, "stair");
		a.forEach(c => {
			if (c.next_row != c.row) {
				var e =
					Math.floor((c.col + .5) * d.cell);
				var h = la(c.row, c.next_row, d),
					k = h.shift();
				e = {
					xc: e,
					y1: k,
					list: h
				}
			} else e = Math.floor((c.row + .5) * d.cell), h = la(c.col, c.next_col, d), k = h.shift(), e = {
				yc: e,
				x1: k,
				list: h
			};
			e.side = d.side;
			e.down = d.down;
			"up" == c.key ? Ga(e, g, f) : Ha(e, g, f)
		});
		return !0
	}

	function Fa(a) {
		a = {
			cell: a,
			len: 2 * a,
			side: Math.floor(a / 2),
			tread: Math.floor(a / 20) + 2,
			down: {}
		};
		let b;
		for (b = 0; b < a.len; b += a.tread) a.down[b] = Math.floor(b / a.len * a.side);
		return a
	}

	function la(a, b, f) {
		let d = [];
		if (b > a)
			for (a *= f.cell, d.push(a), b = (b + 1) * f.cell; a <
				b; a += f.tread) d.push(a);
		else if (b < a)
			for (a = (a + 1) * f.cell, d.push(a), b *= f.cell; a > b; a -= f.tread) d.push(a);
		return d
	}

	function Ga(a, b, f) {
		if (a.xc) {
			let d = a.xc - a.side,
				g = a.xc + a.side;
			a.list.forEach(c => {
				draw_line(f, d, c, g, c, b)
			})
		} else {
			let d = a.yc - a.side,
				g = a.yc + a.side;
			a.list.forEach(c => {
				draw_line(f, c, d, c, g, b)
			})
		}
		return !0
	}

	function Ha(a, b, f) {
		if (a.xc) {
			let d = a.xc;
			a.list.forEach(g => {
				let c = a.down[Math.abs(g - a.y1)];
				draw_line(f, d - c, g, d + c, g, b)
			})
		} else {
			let d = a.yc;
			a.list.forEach(g => {
				let c = a.down[Math.abs(g - a.x1)];
				draw_line(f, g, d -
					c, g, d + c, b)
			})
		}
		return !0
	}

	function Ia() {
		let a = $("dungeon_name").getValue();
		save_canvas($("map"), `${a}.png`)
	}
	let J = {
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
		ma = {
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
		P = {
			north: -1,
			south: 1,
			west: 0,
			east: 0
		},
		M = {
			north: 0,
			south: 0,
			west: -1,
			east: 1
		},
		Ca = $H(M).keys().sort(),
		Da = {
			north: "south",
			south: "north",
			west: "east",
			east: "west"
		};
	document.observe("dom:loaded", () => {
		Object.keys(J).forEach(a => {
			Object.keys(J[a]).forEach(b => {
				let f = J[a][b].title;
				var d = $(a),
					g = d.insert;
				b = (new Element("option", {
					value: b
				})).update(f);
				g.call(d, b)
			})
		});
		Object.keys(ma).forEach(a => {
			$(a).setValue(ma[a])
		});
		Q();
		$("dungeon_name").observe("change", Z);
		$("new_name").observe("click", Q);
		Object.keys(J).forEach(a => {
			$(a).observe("change", aa)
		});
		$("save_map").observe("click", Ia);
		$("print_map").observe("click", () => {
			window.print()
		})
	});
	let W = {};
	J.doors.none.table = {
		"01-15": 65536
	};
	J.doors.basic.table = {
		"01-15": 65536,
		"16-60": 131072
	};
	J.doors.secure.table = {
		"01-15": 65536,
		"16-60": 131072,
		"61-75": 262144
	};
	J.doors.standard.table = {
		"01-15": 65536,
		"16-60": 131072,
		"61-75": 262144,
		"76-90": 524288,
		"91-100": 1048576,
		"101-110": 2097152
	};
	J.doors.deathtrap.table = {
		"01-15": 65536,
		"16-30": 524288,
		"31-40": 1048576
	};
	let X = {
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
		pa = {
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
		V = {
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
		Ea = {
			door: "fill",
			label: "fill",
			stair: "wall",
			wall: "fill",
			fill: "black",
			tag: "white"
		}
});