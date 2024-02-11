// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// generator.js
//
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';

function generate_text(a) {
	if (a = gen_data[a])
		if (a = select_from(a)) {
			let c = new_trace();
			return expand_tokens(a, c)
		} return ""
}

function select_from(a) {
	return a.constructor == Array ? select_from_array(a) : select_from_table(a)
}

function select_from_array(a) {
	return a[random(a.length)]
}

function select_from_table(a) {
	var c;
	if (c = scale_table(a)) {
		c = random(c) + 1;
		let b;
		for (b in a) {
			let d = key_range(b);
			if (c >= d[0] && c <= d[1]) return a[b]
		}
	}
	return ""
}

function scale_table(a) {
	let c = 0,
		b;
	for (b in a) a = key_range(b), a[1] > c && (c = a[1]);
	return c
}

function key_range(a) {
	let c;
	return (c = /(\d+)-00/.exec(a)) ? [parseInt(c[1], 10), 100] : (c = /(\d+)-(\d+)/.exec(a)) ? [parseInt(c[1], 10), parseInt(c[2], 10)] : "00" == a ? [100, 100] : [parseInt(a, 10), parseInt(a, 10)]
}

function new_trace() {
	return {
		exclude: {},
		"var": {}
	}
}

function local_trace(a) {
	let c = Object.clone(a);
	c["var"] = Object.clone(a["var"]);
	return c
}

function expand_tokens(a, c) {
	let b = /\${ ([^{}]+) }/;
	for (var d; d = b.exec(a);) {
		d = d[1];
		let e;
		a = (e = expand_token(d, c)) ? a.replace("${ " + d + " }", e) : a.replace("{" + d + "}", d)
	}
	return a
}

function expand_token(a, c) {
	var b;
	let d;
	return (b = /^\d*d\d+/.exec(a)) || (b = /^calc (.+)/.exec(a)) ? roll_dice_str(b[1]) : (b = /^(\d+) x (.+)/.exec(a)) ? expand_x(b[1], b[2], c) : (b = /^\[ (.+) \]/.exec(a)) ? (b = b[1].split(/,\s*/), expand_tokens(select_from_array(b), c)) : (d = gen_data[a]) ? expand_tokens(select_from(d), c) : (b = /^alt (.+) def (.+)/.exec(a)) ? (d = gen_data[b[1]]) ? expand_tokens(select_from(d), c) : (d = gen_data[b[2]]) ? expand_tokens(select_from(d), c) : b[2] : (b = /^unique (.+)/.exec(a)) ? expand_unique(b[1], c) : (b = /^local (.+)/.exec(a)) ?
		(c = local_trace(c), expand_token(b[1], c)) : (b = /^new (.+)/.exec(a)) ? (c = new_trace(), expand_token(b[1], c)) : (b = /^set (\w+) = (.+?) in (.+)/.exec(a)) ? (c["var"][b[1]] = b[2], expand_token(b[3], c)) : (b = /^set (\w+) = (.+)/.exec(a)) ? set_var(b[1], b[2], c) : (b = /^get (\w+) def (.+)/.exec(a)) ? c["var"][b[1]] || b[2] : (b = /^get (\w+) fix (.+)/.exec(a)) ? c["var"][b[1]] || set_var(b[1], b[2], c) : (b = /^get (\w+)/.exec(a)) ? c["var"][b[1]] : (b = /^shift (\w+) = (.+)/.exec(a)) ? (c["var"][b[1]] = b[2].split(/,\s*/), c["var"][b[1]].shift()) : (b = /^shift (\w+)/.exec(a)) ?
		c["var"][b[1]].shift() : (b = /^an (.+)/.exec(a)) ? aoran(expand_token(b[1], c)) : (b = /^An (.+)/.exec(a)) ? ucfirst(aoran(expand_token(b[1], c))) : (b = /^nt (.+)/.exec(a)) ? nothe(expand_token(b[1], c)) : (b = /^lc (.+)/.exec(a)) ? lc(expand_token(b[1], c)) : (b = /^lf (.+)/.exec(a)) ? inline_case(expand_token(b[1], c)) : (b = /^lt (.+)/.exec(a)) ? lthe(expand_token(b[1], c)) : (b = /^uc (.+)/.exec(a)) ? uc(expand_token(b[1], c)) : (b = /^uf (.+)/.exec(a)) ? ucfirst(expand_token(b[1], c)) : (b = /^sc (.+)/.exec(a)) ? ucfirst(lc(expand_token(b[1], c))) : (b =
			/^tc (.+)/.exec(a)) ? title_case(expand_token(b[1], c)) : (b = /^gen_name (.+)/.exec(a)) ? (b = b[1].replace(/,.*/, ""), generate_name(b)) : a
}

function expand_x(a, c, b) {
	let d = {},
		e = {},
		f = [],
		l = b.comma || ", ";
	for (; match = /^(and|literal|unique) (.+)/.exec(c);) d[match[1]] = !0, c = match[2];
	let k;
	for (k = 0; k < a; k++) {
		var g = new String(c);
		g = d.unique ? expand_unique(g, b) : expand_token(g, b);
		d.literal ? f.push(g) : (match = /^(\d+) x (.+)/.exec(g)) ? e[match[2]] += parseInt(match[1], 10) : e[g] += 1
	}
	$H(e).keys().sort().forEach(h => {
		1 < e[h] ? f.push([e[h], h].join(" x ")) : f.push(h)
	});
	return d.and ? (a = f.pop(), f.length ? [f.join(l), a].join(" and ") : a) : f.join(l)
}

function expand_unique(a, c) {
	let b;
	for (b = 0; 100 > b; b++) {
		let d = expand_token(a, c);
		if (!c.exclude[d]) return c.exclude[d] = !0, d
	}
	return ""
}

function set_var(a, c, b) {
	if ("npc_name" == a) {
		let d;
		(d = /^(.+?) .+/.exec(c)) ? b["var"].name = d[1]: b["var"].name = c
	}
	return b["var"][a] = c
}

function aoran(a) {
	return /^the /i.test(a) ? a : /^(nunchaku)/i.test(a) ? a : /^(unicorn|unique|university)/i.test(a) ? `a ${a}` : /^(hour)/i.test(a) ? `an ${a}` : /^[BCDGJKPQTUVWYZ][A-Z0-9]+/.test(a) ? `a ${a}` : /^[AEFHILMNORSX][A-Z0-9]+/.test(a) ? `an ${a}` : /^[aeiou]/i.test(a) ? `an ${a}` : `a ${a}`
}

function nothe(a) {
	let c;
	return (c = /^the (.+)/i.exec(a)) ? c[1] : a
}

function lc(a) {
	return a.toLowerCase()
}

function lcfirst(a) {
	let c;
	return (c = /^([a-z])(.*)/i.exec(a)) ? lc(c[1]) + c[2] : a
}

function inline_case(a) {
	return /^[A-Z][A-Z]/.test(a) ? a : lcfirst(a)
}

function lthe(a) {
	let c;
	return (c = /^the (.+)/i.exec(a)) ? `the ${c[1]}` : a
}

function uc(a) {
	return a.toUpperCase()
}

function ucfirst(a) {
	let c;
	return (c = /^([a-z])(.*)/i.exec(a)) ? uc(c[1]) + c[2] : a
}

function title_case(a) {
	return a.split(/\s+/).map(uc).join(" ")
};