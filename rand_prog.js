'use strict';

function Generate(state) {
  var var_names = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'foo', 'bar', 'baz',
    'big', 'pig', 'angry', 'bird', 'stella', 'number', 'value',
    'x', 'y', 'z', 'w', 'leonard', 'chuck', 'red', 'bomb', 'matilda',
    'cookie', 'egg', 'toy', 'zebra', 'king', 'chef', 'mustache',
  ];
  var var_count = 0;

  var operators = {
  };

  function Random(n) {
    //state.seed = Math.floor(Math.random() * 1000000);
    state.seed = (state.seed * 1103515245 + 12345) % (1 << 31);
    return state.seed % n;
  }

  function AllocVar() {
    var pick = Random(var_names.length);
    var name = var_names[pick];
    var_names.splice(pick, 1);
    var_count++;
    return name;
  }

  var declarations = '';
  var operations = '';
  var tabs = 0;
  var decl_tabs = 0;

  function Tabs(n) {
    var ret = '';
    for (var i = 0; i < n; ++i) {
      ret += '  ';
    }
    return ret;
  }

  function AddOperation(line) {
    operations += Tabs(tabs) + line + '\n';
  }

  function AddDeclaration(line) {
    declarations += Tabs(decl_tabs) + line + '\n';
  }

  function PickConstant(n) {
    var name = AllocVar();
    AddDeclaration('int ' + name + ' = ' + n + ';');
    return name;
  }

  function PickNumber(n) {
    var num = Random(n);
    return [num, '' + num];
  }

  function Declare() {
    var name = AllocVar();
    AddDeclaration('int ' + name + ';');
    return name;
  }

  function Assign(name, e) {
    AddOperation(name + ' = ' + e + ';');
    return name;
  }

  function ParenIf(x) {
    if (x === undefined || x.indexOf === undefined) {
      throw 'out of vars';
    }
    if (x.indexOf(' ') >= 0) {
      x = '(' + x + ')';
    }
    return x;
  }

  function DoOp(a, op, b) {
    return ParenIf(a) + ' ' + op + ' ' + ParenIf(b);
  }

  function UnOp(op, a) {
    return op + ' ' + ParenIf(a);
  }

  function Print(e) {
    AddOperation('printf("%d\\n", ' + e + ');');
  }

  function Fix0(a) {
    if (a[0] === 0) {
      return [1, DoOp(a[1], '+', '1')];
    }
    return a;
  }

  function Positive(a) {
    if (a[0] < 0) {
      return [-a[0], UnOp('-', a[0])];
    }
    return a;
  }

  function ApplyBinOp(op, a, b) {
    switch (op) {
      case 0: return [a[0] + b[0], DoOp(a[1], '+', b[1])];
      case 1: return [a[0] - b[0], DoOp(a[1], '-', b[1])];
      case 2: return [a[0] * b[0], DoOp(a[1], '*', b[1])];
      case 3: return [a[0] < b[0] ? 1 : 0, DoOp(a[1], '<', b[1])];
      case 4: return [a[0] > b[0] ? 1 : 0, DoOp(a[1], '>', b[1])];
      case 5: return [a[0] <= b[0] ? 1 : 0, DoOp(a[1], '<=', b[1])];
      case 6: return [a[0] >= b[0] ? 1 : 0, DoOp(a[1], '>=', b[1])];
      case 7: return [a[0] === b[0] ? 1 : 0, DoOp(a[1], '==', b[1])];
      case 8: return [a[0] !== b[0] ? 1 : 0, DoOp(a[1], '!=', b[1])];
      case 9: return [(a[0] && b[0]) ? 1 : 0, DoOp(a[1], '&&', b[1])];
      case 10: return [(a[0] || b[0]) ? 1 : 0, DoOp(a[1], '||', b[1])];
      case 11: b = Fix0(b);
        return [a[0] % b[0], DoOp(a[1], '%', b[1])];
      case 12:
        b = Fix0(b);
        return [Math.floor(a[0] / b[0]), DoOp(a[1], '/', b[1])];
      case 13: return [a[0] & b[0], DoOp(a[1], '&', b[1])];
      case 14: return [a[0] | b[0], DoOp(a[1], '|', b[1])];
      case 15: return [a[0] ^ b[0], DoOp(a[1], '^', b[1])];
    }
  }

  function ApplyUnOp(op, a) {
    switch (op) {
      case 0: return [!a[0] ? 1 : 0, UnOp('!', a[1])];
      case 1: return [-a[0], UnOp('-', a[1])];
      case 2: return [~a[0], UnOp('~', a[1])];
      case 3: return [a[0] << 1, DoOp(a[1], '<<', '1')];
      case 4: return [a[0] >> 1, DoOp(a[1], '>>', '1')];
    }
  }

  function ApplyTriOp(a, b, c) {
    return [
      a[0] ? b[0] : c[0],
      ParenIf(a[1]) + ' ? ' + ParenIf(b[1]) + ' : ' + ParenIf(c[1])
    ];
  }

  function SelectExpr(n) {
    if (n <= 0 || var_count > 10) {
      if (var_count < 7 && Random(4) == 0) {
        var val = Random(10);
        return [val, PickConstant(val)];
      } else {
        return PickNumber(10);
      }
    }
    if (Random(6) === 0) {
      return PickNumber(10);
    }
    if (Random(9) === 0) {
      var name = Declare();
      var cond = SelectExpr(n - 1);
      var a = SelectExpr(n - 1);
      var b = SelectExpr(n - 1);
      AddOperation('if (' + cond[1] + ') {'); ++tabs;
      Assign(name, a[1]);
      --tabs; AddOperation('} else {'); ++tabs;
      Assign(name, b[1]);
      --tabs; AddOperation('}');
      if (cond[0]) {
        return [a[0], name];
      } else {
        return [b[0], name];
      }
    }
    if (Random(9) === 0) {
      var value = Random(10);
      var name = PickConstant(value);
      var cond = SelectExpr(n - 1);
      var a = SelectExpr(n - 1);
      AddOperation('if (' + cond[1] + ') {'); ++tabs;
      Assign(name, a[1]);
      --tabs; AddOperation('}');
      if (cond[0]) {
        return [a[0], name];
      } else {
        return [value, name];
      }
    }
    if (Random(9) === 0) {
      var value = Random(10);
      var name = PickConstant(value);
      var amount = Positive(SelectExpr(n - 1));
      var counter = Declare();
      var op = Random(2);
      var c = SelectExpr(n - 1);
      AddOperation('for (' + counter + ' = 0; ' +
                    counter + ' < ' + ParenIf(amount[1]) +
                    '; ++' + counter + ') {');
      ++tabs;
      var step = ApplyBinOp(op, [value, name], c);
      Assign(name, step[1]);
      step = [value, name];
      --tabs; AddOperation('}');
      for (var i = 0; i < amount[0]; i++) {
        step = ApplyBinOp(op, step, c);
      }
      return [step[0], name];
    }
    if (Random(7) === 0) {
      var a = SelectExpr(n - 1);
      var b = Declare();
      Assign(b, a[1]);
      switch (Random(4)) {
        case 0:
          AddOperation('++' + b + ';');
          return [a[0] + 1, b];
        case 1:
          AddOperation('--' + b + ';');
          return [a[0] - 1, b];
        case 2:
          AddOperation(b + '++' + ';');
          return [a[0] + 1, b];
        case 3:
          AddOperation(b + '--' + ';');
          return [a[0] - 1, b];
      }
    }
    if (Random(7) === 0) {
      var a = SelectExpr(n - 1);
      var b = Declare();
      var c = SelectExpr(n - 1);
      Assign(b, a[1]);
      switch (Random(6)) {
        case 0:
          AddOperation(b + ' += ' + c[1] + ';');
          return [a[0] + c[0], b];
        case 1:
          AddOperation(b + ' -= ' + c[1] + ';');
          return [a[0] - c[0], b];
        case 2:
          AddOperation(b + ' *= ' + c[1] + ';');
          return [a[0] * c[0], b];
        case 3:
          AddOperation(b + ' &= ' + c[1] + ';');
          return [a[0] & c[0], b];
        case 4:
          AddOperation(b + ' |= ' + c[1] + ';');
          return [a[0] & c[0], b];
        case 5:
          AddOperation(b + ' ^= ' + c[1] + ';');
          return [a[0] ^ c[0], b];
      }
    }
    // Pick Un, Bin, or Tri.
    var result;
    var a = SelectExpr(n - 1);
    if (Random(7) === 0) {
      var b = SelectExpr(n - 1);
      var c;
      if (Random(2) === 0) {
        c = b;
        b = PickNumber(10);
      } else {
        c = PickNumber(10);
      }
      result = ApplyTriOp(a, b, c);
    } else if (Random(4) !== 0) {
      var b = SelectExpr(n - 1);
      result = ApplyBinOp(Random(16), a, b);
    } else {
      result = ApplyUnOp(Random(5), a);
    }
    if (Random(3) == 2) {
      result = [result[0], Assign(Declare(), result[1])];
    }
    return result;
  }

  function Select(n) {
    AddDeclaration('#include <stdio.h>');
    AddDeclaration('');
    AddDeclaration('int main() {'); ++tabs; ++decl_tabs;
    var val = SelectExpr(n);
    Print(val[1]);
    AddOperation('return 0;');
    --decl_tabs; --tabs; AddOperation('}');
    return val[0];
  }

  var result = Select(2);
  var prog = declarations + operations;
  return [result, prog];
}

