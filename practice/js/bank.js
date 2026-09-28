(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SEQBank = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var NAME_LEN = [0, 3, 3, 5, 4, 4, 3, 5, 5, 4, 3, 6, 6, 8, 8, 7, 7, 9, 8, 8, 6, 9, 9, 11, 10, 10, 9, 11, 11, 10, 6, 9, 9, 11, 10, 10, 9, 11, 11, 10, 5];

  function poly(id, k) {
    switch (id) {
      case "p-sq1": return k * k + 1;
      case "p-sq2": return k * k + 2;
      case "p-sq-k": return k * k - k;
      case "p-sq-k1": return k * k + k + 1;
      case "p-2sq": return 2 * k * k;
      case "p-2sq1": return 2 * k * k + 1;
      case "p-2sq-1": return 2 * k * k - 1;
      case "p-3sq": return 3 * k * k;
      case "p-5sq": return 5 * k * k;
      case "p-6sq": return 6 * k * k;
      case "p-cu1": return k * k * k + 1;
      case "p-cu-1": return k * k * k - 1;
      case "p-cu-sq": return k * k * k + k * k;
      case "p-cu-k1": return k * k * k + k + 1;
      case "p-cu-k": return k * k * k - k;
      case "p-2cu": return 2 * k * k * k;
      case "p-cu-2k": return k * k * k + 2 * k;
      case "p-cu-m2k": return k * k * k - 2 * k;
      case "p-4prod": return k * (k + 1) * (k + 2) * (k + 3);
      case "p-hept": return k * (5 * k - 3) / 2;
      case "p-oct": return k * (3 * k - 2);
      case "p-nona": return k * (7 * k - 5) / 2;
      case "p-deca": return k * (4 * k - 3);
      case "p-tetra": return k * (k + 1) * (k + 2) / 6;
      case "p-censq": return 2 * k * (k - 1) + 1;
      case "p-centri": return (3 * k * (k - 1)) / 2 + 1;
      case "p-star": return 6 * k * (k - 1) + 1;
      case "p-cenhex": return 3 * k * (k - 1) + 1;
      case "p-cenpent": return (5 * k * (k - 1)) / 2 + 1;
      case "p-sumcu": return (k * (k + 1) / 2) * (k * (k + 1) / 2);
      case "p-lazy": return k * (k + 1) / 2 + 1;
      case "p-k2-2k": return k * k + 2 * k;
      case "p-k2m2k": return k * k - 2 * k;
      case "p-k2-4": return k * k + 4;
      case "p-k2k2": return k * k + k + 2;
      case "p-cu-k2-k": return k * k * k + k * k + k;
      case "p-cu-all": return k * k * k + k * k + k + 1;
      case "p-cu-2k2": return k * k * k + 2 * k * k;
      case "p-cu-m2k2": return k * k * k - 2 * k * k;
      case "p-2k2-2k1": return 2 * k * k + 2 * k + 1;
      case "p-3k2-3k1": return 3 * k * k + 3 * k + 1;
      case "p-c3": return k * (k - 1) * (k - 2) / 6;
      case "p-c4": return k * (k - 1) * (k - 2) * (k - 3) / 24;
      case "p-pentpy": return k * k * (k + 1) / 2;
      case "p-hexpy": return k * (k + 1) * (4 * k - 1) / 6;
      case "p-evencu": return 8 * k * k * k;
      case "p-k4": return k * k * k * k;
      case "p-k4k": return k * k * k * k + k;
      case "p-k4mk": return k * k * k * k - k;
      case "p-k4sq": return k * k * k * k + k * k;
      case "p-k-k3": return k * (k + 3);
      case "p-k-k4": return k * (k + 4);
      case "p-k-2k1": return k * (2 * k + 1);
      case "p-k-3k1": return k * (3 * k + 1);
      case "p-k-3km": return k * (3 * k - 1);
      case "p-k2-7": return k * k + 7;
      case "p-k2km": return k * k + k - 1;
      case "p-2cu-k": return 2 * k * k * k + k;
      case "p-2cu-mk": return 2 * k * k * k - k;
      case "p-cu3k2": return k * k * k + 3 * k * k;
      case "p-cum3k2": return k * k * k - 3 * k * k;
      case "p-k2-2k2": return k * k + 2 * k + 2;
      case "p-half-k3": return (k * k + 3 * k) / 2;
      case "p-cu-k2m": return k * k * k + k * k - k;
      case "p-cu-mk2k": return k * k * k - k * k + k;
      case "p-2sq3": return 2 * k * k + 3;
      case "p-3sq2": return 3 * k * k + 2;
      case "p-3sqm": return 3 * k * k - 1;
      case "p-4sq1": return 4 * k * k + 1;
      case "p-4sqm": return 4 * k * k - 1;
      case "p-k4sqk": return k * k * k * k + k * k + k;
      case "p-k4msq": return k * k * k * k - k * k;
      case "p-2k4": return 2 * k * k * k * k;
      default: return null;
    }
  }

  function P(id, name, rule, lo, hi, count) {
    return { id: id, name: name, group: "Number", kind: "poly", rule: rule, lo: lo, hi: hi, count: count || 6 };
  }

  var polys = [
    P("p-sq1", "One above a square", "One more than consecutive squares.", 8, 16),
    P("p-sq2", "Two above a square", "Two more than consecutive squares.", 8, 16),
    P("p-sq-k", "Square minus n", "n\u00b2 \u2212 n for consecutive n.", 8, 16),
    P("p-sq-k1", "Square plus n plus one", "n\u00b2 + n + 1 for consecutive n.", 6, 14),
    P("p-2sq", "Twice a square", "Twice consecutive squares.", 6, 14),
    P("p-2sq1", "Twice a square, plus one", "One more than twice consecutive squares.", 6, 14),
    P("p-2sq-1", "Twice a square, minus one", "One less than twice consecutive squares.", 6, 14),
    P("p-3sq", "Three times a square", "Three times consecutive squares.", 5, 12),
    P("p-5sq", "Five times a square", "Five times consecutive squares.", 4, 12),
    P("p-6sq", "Six times a square", "Six times consecutive squares.", 4, 10),
    P("p-cu1", "One above a cube", "One more than consecutive cubes.", 3, 8),
    P("p-cu-1", "One below a cube", "One less than consecutive cubes.", 3, 8),
    P("p-cu-sq", "Cube plus square", "n\u00b3 + n\u00b2 for consecutive n.", 3, 7),
    P("p-cu-k1", "Cube plus n plus one", "n\u00b3 + n + 1 for consecutive n.", 3, 8),
    P("p-cu-k", "Cube minus n", "n\u00b3 \u2212 n for consecutive n.", 3, 8),
    P("p-2cu", "Twice a cube", "Twice consecutive cubes.", 3, 7),
    P("p-cu-2k", "Cube plus twice n", "n\u00b3 + 2n for consecutive n.", 3, 8),
    P("p-cu-m2k", "Cube minus twice n", "n\u00b3 \u2212 2n for consecutive n.", 3, 8),
    P("p-4prod", "Four consecutive product", "The product of four consecutive integers, and the window steps forward by one.", 2, 5),
    P("p-hept", "Heptagonal numbers", "Heptagonal numbers: n(5n \u2212 3) / 2.", 4, 12),
    P("p-oct", "Octagonal numbers", "Octagonal numbers: n(3n \u2212 2).", 4, 12),
    P("p-nona", "Nonagonal numbers", "Nonagonal numbers: n(7n \u2212 5) / 2.", 4, 10),
    P("p-deca", "Decagonal numbers", "Decagonal numbers: n(4n \u2212 3).", 4, 12),
    P("p-tetra", "Tetrahedral numbers", "Tetrahedral numbers: n(n + 1)(n + 2) / 6.", 4, 12),
    P("p-censq", "Centered squares", "Centered squares: 2n(n \u2212 1) + 1.", 4, 14),
    P("p-centri", "Centered triangular numbers", "Centered triangular numbers: 3n(n \u2212 1) / 2 + 1.", 4, 14),
    P("p-star", "Star numbers", "Star numbers: 6n(n \u2212 1) + 1.", 3, 10),
    P("p-cenhex", "Centered hexagons", "Centered hexagonal numbers: 3n(n \u2212 1) + 1.", 3, 12),
    P("p-cenpent", "Centered pentagons", "Centered pentagonal numbers: 5n(n \u2212 1) / 2 + 1.", 3, 12),
    P("p-sumcu", "Sums of cubes", "The square of a triangular number: [n(n + 1) / 2]\u00b2. These are sums of the first n cubes.", 3, 8),
    P("p-lazy", "Lazy caterer", "Lazy caterer numbers: n(n + 1) / 2 + 1.", 5, 16),
    P("p-k2-2k", "n times n plus two", "n(n + 2) for consecutive n.", 5, 14),
    P("p-k2m2k", "n times n minus two", "n(n \u2212 2) for consecutive n.", 6, 16),
    P("p-k2-4", "Four above a square", "Four more than consecutive squares.", 6, 16),
    P("p-k2k2", "Square plus n plus two", "n\u00b2 + n + 2 for consecutive n.", 5, 14),
    P("p-cu-k2-k", "Cube, square, and n", "n\u00b3 + n\u00b2 + n for consecutive n.", 3, 7),
    P("p-cu-all", "Cube through one", "n\u00b3 + n\u00b2 + n + 1 for consecutive n.", 3, 7),
    P("p-cu-2k2", "Cube plus twice a square", "n\u00b3 + 2n\u00b2 for consecutive n.", 3, 7),
    P("p-cu-m2k2", "Cube minus twice a square", "n\u00b3 \u2212 2n\u00b2 for consecutive n.", 5, 8),
    P("p-2k2-2k1", "Twice square plus twice n plus one", "2n\u00b2 + 2n + 1 for consecutive n.", 4, 12),
    P("p-3k2-3k1", "Three square plus three n plus one", "3n\u00b2 + 3n + 1 for consecutive n.", 3, 10),
    P("p-c3", "Choose three", "Combinations of n things taken three at a time.", 6, 14),
    P("p-c4", "Choose four", "Combinations of n things taken four at a time.", 6, 12),
    P("p-pentpy", "Pentagonal pyramid", "Pentagonal pyramidal numbers: n\u00b2(n + 1) / 2.", 3, 8),
    P("p-hexpy", "Hexagonal pyramid", "Hexagonal pyramidal numbers: n(n + 1)(4n \u2212 1) / 6.", 3, 8),
    P("p-evencu", "Cubes of even numbers", "Cubes of consecutive even numbers.", 2, 5),
    P("p-k4", "Fourth powers", "Consecutive fourth powers.", 2, 5),
    P("p-k4k", "Fourth power plus n", "n\u2074 + n for consecutive n.", 2, 5),
    P("p-k4mk", "Fourth power minus n", "n\u2074 \u2212 n for consecutive n.", 2, 5),
    P("p-k4sq", "Fourth power plus a square", "n\u2074 + n\u00b2 for consecutive n.", 2, 5),
    P("p-k-k3", "n times n plus three", "n(n + 3) for consecutive n.", 5, 16),
    P("p-k-k4", "n times n plus four", "n(n + 4) for consecutive n.", 5, 14),
    P("p-k-2k1", "n times twice n plus one", "n(2n + 1) for consecutive n.", 4, 12),
    P("p-k-3k1", "n times three n plus one", "n(3n + 1) for consecutive n.", 4, 10),
    P("p-k-3km", "n times three n minus one", "n(3n \u2212 1) for consecutive n.", 4, 10),
    P("p-k2-7", "Seven above a square", "Seven more than consecutive squares.", 5, 16),
    P("p-k2km", "Square plus n minus one", "n\u00b2 + n \u2212 1 for consecutive n.", 5, 14),
    P("p-2cu-k", "Twice a cube, plus n", "2n\u00b3 + n for consecutive n.", 2, 6),
    P("p-2cu-mk", "Twice a cube, minus n", "2n\u00b3 \u2212 n for consecutive n.", 3, 6),
    P("p-cu3k2", "Cube plus three squares", "n\u00b3 + 3n\u00b2 for consecutive n.", 3, 7),
    P("p-cum3k2", "Cube minus three squares", "n\u00b3 \u2212 3n\u00b2 for consecutive n.", 5, 9),
    P("p-k2-2k2", "Square plus twice n plus two", "n\u00b2 + 2n + 2 for consecutive n.", 4, 14),
    P("p-half-k3", "Half n times n plus three", "n(n + 3) / 2 for consecutive n.", 4, 14),
    P("p-cu-k2m", "Cube plus square minus n", "n\u00b3 + n\u00b2 \u2212 n for consecutive n.", 3, 7),
    P("p-cu-mk2k", "Cube minus square plus n", "n\u00b3 \u2212 n\u00b2 + n for consecutive n.", 3, 7),
    P("p-2sq3", "Twice a square, plus three", "2n\u00b2 + 3 for consecutive n.", 4, 12),
    P("p-3sq2", "Three squares, plus two", "3n\u00b2 + 2 for consecutive n.", 4, 10),
    P("p-3sqm", "Three squares, minus one", "3n\u00b2 \u2212 1 for consecutive n.", 4, 10),
    P("p-4sq1", "Four squares, plus one", "4n\u00b2 + 1 for consecutive n.", 3, 10),
    P("p-4sqm", "Four squares, minus one", "4n\u00b2 \u2212 1 for consecutive n.", 3, 10),
    P("p-k4sqk", "Fourth power, square, and n", "n\u2074 + n\u00b2 + n for consecutive n.", 2, 4),
    P("p-k4msq", "Fourth power minus a square", "n\u2074 \u2212 n\u00b2 for consecutive n.", 2, 5),
    P("p-2k4", "Twice a fourth power", "Twice consecutive fourth powers.", 2, 4)
  ];

  function R(id, name, rule) {
    return { id: id, name: name, group: "Number", kind: "recur", rule: rule };
  }

  var recs = [
    R("rec-2-2-0", "Twice, plus twice before", "Each term is twice the previous term, plus twice the term before that."),
    R("rec-3-1-0", "Triple plus the one before", "Each term is three times the previous term, plus the term before that."),
    R("rec-3-2-0", "Triple plus twice before", "Each term is three times the previous term, plus twice the term before that."),
    R("rec-4-1-0", "Four times plus the one before", "Each term is four times the previous term, plus the term before that."),
    R("rec-4-m1-0", "Four times minus the one before", "Each term is four times the previous term, minus the term before that."),
    R("rec-2-1-p1", "Double, plus before, plus one", "Each term is twice the previous term, plus the term before that, plus 1."),
    R("rec-2-1-m1", "Double, plus before, minus one", "Each term is twice the previous term, plus the term before that, minus 1."),
    R("rec-1-1-p1", "Sum of two, plus one", "Each term is the sum of the two before it, plus 1."),
    R("rec-1-1-m1", "Sum of two, minus one", "Each term is the sum of the two before it, minus 1."),
    R("rec-1-2-0", "Previous plus twice before", "Each term is the previous term, plus twice the term before that."),
    R("rec-2-3-0", "Double plus three times before", "Each term is twice the previous term, plus three times the term before that."),
    R("rec-3-1-p1", "Triple, plus before, plus one", "Each term is three times the previous term, plus the term before that, plus 1."),
    R("rec-3-m1-p1", "Triple, minus before, plus one", "Each term is three times the previous term, minus the term before that, plus 1."),
    R("rec-4-1-m1", "Four times, plus before, minus one", "Each term is four times the previous term, plus the term before that, minus 1."),
    R("rec-5-m1-0", "Five times minus the one before", "Each term is five times the previous term, minus the term before that."),
    R("rec-2-m1-p1", "Double, minus before, plus one", "Each term is twice the previous term, minus the term before that, plus 1.")
  ];

  function G(id, name, rule) {
    return { id: id, name: name, group: "Number", kind: "gap", rule: rule };
  }

  var gaps = [
    G("gap-tri", "Triangular gaps", "The gaps are consecutive triangular numbers."),
    G("gap-cube", "Cube gaps", "The gaps are consecutive cubes."),
    G("gap-mersenne", "Mersenne gaps", "The gaps are one less than consecutive powers of two."),
    G("gap-pent", "Pentagonal gaps", "The gaps are consecutive pentagonal numbers."),
    G("gap-oblong", "Oblong gaps", "The gaps are consecutive oblong numbers, n(n + 1)."),
    G("gap-third-2", "Third differences of two", "The gaps of the gaps grow by 2 each time."),
    G("gap-third-3", "Third differences of three", "The gaps of the gaps grow by 3 each time."),
    G("gap-third-6", "Third differences of six", "The gaps of the gaps grow by 6 each time.")
  ];

  function D(id, name, rule) {
    return { id: id, name: name, group: "Number", kind: "digit", rule: rule };
  }

  var digits = [
    D("dig-max", "Add the largest digit", "Add the largest digit of the previous number."),
    D("dig-min", "Add the smallest digit", "Add the smallest digit of the previous number."),
    D("dig-sqsum", "Square of the digit sum", "Add the square of the sum of the digits."),
    D("dig-sumsq", "Sum of the squares of the digits", "Add the squares of the digits."),
    D("dig-first", "Add the first digit", "Add the first digit of the previous number."),
    D("dig-ends", "Add the end digits", "Add the product of the first digit and the last digit."),
    D("dig-double-sum", "Double and add the digits", "Double the number and add the sum of its digits."),
    D("dig-collatz", "Collatz step", "If the number is even, halve it. If it is odd, multiply by 3 and add 1.")
  ];

  function B(id, name, rule, base, mode) {
    return { id: id, name: name, group: "Number", kind: "base", rule: rule, base: base, mode: mode };
  }

  var bases = [
    B("base-4", "Base-four count", "The counting numbers, written in base four.", 4, "count"),
    B("base-5", "Base-five count", "The counting numbers, written in base five.", 5, "count"),
    B("base-7", "Base-seven count", "The counting numbers, written in base seven.", 7, "count"),
    B("base-8", "Base-eight count", "The counting numbers, written in base eight.", 8, "count"),
    B("base-9", "Base-nine count", "The counting numbers, written in base nine.", 9, "count"),
    B("base-4-sq", "Squares in base four", "Consecutive squares, written in base four.", 4, "squares"),
    B("base-8-sq", "Squares in base eight", "Consecutive squares, written in base eight.", 8, "squares"),
    B("base-2-sq", "Squares in binary", "Consecutive squares, written in binary.", 2, "squares")
  ];

  function W(id, name, rule) {
    return { id: id, name: name, group: "Number", kind: "pow", rule: rule };
  }

  var pows = [
    W("pow2-plus1", "One above a power of two", "One more than consecutive powers of two."),
    W("pow2-plusk", "Power of two plus the exponent", "2\u207f + n for consecutive n."),
    W("pow2-minusk", "Power of two minus the exponent", "2\u207f \u2212 n for consecutive n."),
    W("pow3-plus1", "One above a power of three", "One more than consecutive powers of three."),
    W("pow3-minus1", "One below a power of three", "One less than consecutive powers of three."),
    W("pow3-plusk", "Power of three plus the exponent", "3\u207f + n for consecutive n."),
    W("pow5", "Powers of five", "Consecutive powers of five."),
    W("pow5-plus1", "One above a power of five", "One more than consecutive powers of five.")
  ];

  function F(id, name, rule) {
    return { id: id, name: name, group: "Number", kind: "fact", rule: rule };
  }

  var facts = [
    F("fact-plus1", "One above a factorial", "One more than consecutive factorials."),
    F("fact-minus1", "One below a factorial", "One less than consecutive factorials."),
    F("fact-plusk", "Factorial plus n", "n! + n for consecutive n."),
    F("dfact-even", "Even double factorial", "Double factorials of consecutive even numbers: n(n \u2212 2)(n \u2212 4)\u2026"),
    F("dfact-odd", "Odd double factorial", "Double factorials of consecutive odd numbers: n(n \u2212 2)(n \u2212 4)\u2026")
  ];

  function Ltr(id, name, group, rule) {
    return { id: id, name: name, group: group, kind: "letter", rule: rule };
  }

  var letters = [
    Ltr("let-slide2", "Sliding pairs", "Letter", "Overlapping pairs of consecutive letters. Each pair starts one letter later."),
    Ltr("let-slide3", "Sliding triples", "Letter", "Overlapping triples of consecutive letters. Each block starts one letter later."),
    Ltr("let-slide4", "Sliding fours", "Letter", "Overlapping blocks of four consecutive letters. Each block starts one letter later."),
    Ltr("let-mirror2", "Mirror pairs, stride two", "Letter", "Each pair is a letter and its partner from the other end. The first letter steps forward by two."),
    Ltr("let-sq", "Letter and its square", "Mixed", "The letter steps forward by one. The number is the square of its place in the alphabet."),
    Ltr("let-tri", "Letter and its triangle", "Mixed", "The letter steps forward by one. The number is the triangular number of its place in the alphabet."),
    Ltr("let-double", "Letter and twice its place", "Mixed", "The letter steps forward by one. The number is twice its place in the alphabet."),
    Ltr("let-primepos", "Letters on primes", "Letter", "Letters whose places in the alphabet are consecutive primes."),
    Ltr("let-name", "Letters in the number", "Number", "How many letters are in the English name of the counting numbers, in order. Hyphens are not counted."),
    Ltr("let-tail", "Consonants from the end", "Letter", "Every other consonant, read backward from the end of the alphabet."),
    Ltr("let-with-prime", "Letters beside primes", "Mixed", "The letter steps forward by one. The number is the next prime."),
    Ltr("let-step-count", "Letter stride with a count", "Mixed", "The letter steps forward by two. The count rises by one.")
  ];

  function V(id, name, rule) {
    return { id: id, name: name, group: "Number", kind: "weave", rule: rule };
  }

  var weaves = [
    V("w-tri-sq", "Triangles and squares", "Odd positions are consecutive triangular numbers. Even positions are consecutive squares."),
    V("w-tri-pr", "Triangles and primes", "Odd positions are consecutive triangular numbers. Even positions are consecutive primes."),
    V("w-fib-pr", "Sums and primes", "Odd positions are a two-term sum. Even positions are consecutive primes."),
    V("w-cu-pr", "Cubes and primes", "Odd positions are consecutive cubes. Even positions are consecutive primes."),
    V("w-p2-sq", "Powers of two and squares", "Odd positions are consecutive powers of two. Even positions are consecutive squares."),
    V("w-ap-tri", "Arithmetic and triangles", "Odd positions rise by a constant. Even positions are consecutive triangular numbers."),
    V("w-fig3", "Squares, primes, triangles", "Three threads are woven: consecutive squares, consecutive primes, then consecutive triangular numbers."),
    V("w-evencube", "Even squares, odd cubes", "Odd positions are squares of consecutive even numbers. Even positions are cubes of consecutive odd numbers.")
  ];

  var items = polys.concat(recs, gaps, digits, bases, pows, facts, letters, weaves);

  function powTerm(id, k) {
    var base = id.indexOf("pow2") === 0 ? 2 : id.indexOf("pow3") === 0 ? 3 : 5;
    var v = Math.pow(base, k);
    if (id.indexOf("plus1") !== -1) return v + 1;
    if (id.indexOf("minus1") !== -1) return v - 1;
    if (id.indexOf("plusk") !== -1) return v + k;
    if (id.indexOf("minusk") !== -1) return v - k;
    return v;
  }

  function fact(k) {
    var v = 1;
    for (var i = 2; i <= k; i++) v *= i;
    return v;
  }

  function dfact(k) {
    var v = 1;
    for (var i = k; i >= 2; i -= 2) v *= i;
    return v;
  }

  function factTerm(id, k) {
    if (id === "dfact-even" || id === "dfact-odd") return dfact(k);
    var v = fact(k);
    if (id === "fact-plus1") return v + 1;
    if (id === "fact-minus1") return v - 1;
    return v + k;
  }

  function toBase(n, b) {
    var s = "";
    var x = n;
    while (x > 0) {
      s = String(x % b) + s;
      x = Math.floor(x / b);
    }
    return s || "0";
  }

  function digitSum(n) {
    return String(n).split("").reduce(function (s, c) { return s + Number(c); }, 0);
  }

  function digitsOf(n) {
    return String(Math.abs(n)).split("").map(Number);
  }

  function parseSigned(token) {
    if (token[0] === "m") return -Number(token.slice(1));
    if (token[0] === "p") return Number(token.slice(1));
    return Number(token);
  }

  function recurParts(id) {
    var bits = id.split("-");
    return { p: parseSigned(bits[1]), q: parseSigned(bits[2]), r: parseSigned(bits[3]) };
  }

  function pushRun(start, count, fn, max) {
    var cap = max || 40000;
    var terms = [];
    for (var i = 0; i < count; i++) {
      var v = fn(start + i);
      if (!Number.isInteger(v) || v <= 0 || v > cap) throw new Error("range");
      terms.push(v);
    }
    for (var j = 1; j < terms.length; j++) if (terms[j] <= terms[j - 1]) throw new Error("order");
    return terms;
  }

  function make(item, ctx) {
    var randInt = ctx.randInt;
    if (item.kind === "poly") {
      var k = randInt(item.lo, item.hi);
      return { rule: item.rule + " Starting at n = " + k + ".", terms: pushRun(k, item.count, function (n) { return poly(item.id, n); }) };
    }
    if (item.kind === "pow") {
      var pk = item.id.indexOf("pow5") === 0 ? randInt(1, 2) : item.id.indexOf("pow3") === 0 ? randInt(3, 4) : randInt(6, 8);
      var pn = item.id.indexOf("pow5") === 0 ? 6 : 6;
      return { rule: item.rule + " Starting at exponent " + pk + ".", terms: pushRun(pk, pn, function (n) { return powTerm(item.id, n); }, 100000) };
    }
    if (item.kind === "fact") {
      if (item.id === "dfact-even") {
        var e0 = randInt(1, 3) * 2;
        return { rule: item.rule + " Starting at " + e0 + ".", terms: pushRun(0, 6, function (i) { return dfact(e0 + 2 * i); }, 20000000) };
      }
      if (item.id === "dfact-odd") {
        var o0 = randInt(0, 2) * 2 + 1;
        return { rule: item.rule + " Starting at " + o0 + ".", terms: pushRun(0, 6, function (i) { return dfact(o0 + 2 * i); }, 20000000) };
      }
      var f0 = 3;
      return { rule: item.rule + " Starting at " + f0 + "!.", terms: pushRun(f0, 6, function (n) { return factTerm(item.id, n); }, 500000) };
    }
    if (item.kind === "recur") {
      var parts = recurParts(item.id);
      var a = randInt(3, 9);
      var b = randInt(4, 12);
      var terms = [a, b];
      while (terms.length < 7) {
        var next = parts.p * terms[terms.length - 1] + parts.q * terms[terms.length - 2] + parts.r;
        if (!Number.isInteger(next) || next <= 0 || next > 25000) throw new Error("range");
        terms.push(next);
      }
      return { rule: item.rule, terms: terms };
    }
    if (item.kind === "gap") return makeGap(item, ctx);
    if (item.kind === "digit") return makeDigit(item, ctx);
    if (item.kind === "base") return makeBase(item, ctx);
    if (item.kind === "letter") return makeLetter(item, ctx);
    if (item.kind === "weave") return makeWeave(item, ctx);
    throw new Error("kind " + item.kind);
  }

  function makeGap(item, ctx) {
    var randInt = ctx.randInt;
    var x = randInt(12, 60);
    var terms = [x];
    if (item.id === "gap-tri") {
      var n = randInt(3, 7);
      for (var i = 0; i < 6; i++) {
        var k = n + i;
        x += k * (k + 1) / 2;
        terms.push(x);
      }
    } else if (item.id === "gap-cube") {
      var c0 = randInt(2, 4);
      for (var c = 0; c < 6; c++) {
        var r = c0 + c;
        x += r * r * r;
        terms.push(x);
      }
    } else if (item.id === "gap-mersenne") {
      var e = randInt(2, 4);
      for (var m = 0; m < 6; m++) {
        x += Math.pow(2, e + m) - 1;
        terms.push(x);
      }
    } else if (item.id === "gap-pent") {
      var p0 = randInt(2, 5);
      for (var p = 0; p < 6; p++) {
        var pk = p0 + p;
        x += pk * (3 * pk - 1) / 2;
        terms.push(x);
      }
    } else if (item.id === "gap-oblong") {
      var o = randInt(2, 5);
      for (var oi = 0; oi < 6; oi++) {
        var ok = o + oi;
        x += ok * (ok + 1);
        terms.push(x);
      }
    } else {
      var third = Number(item.id.slice("gap-third-".length));
      var second = randInt(3, 9);
      var diff = randInt(6, 18);
      for (var t = 0; t < 6; t++) {
        x += diff;
        terms.push(x);
        diff += second;
        second += third;
      }
    }
    if (terms.some(function (n) { return n > 40000; })) throw new Error("range");
    return { rule: item.rule, terms: terms };
  }

  function makeDigit(item, ctx) {
    var randInt = ctx.randInt;
    function run(seed, steps, step) {
      var x = seed;
      var terms = [x];
      for (var i = 0; i < steps; i++) {
        x = step(x);
        if (!Number.isInteger(x) || x <= terms[terms.length - 1] || x > 30000) throw new Error("range");
        terms.push(x);
      }
      return terms;
    }
    if (item.id === "dig-max") {
      return { rule: item.rule, terms: run(randInt(80, 420), 6, function (n) {
        return n + Math.max.apply(null, digitsOf(n));
      }) };
    }
    if (item.id === "dig-min") {
      var seed = randInt(12, 89);
      if (String(seed).indexOf("0") !== -1) throw new Error("zero");
      return { rule: item.rule, terms: run(seed, 6, function (n) {
        if (String(n).indexOf("0") !== -1) throw new Error("zero");
        return n + Math.min.apply(null, digitsOf(n));
      }) };
    }
    if (item.id === "dig-sqsum") {
      return { rule: item.rule, terms: run(randInt(18, 80), 6, function (n) {
        var s = digitSum(n);
        return n + s * s;
      }) };
    }
    if (item.id === "dig-sumsq") {
      return { rule: item.rule, terms: run(randInt(18, 90), 6, function (n) {
        return n + digitsOf(n).reduce(function (s, d) { return s + d * d; }, 0);
      }) };
    }
    if (item.id === "dig-first") {
      return { rule: item.rule, terms: run(randInt(24, 180), 6, function (n) {
        return n + Number(String(n)[0]);
      }) };
    }
    if (item.id === "dig-ends") {
      var ends = randInt(13, 86);
      if (String(ends).indexOf("0") !== -1) throw new Error("zero");
      return { rule: item.rule, terms: run(ends, 6, function (n) {
        var s = String(n);
        if (s.indexOf("0") !== -1) throw new Error("zero");
        return n + Number(s[0]) * Number(s[s.length - 1]);
      }) };
    }
    if (item.id === "dig-double-sum") {
      return { rule: item.rule, terms: run(randInt(14, 60), 6, function (n) {
        return n * 2 + digitSum(n);
      }) };
    }
    var seen = {};
    var c = randInt(3, 20) * 2 + 1;
    var chain = [c];
    seen[c] = true;
    for (var i = 0; i < 6; i++) {
      c = c % 2 === 0 ? c / 2 : 3 * c + 1;
      if (!Number.isInteger(c) || c > 20000 || seen[c]) throw new Error("range");
      seen[c] = true;
      chain.push(c);
    }
    return { rule: item.rule, terms: chain };
  }

  function makeBase(item, ctx) {
    var randInt = ctx.randInt;
    var terms = [];
    if (item.mode === "count") {
      var n = randInt(item.base === 2 ? 12 : 6, item.base === 9 ? 28 : 22);
      for (var i = 0; i < 7; i++) terms.push(toBase(n + i, item.base));
      return { rule: item.rule + " Starting at " + toBase(n, item.base) + ".", terms: terms };
    }
    var root = randInt(5, 12);
    for (var s = 0; s < 6; s++) terms.push(toBase((root + s) * (root + s), item.base));
    return { rule: item.rule + " Starting at " + root + "\u00b2.", terms: terms };
  }

  function makeLetter(item, ctx) {
    var randInt = ctx.randInt;
    var L = ctx.L;
    if (item.id === "let-slide2") {
      var a = randInt(2, 16);
      var terms = [];
      for (var i = 0; i < 6; i++) terms.push(L(a + i) + L(a + i + 1));
      return { rule: item.rule, terms: terms };
    }
    if (item.id === "let-slide3") {
      var b = randInt(2, 14);
      var triples = [];
      for (var j = 0; j < 6; j++) triples.push(L(b + j) + L(b + j + 1) + L(b + j + 2));
      return { rule: item.rule, terms: triples };
    }
    if (item.id === "let-slide4") {
      var c = randInt(1, 12);
      var fours = [];
      for (var f = 0; f < 6; f++) fours.push(L(c + f) + L(c + f + 1) + L(c + f + 2) + L(c + f + 3));
      return { rule: item.rule, terms: fours };
    }
    if (item.id === "let-mirror2") {
      var s = randInt(1, 12);
      var pairs = [];
      for (var m = 0; m < 6; m++) {
        var pos = s + m * 2;
        pairs.push(L(pos) + L(27 - pos));
      }
      return { rule: item.rule, terms: pairs };
    }
    if (item.id === "let-sq") {
      var p = randInt(4, 8);
      var sq = [];
      for (var si = 0; si < 6; si++) {
        var pos = p + si;
        sq.push(L(pos) + String(pos * pos));
      }
      return { rule: item.rule, terms: sq };
    }
    if (item.id === "let-tri") {
      var t0 = randInt(4, 10);
      var tri = [];
      for (var ti = 0; ti < 6; ti++) {
        var tp = t0 + ti;
        tri.push(L(tp) + String(tp * (tp + 1) / 2));
      }
      return { rule: item.rule, terms: tri };
    }
    if (item.id === "let-double") {
      var d0 = randInt(4, 14);
      var dub = [];
      for (var di = 0; di < 6; di++) {
        var dp = d0 + di;
        dub.push(L(dp) + String(dp * 2));
      }
      return { rule: item.rule, terms: dub };
    }
    if (item.id === "let-primepos") {
      var primes = ctx.PRIMES.filter(function (n) { return n <= 23; });
      var start = randInt(0, primes.length - 6);
      var letters = [];
      for (var pi = 0; pi < 6; pi++) letters.push(L(primes[start + pi]));
      return { rule: item.rule, terms: letters };
    }
    if (item.id === "let-name") {
      var n0 = randInt(1, 34);
      var names = [];
      for (var ni = 0; ni < 7; ni++) names.push(NAME_LEN[n0 + ni]);
      return { rule: item.rule + " Starting at " + n0 + ".", terms: names };
    }
    if (item.id === "let-tail") {
      var back = randInt(0, 8);
      var tail = [];
      for (var bi = 0; bi < 6; bi++) tail.push(ctx.CONS[ctx.CONS.length - 1 - back - bi * 2]);
      return { rule: item.rule, terms: tail };
    }
    if (item.id === "let-with-prime") {
      var letter = randInt(1, 16);
      var p0 = randInt(4, 12);
      var mixed = [];
      for (var wi = 0; wi < 6; wi++) mixed.push(L(letter + wi) + String(ctx.PRIMES[p0 + wi]));
      return { rule: item.rule, terms: mixed };
    }
    var letter2 = randInt(1, 14);
    var count = randInt(2, 9);
    var stepped = [];
    for (var li = 0; li < 6; li++) stepped.push(L(letter2 + li * 2) + String(count + li));
    return { rule: item.rule, terms: stepped };
  }

  function makeWeave(item, ctx) {
    var randInt = ctx.randInt;
    var series = ctx.series;
    var weave = ctx.weave;
    function tris(n, count) {
      var out = [];
      for (var i = 0; i < count; i++) {
        var k = n + i;
        out.push(k * (k + 1) / 2);
      }
      return out;
    }
    function sqs(n, count) {
      var out = [];
      for (var i = 0; i < count; i++) out.push((n + i) * (n + i));
      return out;
    }
    function cubs(n, count) {
      var out = [];
      for (var i = 0; i < count; i++) {
        var k = n + i;
        out.push(k * k * k);
      }
      return out;
    }
    if (item.id === "w-tri-sq") {
      return { rule: item.rule, terms: weave(tris(randInt(6, 14), 4), sqs(randInt(6, 12), 4)) };
    }
    if (item.id === "w-tri-pr") {
      var p0 = randInt(4, 12);
      var primes = [];
      for (var i = 0; i < 4; i++) primes.push(ctx.PRIMES[p0 + i]);
      return { rule: item.rule, terms: weave(tris(randInt(5, 12), 4), primes) };
    }
    if (item.id === "w-fib-pr") {
      var a = randInt(4, 12);
      var b = randInt(a + 3, a + 12);
      var fib = [a, b, a + b, a + 2 * b];
      var q0 = randInt(5, 14);
      var pr = [];
      for (var f = 0; f < 4; f++) pr.push(ctx.PRIMES[q0 + f]);
      return { rule: item.rule, terms: weave(fib, pr) };
    }
    if (item.id === "w-cu-pr") {
      var r0 = randInt(6, 14);
      var cubes = cubs(randInt(3, 6), 4);
      var pr2 = [];
      for (var c = 0; c < 4; c++) pr2.push(ctx.PRIMES[r0 + c]);
      return { rule: item.rule, terms: weave(cubes, pr2) };
    }
    if (item.id === "w-p2-sq") {
      var e = randInt(4, 7);
      var powers = [];
      for (var p = 0; p < 4; p++) powers.push(Math.pow(2, e + p));
      return { rule: item.rule, terms: weave(powers, sqs(randInt(6, 12), 4)) };
    }
    if (item.id === "w-ap-tri") {
      var diff = randInt(7, 16);
      return { rule: item.rule.replace("a constant", String(diff)), terms: weave(series(randInt(14, 50), diff, 4), tris(randInt(6, 14), 4)) };
    }
    if (item.id === "w-fig3") {
      var squares = sqs(randInt(4, 9), 3);
      var p1 = randInt(3, 10);
      var primes3 = [ctx.PRIMES[p1], ctx.PRIMES[p1 + 1], ctx.PRIMES[p1 + 2]];
      var triangles = tris(randInt(5, 12), 3);
      return { rule: item.rule, terms: ctx.weave3(squares, primes3, triangles) };
    }
    var even = [];
    var odd = [];
    var e0 = randInt(3, 7);
    var o0 = randInt(3, 6);
    for (var n = 0; n < 4; n++) {
      var ev = 2 * (e0 + n);
      var od = 2 * (o0 + n) + 1;
      even.push(ev * ev);
      odd.push(od * od * od);
    }
    return { rule: item.rule, terms: weave(even, odd) };
  }

  return {
    items: items,
    nameLen: NAME_LEN,
    poly: poly,
    powTerm: powTerm,
    factTerm: factTerm,
    recurParts: recurParts,
    make: make,
  };
});
