
// Lienzo canvas
var canvas = this._canvas = new fabric.Canvas('canvas');
canvas.backgroundColor = '#EDFAFA';
canvas.renderAll();


// Declaración de Variables
var netInfo = []; //Contiene todos los Elementos(SwitchOF- Hosts) de la Red, con su PosX, PosY y su Etiqueta
var tagHost = []; //Contiente las Etiquetas(H1,H2,...)de los Hosts de la Red
var tagSwitchOF = []; //Contiente las Etiquetas(S1,S2,...)de los SwitchsOF de la Red
var link = []; //Contiene el Arreglo de Links de la Red
var flag = true; //Control de Uso del Zoom


// Zoom Lienzo Mediante el Moviemiento del Scroll del Mouse
canvas.on('mouse:wheel', function (opt) {
  if (flag == true) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

})

// Crea un Grupo con el Elemento y su Etiqueta Respectíva
function insertElement(posX, posY, image, tagId, line) {

  var img = new Image();
  img.src = image;

  var element = new fabric.Image(img);
  element.set({
    scaleX: 0.125,
    scaleY: 0.125,
    padding: 0,
    id: tagId,
  });

  var text = new fabric.Textbox(tagId, {
    top: 0,
    left: -15,
    fontFamily: 'arial',
    fill: '#0D6BA0',
    fontSize: 15
  });

  var group = new fabric.Group([element, text], {

    left: posX,
    top: posY,
    hasControls: false,
    transparentCorners: false,
    selectable: true
  });

  group.line = line;

  return group;

}


//Generador de Etiquetas para tagHost[] y tagSwitchOF[]
function tagGenerator(numHost, topologyType, depth, fanout) {

  // Generadoor de Etiquetas para Host  Topo Single
  if (topologyType == "single") {
    for (var i = 1; i <= numHost; i++) {

      tagHost[i - 1] = "H" + i;

    }
  }
  // Generador de Etiquetas para Host y SwitchOF Topo Linear 
  else if (topologyType == "linear" || topologyType == "ring") {
    for (var i = 1; i <= numHost; i++) {

      tagHost[i - 1] = "H" + i;
      tagSwitchOF[i - 1] = "S" + i;

    }
  }
  // Generador de Etiquetas para Host y SwitchOF Topo Anillo 
  else if (topologyType == "ring") {

  }
  // Generador de Etiquetas para Host y SwitchOF Topo Árbol 
  else if (topologyType == "tree") {
    console.log("tag");
    var total = totalElementTree(depth, fanout);

    for (var i = 1; i <= total[0]; i++) {

      tagHost[i - 1] = "H" + i;

    }

    for (var a = 1; a <= total[1]; a++) {
      tagSwitchOF[a - 1] = "S" + a;
    }
  }
}


