/*

jQuery Cherry Pie Plugin
version 0.1

Copyright (c) 2011 Cameron Daigle, http://camerondaigle.com

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function($) {

  var opts;

  $.fn.cutiepie = function(options) {
    var defaults = {
      stroke: "#fff",
      pie: {
        stroke_width: 4
      },
      slice: {
        stroke_width: 2,
        color: "#e42929"
      }
    };
    return this.each(function() {
      var cutiepie = {};
      cutiepie.el = $(this);
      cutiepie.opts = $.extend(true, defaults, options);
      cutiepie.graph = initGraph.call(cutiepie);
      cutiepie.values = parseData.call(cutiepie);
      drawPie.call(cutiepie);
    });

  };

  function initGraph() {
    var cutiepie = this;
    var $el = cutiepie.el;
    $el.addClass('cutiepie');
    cutiepie.opts.w = $el.width();
    cutiepie.opts.h = $el.height();
    $el.children().hide();
    return Raphael($el.attr('id'), cutiepie.opts.w, cutiepie.opts.h);
  }

  function parseData() {
    var cutiepie = this,
        amounts = [],
        total = 0,
        val;
    var parsers = {
      'ul': function() {
        cutiepie.el.find('li').each(function() {
          val = parseInt($(this).text(), 10);
          amounts.push(val);
          total += val;
        });
      }
    };
    parsers.ol = parsers.ul;
    parsers[cutiepie.el[0].tagName.toLowerCase()]();
    return getValues(amounts, total);
  };

  function drawPie() {
    var cutiepie = this,
        opts = cutiepie.opts,
        x = opts.w / 2,
        y = opts.h / 2,
        r = (opts.w - opts.pie.stroke_width*2)/2,
        x1 = x + r,
        y1 = y,
        pi = Math.PI,
        colors = typeof opts.slice.color === "string" ? getSpectrum.call(cutiepie) : [opts.slice.color],
        long_arc = 0,
        rad = 0,
        x2, y2;
    cutiepie.graph.circle(x, y, r).attr({
      stroke: opts.stroke,
      "stroke-width": opts.pie.stroke_width
    });
    for (var i = 0, max = cutiepie.values.length; i < max; i++) {
      rad += cutiepie.values[i].rad;
      long_arc = cutiepie.values[i].rad > pi ? 1 : 0;
      x2 = x + Math.cos(rad) * r;
      y2 = y - Math.sin(rad) * r;
      fill_color = colors[i] ? colors[i] : colors[0];
      cutiepie.graph.path(["M", x, y, "L", x1, y1, "A", r, r, 0, long_arc, 0, x2, y2, "z"]).attr({
        fill: fill_color,
        stroke: opts.stroke,
        "stroke-width": opts.slice.stroke_width,
        "stroke-linejoin": "round"
      });
      x1 = x2;
      y1 = y2;
    }
  }

  function getValues(amounts, total) {
    var values = [],
        pi = Math.PI,
        rad;
    for (var i = 0, max = amounts.length; i < max; i++) {
      rad = amounts[i] / total * (2*pi);
      values.push({
        "value": amounts[i],
        "rad": rad
      });
    }
    return values;
  }

  function getSpectrum() {
    var cutiepie = this,
        color = hexToHsv(cutiepie.opts.slice.color),
        interval = 255 / cutiepie.values.length,
        spectrum = [cutiepie.opts.slice.color],
        hue = color[0];
    for (var i = 0, max = cutiepie.values.length; i < max; i++) {
      hue += interval;
      hue > 255 ? hue -= 255 : false;
      color[0] = hue;
      spectrum.push(hsvToHex(color));
    }
    return spectrum;
  }

  // adapted from http://matthaynes.net/blog/2008/08/07/javascript-colour-functions/

  function hsvToHex(hsv) {
      var h = hsv[0],
          s = hsv[1] / 100,
          v = hsv[2] / 100,
          hi = Math.floor((h/60) % 6),
          f = (h / 60) - hi,
          p = v * (1 - s),
          q = v * (1 - f * s),
          t = v * (1 - (1 - f) * s),
          rgb = [];
      switch (hi) {
          case 0: rgb = [v,t,p]; break;
          case 1: rgb = [q,v,p]; break;
          case 2: rgb = [p,v,t]; break;
          case 3: rgb = [p,q,v]; break;
          case 4: rgb = [t,p,v]; break;
          case 5: rgb = [v,p,q]; break;
      }
      var r = Math.round(rgb[0]*255).toString(16),
          g = Math.round(rgb[1]*255).toString(16),
          b = Math.round(rgb[2]*255).toString(16);
      r = r.length < 2 ? "0" + r : r;
      g = g.length < 2 ? "0" + g : g;
      b = b.length < 2 ? "0" + b : b;
      return "#" + r + g + b;
  }

  function hexToHsv(hex) {
      var r = parseInt(hex.substring(1, 3), 16) / 255,
          g = parseInt(hex.substring(3, 5), 16) / 255,
          b = parseInt(hex.substring(5, 7), 16) / 255;
      var min = Math.min(Math.min(r, g), b),
          max = Math.max(Math.max(r, g), b),
          delta = max - min;
      var value = max,
          saturation,
          hue;
      if (max == min) {
          hue = 0;
      } else if (max == r) {
          hue = (60 * ((g-b) / (max-min))) % 360;
      } else if (max == g) {
          hue = 60 * ((b-r) / (max-min)) + 120;
      } else if (max == b) {
          hue = 60 * ((r-g) / (max-min)) + 240;
      }
      if (hue < 0) {
          hue += 360;
      }
      if (max == 0) {
          saturation = 0;
      } else {
          saturation = 1 - (min/max);
      }
      return [Math.round(hue), Math.round(saturation * 100), Math.round(value * 100)];
  }


})(jQuery);