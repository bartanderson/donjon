// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// name.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';
let chain_cache = {};

function generate_name(b) {
	let a;
	return (a = markov_chain(b)) ? markov_name(a) : ""
}

function markov_chain(b) {
	var a;
	if (a = chain_cache[b]) return a;
	if (a = name_set[b])
		if (a = construct_chain(a)) return chain_cache[b] = a;
	return !1
}

function construct_chain(b) {
	let a = {},
		c;
	for (c = 0; c < b.length; c++) {
		let g = b[c].split(/\s+/);
		a = incr_chain(a, "parts", g.length);
		let f;
		for (f = 0; f < g.length; f++) {
			var d = g[f];
			a = incr_chain(a, "name_len", d.length);
			var e = d.substr(0, 1);
			a = incr_chain(a, "initial", e);
			for (d = d.substr(1); 0 < d.length;) {
				let h = d.substr(0, 1);
				a = incr_chain(a, e, h);
				d = d.substr(1);
				e = h
			}
		}
	}
	return scale_chain(a)
}

function incr_chain(b, a, c) {
	b[a] ? b[a][c] ? b[a][c]++ : b[a][c] = 1 : (b[a] = {}, b[a][c] = 1);
	return b
}

function scale_chain(b) {
	let a = {};
	Object.keys(b).forEach(c => {
		a[c] = 0;
		Object.keys(b[c]).forEach(d => {
			let e = Math.floor(Math.pow(b[c][d], 1.3));
			b[c][d] = e;
			a[c] += e
		})
	});
	b.table_len = a;
	return b
}

function markov_name(b) {
	let a = select_link(b, "parts"),
		c = [],
		d;
	for (d = 0; d < a; d++) {
		let g = select_link(b, "name_len");
		var e = select_link(b, "initial");
		let f = e;
		for (; f.length < g;) e = select_link(b, e), f += e;
		c.push(f)
	}
	return c.join(" ")
}

function select_link(b, a) {
	let c = random(b.table_len[a]),
		d = 0;
	return Object.keys(b[a]).filter(e => {
		d += b[a][e];
		return c < d
	})[0]
};