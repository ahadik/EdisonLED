var mraa;
var hex_rgb = require('hex-rgb-converter');
var minimist = require('minimist');
var prompt = require('prompt');

var express = require("express");
var app     = express();
var path    = require("path");

app.use(express.static(__dirname + '/dist/assets'));
app.use(express.static(__dirname + '/dist/css'));
app.use(express.static(__dirname + '/dist/scripts'));

var args = minimist(process.argv.slice(2), {
  string: 'lang',           // --lang xml
  boolean: ['version'],     // --version
  alias: { v: 'version', h: 'help' }
});

if (args.help) {
  console.log('Usage: color_set [color_value, --hex]');
  console.log('    color_value: Provide an initial color value if desired in either Hex ("abc123") or RGB ("100,200,250")');
  console.log('    --hex:       Set if the provided `color_value` is in Hex form.');
  console.log('    --pwm:       When set to True, PWM will be used to set LEDs on the pins set in the script. When False, pins will not be set. Leave as False when testing.');
  process.exit();
}

var redPin = 6;
var greenPin = 5;
var bluePin = 3;

var red;
var green;
var blue;

var pins = [red, green, blue];
var pinNums = [redPin, greenPin, bluePin];

const pwmPinMock = {
  write: function(value) {
    this.value = value;
  },
  read: function(value) {
    return this.value;
  }
};

if (args.pwm) {
  mraa = require('mraa');
}

pinNums.map(function(pinNum, index) {
  if (args.pwm) {
    pins[index] = new mraa.Pwm(pinNum);
    pins[index].enable(true);
  } else {
    pins[index] = Object.assign({}, pwmPinMock);
  }

  pins[index].write(0);
});

function parseColorString(color) {

  var colorArray = color.split(/[ ,]+/);

  if (colorArray.length === 1) {
    if (color[0] === '#') {
      color = color.slice(1);
    }
    return hex_rgb.toRGB(color);
  }

  return colorArray;
}

function setColor(rVal, gVal, bVal) {
  console.log('RGB Values');
  console.log('Red:   '+rVal);
  console.log('Green: '+gVal);
  console.log('Blue:  '+bVal);

  [rVal, gVal, bVal].map(function(value, index) {
    if (value > 255) {
      value = 255;
    } else if (value < 0) {
      value = 0;
    }

    pins[index].write(value/255);
  });
}

function readInput() {
  prompt.get(['color'], function(err, result) {

    var parsedColor = parseColorString(result.color);
    setColor(parsedColor[0], parsedColor[1], parsedColor[2]);
    readInput();
  });
}

if (args._.length) {
  if (args.hex && args._[0][0] === '#') {
    args._[0] = args._[0].slice(1);
  }
  var rgbValues = args.hex ? hex_rgb.toRGB(args._[0]) : args._.slice(0,3);

  setColor(rgbValues[0], rgbValues[1], rgbValues[2]);
}

app.get('/',function(req,res){
  var colorQuery = req.query.color;
  if (colorQuery) {
    var parsedColor = parseColorString(req.query.color);
    setColor(parsedColor[0], parsedColor[1], parsedColor[2]);
  }

  res.sendFile(path.join(__dirname+'/dist/index.html'));
});

app.listen(1500);
console.log("Running at Port 1500");

prompt.start();

readInput();

