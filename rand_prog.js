function Generate() {
  var var_names = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'foo', 'bar', 'baz',
  ];

  function Random(n) {
    return pick = Math.floor(Math.random() * n);
  }

  function AllocVar() {
    var pick = Random(var_names.length);
    var name = var_names[pick];
    var_names.splice(pick, 1);
    return name;
  }

  var declarations = '';
  var operations = '';

  function PickConstant(n) {
    var name = AllocVar();
    declarations += 'int ' + name + ' = ' + n + ';\n';
    return name;
  }

  function Assign(e) {
    var name = AllocVar();
    declarations += 'int ' + name + ';\n';
    operations += name + ' = ' + e + ';\n';
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

  function Print(e) {
    operations += 'printf("%d\\n", ' + e + ');\n';
  }

  function SelectExpr(n) {
    if (n <= 0) {
      var val = Random(10);
      return [val, PickConstant(val)];
    }
    if (Random(3) == 2) {
      var val = Random(10);
      return [val, '' + val];
    }
    var a = SelectExpr(n - 1);
    var b = SelectExpr(n - 1);
    var result;
    switch (Random(4)) {
      case 0: result = [a[0] + b[0], DoOp(a[1], '+', b[1])]; break;
      case 1: result = [a[0] - b[0], DoOp(a[1], '-', b[1])]; break;
      case 2: result = [a[0] * b[0], DoOp(a[1], '*', b[1])]; break;
      case 3: result = [a[0] < b[0] ? 1 : 0, DoOp(a[1], '<', b[1])]; break;
    }
    if (Random(3) == 2) {
      result = [result[0], Assign(result[1])];
    }
    return result;
  }

  function Select(n) {
    var val = SelectExpr(n);
    Print(val[1]);
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
    var data = window.localStorage('state');
    return JSON.parse(data);
  } catch (e) {
    return {score: 0};
  }
}

window.onload = function() {
  var answer = document.getElementById('answer');
  var score = document.getElementById('score');
  var go = document.getElementById('go');
  var prob;
  var state;

  function AddPoint() {
    var point = document.createElement('img');
    point.height = 100;
    point.src = 'http://vignette2.wikia.nocookie.net/angrybirds/images/6/61/20130404-kingpig.png/revision/latest?cb=20130404030723';
    score.appendChild(point);
  }

  function Restore() {
    state = LoadState();
    for (var i = 0; i < state.score; ++i) {
      AddPoint();
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
      AddPoint();
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
