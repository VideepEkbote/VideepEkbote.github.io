(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SEQSeq = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var Bank = (function () {
    if (typeof require === "function") {
      try { return require("./bank.js"); } catch (err) { return null; }
    }
    return null;
  })();
  if (!Bank && typeof SEQBank !== "undefined") Bank = SEQBank;

  var ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var CONS = "BCDFGHJKLMNPQRSTVWXYZ".split("");
  var CATALOG = [];
  var GENERATORS = {};
  var CATALAN = [1, 2, 5, 14, 42, 132, 429, 1430];

  function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
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

  function L(n) {
    if (!Number.isInteger(n) || n < 1 || n > 26) throw new Error("letter " + n);
    return ALPHA[n - 1];
  }

  function roman(n) {
    if (!Number.isInteger(n) || n < 1 || n > 89) throw new Error("roman " + n);
    var pairs = [[50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    var s = "";
    var x = n;
    for (var i = 0; i < pairs.length; i++) {
      while (x >= pairs[i][0]) {
        s += pairs[i][1];
        x -= pairs[i][0];
      }
    }
    return s;
  }

  function lookSay(s) {
    var out = "";
    for (var i = 0; i < s.length; ) {
      var j = i;
      while (j < s.length && s[j] === s[i]) j++;
      out += String(j - i) + s[i];
      i = j;
    }
    return out;
  }

  function sieve(limit) {
    var mark = [];
    var primes = [];
    for (var n = 2; n <= limit; n++) {
      if (mark[n]) continue;
      primes.push(n);
      for (var m = n * n; m <= limit; m += n) mark[m] = true;
    }
    return primes;
  }

  var PRIMES = sieve(400);

  function digitSum(n) {
    return String(n).split("").reduce(function (s, c) { return s + Number(c); }, 0);
  }

  function digitProduct(n) {
    var p = 1;
    var s = String(n);
    for (var i = 0; i < s.length; i++) {
      if (s[i] === "0") return 0;
      p *= Number(s[i]);
    }
    return p;
  }

  function hasZero(n) {
    return String(n).indexOf("0") !== -1;
  }

  function revNum(n) {
    return Number(String(n).split("").reverse().join(""));
  }

  function buildReverse() {
    var found = [];
    for (var s = 12; s <= 89; s++) {
      if (hasZero(s)) continue;
      var text = String(s);
      if (text[0] === text[1]) continue;
      var x = s;
      var terms = [x];
      var ok = true;
      for (var i = 0; i < 6; i++) {
        x = x + revNum(x);
        if (x > 20000 || hasZero(x)) { ok = false; break; }
        terms.push(x);
      }
      if (ok && terms.length === 7) found.push(terms);
    }
    return found;
  }

  function buildDigitProduct() {
    var found = [];
    for (var s = 12; s <= 96; s++) {
      if (hasZero(s)) continue;
      var x = s;
      var terms = [x];
      var ok = true;
      for (var i = 0; i < 6; i++) {
        x = x + digitProduct(x);
        if (x > 8000 || hasZero(x)) { ok = false; break; }
        terms.push(x);
      }
      if (ok && terms.length === 7) found.push(terms);
    }
    return found;
  }

  function buildSumProduct() {
    var found = [];
    for (var s = 12; s <= 89; s++) {
      if (hasZero(s)) continue;
      var x = s;
      var terms = [x];
      var ok = true;
      for (var i = 0; i < 6; i++) {
        x = x + digitSum(x) + digitProduct(x);
        if (x > 30000 || hasZero(x)) { ok = false; break; }
        terms.push(x);
      }
      if (ok && terms.length === 7) found.push(terms);
    }
    return found;
  }

  var REVERSE_SEQS = buildReverse();
  var PRODUCT_SEQS = buildDigitProduct();
  var SUMPROD_SEQS = buildSumProduct();

  function toBase3(n) {
    var s = "";
    var x = n;
    while (x > 0) {
      s = String(x % 3) + s;
      x = Math.floor(x / 3);
    }
    return s || "0";
  }

  function present(allTerms) {
    var terms = allTerms.map(String);
    var unique = new Set(terms).size === terms.length;
    var gap = unique && terms.length >= 6 && Math.random() < 0.62;
    if (!gap) {
      return {
        tokens: terms.slice(0, -1).concat(["?"]),
        answer: terms[terms.length - 1],
      };
    }
    var lo = Math.max(2, terms.length - 4);
    var hi = terms.length - 2;
    var idx = randInt(lo, hi);
    var tokens = terms.slice();
    var answer = tokens[idx];
    tokens[idx] = "?";
    return { tokens: tokens, answer: answer };
  }

  function from(meta, producer) {
    var last = null;
    for (var i = 0; i < 50; i++) {
      try {
        var made = producer();
        var strings = made.terms.map(function (t) {
          if (typeof t === "number") {
            if (!Number.isInteger(t)) throw new Error("float");
            return String(t);
          }
          return String(t);
        });
        if (strings.length < 6 || strings.length > 9) throw new Error("length");
        if (strings.some(function (s) {
          return !s || s === "NaN" || s === "undefined" || s === "Infinity" || s.indexOf("?") !== -1;
        })) throw new Error("token");
        if (strings.some(function (s) { return s.length > 12; })) throw new Error("wide");
        var shown = present(strings);
        if (shown.answer.length > 12) throw new Error("answer");
        if (shown.tokens.filter(function (t) { return t === "?"; }).length !== 1) throw new Error("gap");
        return {
          kind: "seq",
          familyId: meta.id,
          family: meta.name,
          group: meta.group,
          rule: made.rule,
          tokens: shown.tokens,
          answer: shown.answer,
        };
      } catch (err) {
        last = err;
      }
    }
    throw new Error("failed " + meta.id + (last ? " (" + last.message + ")" : ""));
  }

  function register(meta, producer) {
    CATALOG.push(meta);
    GENERATORS[meta.id] = function () { return from(meta, producer); };
  }

  function series(start, step, n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(start + i * step);
    return out;
  }

  function weave(a, b) {
    var out = [];
    var n = Math.max(a.length, b.length);
    for (var i = 0; i < n; i++) {
      if (i < a.length) out.push(a[i]);
      if (i < b.length) out.push(b[i]);
    }
    return out;
  }

  register({ id: "ap", name: "Arithmetic run", group: "Number" }, function () {
    var mag = randInt(13, 42);
    if (mag % 10 === 0) mag += 3;
    var dir = Math.random() < 0.22 ? -1 : 1;
    var start = dir > 0 ? randInt(24, 360) : randInt(mag * 6 + 30, mag * 6 + 280);
    var diff = mag * dir;
    var terms = series(start, diff, 7);
    if (terms.some(function (n) { return n <= 0 || n > 4000; })) throw new Error("range");
    var way = diff > 0 ? "increases" : "decreases";
    return { rule: "Each term " + way + " by " + mag + ".", terms: terms };
  });

  register({ id: "gp", name: "Geometric run", group: "Number" }, function () {
    var ratio = pick([3, 3, 4, 5]);
    var steps = ratio === 3 ? 6 : 5;
    var x = ratio === 3 ? randInt(4, 9) : ratio === 4 ? randInt(3, 6) : pick([2, 3]);
    var terms = [x];
    for (var i = 0; i < steps; i++) {
      x *= ratio;
      if (x > 20000) throw new Error("range");
      terms.push(x);
    }
    return { rule: "Each term is multiplied by " + ratio + ".", terms: terms };
  });

  register({ id: "quadratic", name: "Second differences", group: "Number" }, function () {
    var second = pick([6, 8, 10, 12]);
    var diff = randInt(7, 22);
    var x = randInt(18, 80);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x += diff;
      terms.push(x);
      diff += second;
    }
    return { rule: "The gaps grow by " + second + " each time.", terms: terms };
  });

  register({ id: "fib", name: "Two-term sum", group: "Number" }, function () {
    var a = randInt(8, 24);
    var b = randInt(a + 6, a + 22);
    var terms = [a, b];
    while (terms.length < 7) {
      var next = terms[terms.length - 1] + terms[terms.length - 2];
      if (next > 8000) throw new Error("range");
      terms.push(next);
    }
    return { rule: "Each term is the sum of the two before it.", terms: terms };
  });

  register({ id: "trib", name: "Three-term sum", group: "Number" }, function () {
    var a = randInt(4, 12);
    var b = randInt(5, 14);
    var c = randInt(6, 16);
    var terms = [a, b, c];
    while (terms.length < 7) {
      var next = terms[terms.length - 1] + terms[terms.length - 2] + terms[terms.length - 3];
      if (next > 6000) throw new Error("range");
      terms.push(next);
    }
    return { rule: "Each term is the sum of the three before it.", terms: terms };
  });

  register({ id: "weave-ap", name: "Woven arithmetic", group: "Number" }, function () {
    var d1 = randInt(7, 15);
    var d2 = randInt(d1 + 2, d1 + 9);
    var a0 = randInt(24, 90);
    var b0 = randInt(18, 80);
    var terms = weave(series(a0, d1, 4), series(b0, d2, 4));
    return {
      rule: "Two arithmetic threads are woven. Odd positions rise by " + d1 + ", even positions by " + d2 + ".",
      terms: terms,
    };
  });

  register({ id: "weave-sq-cu", name: "Squares and cubes", group: "Number" }, function () {
    var s0 = randInt(6, 11);
    var c0 = randInt(3, 6);
    var squares = [];
    var cubes = [];
    for (var i = 0; i < 4; i++) {
      squares.push((s0 + i) * (s0 + i));
      cubes.push((c0 + i) * (c0 + i) * (c0 + i));
    }
    return {
      rule: "Odd positions are consecutive squares. Even positions are consecutive cubes.",
      terms: weave(squares, cubes),
    };
  });

  register({ id: "weave-prime-sq", name: "Primes and squares", group: "Number" }, function () {
    var p0 = randInt(6, 14);
    var s0 = randInt(8, 14);
    var primes = [];
    var squares = [];
    for (var i = 0; i < 4; i++) {
      primes.push(PRIMES[p0 + i]);
      squares.push((s0 + i) * (s0 + i));
    }
    return {
      rule: "Odd positions are consecutive primes. Even positions are consecutive squares.",
      terms: weave(primes, squares),
    };
  });

  register({ id: "weave-ap-gp", name: "Arithmetic and geometric", group: "Number" }, function () {
    var diff = randInt(9, 22);
    var ratio = pick([2, 3, 4]);
    var a0 = randInt(16, 60);
    var b = ratio === 4 ? randInt(2, 4) : randInt(3, 8);
    var arith = series(a0, diff, 4);
    var geo = [];
    for (var i = 0; i < 4; i++) {
      geo.push(b);
      b *= ratio;
      if (b > 4000) throw new Error("range");
    }
    return {
      rule: "Odd positions rise by " + diff + ". Even positions are multiplied by " + ratio + ".",
      terms: weave(arith, geo),
    };
  });

  register({ id: "mul-add", name: "Scale and shift", group: "Number" }, function () {
    var k = pick([2, 3, 4, 5]);
    var m = pick([3, 5, 7, 9, 11, -3, -5]);
    var x = randInt(4, 16);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x = x * k + m;
      if (x <= 0 || x > 14000) throw new Error("range");
      terms.push(x);
    }
    var shift = m < 0 ? "minus " + (-m) : "plus " + m;
    return { rule: "Each term is the previous one times " + k + ", " + shift + ".", terms: terms };
  });

  register({ id: "add-squares", name: "Square gaps", group: "Number" }, function () {
    var root = randInt(3, 6);
    var x = randInt(12, 60);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x += (root + i) * (root + i);
      terms.push(x);
    }
    return { rule: "The gaps are consecutive squares, starting at " + (root * root) + ".", terms: terms };
  });

  register({ id: "add-odds", name: "Odd gaps", group: "Number" }, function () {
    var odd = pick([11, 13, 15, 17, 19]);
    var x = randInt(20, 80);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x += odd + i * 2;
      terms.push(x);
    }
    return { rule: "The gaps are consecutive odd numbers, starting at " + odd + ".", terms: terms };
  });

  register({ id: "add-primes", name: "Prime gaps", group: "Number" }, function () {
    var p0 = randInt(5, 14);
    var x = randInt(24, 90);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x += PRIMES[p0 + i];
      terms.push(x);
    }
    return { rule: "The gaps are consecutive primes, starting at " + PRIMES[p0] + ".", terms: terms };
  });

  register({ id: "rising-product", name: "Rising factors", group: "Number" }, function () {
    var factor = pick([3, 4, 5]);
    var x = factor >= 5 ? randInt(2, 3) : randInt(2, 6);
    var terms = [x];
    for (var m = factor; terms.length < 6; m++) {
      x *= m;
      if (x > 20000) throw new Error("range");
      terms.push(x);
    }
    return { rule: "Multiply by " + factor + ", then " + (factor + 1) + ", then " + (factor + 2) + ", and so on.", terms: terms };
  });

  register({ id: "alt-mul", name: "Alternating factors", group: "Number" }, function () {
    var a = pick([2, 3, 4, 5]);
    var b = pick([2, 3, 4, 5, 6].filter(function (n) { return n !== a; }));
    var x = (a >= 5 || b >= 5) ? randInt(2, 4) : randInt(3, 9);
    var terms = [x];
    var factors = [a, b, a, b, a, b];
    for (var i = 0; i < factors.length; i++) {
      x *= factors[i];
      if (x > 20000) throw new Error("range");
      terms.push(x);
    }
    return { rule: "Multiply by " + a + " and by " + b + ", alternating.", terms: terms };
  });

  register({ id: "alt-add-mul", name: "Add, then scale", group: "Number" }, function () {
    var add = randInt(7, 18);
    var mul = pick([2, 3, 4]);
    var x = mul >= 4 ? randInt(3, 8) : randInt(6, 20);
    var terms = [x];
    var ops = ["add", "mul", "add", "mul", "add", "mul"];
    for (var i = 0; i < ops.length; i++) {
      x = ops[i] === "add" ? x + add : x * mul;
      if (x > 12000) throw new Error("range");
      terms.push(x);
    }
    return { rule: "Add " + add + ", then multiply by " + mul + ", and repeat.", terms: terms };
  });

  register({ id: "two-delta", name: "Two-step gaps", group: "Number" }, function () {
    var d1 = randInt(9, 24);
    var d2 = randInt(4, 16);
    if (Math.abs(d1 - d2) < 4) d2 += 6;
    var x = randInt(24, 90);
    var terms = [x];
    var diffs = [d1, d2, d1, d2, d1, d2];
    for (var i = 0; i < diffs.length; i++) {
      x += diffs[i];
      terms.push(x);
    }
    return { rule: "The gaps alternate between " + d1 + " and " + d2 + ".", terms: terms };
  });

  register({ id: "three-delta", name: "Three-step gaps", group: "Number" }, function () {
    var ds = [randInt(6, 18), randInt(8, 22), randInt(5, 16)];
    if (ds[0] === ds[1] || ds[1] === ds[2] || ds[0] === ds[2]) ds[2] += 5;
    var x = randInt(20, 70);
    var terms = [x];
    var diffs = [ds[0], ds[1], ds[2], ds[0], ds[1], ds[2], ds[0]];
    for (var i = 0; i < diffs.length; i++) {
      x += diffs[i];
      terms.push(x);
    }
    return { rule: "The gaps cycle through " + ds[0] + ", " + ds[1] + ", and " + ds[2] + ".", terms: terms };
  });

  register({ id: "squares", name: "Consecutive squares", group: "Number" }, function () {
    var n = randInt(11, 20);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push((n + i) * (n + i));
    return { rule: "Consecutive squares, starting at " + n + "\u00b2.", terms: terms };
  });

  register({ id: "cubes", name: "Consecutive cubes", group: "Number" }, function () {
    var n = randInt(5, 8);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var r = n + i;
      terms.push(r * r * r);
    }
    return { rule: "Consecutive cubes, starting at " + n + "\u00b3.", terms: terms };
  });

  register({ id: "triangular", name: "Triangular numbers", group: "Number" }, function () {
    var n = randInt(9, 16);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i;
      terms.push((k * (k + 1)) / 2);
    }
    return { rule: "Triangular numbers: n(n + 1) / 2, starting at n = " + n + ".", terms: terms };
  });

  register({ id: "pentagonal", name: "Pentagonal numbers", group: "Number" }, function () {
    var n = randInt(6, 12);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i;
      terms.push((k * (3 * k - 1)) / 2);
    }
    return { rule: "Pentagonal numbers: n(3n \u2212 1) / 2, starting at n = " + n + ".", terms: terms };
  });

  register({ id: "hexagonal", name: "Hexagonal numbers", group: "Number" }, function () {
    var n = randInt(6, 12);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i;
      terms.push(k * (2 * k - 1));
    }
    return { rule: "Hexagonal numbers: n(2n \u2212 1), starting at n = " + n + ".", terms: terms };
  });

  register({ id: "factorial", name: "Factorials", group: "Number" }, function () {
    var windows = [
      [2, 6, 24, 120, 720, 5040],
      [6, 24, 120, 720, 5040, 40320],
      [24, 120, 720, 5040, 40320, 362880],
    ];
    var terms = pick(windows).slice();
    var firstMul = terms[1] / terms[0];
    return {
      rule: "Factorials. Multiply by " + firstMul + ", then " + (firstMul + 1) + ", then " + (firstMul + 2) + ", and so on.",
      terms: terms,
    };
  });

  register({ id: "powers2", name: "Powers of two", group: "Number" }, function () {
    var e = randInt(8, 12);
    var terms = [];
    for (var i = 0; i < 6; i++) terms.push(Math.pow(2, e + i));
    return { rule: "Consecutive powers of two, starting at 2^" + e + ".", terms: terms };
  });

  register({ id: "powers3", name: "Powers of three", group: "Number" }, function () {
    var e = randInt(2, 3);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var value = Math.pow(3, e + i);
      if (value > 7000) throw new Error("range");
      terms.push(value);
    }
    return { rule: "Consecutive powers of three, starting at 3^" + e + ".", terms: terms };
  });

  register({ id: "mersenne", name: "One less than a power of two", group: "Number" }, function () {
    var e = randInt(6, 9);
    var terms = [];
    for (var i = 0; i < 6; i++) terms.push(Math.pow(2, e + i) - 1);
    return { rule: "One less than consecutive powers of two, starting at 2^" + e + " \u2212 1.", terms: terms };
  });

  register({ id: "n2-plus-n", name: "n squared plus n", group: "Number" }, function () {
    var n = randInt(8, 18);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i;
      terms.push(k * k + k);
    }
    return { rule: "Each term is n\u00b2 + n for consecutive n, starting at n = " + n + ".", terms: terms };
  });

  register({ id: "n3-plus-n", name: "n cubed plus n", group: "Number" }, function () {
    var n = randInt(4, 8);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i;
      terms.push(k * k * k + k);
    }
    return { rule: "Each term is n\u00b3 + n for consecutive n, starting at n = " + n + ".", terms: terms };
  });

  register({ id: "primes", name: "Prime numbers", group: "Number" }, function () {
    var start = randInt(12, 36);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push(PRIMES[start + i]);
    return { rule: "Consecutive prime numbers, starting at " + PRIMES[start] + ".", terms: terms };
  });

  register({ id: "prime-squares", name: "Squares of primes", group: "Number" }, function () {
    var start = randInt(4, 8);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var p = PRIMES[start + i];
      terms.push(p * p);
    }
    return { rule: "Squares of consecutive primes, starting at " + PRIMES[start] + "\u00b2.", terms: terms };
  });

  register({ id: "odd-squares", name: "Squares of odd numbers", group: "Number" }, function () {
    var n = pick([9, 11, 13, 15, 17]);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i * 2;
      terms.push(k * k);
    }
    return { rule: "Squares of consecutive odd numbers, starting at " + n + "\u00b2.", terms: terms };
  });

  register({ id: "recurrence", name: "Double-step recurrence", group: "Number" }, function () {
    var a = randInt(5, 14);
    var b = randInt(4, 12);
    var terms = [a, b];
    while (terms.length < 7) {
      var next = 2 * terms[terms.length - 1] + terms[terms.length - 2];
      if (next > 9000) throw new Error("range");
      terms.push(next);
    }
    return { rule: "Each term is twice the previous term, plus the term before that.", terms: terms };
  });

  register({ id: "reverse-add", name: "Add the reverse", group: "Number" }, function () {
    if (!REVERSE_SEQS.length) throw new Error("seeds");
    return {
      rule: "Each term is the previous number plus its digit reversal.",
      terms: pick(REVERSE_SEQS).slice(),
    };
  });

  register({ id: "pair-swap", name: "Digit swaps", group: "Number" }, function () {
    function fresh() {
      for (var t = 0; t < 20; t++) {
        var n = randInt(36, 89);
        var s = String(n);
        if (s.indexOf("0") === -1 && s[0] !== s[1]) return n;
      }
      throw new Error("pair");
    }
    var used = {};
    var terms = [];
    for (var i = 0; i < 3; i++) {
      var n = fresh();
      var guard = 0;
      while (used[n] && guard < 15) {
        n = fresh();
        guard++;
      }
      used[n] = true;
      var s = String(n);
      terms.push(n);
      terms.push(Number(s[1] + s[0]));
    }
    return { rule: "Numbers come in pairs. The second number is the first with its digits swapped.", terms: terms };
  });

  register({ id: "look-say", name: "Look-and-say", group: "Number" }, function () {
    var seed = pick(["2", "3", "13"]);
    var terms = [seed];
    for (var i = 0; i < 5; i++) terms.push(lookSay(terms[terms.length - 1]));
    if (terms.some(function (t) { return t.length > 12; })) throw new Error("wide");
    return { rule: "Read each run of digits aloud: how many, then which digit.", terms: terms };
  });

  register({ id: "binary", name: "Binary count", group: "Number" }, function () {
    var n = randInt(20, 48);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push((n + i).toString(2));
    return { rule: "The counting numbers, written in binary, starting at " + n.toString(2) + ".", terms: terms };
  });

  register({ id: "catalan", name: "Catalan numbers", group: "Number" }, function () {
    var start = pick([1, 2]);
    var terms = CATALAN.slice(start, start + 6);
    return { rule: "Consecutive Catalan numbers.", terms: terms };
  });

  register({ id: "square-minus", name: "One below a square", group: "Number" }, function () {
    var n = randInt(11, 20);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var k = n + i;
      terms.push(k * k - 1);
    }
    return { rule: "One less than consecutive squares, starting at " + n + "\u00b2 \u2212 1.", terms: terms };
  });

  register({ id: "double-grow", name: "Double and grow", group: "Number" }, function () {
    var x = randInt(6, 18);
    var add = randInt(3, 8);
    var startAdd = add;
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x = x * 2 + add;
      if (x > 8000) throw new Error("range");
      terms.push(x);
      add += 1;
    }
    return { rule: "Double the term and add " + startAdd + ", then " + (startAdd + 1) + ", then " + (startAdd + 2) + ", and so on.", terms: terms };
  });

  register({ id: "sub-grow", name: "Growing subtraction", group: "Number" }, function () {
    var step = randInt(6, 12);
    var grow = pick([3, 4, 5]);
    var x = randInt(step * 8 + 40, step * 8 + 220);
    var terms = [x];
    var s = step;
    for (var i = 0; i < 6; i++) {
      x -= s;
      if (x <= 0) throw new Error("range");
      terms.push(x);
      s += grow;
    }
    return { rule: "Subtract " + step + ", then " + (step + grow) + ", then " + (step + 2 * grow) + ", and so on.", terms: terms };
  });

  register({ id: "digit-sum", name: "Digit sums", group: "Number" }, function () {
    var x = randInt(120, 480);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x += digitSum(x);
      terms.push(x);
    }
    return { rule: "Each term is the previous number plus the sum of its digits.", terms: terms };
  });

  register({ id: "digit-product", name: "Digit products", group: "Number" }, function () {
    if (!PRODUCT_SEQS.length) throw new Error("seeds");
    return {
      rule: "Each term is the previous number plus the product of its digits.",
      terms: pick(PRODUCT_SEQS).slice(),
    };
  });

  register({ id: "roman", name: "Roman numerals", group: "Number" }, function () {
    var n = randInt(28, 46);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push(roman(n + i));
    return { rule: "Consecutive Roman numerals, starting at " + roman(n) + ".", terms: terms };
  });

  register({ id: "letter-step", name: "Letter steps", group: "Letter" }, function () {
    var step = pick([3, 4, 5]);
    var back = Math.random() < 0.4;
    var span = 5 * step;
    var start = back ? randInt(1 + span, 26) : randInt(1, 26 - span);
    var terms = [];
    for (var i = 0; i < 6; i++) terms.push(L(start + (back ? -i * step : i * step)));
    var way = back ? "backward" : "forward";
    return { rule: "Each letter moves " + way + " by " + step + ".", terms: terms };
  });

  register({ id: "letter-grow", name: "Growing letter steps", group: "Letter" }, function () {
    var start = randInt(1, 6);
    var p = start;
    var step = 2;
    var terms = [L(p)];
    for (var i = 0; i < 5; i++) {
      p += step;
      step += 1;
      terms.push(L(p));
    }
    return { rule: "The letter jumps grow by one each time: +2, +3, +4, and so on.", terms: terms };
  });

  register({ id: "letter-mirror", name: "Letters from both ends", group: "Letter" }, function () {
    var s = randInt(4, 10);
    var terms = [];
    for (var i = 0; i < 7; i++) {
      var pos = i % 2 === 0 ? s + i / 2 : 28 - s - (i + 1) / 2;
      terms.push(L(pos));
    }
    return { rule: "Odd positions step forward from " + L(s) + ". Even positions step backward from " + L(27 - s) + ".", terms: terms };
  });

  register({ id: "letter-pairs", name: "Mirror pairs", group: "Letter" }, function () {
    var s = randInt(5, 12);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var a = s + i;
      terms.push(L(a) + L(27 - a));
    }
    return { rule: "Each pair is a letter and its partner from the other end of the alphabet. The first letter steps forward.", terms: terms };
  });

  register({ id: "letter-blocks", name: "Shifting blocks", group: "Letter" }, function () {
    var gap = pick([3, 4]);
    var startMax = 26 - 5 - 2 * gap;
    var start = randInt(1, startMax);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var a = start + i;
      terms.push(L(a) + L(a + gap) + L(a + 2 * gap));
    }
    return { rule: "Three-letter blocks. Each letter steps forward by one from the previous block, with a gap of " + gap + " inside the block.", terms: terms };
  });

  register({ id: "consonants", name: "Consonants", group: "Letter" }, function () {
    var start = randInt(0, CONS.length - 13);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push(CONS[start + i * 2]);
    return { rule: "Every other consonant, skipping the vowels and the consonant in between.", terms: terms };
  });

  register({ id: "alpha-linear", name: "Letters and numbers in step", group: "Mixed" }, function () {
    var letterStep = pick([2, 3, 4]);
    var numberStep = pick([2, 3, 4, 5].filter(function (n) { return n !== letterStep; }));
    var startL = randInt(1, 26 - 5 * letterStep);
    var startN = randInt(3, 14);
    var terms = [];
    for (var i = 0; i < 6; i++) terms.push(L(startL + i * letterStep) + String(startN + i * numberStep));
    return { rule: "The letter increases by " + letterStep + " and the number by " + numberStep + ".", terms: terms };
  });

  register({ id: "alpha-squares", name: "Letters and square numbers", group: "Mixed" }, function () {
    var startL = randInt(1, 16);
    var startSq = randInt(4, 8);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var k = startSq + i;
      terms.push(L(startL + i * 2) + String(k * k));
    }
    return { rule: "Letters step forward by two. The numbers are consecutive squares.", terms: terms };
  });

  register({ id: "consonant-count", name: "Consonants with a count", group: "Mixed" }, function () {
    var start = randInt(0, CONS.length - 13);
    var n0 = randInt(3, 12);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push(CONS[start + i * 2] + String(n0 + i));
    return { rule: "Every other consonant, with a count that rises by one.", terms: terms };
  });

  register({ id: "letter-swap", name: "Swapped letter pairs", group: "Letter" }, function () {
    var start = randInt(4, 16);
    var terms = [];
    for (var i = 0; i < 3; i++) {
      var a = start + i * 2;
      var pair = L(a) + L(a + 1);
      terms.push(pair);
      terms.push(L(a + 1) + L(a));
    }
    return { rule: "Letter pairs alternate with their reversal. The next pair starts on the next two letters.", terms: terms };
  });

  register({ id: "rising-affine", name: "Rising scale", group: "Number" }, function () {
    var k = pick([1, 2]);
    var x = k === 1 ? randInt(3, 9) : randInt(2, 5);
    var terms = [x];
    var factor = k;
    for (var i = 0; i < 5; i++) {
      x = x * factor + factor;
      if (x > 20000) throw new Error("range");
      terms.push(x);
      factor += 1;
    }
    return { rule: "Multiply by " + k + " and add " + k + ", then by " + (k + 1) + " and add " + (k + 1) + ", and so on.", terms: terms };
  });

  register({ id: "geo-gaps", name: "Geometric gaps", group: "Number" }, function () {
    var ratio = pick([2, 3]);
    var gap = ratio === 3 ? randInt(2, 4) : randInt(3, 8);
    var x = randInt(8, 40);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x += gap;
      if (x > 9000) throw new Error("range");
      terms.push(x);
      gap *= ratio;
    }
    return { rule: "The gaps themselves multiply by " + ratio + " each time.", terms: terms };
  });

  register({ id: "fib-gaps", name: "Fibonacci gaps", group: "Number" }, function () {
    var g1 = randInt(4, 12);
    var g2 = randInt(g1 + 2, g1 + 10);
    var gaps = [g1, g2];
    while (gaps.length < 6) gaps.push(gaps[gaps.length - 1] + gaps[gaps.length - 2]);
    var x = randInt(8, 36);
    var terms = [x];
    for (var i = 0; i < gaps.length; i++) {
      x += gaps[i];
      terms.push(x);
    }
    return { rule: "The gaps are a two-term sum: each gap is the sum of the two gaps before it.", terms: terms };
  });

  register({ id: "three-product", name: "Three consecutive product", group: "Number" }, function () {
    var k = randInt(3, 7);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var n = k + i;
      terms.push(n * (n + 1) * (n + 2));
    }
    return { rule: "Each term is the product of three consecutive integers, and the window steps forward by one.", terms: terms };
  });

  register({ id: "cube-minus-square", name: "Cube minus square", group: "Number" }, function () {
    var k = randInt(4, 8);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var n = k + i;
      terms.push(n * n * (n - 1));
    }
    return { rule: "Each term is n\u00b3 \u2212 n\u00b2 for consecutive n, starting at n = " + k + ".", terms: terms };
  });

  register({ id: "double-nudge", name: "Double and nudge", group: "Number" }, function () {
    var x = randInt(6, 22);
    var nudge = pick([1, -1]);
    var first = nudge;
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x = x * 2 + nudge;
      if (x <= 0 || x > 5000) throw new Error("range");
      terms.push(x);
      nudge = -nudge;
    }
    var word = first > 0 ? "add 1, then subtract 1" : "subtract 1, then add 1";
    return { rule: "Double the term and " + word + ", alternating.", terms: terms };
  });

  register({ id: "recurrence-3", name: "Triple-step recurrence", group: "Number" }, function () {
    var a = randInt(3, 10);
    var b = randInt(a + 3, a + 12);
    var terms = [a, b];
    while (terms.length < 7) {
      var next = 3 * terms[terms.length - 1] - terms[terms.length - 2];
      if (next <= terms[terms.length - 1] || next > 9000) throw new Error("range");
      terms.push(next);
    }
    return { rule: "Each term is three times the previous term, minus the term before that.", terms: terms };
  });

  register({ id: "last-digit-square", name: "Square of the last digit", group: "Number" }, function () {
    var x = randInt(13, 86);
    if (x % 10 === 0) throw new Error("zero");
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      var d = x % 10;
      if (d === 0) throw new Error("zero");
      x = x + d * d;
      if (x > 2500) throw new Error("range");
      terms.push(x);
    }
    return { rule: "Add the square of the last digit.", terms: terms };
  });

  register({ id: "digit-sum-product", name: "Digit sum and product", group: "Number" }, function () {
    if (!SUMPROD_SEQS.length) throw new Error("seeds");
    return {
      rule: "Each term is the previous number plus the sum of its digits and the product of its digits.",
      terms: pick(SUMPROD_SEQS).slice(),
    };
  });

  register({ id: "weave-fib-sq", name: "Sums and squares", group: "Number" }, function () {
    var a = randInt(4, 14);
    var b = randInt(a + 3, a + 14);
    var fib = [a, b, a + b, a + 2 * b];
    var s0 = randInt(7, 13);
    var squares = [];
    for (var i = 0; i < 4; i++) squares.push((s0 + i) * (s0 + i));
    return {
      rule: "Odd positions are a two-term sum. Even positions are consecutive squares.",
      terms: weave(fib, squares),
    };
  });

  register({ id: "weave-three", name: "Three woven runs", group: "Number" }, function () {
    var d1 = randInt(5, 9);
    var d2 = randInt(12, 19);
    var d3 = randInt(2, 4);
    var terms = weave3(
      series(randInt(12, 40), d1, 3),
      series(randInt(8, 30), d2, 3),
      series(randInt(16, 55), d3, 3)
    );
    return {
      rule: "Three arithmetic threads are woven. Their gaps are " + d1 + ", " + d2 + ", and " + d3 + ".",
      terms: terms,
    };
  });

  register({ id: "base3", name: "Base-three count", group: "Number" }, function () {
    var n = randInt(6, 24);
    var terms = [];
    for (var i = 0; i < 7; i++) terms.push(toBase3(n + i));
    return { rule: "The counting numbers, written in base three, starting at " + toBase3(n) + ".", terms: terms };
  });

  register({ id: "letter-split", name: "Split letter steps", group: "Letter" }, function () {
    var s1 = pick([1, 2, 3]);
    var s2 = pick([2, 3, 4].filter(function (n) { return n !== s1; }));
    var a0 = randInt(1, 26 - 5 * s1);
    var b0 = randInt(1, 26 - 5 * s2);
    var terms = [];
    for (var i = 0; i < 6; i++) terms.push(L(a0 + i * s1) + L(b0 + i * s2));
    return { rule: "In each pair, the first letter steps by " + s1 + " and the second by " + s2 + ".", terms: terms };
  });

  register({ id: "alpha-jump", name: "Counted letter jumps", group: "Mixed" }, function () {
    var num = randInt(2, 4);
    var letter = randInt(1, 6);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      if (letter < 1 || letter > 26) throw new Error("range");
      terms.push(L(letter) + String(num));
      letter += num;
      num += 1;
    }
    return { rule: "The number rises by one. The next letter jumps forward by the number just shown.", terms: terms };
  });

  register({ id: "pyramidal", name: "Pyramidal numbers", group: "Number" }, function () {
    var n = randInt(4, 9);
    var terms = [];
    for (var i = 0; i < 6; i++) {
      var k = n + i;
      terms.push((k * (k + 1) * (2 * k + 1)) / 6);
    }
    return { rule: "Square pyramidal numbers: n(n + 1)(2n + 1) / 6, starting at n = " + n + ".", terms: terms };
  });

  register({ id: "double-trim", name: "Double and trim", group: "Number" }, function () {
    var sub = randInt(2, 7);
    var startSub = sub;
    var x = randInt(24, 70);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      x = x * 2 - sub;
      if (x <= 0 || x > 9000) throw new Error("range");
      terms.push(x);
      sub += 1;
    }
    return { rule: "Double the term and subtract " + startSub + ", then " + (startSub + 1) + ", then " + (startSub + 2) + ", and so on.", terms: terms };
  });

  register({ id: "prime-multiples", name: "Prime multiples", group: "Number" }, function () {
    var p0 = randInt(5, 14);
    var m0 = pick([2, 3, 4]);
    var terms = [];
    for (var i = 0; i < 6; i++) terms.push(PRIMES[p0 + i] * (m0 + i));
    return { rule: "Consecutive primes, starting at " + PRIMES[p0] + ", multiplied by " + m0 + ", then " + (m0 + 1) + ", then " + (m0 + 2) + ", and so on.", terms: terms };
  });

  register({ id: "square-prime-gaps", name: "Square and prime gaps", group: "Number" }, function () {
    var root = randInt(2, 5);
    var p0 = randInt(3, 10);
    var x = randInt(12, 48);
    var terms = [x];
    for (var i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        var r = root + i / 2;
        x += r * r;
      } else {
        x += PRIMES[p0 + (i - 1) / 2];
      }
      terms.push(x);
    }
    return { rule: "The gaps alternate between consecutive squares and consecutive primes.", terms: terms };
  });

  register({ id: "rising-swaps", name: "Rising swaps", group: "Number" }, function () {
    var step = pick([7, 9, 11, 13]);
    var n = randInt(24, 60);
    var terms = [];
    var seen = {};
    for (var i = 0; i < 3; i++) {
      var cur = n + i * step;
      var s = String(cur);
      if (cur < 12 || cur > 89 || s.length !== 2 || s.indexOf("0") !== -1 || s[0] === s[1]) throw new Error("range");
      var swap = Number(s[1] + s[0]);
      if (seen[cur] || seen[swap]) throw new Error("dup");
      seen[cur] = true;
      seen[swap] = true;
      terms.push(cur);
      terms.push(swap);
    }
    return { rule: "Numbers come in swapped pairs. The first number of each pair rises by " + step + ".", terms: terms };
  });

  function weave3(a, b, c) {
    var out = [];
    for (var i = 0; i < a.length; i++) out.push(a[i], b[i], c[i]);
    return out;
  }

  if (Bank && Bank.items) {
    Bank.items.forEach(function (item) {
      register({ id: item.id, name: item.name, group: item.group }, function () {
        return Bank.make(item, {
          randInt: randInt,
          pick: pick,
          L: L,
          PRIMES: PRIMES,
          CONS: CONS,
          series: series,
          weave: weave,
          weave3: weave3,
        });
      });
    });
  }

  function pickIds(allIds, coverage, k) {
    var cov = coverage || {};
    var groups = new Map();
    allIds.forEach(function (id) {
      var c = cov[id] ? cov[id].count || 0 : 0;
      if (!groups.has(c)) groups.set(c, []);
      groups.get(c).push(id);
    });
    var counts = Array.from(groups.keys()).sort(function (a, b) { return a - b; });
    var ordered = [];
    counts.forEach(function (c) {
      var bucket = groups.get(c).slice().sort(function (a, b) {
        var la = cov[a] ? cov[a].last || 0 : 0;
        var lb = cov[b] ? cov[b].last || 0 : 0;
        if (la !== lb) return la - lb;
        return Math.random() - 0.5;
      });
      ordered = ordered.concat(bucket);
    });
    return ordered.slice(0, Math.min(k, ordered.length));
  }

  function generateSet(count, coverage) {
    var ids = pickIds(CATALOG.map(function (m) { return m.id; }), coverage, count || 30);
    return shuffle(ids.map(function (id) { return GENERATORS[id](); }));
  }

  function selfTest() {
    var problems = [];
    function eq(actual, expected, label) {
      if (actual !== expected) problems.push(label + ": " + actual + " != " + expected);
    }
    eq(roman(4), "IV", "roman4");
    eq(roman(9), "IX", "roman9");
    eq(roman(14), "XIV", "roman14");
    eq(roman(19), "XIX", "roman19");
    eq(roman(24), "XXIV", "roman24");
    eq(roman(40), "XL", "roman40");
    eq(lookSay("1"), "11", "las1");
    eq(lookSay("1211"), "111221", "las1211");
    eq(L(1), "A", "A");
    eq(L(26), "Z", "Z");
    if (REVERSE_SEQS.length < 1) problems.push("reverse seeds");
    if (PRODUCT_SEQS.length < 1) problems.push("product seeds");
    if (SUMPROD_SEQS.length < 1) problems.push("sum-product seeds");
    var ids = CATALOG.map(function (m) { return m.id; });
    if (new Set(ids).size !== ids.length) problems.push("duplicate ids");
    return {
      problems: problems,
      families: CATALOG.length,
      reverseSeeds: REVERSE_SEQS.length,
      productSeeds: PRODUCT_SEQS.length,
    };
  }

  return {
    generateSet: generateSet,
    question: function (id) { return GENERATORS[id](); },
    catalog: function () { return CATALOG.map(function (m) { return { id: m.id, name: m.name, group: m.group }; }); },
    selfTest: selfTest,
    lookSay: lookSay,
  };
});