function SaveState(state) {
  window.localStorage.setItem('state', JSON.stringify(state));
}

function LoadState() {
  try {
    var data = window.localStorage.getItem('state');
    if (data === null) {
      throw 'fail';
    }
    var result = JSON.parse(data);
    if (result.score === undefined) {
      result.score = 0;
    }
    if (result.level === undefined) {
      result.level = 1;
    }
    if (result.seed === undefined) {
      result.seed = 0;
    }
    return result;
  } catch (e) {
    var result = {score: 0, level: 1, seed: 0};
    SaveState(result);
    return result;
  }
}

var IMAGES = [
  ['http://vignette2.wikia.nocookie.net/angrybirds/images/6/61/20130404-kingpig.png/revision/latest?cb=20130404030723', 100],
  ['http://vignette3.wikia.nocookie.net/angrybirds/images/9/9c/33284ddfa59f2d01916f72da3caa3492.png/revision/latest?cb=20130723084428', 100],
  ['http://vignette3.wikia.nocookie.net/angrybirds/images/9/94/Moustache_pig_sweats.png/revision/latest?cb=20120715013254', 70],
  ['http://vignette4.wikia.nocookie.net/angrybirds/images/4/4d/AB_Pig_Space.png/revision/latest?cb=20120409022934', 100],
  ['http://vignette2.wikia.nocookie.net/angrybirds/images/b/b5/Helmet_pig_copy.png/revision/latest?cb=20130103091722', 70],
  ['http://vignette3.wikia.nocookie.net/angrybirdsfanon/images/f/f0/Angry_Bird_red.png/revision/latest?cb=20130304122242', 70],
  ['http://vignette4.wikia.nocookie.net/angrybirds/images/9/90/Surprised_Chuck.png/revision/latest?cb=20130917102203', 70],
  ['http://vignette2.wikia.nocookie.net/angry-birds-roleplay/images/3/3b/Bomb.png/revision/latest?cb=20140630191947', 100],
  ['http://vignette1.wikia.nocookie.net/angrybirds/images/6/64/BlueBirdToons.png/revision/latest/scale-to-width-down/200?cb=20140415181802', 100],
  ['http://vignette2.wikia.nocookie.net/angrybirds/images/4/4d/WhiteBirdToons.png/revision/latest?cb=20140415182012', 100],
  ['http://vignette2.wikia.nocookie.net/angrybirds/images/9/94/Egg_angry_birds.png/revision/20130917102542', 70],
];

