(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SEQMath = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function carries(a, b) {
    var n = 0;
    var carry = 0;
    for (var i = 0; i < 4; i++) {
      var sum = (a % 10) + (b % 10) + carry;
      if (sum >= 10) n += 1;
      carry = sum >= 10 ? 1 : 0;
      a = Math.floor(a / 10);
      b = Math.floor(b / 10);
    }
    return n;
  }

  function borrows(a, b) {
    var n = 0;
    var borrow = 0;
    for (var i = 0; i < 4; i++) {
      var digit = (a % 10) - borrow - (b % 10);
      if (digit < 0) {
        n += 1;
        borrow = 1;
      } else {
        borrow = 0;
      }
      a = Math.floor(a / 10);
      b = Math.floor(b / 10);
    }
    return n;
  }

  function factorPair(hard) {
    var i;
    if (!hard) {
      for (i = 0; i < 40; i++) {
        var small = randInt(12, 24);
        var other = randInt(12, 39);
        if (small % 10 === 0 || other % 10 === 0) continue;
        return Math.random() < 0.5 ? [small, other] : [other, small];
      }
      return [16, 23];
    }
    for (i = 0; i < 40; i++) {
      var a = randInt(26, 74);
      var b = randInt(26, 74);
      if (a % 10 === 0 || b % 10 === 0) continue;
      if (Math.max(a, b) < 46) continue;
      if (a >= 65 && b >= 65) continue;
      return [a, b];
    }
    return [36, 48];
  }

  function q(id, name, rule, left, op, right, answer) {
    return {
      kind: "math",
      familyId: id,
      family: name,
      group: "Arithmetic",
      rule: rule,
      left: String(left),
      op: op,
      right: String(right),
      answer: String(answer),
    };
  }

  function genAdd(hard) {
    var i;
    var a;
    var b;
    if (!hard) {
      for (i = 0; i < 40; i++) {
        a = randInt(1100, 5499);
        b = randInt(1100, 5499);
        if (a % 1000 === 0 && b % 1000 === 0) continue;
        return q("add", "Addition", "Four-digit addition.", a, "+", b, a + b);
      }
      return q("add", "Addition", "Four-digit addition.", 2341, "+", 1526, 3867);
    }
    for (i = 0; i < 40; i++) {
      a = randInt(4000, 9999);
      b = randInt(4000, 9999);
      if (Math.max(a, b) < 7000) continue;
      if (a % 10 === 0 || b % 10 === 0) continue;
      if (carries(a, b) < 2) continue;
      return q("add", "Addition", "Four-digit addition.", a, "+", b, a + b);
    }
    return q("add", "Addition", "Four-digit addition.", 7468, "+", 3597, 11065);
  }

  function genSub(hard) {
    var i;
    var a;
    var b;
    var diff;
    if (!hard) {
      for (i = 0; i < 80; i++) {
        a = randInt(1400, 6499);
        b = randInt(1000, a - 40);
        if (borrows(a, b) > 1) continue;
        return q("sub", "Subtraction", "Four-digit subtraction.", a, "\u2212", b, a - b);
      }
      return q("sub", "Subtraction", "Four-digit subtraction.", 4821, "\u2212", 2310, 2511);
    }
    for (i = 0; i < 80; i++) {
      a = randInt(5000, 9999);
      b = randInt(1200, a - 180);
      if (b < 1000) continue;
      diff = a - b;
      if (borrows(a, b) < 2) continue;
      return q("sub", "Subtraction", "Four-digit subtraction.", a, "\u2212", b, diff);
    }
    return q("sub", "Subtraction", "Four-digit subtraction.", 7351, "\u2212", 2684, 4667);
  }

  function genMul(hard) {
    var pair = factorPair(hard);
    return q("mul", "Multiplication", "Two-digit multiplication.", pair[0], "\u00d7", pair[1], pair[0] * pair[1]);
  }

  function genDiv(hard) {
    var pair = factorPair(hard);
    var divisor = pair[0];
    var quotient = pair[1];
    return q(
      "div",
      "Division",
      "Exact two-digit division.",
      divisor * quotient,
      "\u00f7",
      divisor,
      quotient
    );
  }

  function mix(total) {
    var mul = Math.round(total * 0.24);
    var div = Math.round(total * 0.16);
    var add = Math.round(total * 0.30);
    var sub = total - add - mul - div;
    return { add: add, sub: sub, mul: mul, div: div };
  }

  var GENS = { add: genAdd, sub: genSub, mul: genMul, div: genDiv };

  function generateSet(total) {
    var n = total || 50;
    var counts = mix(n);
    var items = [];
    Object.keys(counts).forEach(function (key) {
      var hardN = Math.round(counts[key] * 0.4);
      for (var i = 0; i < counts[key]; i++) items.push(GENS[key](i < hardN));
    });
    return shuffle(items);
  }

  return {
    generateSet: generateSet,
    mix: mix,
  };
});
