'use strict';

function Generate() {
  var var_names = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'foo', 'bar', 'baz',
  ];

  var operators = {
  };

  function Random(n) {
    return Math.floor(Math.random() * n);
  }

  function AllocVar() {
    var pick = Random(var_names.length);
    var name = var_names[pick];
    var_names.splice(pick, 1);
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

  function Declare() {
    var name = AllocVar();
    AddDeclaration('int ' + name + ';');
    return name;
  }

  function Assign(name, e) {
    AddOperation(name + ' = ' + e + ';');
    return name;
  }

  function DoOp(a, op, b) {
    if (a.indexOf(' ') >= 0) {
      a = '(' + a + ')';
    }
    if (b.indexOf(' ') >= 0) {
      b = '(' + b + ')';
    }
    return a + ' ' + op + ' ' + b;
  }

  function UnOp(op, a) {
    if (a.indexOf(' ') >= 0) {
      a = '(' + a + ')';
    }
    return op + ' ' + a;
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

  function SelectExpr(n) {
    if (n <= 0) {
      var val = Random(10);
      return [val, PickConstant(val)];
    }
    if (Random(4) === 0) {
      var val = Random(10);
      return [val, '' + val];
    }
    if (Random(5) === 0) {
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
    if (Random(5) === 0) {
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
    var result;
    var a = SelectExpr(n - 1);
    if (Random(4) !== 0) {
      var b = SelectExpr(n - 1);
      switch (Random(16)) {
        case 0:
          result = [a[0] + b[0], DoOp(a[1], '+', b[1])]; break;
        case 1:
          result = [a[0] - b[0], DoOp(a[1], '-', b[1])]; break;
        case 2:
          result = [a[0] * b[0], DoOp(a[1], '*', b[1])]; break;
        case 3:
          result = [a[0] < b[0] ? 1 : 0, DoOp(a[1], '<', b[1])]; break;
        case 4:
          result = [a[0] > b[0] ? 1 : 0, DoOp(a[1], '>', b[1])]; break;
        case 5:
          result = [a[0] <= b[0] ? 1 : 0, DoOp(a[1], '<=', b[1])]; break;
        case 6:
          result = [a[0] >= b[0] ? 1 : 0, DoOp(a[1], '>=', b[1])]; break;
        case 7:
          result = [a[0] === b[0] ? 1 : 0, DoOp(a[1], '==', b[1])]; break;
        case 8:
          result = [a[0] !== b[0] ? 1 : 0, DoOp(a[1], '!=', b[1])]; break;
        case 9:
          result = [(a[0] && b[0]) ? 1 : 0, DoOp(a[1], '&&', b[1])]; break;
        case 10:
          result = [(a[0] || b[0]) ? 1 : 0, DoOp(a[1], '||', b[1])]; break;
        case 11:
          b = Fix0(b);
          result = [a[0] % b[0], DoOp(a[1], '%', b[1])]; break;
        case 12:
          b = Fix0(b);
          result = [Math.floor(a[0] / b[0]), DoOp(a[1], '/', b[1])]; break;
        case 13:
          result = [a[0] & b[0], DoOp(a[1], '&', b[1])]; break;
        case 14:
          result = [a[0] | b[0], DoOp(a[1], '|', b[1])]; break;
        case 15:
          result = [a[0] ^ b[0], DoOp(a[1], '^', b[1])]; break;
      }
    } else {
      switch (Random(3)) {
        case 0: result = [!a[0] ? 1 : 0, UnOp('!', a[1])]; break;
        case 1: result = [-a[0], UnOp('-', a[1])]; break;
        case 2: result = [~a[0], UnOp('~', a[1])]; break;
      }
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
    if (result.score === undefined || result.level === undefined) {
      throw 'fail';
    }
    return result;
  } catch (e) {
    var result = {score: 0, level: 1};
    SaveState(result);
    return result;
  }
}

window.onload = function() {
  var answer = document.getElementById('answer');
  var score = document.getElementById('score');
  var go = document.getElementById('go');
  var prob;
  var state;

  function PickKind(n) {
    var group = Math.floor(n / 5);
    if (n % 5 === 0) {
      return group % 10;
    } else {
      return -1;
    }
  }
  function AddPoint(n) {
    var point = document.createElement('img');
    n = PickKind(n);
    if (n === 0) {
      point.src = 'http://vignette2.wikia.nocookie.net/angrybirds/images/6/61/20130404-kingpig.png/revision/latest?cb=20130404030723';
      point.height = 100;
    } else if (n === 1) {
      point.src = 'http://vignette3.wikia.nocookie.net/angrybirds/images/9/9c/33284ddfa59f2d01916f72da3caa3492.png/revision/latest?cb=20130723084428';
      point.height = 100;
    } else if (n === 2) {
      point.src = 'http://vignette3.wikia.nocookie.net/angrybirds/images/9/94/Moustache_pig_sweats.png/revision/latest?cb=20120715013254';
      point.height = 70;
    } else if (n === 3) {
      point.src = 'http://vignette4.wikia.nocookie.net/angrybirds/images/4/4d/AB_Pig_Space.png/revision/latest?cb=20120409022934';
      point.height = 100;
    } else if (n === 4) {
      point.src = 'http://vignette2.wikia.nocookie.net/angrybirds/images/b/b5/Helmet_pig_copy.png/revision/latest?cb=20130103091722';
      point.height = 70;
    } else if (n === 5) {
      point.src = 'http://vignette3.wikia.nocookie.net/angrybirdsfanon/images/f/f0/Angry_Bird_red.png/revision/latest?cb=20130304122242';
      point.height = 70;
    } else if (n === 6) {
      point.src = 'http://vignette4.wikia.nocookie.net/angrybirds/images/9/90/Surprised_Chuck.png/revision/latest?cb=20130917102203';
      point.height = 70;
    } else if (n === 7) {
      point.src = 'http://vignette2.wikia.nocookie.net/angry-birds-roleplay/images/3/3b/Bomb.png/revision/latest?cb=20140630191947';
      point.height = 100;
    } else if (n === 8) {
      point.src = 'http://vignette1.wikia.nocookie.net/angrybirds/images/6/64/BlueBirdToons.png/revision/latest/scale-to-width-down/200?cb=20140415181802';
      point.height = 100;
    } else if (n === 9) {
      point.src = 'http://vignette2.wikia.nocookie.net/angrybirds/images/4/4d/WhiteBirdToons.png/revision/latest?cb=20140415182012';
      point.height = 100;
    } else {
      point.src = 'http://vignette2.wikia.nocookie.net/angrybirds/images/9/94/Egg_angry_birds.png/revision/20130917102542';
      point.height = 70;
    }
    score.appendChild(point);
  }

  function Restore() {
    state = LoadState();
    for (var i = 0; i < state.score; ++i) {
      AddPoint(i);
    }
  }

  function NextQuestion() {
    prob = Generate();
    question.innerText = prob[1];
    answer.value = '';
    answer.focus();
  }

  function CheckAnswer() {
    if (answer.value === '' + prob[0]) {
      AddPoint(state.score);
      state.score++;
      SaveState(state);
      NextQuestion();
    }
  }

  Restore();
  NextQuestion();
  go.onclick = CheckAnswer;
  answer.onkeypress = function(e) {
    if (e.which === 13) {
      CheckAnswer();
    }
  };
}