window.onload = function() {
  var answer = document.getElementById('answer');
  var score = document.getElementById('score');
  var go = document.getElementById('go');
  var skip = document.getElementById('skip');
  var prob;
  var state;

  function AddPoint(kind, n) {
    var point = document.createElement('img');
    point.src = IMAGES[kind][0];
    point.height = IMAGES[kind][1];
    score.appendChild(point);
    var text = document.createElement('span');
    text.style = 'font-size: 30px; font-family: San-serif';
    text.innerText = 'x ' + n + '  ';
    score.appendChild(text);
  }

  function ClearPoints() {
    while (score.hasChildNodes()) {
      score.removeChild(score.lastChild);
    }
  }

  function Restore() {
    ClearPoints();
    state = LoadState();
    var columns = IMAGES.length - 1;
    var items = [];
    for (var i = 0; i < columns; ++i) {
      items.push(0);
    }
    var eggs = 0;
    var j = 0;
    for (var i = 0; i < state.score; ++i) {
      if (i % 5 == 1) {
        items[j]++;
        j = (j + 1) % columns;
      } else {
        eggs++;
      }
    }
    for (var i = 0; i < columns; ++i) {
      AddPoint(i, items[i]);
    }
    AddPoint(columns, eggs);
  }

  function NextQuestion() {
    prob = Generate(state);
    question.innerText = prob[1];
    answer.value = '';
    answer.focus();
  }

  function CheckAnswer() {
    if (answer.value === '' + prob[0]) {
      state.score++;
      SaveState(state);
      Restore();
      NextQuestion();
    }
  }

  function SkipQuestion() {
    state.score--;
    if (state.score < 0) {
      state.score = 0;
    }
    SaveState(state);
    Restore();
    NextQuestion();
  }

  Restore();
  NextQuestion();
  go.onclick = CheckAnswer;
  skip.onclick = SkipQuestion;
  answer.onkeypress = function(e) {
    if (e.which === 13) {
      CheckAnswer();
    }
  };
}