// Identificador y Creador de la Linea del Link
function makeLink(coords, linkType) {

  if (linkType == "normal") {

    return new fabric.Line(coords, {
      fill: 'red',
      stroke: '#8BDF66',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
  } else {

    return new fabric.Line(coords, {
      strokeDashArray: [5, 5],
      stroke: 'blue',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
  }

}


// Creador de Enlaces de la Red
function linkMaker(topologyType) {

  var pareja;
  var k = [];//Contiene Todas las Parejas Enlazadas en la Red

  // Creador de Enlaces de la Red Linear
  if (topologyType == "linear") {

    // Creador de Pares de Conexión Según la Red
    for (var temp = 1; temp <= tagHost.length; temp++) {

      if (temp < tagHost.length) {
        pareja = "(" + tagSwitchOF[temp - 1] + "," + tagHost[temp - 1] + ")";
        k.push(pareja);
        pareja = "(" + tagSwitchOF[temp - 1] + "," + tagHost[temp] + ")";
        k.push(pareja);

      }
      else {
        pareja = "(" + tagSwitchOF[temp - 1] + "," + tagHost[temp - 1] + ")";
        k.push(pareja);
      }
    }
    console.log("Conexiones:" + k);

    for (var l = 0; l < netInfo.length; l++) {
      if (l + 1 != netInfo.length) {
        xInicial = netInfo[l].rX;
        yInicial = netInfo[l].rY;

        xFinal = netInfo[l + 1].rX;
        yFinal = netInfo[l + 1].rY;
        var line = makeLink([xInicial + 25, yInicial + 35, xFinal + 25, yFinal + 35], "normal");
        link[l] = line;

        canvas.add(line);
      }
    }
  }
  // // Creador de Enlaces de la Red Single
  else if (topologyType == "single") {

    // Creador de Pares de Conexión según la Red
    for (var temp = 1; temp <= tagHost.length; temp++) {

      pareja = "(S1," + tagHost[temp - 1] + ")";
      k[temp - 1] = pareja;

    }
    console.log("Conexiones:" + k);

    // puntos iniciales del switch
    xInicial = netInfo[netInfo.length - 1].rX;
    yInicial = netInfo[netInfo.length - 1].rY;

    for (var y = 0; y < netInfo.length - 1; y++) {

      xFinal = netInfo[y].rX;
      yFinal = netInfo[y].rY;
      var line = makeLink([xInicial + 25, yInicial, xFinal + 28, yFinal + 25], "normal");
      link[y] = line;

      canvas.add(line);

    }
  }
  else if (topologyType == "ring") {

    // Creador de Pares de Conexión según la Red
    for (var temp = 1; temp <= tagHost.length; temp++) {

      pareja = "(" + tagSwitchOF[temp - 1] + "," + tagHost[temp - 1] + ")";
      k.push(pareja);

    }
    console.log("Conexiones:" + k);

    // puntos iniciales del switch
    xInicial = netInfo[netInfo.length - 1].rX;
    yInicial = netInfo[netInfo.length - 1].rY;


  }


  // Creador de Enlaces de la Red en Árbol
  else if (topologyType == "tree") {

  }
}

// Total de Host y SwitchsOF Topologia Tree
function totalElementTree(depth, fanout) {
  var total = [];//numero de Host , numero de SwitchOF
  var temp = 0;
  for (var i = 0; i <= depth; i++) {
    temp += Math.pow(fanout, i);
  }

  var totalSwitch = temp - (Math.pow(fanout, depth));
  total = [(Math.pow(fanout, depth)), totalSwitch];
  return total;
}



//Creador de Topologías
function topolyMaker(numHost, topologyType, depth, fanout) {

  var posX = [];
  var image = "";
  var pSX = (tagHost.length * 68);
  var pSY = (2 * 58);
  var pCX = tagHost.length * 68;
  var pCY = 20;
  var h = [];
  var s = [];

  // Creador Topología Single - 1 Conmutador Conectado a N Host
  if (topologyType == "single") {

    if (numHost < 2) {
      alert("No es Posible Realizar la Red");

    } else {
      for (var r = 0; r < tagHost.length; r++) {

        var pY = 3 * 60;
        posX[r] = (r + 1) * 100;
        image = 'img/host.png';
        var obj = {
          value: tagHost[r],
          rX: posX[r],
          rY: pY
        };
        netInfo.push(obj);
        h[r] = obj;
      }

      //Insert SwitchOF de la Red Single
      var objt = {
        value: "S1",
        rX: pSX + 20,
        rY: pSY + 20
      };
      netInfo.push(objt);

      linkMaker(topologyType);

      // Agrega el Link del Controller
      canvas.add(makeLink([pSX + 33, pSY + 20, pCX + 35, pCY + 20], "cont"));

      // Insertar Elementos de Red
      for (var a = 0; a < h.length; a++) {

        canvas.add(insertElement(h[a].rX, h[a].rY, "../static/img/host.png", tagHost[a], 0));

      }
      //Inserta el SwithcOF de la Red Single
      canvas.add(insertElement(pSX, pSY, '../static/img/openflow_switch.png', 'S1', 0));
      //Inserta el Controller de la Red Single
      canvas.add(insertElement(pCX, pCY, '../static/img/controller.png', '', 0));

      // Variables JSON
      console.log(netInfo);
      var json = JSON.stringify(netInfo[0]);
      console.log('esto es un json: ' + json);
      const csrftoken = getCookie('csrftoken');

      /*
            const res = axios.post('http://127.0.0.1:3000/alambric_emulator/', json, {
              headers: {
                // Overwrite Axios's automatically set Content-Type
                'Content-Type': 'application/json'
              }
            });
      
      
      /*
            axios({
              method: 'post',
              url: 'http://127.0.0.1:3000/alambric_emulator/',
              data: json,
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
              }
            });*/

      $.ajax({
        type: "post",//get- consutla post- se actualiza
        url: "http://127.0.0.1:3000/alambric_emulator/",
        /* url: "../static/py/algo.py",*/
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        data: json,
        headers: {'X-CSRFToken': csrftoken},

        /*success: function (data) {
          alert(JSON.stringify(data));
        }*/
      });



    }

  }
  // Creador Topología Linear - N Conmutador Conectado a N Host
  else if (topologyType == "linear") {


    if (numHost < 2) {
      alert("No es Posible Realizar la Red");

    } else {
      // Host
      for (var r = 0; r < tagHost.length; r++) {

        var pY = 3 * 60;
        posX[r] = (r + 1) * 180;
        image = 'img/host.png';
        var obj = {
          value: tagHost[r],
          rX: posX[r],
          rY: pY
        };

        var objSw = {
          value: tagSwitchOF[r],
          rX: posX[r] + 90,
          rY: pY
        };

        netInfo.push(obj);
        h[r] = obj;

        netInfo.push(objSw);
        s[r] = objSw;


      }

      linkMaker(topologyType);
      var pCX1 = (netInfo.length * 68);

      // Inserta los Links desde el SwitchOF al Controller de la Topología Linear
      for (var u = 0; u < s.length; u++) {

        canvas.add(makeLink([(s[u].rX) + 28, (s[u].rY) + 35, pCX1 + 28, pCY + 20], "cont"));
      }

      // Inserta Switch y Host de la Topolgía Linear
      for (var a = 0; a < h.length; a++) {

        canvas.add(insertElement(h[a].rX, h[a].rY, '../static/img/host.png', tagHost[a], 0));
        canvas.add(insertElement(s[a].rX, s[a].rY, '../static/img/openflow_switch.png', tagSwitchOF[a], 0));

      }

      //Inserta el Controller de la Topología Linear
      canvas.add(insertElement(pCX1, pCY, '../static/img/controller.png', '', 0));
    }
  }
  //Creador Topología Ring - N Host conectados a N Conmutadores (conectados entre sí)
  else if (topologyType == "ring") {

    if (numHost < 2) {
      alert("No es Posible Realizar la Red");

    } else {

      for (var r = 0; r < tagHost.length; r++) {

        var pY = 5 * 60;
        posX[r] = ((r + 1) * 130);
        image = '../static/img/openflow_switch.png';
        var obj = {
          value: tagHost[r],
          rX: posX[r],
          rY: pY
        };
        netInfo.push(obj);
        h[r] = obj;
      }

      for (var r = 0; r < tagSwitchOF.length; r++) {

        var pY = 3 * 60;
        posX[r] = ((r + 1) * 130);
        image = '../static/img/openflow_switch.png';
        var obj = {
          value: tagSwitchOF[r],
          rX: posX[r],
          rY: pY
        };
        netInfo.push(obj);
        s[r] = obj;
      }
      linkMaker(topologyType);
      //Inserta los Enlances desde Los SwitchOF a los Hosts
      for (var m = 0; m < s.length; m++) {

        var xI = s[m].rX;
        var yI = s[m].rY;
        var xF = h[m].rX;
        var yF = h[m].rY;

        var line = makeLink([xI + 25, yI + 35, xF + 25, yF + 35], "normal");
        link[m] = line;
        canvas.add(line);

      }


      for (var u = 0; u < s.length; u++) {
        if (u + 1 < h.length) {
          canvas.add(makeLink([(s[u].rX) + 28, (s[u].rY) + 35, (s[u + 1].rX) + 28, (s[u + 1].rY) + 35], "cont"));
        }

      }


      // Inserta los Links desde los SwitchOF al Controller de la Topología Linear
      for (var u = 0; u < s.length; u++) {

        canvas.add(makeLink([(s[u].rX) + 28, (s[u].rY) + 35, pCX + 28, pCY + 20], "cont"));
      }

      //Inserta los SwitchOF Topologia Ring
      for (var a = 0; a < s.length; a++) {

        canvas.add(insertElement(s[a].rX, s[a].rY, '../static/img/openflow_switch.png', tagSwitchOF[a], 0));

      }

      //Inserta los Hosts Topología Ring
      for (var a = 0; a < h.length; a++) {

        canvas.add(insertElement(h[a].rX, h[a].rY, '../static/img/host.png', tagHost[a], 0));

      }

      //Inserta el Controller  Topología Ring
      canvas.add(insertElement(pCX, pCY, '../static/img/controller.png', '', 0));

    }

  }
  //Creador Topología Tree - Deapth -> Número de Niveles, Fannout -> Apertura  por Nivel (A^F)
  else if (topologyType == "tree") {

    var posY = [];
    var totalLevel = depth + 1;
    var lastLevel = Math.pow(fanout, depth);
    var level = []; //Contiene el Número de Elementos por Nivel

    //Numero de Elementos por Nivel
    for (var i = 0; i < totalLevel; i++) {

      level[i] = Math.pow(fanout, i);

    }

    //Inserta los Host de la Topología Tree (Altura Fija)
    for (var r = 0; r < tagHost.length; r++) {

      var pY = totalLevel * 80;
      posX[r] = (r + 1) * 100;
      image = '../static/img/host.png';
      canvas.add(insertElement(posX[r], pY, image, tagHost[r], 0));

    }

    var t = 0; //Genera el Indice del tagSwitchOF[]

    for (var i = 0; i < level.length; i++) {

      for (var e = 1; e <= level[i]; e++) {

        var image = '';

        if (lastLevel == level[i]) {

          image = '';

        } else {

          posX[e] = e * 100;
          posY[i] = (i * 60) + 100;
          image = '../static/img/openflow_switch.png';
          canvas.add(insertElement(posX[e], posY[i], image, tagSwitchOF[t], 0));
        }
        t++;
      }
    }


    //Inserta el Controller  Topología Tree
    canvas.add(insertElement(100, pCY, '../static/img/controller.png', '', 0));

  }


}

// Menú del Panel de Herramientas
function option(x) {

  switch (x.id) {

    case "cursor":
      var topologyType = prompt("Tipo de Topología:");
      var numHost;


      // Topología Minimal - Caso Particular de Topología Single N=2
      if (topologyType == "minimal") {
        numHost = 2;
        topologyType = "single";
        tagGenerator(numHost, topologyType, 0, 0);
        topolyMaker(numHost, topologyType, 0, 0);

      }
      else if (topologyType == "tree") {
        var d = prompt("Niveles de la topología: "); // Número de Niveles
        var f = prompt("Aperturas por nodo: ");  // Apertura
        var depth = parseInt(d);
        var fanout = parseInt(f);
        tagGenerator(0, topologyType, depth, fanout);
        topolyMaker(0, topologyType, depth, fanout);
      }
      else {
        var nH = prompt("Número de Host: ");
        numHost = parseInt(nH);
        tagGenerator(numHost, topologyType, 0, 0);
        topolyMaker(numHost, topologyType, 0, 0);
      }


      break;

    case "host":
      var o = {} // empty Object
      var key = 'Orientation Sensor';
      o[key] = []; // empty Array, which you can push() values into


      var data = {
        sampleTime: '1450632410296',
        data: '76.36731:3.4651554:0.5665419'
      };
      var data2 = {
        sampleTime: '1450632410296',
        data: '78.15431:0.5247617:-0.20050584'
      };
      o[key].push(data);
      o[key].push(data2);

      var json = JSON.stringify(o);

      var fs = require('fs');

      fs.writeFile('myjsonfile.json', json, 'utf8', function (err) {
        if (err) {
          console.log(err);
        }
        console.log('Archivo creado ');
      });

      break;

    case "switch_openflow":

      break;

    case "switch_legacy":

      break;

    case "router_legacy":

      break;

    case "controller":

      break;

    case "link":

      break;

    case "delete":

      break;
  }
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
