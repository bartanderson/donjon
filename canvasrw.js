// canvas.js
// written by drow <drow@bin.sh>
// http://creativecommons.org/licenses/by-nc/3.0/

'use strict';
((global, func) => func(global))(window, global => {
	// Function to convert RGB values to Hexadecimal color code
	function rgbToHex(red, green, blue) {
		let hexColor = "#" + [("00" + red.toString(16)).substr(-2), ("00" + green.toString(16)).substr(-2), ("00" + blue.toString(16)).substr(-2)].join("");
		colorMap[hexColor] = [red, green, blue, 255];
		return hexColor
	}

// Function to convert color code to RGB values
function colorToRgb(colorCode) {
	if (colorMap[colorCode]) return colorMap[colorCode]; {
		let match;
		var rgb = (match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(colorCode)) || (match = /^#([0-9a-f])([0-9a-f])([0-9a-f])/i.exec(colorCode)) ? [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16), 255] : (match = /^rgb\((\d+),(\d+),(\d+)\)/i.exec(colorCode)) ? [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3],
			10), 255] : false
	}
	return rgb ? colorMap[colorCode] = rgb : [0, 0, 0, 255]
}

	// Function to convert HSV values to RGB values
	function hsvToRgb(hsv) {
		let hue = hsv[0];
		var saturation = hsv[2] / 100;
		hsv = hsv[1] / 100 * saturation;
		let value = hsv * (1 - Math.abs(hue / 60 % 2 - 1));
		saturation -= hsv;
		let red = 0,
			green = 0,
			blue = 0;
		60 > hue ? (red = hsv, green = value) : 120 > hue ? (red = value, green = hsv) : 180 > hue ? (green = hsv, blue = value) : 240 > hue ? (green = value, blue = hsv) : 300 > hue ? (red = value, blue = hsv) : (red = hsv, blue = value);
		red = Math.min(Math.max(Math.floor(255 * (red + saturation)), 0), 255);
		green = Math.min(Math.max(Math.floor(255 * (green + saturation)), 0), 255);
		blue = Math.min(Math.max(Math.floor(255 * (blue + saturation)), 0), 255);
		return [red, green, blue]
	}

	// Function to set pixel color
	function setPixel(context, x, y, color) {
		cache ? pixelMap[color] ? pixelMap[color].push([x, y]) : pixelMap[color] = [
			[x, y]
		] : fillRect(context, x, y, x, y, color)
	}

	// Function to fill rectangle with color
	function fillRect(context, x1, y1, x2, y2, color) {
		context.fillStyle = color;
		context.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1)
	}
	let colorMap = {},
		cache = false,
		pixelMap = {};
	global.new_image = function(element, width, height) {
		element = $(element);
		element.width = width;
		element.height = height;
		element = element.getContext("2d", {willReadFrequently: true});
		fillRect(element, 0, 0, width, height, "#ffffff");
		return element
	};
	global.rgb2hex = rgbToHex;
	global.hsv2hex = function(hsv) {
		hsv = hsvToRgb(hsv);
		return rgbToHex(hsv[0], hsv[1], hsv[2])
	};
	global.color2rgb = colorToRgb;
	global.rgb2hsv = function(rgb) {
		var red = rgb[0] / 255,
			green = rgb[1] / 255;
		let blue = rgb[2] / 255;
		rgb = Math.max(red, green, blue);
		let value = rgb - Math.min(red, green, blue);
		red = (Math.floor(60 * (0 == value ? 0 : rgb == red ? (green - blue) / value % 6 : rgb == green ? (blue - red) / value + 2 : (red - green) / value + 4)) + 360) % 360;
		green = Math.min(Math.max(Math.floor(100 * (0 == rgb ? 0 : value / rgb)), 0), 100);
		rgb = Math.min(Math.max(Math.floor(100 *
			rgb), 0), 100);
		return [red, green, rgb]
	};
	global.hsv2rgb = hsvToRgb;
	global.set_pixel = setPixel;
	global.cache_pixels = function(value) {
		cache = value
	};
	global.draw_pixels = function(context) {
		let width = context.canvas.width,
			imageData = context.getImageData(0, 0, width, context.canvas.height);
		Object.keys(pixelMap).forEach(color => {
			let rgb = colorToRgb(color);
			pixelMap[color].forEach(pixel => {
				pixel = pixel[1] * width + pixel[0] << 2;
				let i;
				for (i = 0; 4 > i; i++) imageData.data[pixel + i] = rgb[i]
			})
		});
		context.putImageData(imageData, 0, 0);
		cache = false;
		pixelMap = {}
	};
	global.draw_line = function(context, x1, y1, x2, y2, color) {
		x2 == x1 && y2 == y1 ? setPixel(context, x1, y1, color) : (context.beginPath(), context.moveTo(x1 + .5, y1 + .5), context.lineTo(x2 + .5, y2 + .5), context.strokeStyle = color, context.stroke())
	};
	global.fill_rect = fillRect;
	global.stroke_rect = function(context, x1, y1, x2, y2, color) {
		context.strokeStyle = color;
		context.strokeRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1)
	};
	global.draw_string = function(context, text, x, y, font, color) {
		context.textBaseline = "middle";
		context.textAlign = "center";
		context.font = font;
		context.fillStyle = color;
		context.fillText(text, x, y)
	};
	global.draw_image = function(context, image, x, y) {
		context.drawImage(image, x, y)
	};
	global.save_canvas = function(canvas, filename) {
		canvas = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		let link = document.createElement("a");
		"string" == typeof link.download ? (link.href = canvas, link.download = filename, link.click()) : window.location.assign(canvas)
	}
});
