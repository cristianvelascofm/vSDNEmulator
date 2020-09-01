
// Lienzo canvas
var canvas = this._canvas = new fabric.Canvas('canvas');
canvas.backgroundColor = '#EDFAFA';
canvas.renderAll();
var insertOp = false;
var imgUrl = '';
// Declaración de Variables
var netInfo = []; //Contiene todos los Elementos(SwitchOF- Hosts) de la Red, con su PosX, PosY y su Etiqueta
var tagHost = []; //Contiente las Etiquetas(H1,H2,...)de los Hosts de la Red
var tagSwitchOF = []; //Contiente las Etiquetas(S1,S2,...)de los SwitchsOF de la Red
var tagController = [];  // Contiene las Etiquetas(C1, C2, C3..) de los Controladores de Red 
var link = []; //Contiene el Arreglo de Links de la Red
var flag = true; //Control de Uso del Zoom
var topologyType = "";

//Variables para la ejecucion de las Topologías desde Templates

var numHostTemplate = 0;


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
    top: 62,
    left: 22,
    fontFamily: 'arial',
    fill: '#15435d',
    fontSize: 15
  });


  if (tagId.charAt(0) == "s") {
    text.top = 47;
  }

  if (tagId.charAt(0) == "c") {
    text.top = 68;
  }
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

      tagHost[i - 1] = "h" + i;

    }
  }
  // Generador de Etiquetas para Host y SwitchOF Topo Linear 
  else if (topologyType == "linear" || topologyType == "ring") {
    for (var i = 1; i <= numHost; i++) {

      tagHost[i - 1] = "h" + i;
      tagSwitchOF[i - 1] = "s" + i;

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

      tagHost[i - 1] = "h" + i;

    }

    for (var a = 1; a <= total[1]; a++) {
      tagSwitchOF[a - 1] = "s" + a;
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
  } else if (linkType == "portHost") {

    return new fabric.Line(coords, {
      fill: 'yellow',
      stroke: '#E1B13C',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
  }else if(linkType == "portSwitch"){
    
    return new fabric.Line(coords, {
      fill: 'yellow',
      stroke: '#57E3EC',
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    
  }else {

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

      pareja = "(s1," + tagHost[temp - 1] + ")";
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
function topologyMaker(numHost, topologyType, depth, fanout) {

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
        value: "s1",
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
      canvas.add(insertElement(pSX, pSY, '../static/img/openflow_switch.png', 's1', 0));
      //Inserta el Controller de la Red Single
      canvas.add(insertElement(pCX, pCY, '../static/img/controller.png', 'c1', 0));

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
        headers: { 'X-CSRFToken': csrftoken },

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
      canvas.add(insertElement(pCX1, pCY, '../static/img/controller.png', 'c1', 0));
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
      canvas.add(insertElement(pCX, pCY, '../static/img/controller.png', 'c1', 0));

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
    canvas.add(insertElement(100, pCY, '../static/img/controller.png', 'c1', 0));

  }


}
var insertOP = false;
var imgUrl = "";

var x0, y0;
var tool = 'cursor';
var action = 'none';

$(".mode").click(function () {
  tool = $(this).attr('id');
  console.log(tool);
  // var currentTool = document.getElementById("currentTool");
  //currentTool.textContent = "Current Mode: " + tool;
  canvas.isDrawingMode = false; //don't draw until "Freeline" is clicked
});

canvas.observe('mouse:down', function (options) {
  var pointer = canvas.getPointer(options.e);
  x0 = pointer.x; //get initial starting point of x
  y0 = pointer.y; //get initial starting point of y
  var img = '';
  var tag = "";
  switch (tool) {
    case 'cursor':
      break;
    case 'host':
      img = '../static/img/host.png';
      tag = "h" + (tagHost.length + 1);
      tagHost.push(tag);

      console.log(tag);
      element(img, tag, x0, y0);

      break;
    case 'controller':
      img = '../static/img/controller.png';
      tag = "c" + (tagController.length + 1);
      tagController.push(tag);
      console.log(tag);
      element(img, tag, x0, y0);

      break;
    case 'switch_openflow':
      img = '../static/img/openflow_switch.png';
      tag = "s" + (tagSwitchOF.length + 1);
      tagSwitchOF.push(tag);

      element(img, tag, x0, y0);


  }
});

function deleteElement() {

  var object = canvas.getActiveObject();
  if (!object) {
    $.fancybox.open('<div class="message"><h2>Mensaje</h2><p>Selecciona un Elemento Primero</p></div>');
    return "";
  }
  canvas.remove(object);
  insertOp = false;
  activeTool(selector);

}

function element(imagen, tag, x, y) {

  console.log(imagen);

  var img = new Image();
  img.src = imagen;

  var element = new fabric.Image(img);
  element.set({
    scaleX: 0.125,
    scaleY: 0.125,
    padding: 0,
    id: tag,
  });

  var text = new fabric.Textbox(tag, {
    top: 62,
    left: 22,
    fontFamily: 'arial',
    fill: '#15435d',
    fontSize: 15
  });

  if (tag.charAt(0) == "s") {
    text.top = 47;
  }

  if (tag.charAt(0) == "c") {
    text.top = 68;
  }

  var group = new fabric.Group([element, text], {

    left: x,
    top: y,
    hasControls: false,
    transparentCorners: false,
    selectable: true
  });
  //canvas.add(group);

  var port = new Image();
  port.src = "../static/img/port.png";

  var elem = new fabric.Image(port);
  elem.set({
    scaleX: 0.035,
    scaleY: 0.035,
    padding: 0,
    id: tag,
  });

  var e = new fabric.Image(port);
  e.set({
    scaleX: 0.035,
    scaleY: 0.035,
    padding: 0,
    id: tag,
  });

  if (tag.charAt(0) == "h") {

    canvas.add(makeLink([x + 30, y + 35, x + 70, y + 99], "portHost"));
    canvas.add(makeLink([x + 30, y + 35, x - 9, y + 99], "portHost"));

    var pt1 = new fabric.Textbox("eth0", {
      top: 22,
      left: -5,
      fontFamily: 'arial',
      fill: '#15435d',
      fontSize: 15
    });

    var pt2 = new fabric.Textbox("eth1", {
      top: 22,
      left: -5,
      fontFamily: 'arial',
      fill: '#15435d',
      fontSize: 15
    });


    var gp1 = new fabric.Group([e, pt2], {

      left: x + 57,
      top: y + 90,
      hasControls: false,
      transparentCorners: false,
      selectable: true
    });
    canvas.add(group);
    canvas.add(gp1);

    var grp2 = new fabric.Group([elem, pt1], {
      left: x - 18,
      top: y + 90,
      hasControls: false,
      transparentCorners: false,
      selectable: true
    });

    canvas.add(grp2);

  } else if (tag.charAt(0) == "s") {

    console.log(" Aqui esta el SW ");
    var pt = [];
    for (var i = 0; i < 6; i++) {

      pt[i] = new fabric.Textbox("eth" + i, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var ele = new fabric.Image(port);
      ele.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
      });

      var grp = new fabric.Group([ele, pt[i]], {
        left: (i * 48) + x - 108,
        top: y + 90,
        hasControls: false,
        transparentCorners: false,
        selectable: true
      });
      canvas.add(makeLink([x + 30, y + 35, ((i * 48) + x - 108)+15, y + 99], "portSwitch"));
      canvas.add(grp);
      
    }
    canvas.add(group);
  }else if(tag.charAt(0)=="c"){

    canvas.add(group);

  } 

}
//Borrar Todo el Lienzo Canvas
function clearAll() {
  canvas.clear();
}


// Obtener Cockie Djando
var selector = false;

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



// Función Modo Seleccionar
var btnCursor = document.getElementById('cursor');
//btnCursor.focus;


/* Cambio Valores Herramienta Activa*/

function activeTool(val) {

  if (val == true) {
    btnCursor.style.backgroundColor = "#a4e7a4ad";
    imgUrl = '';

  } else {
    btnCursor.style.backgroundColor = "#c9e0f7";
  }
  btnCursor.focus();
}





function lockImageControl(elmt, select) {


  if (select == true) {

    elmt.selectable = true;
    elmt.hasControls = false;
    elmt.hasRotatingPoint = false;
    elmt.borderColor = "#5a0e1075";
    elmt.cornerColor = "#5a0e1075";
    elmt.transparentCorners = true;
    elmt.cornerStyle = "circle";
    elmt.setControlsVisibility({ 'ml': false, 'mb': false, 'mr': false, 'mt': false });

  }
  else {

    elmt.selectable = true;
    elmt.hasControls = false;
    elmt.hasRotatingPoint = false;


  }

}

/* Menú Topologías Template */

function topologyTemplate(x) {
  switch (x.id) {

    case "minimalTopo":

      numHost = 2;
      topologyType = "single";
      tagGenerator(numHost, topologyType, 0, 0);
      topologyMaker(numHost, topologyType, 0, 0);

      break;
    case "singleTopo":

      topologyType = "single";
      frameFancyBox(topologyType);


      break;

    case "linearTopo":

      topologyType = "linear";
      frameFancyBox(topologyType);

      break;

    case "anilloTopo":

      topologyType = "ring";
      frameFancyBox(topologyType);


      break;

    case "treeTopo":

      topologyType = "tree";
      frameFancyBox(topologyType);


      break;
  }
}

/* Variables para Formulario Template FancyBox */
var inputHostTemplate = $('#inputHostTemplate');
var inputFanoutT = $('#inputFanoutTemplate');
var inputDepthT = $('#inputDepthTemplate');

/* Envio parametros (FancyBox) para crear Topologia Tree */
function frameFancyBox(id) {

  if (id != 'tree') {
    inputHostTemplate.val(2);
    inputHostTemplate.select();
    $.fancybox.open($('.divFormTemplate'), {
      touch: false,
      modal: false,
      infobar: false,
      clickSlide: false,
      clickOutside: false,

    });
  } else {
    inputDepthT.val(1);
    inputDepthT.select();
    inputFanoutT.val(2);
    $.fancybox.open($('.divFormTree'), {
      touch: false,
      modal: false,
      infobar: false,
      clickSlide: false,
      clickOutside: false,
    });
  }


}
/* Envio parametros (FancyBox) para crear Topologia */
$('#createButtonTemplate').on('click', function () {
  console.log('enter');
  var templateForm = document.forms['formulario'];
  var value = templateForm['inputHostTemplate'].value;
  numHostTemplate = parseInt(value);

  tagGenerator(numHostTemplate, topologyType, 0, 0);
  topologyMaker(numHostTemplate, topologyType, 0, 0);
  parent.jQuery.fancybox.close();


});
/* Opciones de enter en el Formulario (FancyBox) para parametros Topologia */
$("#inputHostTemplate").keypress(function (e) {
  var code = (e.keyCode ? e.keyCode : e.which);

  if (code == 13) {

    e.preventDefault();

    $('#createButtonTemplate').trigger('click');


  }
});


/* Envio parametros (FancyBox) para crear Topologia Tree */
$('#createButtonTree').on('click', function () {

  var templateForm = document.forms['formularioTree'];
  var dp = templateForm['inputDepthTemplate'].value;
  var fn = templateForm['inputFanoutTemplate'].value;
  var numDepthTemplate = parseInt(dp);
  var numFanoutTemplate = parseInt(fn);
  tagGenerator(0, topologyType, numDepthTemplate, numFanoutTemplate);
  topologyMaker(0, topologyType, numDepthTemplate, numFanoutTemplate);

  parent.jQuery.fancybox.close();


});
/* Opciones de enter en el Formulario (FancyBox) para parametros Topologia Tree */
$("#inputDepthTemplate").keypress(function (e) {
  var code = (e.keyCode ? e.keyCode : e.which);

  if (code == 13) {

    e.preventDefault();
    $('#inputFanoutTemplate').focus();
    $('#inputFanoutTemplate').select();

  }
});

$("#inputFanoutTemplate").keypress(function (e) {
  var code = (e.keyCode ? e.keyCode : e.which);

  if (code == 13) {

    e.preventDefault();
    $('#createButtonTree').trigger('click');

  }
});