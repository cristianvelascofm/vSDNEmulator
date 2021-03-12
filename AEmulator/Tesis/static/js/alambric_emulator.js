
/* ********--------------*******************------------------***************------------*/
// Etiqueta Hover para los elementos
var labelTextController = new fabric.IText("label", {
  left: 5,
  top: 5,
  fontFamily: 'Helvetica',
  fill: '#333',
  lineHeight: 1.1,
  fontSize: 13,

});

window.oncontextmenu = function () {
  return false;
}


var boxWidth = labelTextController.getScaledWidth();
var rectangleController = new fabric.Rect({
  left: 0,
  top: 0,
  width: boxWidth + 10,
  height: 25,
  fill: 'white',
  strokeWidth: 2,
  stroke: 'rgba(100,200,200,0.5)'
});

var groupLabelController = new fabric.Group([rectangleController, labelTextController], {
  left: 30,
  top: 30,
  opacity: 1,
  hasControls: false,
  hasBorders: true,
  transparentCorners: false,
  selectable: false,
  visible: false,
  id: "float",
  connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[]))   
});

groupLabelController.setShadow("10px 10px 5px rgba(94, 128, 191, 0.2)");

window.onload = function () {
  canvas.add(groupLabelController);
  canvas.discardActiveObject();
  canvas.renderAll();
}

// Lienzo canvas
var canvas = this._canvas = new fabric.Canvas('canvas', {
  fireRightClick: true,
  fireMiddleClick: true
});
canvas.backgroundColor = '#EDFAFA';
canvas.renderAll();
var insertOp = false;
var imgUrl = '';
// Declaración de Variables
var netInfo = []; //Contiene todos los Elementos(SwitchOF- Hosts) de la Red, con su PosX, PosY y su Etiqueta
var tagHost = []; //Contiente las Etiquetas(H1,H2,...)de los Hosts de la Red
var tagSwitchOF = []; //Contiente las Etiquetas(S1,S2,...)de los SwitchsOF de la Red
var tagController = []; // Contiene las Etiquetas(C1, C2, C3..) de los Controladores de Red 
var link = []; //Contiene el Arreglo de Links de la Red
var flag = true; //Control de Uso del Zoom
var topologyType = "";


var elements = [];//contiene todos los elementos de red y su configuración
var elemento = {}


//variables necesarias para la gestion del grafico del trafico generado

var labelsGraphic = [];
var datosYNumBytes = [];
var datosYBitsPerSecond = [];
var datosYSndCwnd = [];
var datosYRetransmits = [];
var datosYRtt = [];
var datosYRttVar = [];
var datosYPmtu = [];

//Datos del Trafico generado
var trafficData = {}

//Variables para la ejecucion de las Topologías desde Templates

var numHostTemplate = 0;
var numDepthTemplate = 0;
var numFanoutTemplate = 0;


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

// Inserta una Topología con los elementos correspondientes
function insertElement(x, y, image, tag, numHost, topology) {
  var img = new Image();
  img.src = image;
  console.log(tag);

  var connection = {

    type: "",
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    id: "",
    elementOrigin: "",
    elementFinal: "",

  };


  var elemento = new fabric.Image(img);
  elemento.set({
    scaleX: 0.125,
    scaleY: 0.125,
    padding: 0,
    id: tag,
    elementConnection: [], // Contiene las conexiones pertenecientes al elmento
    connectionLine: [], // Contiene todos los enlaces (lineas (makeLine())) del elemento
  });

  var text = new fabric.Textbox(tag, {
    top: 62,
    left: 22,
    fontFamily: 'arial',
    fill: '#15435d',
    fontSize: 15
  });
  if (topology == "single") {


    if (tag.charAt(0) == 'h') {

      var groupHost = new fabric.Group([elemento, text], {

        left: x,
        top: y + 160,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 

      });

      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x + 30;
      connection.y1 = y + 195;
      connection.x2 = (x + (1 * 65)) - 35;
      connection.y2 = y + 107;
      connection.id = "a" + 0;
      elemento.elementConnection.push(connection);

      var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portHost");

      elemento.connectionLine.push(link);
      groupHost.connection.push(link);


      var line = elemento.connectionLine[0];
      groupHost.line = line;
      var port = new Image();
      port.src = "../static/img/port.png";

      var pt = new fabric.Image(port);
      pt.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      pt.connectionLine.push(elemento.connectionLine[0]);

      var label = new fabric.Textbox("eth" + 0, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupHostPort = new fabric.Group([pt, label], {

        left: (x + (1 * 65)) - 48,
        top: y + 100,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Hp',// HostPort
        id: "eth" + 0,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });
      var li = elemento.connectionLine[0];
      groupHostPort.connection.push(elemento.connectionLine[0]);
      groupHost.li = li;
      canvas.add(groupHost.connection[0]);
      canvas.add(groupHostPort);
      canvas.add(groupHost);
      tagHost.push(tag);

    } else if (tag.charAt(0) == 's') {

      var groupSwitch = new fabric.Group([elemento, text], {

        left: ((numHost * 100) / 2) + 35,
        top: y,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
        type: null,
      });

      // Creación de lineas por cada enlace
      for (var i = 0; i < numHost; i++) {

        connection.type = "association";
        connection.elementOrigin = tag;
        connection.x1 = ((numHost * 100) / 2) + 65;
        connection.y1 = y + 35;
        connection.x2 = (x + (i * 100)) + 26;
        connection.y2 = y + 107;
        connection.id = "a" + i;
        elemento.elementConnection.push(connection);

        var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");

        elemento.connectionLine.push(link);
        groupSwitch.connection.push(link);

      }

      // Asociamos el grupo con cada enlace
      for (var i = 0; i < numHost; i++) {

        var line = elemento.connectionLine[i];
        groupSwitch.line = line;

      }

      var port = new Image();
      port.src = "../static/img/port.png";
      for (var i = 0; i < numHost; i++) {

        var asociate = elemento.elementConnection[i].elementOrigin;

        if (asociate.charAt(0) == "s") {

          var pt = new fabric.Image(port);
          pt.set({
            scaleX: 0.035,
            scaleY: 0.035,
            padding: 0,
            id: tag,
            connectionLine: [], // Contenedor de las lineas de conexión.
          });

          // Asignación de lineas por cada puerto  
          pt.connectionLine.push(elemento.connectionLine[i]);

          var label = new fabric.Textbox("eth" + i, {
            top: 22,
            left: -5,
            fontFamily: 'arial',
            fill: '#15435d',
            fontSize: 15
          });

          var groupSwitchPort = new fabric.Group([pt, label], {

            //left: (x + (i * 100)) - 19,
            left: (x + (i * 100)) + 15,
            top: y + 100,
            hasControls: false,
            hasBorders: false,
            transparentCorners: false,
            selectable: true,
            elementContainer: tag,
            identificator: 'Sp',//SwitchPort
            id: "eth" + i,
            connection: [], // Contenedor de lineas de conexión del grupo.

          });

          groupSwitchPort.connection.push(elemento.connectionLine[i]);

          var li = elemento.connectionLine[i];

          // Asignación de lineas por cada puerto en el grupo
          groupSwitch.link = li;
          canvas.add(groupSwitch.connection[i]);
          canvas.add(groupSwitchPort);
        }

      }
      canvas.add(groupSwitch);
      tagSwitchOF.push("s" + (tagSwitchOF.length + 1));

    } else if (tag.charAt(0) == 'c') {

      var groupController = new fabric.Group([elemento, text], {

        left: ((numHost * 100) / 2) + 35,
        top: y,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
        type: null,
      });

      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x2 = ((numHost * 100) / 2) + 65;
      connection.y2 = y + 35;
      connection.x1 = ((numHost * 100) / 2) + 65;
      connection.y1 = y + 125;
      connection.id = "a" + 0;
      elemento.elementConnection.push(connection);

      var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "normal");

      elemento.connectionLine.push(link);
      groupController.connection.push(link);

      var line = elemento.connectionLine[0];
      groupController.line = line;

      canvas.add(groupController);

      //groupController.

      tagController.push(tag);
      canvas.add(link);
      canvas.sendToBack(link);

      canvas.forEachObject(function (obj) {

        var id1 = "s" + tagSwitchOF.length;

        if (obj.id == id1) {
          obj.link = link;
          console.log(obj.id);
          obj.connection.push(link);
        }

      });



    }
  } else if (topology == "linear") {
    if (tag.charAt(0) == 'h') {

      var groupHost = new fabric.Group([elemento, text], {
        left: x,
        top: y + 160,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [],
      });


      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x + 30;
      connection.y1 = y + 195;
      connection.x2 = (x + (1 * 65)) - 35;
      connection.y2 = y + 107;
      connection.id = "a" + 0;

      var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portHost");
      groupHost.connection.push(link);



      var line = groupHost.connection[i];
      groupHost.line = line;


      var port = new Image();
      port.src = "../static/img/port.png";


      var pt = new fabric.Image(port);
      pt.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
      });

      var label = new fabric.Textbox("eth" + 0, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupHostPort = new fabric.Group([pt, label], {

        left: (x + (1 * 65)) - 48,
        top: y + 100,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Hp',
        id: "eth" + 0,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });
      groupHostPort.connection.push(groupHost.connection[0]);

      var l = groupHost.connection[0];

      canvas.add(groupHost.connection[0]);
      canvas.add(groupHostPort);

      canvas.add(groupHost);
      tagHost.push("h" + (tagHost.length + 1));

    } else if (tag.charAt(0) == 's') {

      var groupSwitch = new fabric.Group([elemento, text], {

        //left: ((numHost * 100) / 2) + 35,
        left: x - 90,
        top: y - 35,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
        type: null
      });

      var port = new Image();
      port.src = "../static/img/port.png";

      var tagS = [];
      tagS.push(tag);

      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x - 60;
      connection.y1 = y - 3;
      connection.x2 = (x - 130);
      connection.y2 = y - 3;
      connection.id = "a" + 0;

      var link0 = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");
      groupSwitch.connection.push(link0);


      var pt0 = new fabric.Image(port);
      pt0.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      //pt0.connectionLine.push(elemento.connectionLine[0]);

      var label0 = new fabric.Textbox("eth" + 0, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupSwitchPort0 = new fabric.Group([pt0, label0], {

        //left: (x + (i * 100)) - 19,
        left: (x - 145),
        top: y - 10,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Sp',
        id: "eth" + 0,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });

      var line0 = groupSwitch.connection[0];

      groupSwitchPort0.connection.push(groupSwitch.connection[0]);
      groupSwitchPort0.line = line0;


      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x - 60;
      connection.y1 = y;
      connection.x2 = x - 60;
      connection.y2 = y + 48;
      connection.id = "a" + 1;

      var link1 = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");
      groupSwitch.connection.push(link1);


      var pt1 = new fabric.Image(port);
      pt1.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      // pt1.connectionLine.push(groupSwitch.connection[1]);

      var label1 = new fabric.Textbox("eth" + 1, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupSwitchPort1 = new fabric.Group([pt1, label1], {

        //left: (x + (i * 100)) - 19,
        left: (x - 73),
        top: y + 48,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Sp',
        id: "eth" + 1,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });

      var line1 = groupSwitch.connection[1];

      groupSwitchPort1.connection.push(groupSwitch.connection[1]);
      groupSwitchPort1.line = line1;





      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x - 60;
      connection.y1 = y - 1;
      connection.x2 = x + 30;
      connection.y2 = y - 3;
      connection.id = "a" + 2;

      var link2 = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");
      groupSwitch.connection.push(link2);



      var pt2 = new fabric.Image(port);
      pt2.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      //pt0.connectionLine.push(elemento.connectionLine[0]);

      var label2 = new fabric.Textbox("eth" + 2, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupSwitchPort2 = new fabric.Group([pt2, label2], {

        //left: (x + (i * 100)) - 19,
        left: (x + 10),
        top: y - 10,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Sp',
        id: "eth" + 2,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });

      var line2 = groupSwitch.connection[2];

      groupSwitchPort2.connection.push(groupSwitch.connection[2]);
      groupSwitchPort2.line = line2;

      groupSwitchPort0.connection.push(groupSwitch.connection[0]);
      groupSwitchPort0.line = line0;

      canvas.add(groupSwitch.connection[0]);
      canvas.add(groupSwitch.connection[1]);
      canvas.add(groupSwitch.connection[2]);
      canvas.add(groupSwitchPort0);
      canvas.add(groupSwitchPort1);
      canvas.add(groupSwitchPort2);





      // }
      canvas.add(groupSwitch);
      tagSwitchOF.push("s" + (tagSwitchOF.length + 1));

    } else if (tag.charAt(0) == 'c') {

      var groupController = new fabric.Group([elemento, text], {

        left: (144 * numHost),
        top: y,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
        type: null
      });

      for (var i = 0; i < numHost; i++) {

        connection.type = "association";
        connection.elementOrigin = tag;
        connection.x2 = (numHost * 144) + 30; //punto del Controlador
        connection.y2 = y + 35;
        connection.x1 = ((i * 235) + 280);// punto del Switch
        connection.y1 = y + 225;
        connection.id = "a" + i;

        var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "normal");
        groupController.connection.push(link);

      }

      for (var i = 0; i < numHost; i++) {

        var line = groupController.connection[i];
        groupController.line = line;
        canvas.add(line);
        canvas.sendToBack(line);

      }

      canvas.add(groupController);
      tagController.push(tag);

      var tagLastSwitch = [];

      for (var i = tagSwitchOF.length - numHost; i < tagSwitchOF.length; i++) {

        tagLastSwitch.push(tagSwitchOF[i]);

      }

      canvas.forEachObject(function (obj) {

        for (var i = 0; i < groupController.connection.length; i++) {

          var link = groupController.connection[i];

          if (obj.id == tagLastSwitch[i]) {

            obj.link = link;
            obj.connection.push(link);

          }
        }

      });

    }


  } else if (topology == "ring") {

    if (tag.charAt(0) == 'h') {

      var groupHost = new fabric.Group([elemento, text], {
        left: x,
        top: y + 160,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [],
      });


      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x + 30;
      connection.y1 = y + 195;
      connection.x2 = (x + (1 * 65)) - 35;
      connection.y2 = y + 107;
      connection.id = "a" + 0;

      var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portHost");
      groupHost.connection.push(link);



      var line = groupHost.connection[i];
      groupHost.line = line;


      var port = new Image();
      port.src = "../static/img/port.png";


      var pt = new fabric.Image(port);
      pt.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
      });

      var label = new fabric.Textbox("eth" + 0, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupHostPort = new fabric.Group([pt, label], {

        left: (x + (1 * 65)) - 48,
        top: y + 100,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Hp',
        id: "eth" + 0,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });
      groupHostPort.connection.push(groupHost.connection[0]);

      var l = groupHost.connection[0];

      canvas.add(groupHost.connection[0]);
      canvas.add(groupHostPort);

      canvas.add(groupHost);
      tagHost.push("h" + (tagHost.length + 1));

    } else if (tag.charAt(0) == 's') {

      var groupSwitch = new fabric.Group([elemento, text], {

        //left: ((numHost * 100) / 2) + 35,
        left: x - 90,
        top: y - 35,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
        type: null
      });

      var port = new Image();
      port.src = "../static/img/port.png";

      var tagS = [];
      tagS.push(tag);

      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x - 60;
      connection.y1 = y - 3;
      connection.x2 = (x - 130);
      connection.y2 = y - 3;
      connection.id = "a" + 0;

      var link0 = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");
      groupSwitch.connection.push(link0);


      var pt0 = new fabric.Image(port);
      pt0.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      //pt0.connectionLine.push(elemento.connectionLine[0]);

      var label0 = new fabric.Textbox("eth" + 0, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupSwitchPort0 = new fabric.Group([pt0, label0], {

        //left: (x + (i * 100)) - 19,
        left: (x - 145),
        top: y - 10,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Sp',
        id: "eth" + 0,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });

      var line0 = groupSwitch.connection[0];

      groupSwitchPort0.connection.push(groupSwitch.connection[0]);
      groupSwitchPort0.line = line0;


      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x - 60;
      connection.y1 = y;
      connection.x2 = x - 60;
      connection.y2 = y + 48;
      connection.id = "a" + 1;

      var link1 = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");
      groupSwitch.connection.push(link1);


      var pt1 = new fabric.Image(port);
      pt1.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      // pt1.connectionLine.push(groupSwitch.connection[1]);

      var label1 = new fabric.Textbox("eth" + 1, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupSwitchPort1 = new fabric.Group([pt1, label1], {

        //left: (x + (i * 100)) - 19,
        left: (x - 73),
        top: y + 48,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Sp',
        id: "eth" + 1,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });

      var line1 = groupSwitch.connection[1];

      groupSwitchPort1.connection.push(groupSwitch.connection[1]);
      groupSwitchPort1.line = line1;





      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x - 60;
      connection.y1 = y - 1;
      connection.x2 = x + 30;
      connection.y2 = y - 3;
      connection.id = "a" + 2;

      var link2 = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");
      groupSwitch.connection.push(link2);



      var pt2 = new fabric.Image(port);
      pt2.set({
        scaleX: 0.035,
        scaleY: 0.035,
        padding: 0,
        id: tag,
        connectionLine: [], // Contenedor de las lineas de conexión.
      });

      // Asignación de lineas por cada puerto  
      //pt0.connectionLine.push(elemento.connectionLine[0]);

      var label2 = new fabric.Textbox("eth" + 2, {
        top: 22,
        left: -5,
        fontFamily: 'arial',
        fill: '#15435d',
        fontSize: 15
      });

      var groupSwitchPort2 = new fabric.Group([pt2, label2], {

        //left: (x + (i * 100)) - 19,
        left: (x + 10),
        top: y - 10,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        elementContainer: tag,
        identificator: 'Sp',
        id: "eth" + 2,
        connection: [], // Contenedor de lineas de conexión del grupo.

      });

      var line2 = groupSwitch.connection[2];

      groupSwitchPort2.connection.push(groupSwitch.connection[2]);
      groupSwitchPort2.line = line2;

      groupSwitchPort0.connection.push(groupSwitch.connection[0]);
      groupSwitchPort0.line = line0;

      canvas.add(groupSwitch.connection[0]);
      canvas.add(groupSwitch.connection[1]);
      canvas.add(groupSwitch.connection[2]);
      canvas.add(groupSwitchPort0);
      canvas.add(groupSwitchPort1);
      canvas.add(groupSwitchPort2);





      // }
      canvas.add(groupSwitch);
      tagSwitchOF.push("s" + (tagSwitchOF.length + 1));

    } else if (tag.charAt(0) == 'c') {

      var groupController = new fabric.Group([elemento, text], {

        left: (144 * numHost),
        top: y,
        hasControls: false,
        hasBorders: false,
        transparentCorners: false,
        selectable: true,
        id: tag,
        connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
        type: null
      });

      for (var i = 0; i < numHost; i++) {

        connection.type = "association";
        connection.elementOrigin = tag;
        connection.x2 = (numHost * 144) + 30; //punto del Controlador
        connection.y2 = y + 35;
        connection.x1 = ((i * 235) + 280);// punto del Switch
        connection.y1 = y + 225;
        connection.id = "a" + i;

        var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "normal");
        groupController.connection.push(link);

      }

      for (var i = 0; i < numHost; i++) {

        var line = groupController.connection[i];
        groupController.line = line;
        canvas.add(line);
        canvas.sendToBack(line);

      }

      canvas.add(groupController);
      tagController.push(tag);

      var tagLastSwitch = [];

      for (var i = tagSwitchOF.length - numHost; i < tagSwitchOF.length; i++) {

        tagLastSwitch.push(tagSwitchOF[i]);

      }

      canvas.forEachObject(function (obj) {

        for (var i = 0; i < groupController.connection.length; i++) {

          var link = groupController.connection[i];

          if (obj.id == tagLastSwitch[i]) {

            obj.link = link;
            obj.connection.push(link);

          }
        }

      });

    }


  }

}

// Identificador y Creador de la Linea del Link
function makeLink(coords, linkType) {

  if (linkType == "normal") {

    return new fabric.Line(coords, {
      fill: 'red',
      stroke: '#9733FA',
      strokeWidth: 2,
      selectable: true,
      hasBorders: false,
      hasControls: false,
      /*   lockMovementX: true,
         lockMovementY: true,
         lockScalingX: true,
         lockScalingY: true,
         lockUniScaling: true,
         lockRotation: true,*/
      // evented: false,
      id: "normal",
    });
  } else if (linkType == "portHost") {

    return new fabric.Line(coords, {
      fill: 'yellow',
      stroke: '#E1B13C',
      strokeWidth: 2,
      selectable: true,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      lockRotation: true,
      // evented: false,
      id: "portHost",
    });
  } else if (linkType == "link") {

    return new fabric.Line(coords, {
      fill: 'green',
      stroke: '#2AFE00',
      strokeWidth: 2,
      selectable: true,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      lockRotation: true,
      //evented: false,
      id: "link",
    });

  } else if (linkType == "portSwitch") {

    return new fabric.Line(coords, {
      fill: 'yellow',
      stroke: '#57E3EC',
      strokeWidth: 2,
      selectable: true,
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockUniScaling: true,
      lockRotation: true,
      //evented: false,
      id: "portSwitch",
    });

  } else {

    return new fabric.Line(coords, {
      strokeDashArray: [5, 5],
      stroke: 'blue',
      strokeWidth: 2,
      selectable: true,
      /* lockMovementX: true,
       lockMovementY: true,
       lockScalingX: true,
       lockScalingY: true,
       lockUniScaling: true,
       lockRotation: true,*/
      // evented: false,
      id: "normal",
    });
  }

}


// Creador de Enlaces de la Red
function linkMaker(topologyType) {

  var pareja;
  var k = []; //Contiene Todas las Parejas Enlazadas en la Red

  // Creador de Enlaces de la Red Linear
  if (topologyType == "linear") {

    // Creador de Pares de Conexión Según la Red
    for (var temp = 1; temp <= tagHost.length; temp++) {

      if (temp < tagHost.length) {
        pareja = "(" + tagSwitchOF[temp - 1] + "," + tagHost[temp - 1] + ")";
        k.push(pareja);
        pareja = "(" + tagSwitchOF[temp - 1] + "," + tagHost[temp] + ")";
        k.push(pareja);

      } else {
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

      //canvas.add(line);

    }
  } else if (topologyType == "ring") {

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
  var total = []; //numero de Host , numero de SwitchOF
  var temp = 0;
  for (var i = 0; i <= depth; i++) {
    temp += Math.pow(fanout, i);
  }

  var totalSwitch = temp - (Math.pow(fanout, depth));
  total = [(Math.pow(fanout, depth)), totalSwitch];
  return total;
}

//Car
function loadInfoElements() {
  canvas.forEachObject(function (obj) {
    //Recopila la información de cada Host
    if (obj.id.charAt(0) == 'h') {

      var element = {
        id: obj.id,
        rX: obj.left,
        rY: obj.top,
        ipHost: obj.ipHost,
        shedule: obj.sheduler,
        cpuLimit: obj.cpuLimit,
        cpuCores: obj.cpuCores
      };
      elements.push(element);
    } else if (obj.id.charAt(0) == 's') { //Recopila la información de cada Switch
      var element = {
        id: obj.id,
        rX: obj.left,
        rY: obj.top,
        verbose: obj.verbose,
        batch: obj.batch,
        inNameSpace: obj.inNameSpace,
        inBand: obj.inBand,
        modej: obj.model,
        dataPathArgs: obj.dataPathArgs,
        dataPathIP: obj.dataPathIP,
        dataPath: obj.dataPath,
        protocol: obj.protocol,
        dpctlPort: obj.dpctlPort,
        ipSwitch: obj.ipSwitch,
        stpPriority: obj.stpPriority,
        stp: obj.stp,
        type: obj.type
      };
      elements.push(element);

    } else if (obj.id.charAt(0) == 'c') { //Recopila la información de cada Controlador
      var element = {
        id: obj.id,
        rX: obj.left,
        rY: obj.top,
        type: obj.type,
        iPController: obj.iPController,
        portController: obj.portController,
        protocol: obj.protocol

      };
      elements.push(element);

    } else if (obj.id.charAt(0) == 'l') {//Recopila la información de cada Asociacion tipo Link
      var element = {
        id: obj.id,
        rX: obj.left,
        rY: obj.top,
        loss: obj.loss,
        queue: obj.queue,
        jitter: obj.jitter,
        delay: obj.delay,
        bw: obj.bw,
        connection: obj.connectionLink,
        intfName1: obj.intfName1,
        intfName2: obj.intfName2

      };
      elements.push(element);

    } else if (obj.id.charAt(1) == 'a') { //Para los Labels identifica la letra a de lAbel - Recopila la información de cada Label
      var element = {
        id: obj.id,
        rX: obj.left,
        rY: obj.top,
        label: obj.label,

      }
      elements.push(element);
    } else if (obj.id.charAt(0) == 'e') {
      var element = {
        id: obj.id,
        rX: obj.left,
        rY: obj.top,
        iPPort: obj.iPPort
      }
      elements.push(element);
    }
  });
}


//Creador de Topologías
function topologyMaker(numHost, topologyType, depth, fanout) {

  var posX = [];
  var image = "";
  //var pSX = (tagHost.length * 68);
  var pSX = 800;
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
      for (var r = 0; r < numHost; r++) {

        var pY = 3 * 60;
        posX[r] = (r + 1) * 100; // Separación entre Host
        image = 'img/host.png';
        var obj = {
          value: tagHost[tagHost.length + r + 1],
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
        rY: pSY + 20 //Valor de distanciamiento en Y del Host
      };
      netInfo.push(objt);

      linkMaker(topologyType);


      // Insertar Elementos de Red
      for (var a = 0; a < h.length; a++) {

        insertElement(h[a].rX, h[a].rY, "../static/img/host.png", "h" + (tagHost.length + 1), numHost, topologyType);
      }

      //Inserta el SwithcOF de la Red Single
      insertElement(101, pSY, '../static/img/openflow_switch.png', "s" + (tagSwitchOF.length + 1), numHost, topologyType);

      //Inserta el Controller de la Red Single
      insertElement(pCX, pCY, '../static/img/controller.png', 'c' + (tagController.length + 1), numHost, topologyType);

      // Esta sección Crea Los Links y Las Asociaciones al Controlador de la Red Single
      var id0 = [];
      var id1 = "";
      var posX1 = [];
      var posY1 = [];
      var posX2 = [];
      var posY2 = [];
      var objHost = [];
      var objSwitch = [];
      var objController = [];


      for (var i = (tagHost.length) - numHost; i <= tagHost.length; i++) {// Toma los útlimos hosts agregados previamente

        id0.push("h" + (i + 1));//Armamos el id del host necesitado
        canvas.forEachObject(function (obj) {

          if (obj.elementContainer && obj.elementContainer == id0[i - 1]) {

            posX2.push(obj.connection[0].x2);
            posY2.push(obj.connection[0].y2);
            objHost.push(obj);



          }

        });
      }

      canvas.forEachObject(function (obj) {
        id1 = "s" + tagSwitchOF.length;

        if (obj.elementContainer && obj.elementContainer == id1) {

          posX1.push(obj.connection[0].x2);
          posY1.push(obj.connection[0].y2);
          objSwitch.push(obj);

        }
      });

      for (var s = 0; s < posX1.length; s++) {

        var link = makeLink([posX1[s], posY1[s], posX2[s], posY2[s]], "link");
        canvas.add(link);
        canvas.sendToBack(link);

        objSwitch[s].state = "connected";
        objHost[s].state = "connected";
        objSwitch[s].connection.push(link);
        objHost[s].connection.push(link);

        objSwitch[s].link = link;
        objHost[s].link = link;

        //Emparejamiento
        link.connectionLink = objSwitch[s].elementContainer + "," + objHost[s].elementContainer;
        link.intfName1 = objSwitch[s].elementContainer + "-" + objSwitch[s].id;
        link.intfName2 = objHost[s].elementContainer + "-" + objHost[s].id;


      }


    }

  }
  // Creador Topología Linear - N Conmutador Conectado a N Host cada uno
  else if (topologyType == "linear") {

    if (numHost < 2) {
      alert("No es Posible Realizar la Red");

    } else {
      // Host
      for (var r = 0; r < numHost; r++) {

        var pY = 3 * 60;
        posX[r] = (r + 1) * 240;
        image = 'img/host.png';
        var obj = {
          value: tagHost[r],
          rX: posX[r],
          rY: pY + 80,
        };

        var objSw = {
          value: tagSwitchOF[r],
          rX: posX[r] + 90,
          rY: pY + 80,
        };

        netInfo.push(obj);
        h[r] = obj;

        netInfo.push(objSw);
        s[r] = objSw;


      }

      var pCX1 = (netInfo.length * 68);

      // Inserta Switch y Host de la Topolgía Linear
      for (var a = 0; a < h.length; a++) {

        (insertElement(h[a].rX, h[a].rY, '../static/img/host.png', 'h' + (tagHost.length + 1), numHost, topologyType));
        (insertElement(s[a].rX, s[a].rY, '../static/img/openflow_switch.png', 's' + (tagSwitchOF.length + 1), numHost, topologyType));
      }

      var port0Delete = "s" + (tagSwitchOF.length - numHost + 1);
      var port2Delete = "s" + tagSwitchOF.length;
      canvas.forEachObject(function (obj) {

        if (obj.elementContainer == port0Delete && obj.id == "eth0") {

          canvas.remove(obj);
          canvas.remove(obj.line);
        }
        if (obj.elementContainer == port2Delete && obj.id == "eth2") {

          canvas.remove(obj);
          canvas.remove(obj.line);
        }
      });

      //Inserta el Controller de la Topología Linear
      (insertElement(pCX1, pCY, '../static/img/controller.png', 'c' + +(tagController.length + 1), numHost, topologyType));
    }
    // Esta sección Crea Los Links y Las Asociaciones al Controlador de la Red Linear
    var id0 = [];
    var id1 = [];
    var posX1 = [];
    var posY1 = [];
    var posX2 = [];
    var posY2 = [];
    var objHost = [];
    var objSwitch = [];
    var objController = [];

    // **--** Esta seccion busca y enlaza los eth0 de los Host y los eth1 de los Switchs ** -- ** -- ** -- ** -- **--** --** -- **
    for (var i = (tagHost.length) - numHost; i <= tagHost.length; i++) {
      id0.push("h" + (i + 1));
      canvas.forEachObject(function (obj) {

        if (obj.elementContainer && obj.elementContainer == id0[i - 1]) {

          if (obj.id == "eth0") {
            posX2.push(obj.connection[0].x2);
            posY2.push(obj.connection[0].y2);
            objHost.push(obj);
          }
        }
      });
    }

    for (var i = (tagSwitchOF.length) - numHost; i <= tagSwitchOF.length; i++) {
      id1.push("s" + (i + 1));
      canvas.forEachObject(function (obj) {
        if (obj.elementContainer && obj.elementContainer == id1[i - 1]) {
          if (obj.id == "eth1") {

            posX1.push(obj.connection[0].x2);
            posY1.push(obj.connection[0].y2);
            objSwitch.push(obj);
          }
        }
      });
    }

    for (var s = 0; s < posX1.length; s++) {

      var link = makeLink([posX1[s], posY1[s], posX2[s], posY2[s]], "link");
      canvas.add(link);
      canvas.sendToBack(link);

      objSwitch[s].state = "connected";
      objHost[s].state = "connected";
      objSwitch[s].connection.push(link);
      objHost[s].connection.push(link);

      objSwitch[s].link = link;
      objHost[s].link = link;

      //Emparejamiento
      link.connectionLink = objSwitch[s].elementContainer + "," + objHost[s].elementContainer;
      link.intfName1 = objSwitch[s].elementContainer + "-" + objSwitch[s].id;
      link.intfName2 = objHost[s].elementContainer + "-" + objHost[s].id;


    }
    // **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- **


    id0 = [];
    id1 = [];
    posX1 = [];
    posY1 = [];
    posX2 = [];
    posY2 = [];
    objHost = [];
    objSwitch = [];
    objController = [];
    var objSwitchAux = [];

    // **--** Esta seccion busca y enlaza los eth0 de los Switchs y los eth2 de los Switchs ** -- ** -- ** -- ** -- **--** --** -- **
    for (var i = (tagSwitchOF.length) - numHost; i <= tagSwitchOF.length; i++) {
      id0.push("s" + (i + 1));
      canvas.forEachObject(function (obj) {

        if (obj.elementContainer && obj.elementContainer == id0[i - 1]) {

          if (obj.id == "eth0") {
            posX2.push(obj.connection[0].x2);
            posY2.push(obj.connection[0].y2);
            obj.position = "terminal";
            objSwitchAux.push(obj);

          }


        }
      });
    }
    console.log(objSwitchAux[0].id);

    for (var i = (tagSwitchOF.length) - numHost; i <= tagSwitchOF.length; i++) {
      id1.push("s" + (i + 1));
      canvas.forEachObject(function (obj) {
        if (obj.elementContainer && obj.elementContainer == id1[i - 1]) {
          if (obj.id == "eth2") {

            posX1.push(obj.connection[0].x2);
            posY1.push(obj.connection[0].y2);
            obj.position = "initial";
            objSwitch.push(obj);

          }
        }
      });
    }

    for (var s = 0; s < posX1.length; s++) {

      var link = makeLink([posX2[s], posY2[s], posX1[s], posY1[s]], "link");
      canvas.add(link);
      canvas.sendToBack(link);

      objSwitch[s].state = "connected";
      objSwitchAux[s].state = "connected";
      objSwitch[s].connection.push(link);
      objSwitchAux[s].connection.push(link);

      objSwitch[s].link = link;
      objSwitchAux[s].link = link;

      //Emparejamiento
      link.connectionLink = objSwitch[s].elementContainer + "," + objSwitchAux[s].elementContainer;
      link.intfName1 = objSwitch[s].elementContainer + "-" + objSwitch[s].id;
      link.intfName2 = objSwitchAux[s].elementContainer + "-" + objSwitchAux[s].id;


    }
    // **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- **

  }


  //Creador Topología Ring - N Host conectados a N Conmutadores (conectados entre sí)
  else if (topologyType == "ring") {

    if (numHost < 2) {
      alert("No es Posible Realizar la Red");

    } else {
      // Host
      for (var r = 0; r < numHost; r++) {

        var pY = 3 * 60;
        posX[r] = (r + 1) * 240;
        image = 'img/host.png';
        var obj = {
          value: tagHost[r],
          rX: posX[r],
          rY: pY + 80,
        };

        var objSw = {
          value: tagSwitchOF[r],
          rX: posX[r] + 90,
          rY: pY + 80,
        };

        netInfo.push(obj);
        h[r] = obj;

        netInfo.push(objSw);
        s[r] = objSw;


      }

      var pCX1 = (netInfo.length * 68);

      // Inserta Switch y Host de la Topolgía Ring
      for (var a = 0; a < h.length; a++) {

        (insertElement(h[a].rX, h[a].rY, '../static/img/host.png', 'h' + (tagHost.length + 1), numHost, topologyType));
        (insertElement(s[a].rX, s[a].rY, '../static/img/openflow_switch.png', 's' + (tagSwitchOF.length + 1), numHost, topologyType));
      }

      var objPort0;
      var objPort2;
      var port0Delete = "s" + (tagSwitchOF.length - numHost + 1);
      var port2Delete = "s" + tagSwitchOF.length;
      canvas.forEachObject(function (obj) {

        if (obj.elementContainer == port0Delete && obj.id == "eth0") {
          objPort0 = obj;
          canvas.remove(obj);
          canvas.remove(obj.line);
        }
        if (obj.elementContainer == port2Delete && obj.id == "eth2") {
          objPort2 = obj;
          canvas.remove(obj);
          canvas.remove(obj.line);
        }
      });

      //Inserta el Controller de la Topología Ring
      (insertElement(pCX1, pCY, '../static/img/controller.png', 'c' + +(tagController.length + 1), numHost, topologyType));
    }

    var id0 = [];
    var id1 = [];
    var posX1 = [];
    var posY1 = [];
    var posX2 = [];
    var posY2 = [];
    var objHost = [];
    var objSwitch = [];
    var objController = [];

    // **--** Esta seccion busca y enlaza los eth0 de los Host y los eth1 de los Switchs ** -- ** -- ** -- ** -- **--** --** -- **
    for (var i = (tagHost.length) - numHost; i <= tagHost.length; i++) {
      id0.push("h" + (i + 1));
      canvas.forEachObject(function (obj) {

        if (obj.elementContainer && obj.elementContainer == id0[i - 1]) {

          if (obj.id == "eth0") {
            posX2.push(obj.connection[0].x2);
            posY2.push(obj.connection[0].y2);

            objHost.push(obj);
          }
        }
      });
    }

    for (var i = (tagSwitchOF.length) - numHost; i <= tagSwitchOF.length; i++) {
      id1.push("s" + (i + 1));
      canvas.forEachObject(function (obj) {
        if (obj.elementContainer && obj.elementContainer == id1[i - 1]) {
          if (obj.id == "eth1") {

            posX1.push(obj.connection[0].x2);
            posY1.push(obj.connection[0].y2);

            objSwitch.push(obj);
          }
        }
      });
    }

    for (var s = 0; s < posX1.length; s++) {

      var link = makeLink([posX1[s], posY1[s], posX2[s], posY2[s]], "link");
      canvas.add(link);
      canvas.sendToBack(link);

      objSwitch[s].state = "connected";
      objHost[s].state = "connected";
      objSwitch[s].connection.push(link);
      objHost[s].connection.push(link);

      objSwitch[s].link = link;
      objHost[s].link = link;

    }
    // **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- **


    id0 = [];
    id1 = [];
    posX1 = [];
    posY1 = [];
    posX2 = [];
    posY2 = [];
    objHost = [];
    objSwitch = [];
    objController = [];
    var objSwitchAux = [];

    // **--** Esta seccion busca y enlaza los eth0 de los Switchs y los eth2 de los Switchs ** -- ** -- ** -- ** -- **--** --** -- **
    for (var i = (tagSwitchOF.length) - numHost; i <= tagSwitchOF.length; i++) {
      id0.push("s" + (i + 1));
      canvas.forEachObject(function (obj) {

        if (obj.elementContainer && obj.elementContainer == id0[i - 1]) {

          if (obj.id == "eth0") {
            posX2.push(obj.connection[0].x2);
            posY2.push(obj.connection[0].y2);
            obj.position = "terminal";
            objSwitchAux.push(obj);
          }


        }
      });
    }
    console.log(objSwitchAux[0].id);

    for (var i = (tagSwitchOF.length) - numHost; i <= tagSwitchOF.length; i++) {
      id1.push("s" + (i + 1));
      canvas.forEachObject(function (obj) {
        if (obj.elementContainer && obj.elementContainer == id1[i - 1]) {
          if (obj.id == "eth2") {

            posX1.push(obj.connection[0].x2);
            posY1.push(obj.connection[0].y2);
            obj.position = "initial";
            objSwitch.push(obj);
          }
        }
      });
    }

    for (var s = 0; s < posX1.length; s++) {

      var link = makeLink([posX2[s], posY2[s], posX1[s], posY1[s]], "link");
      canvas.add(link);
      canvas.sendToBack(link);

      objSwitch[s].state = "connected";
      objSwitchAux[s].state = "connected";
      objSwitch[s].connection.push(link);
      objSwitchAux[s].connection.push(link);

      objSwitch[s].link = link;
      objSwitchAux[s].link = link;
      //Emparejamiento
      link.connectionLink = objSwitch[s].elementContainer + "," + objSwitchAux[s].elementContainer;
      link.intfName1 = objSwitch[s].elementContainer + "-" + objSwitch[s].id;
      link.intfName2 = objSwitchAux[s].elementContainer + "-" + objSwitchAux[s].id;


    }
    // **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- ** **--** --** -- ** -- ** -- **



    objPort0.top = 280;
    objPort0.line.set({ 'y2': 288 });
    objPort2.top = 280;
    objPort2.line.set({ 'y2': 288 });

    canvas.add(objPort0);
    canvas.add(objPort2);
    canvas.add(objPort0.line);
    canvas.add(objPort2.line);
    canvas.sendToBack(objPort0.line);
    canvas.sendToBack(objPort2.line);
    var l = makeLink([objPort0.line.get('x2'), objPort0.line.get('y2'), objPort2.line.get('x2'), objPort2.line.get('y2')], "link");

    objPort0.position = "terminal";
    objPort0.connection.push(l);
    objPort2.position = "initial";
    objPort2.connection.push(l);
    objPort0.state = "connected";
    objPort2.state = "connected";
    objPort0.line = l;
    objPort2.line = l;


    //Emparejamiento
    l.connectionLink = objPort0.elementContainer + "," + objPort2.elementContainer;
    l.intfName1 = objPort0.elementContainer + "-" + objPort0.id;
    l.intfName2 = objPort2.elementContainer + "-" + objPort2.id;


    canvas.add(l);
    canvas.sendToBack(l);
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


//Variables Controlar Eventos en el Canvas

var insertOP = false;
var imgUrl = "";
var selected = null;
var x0, y0;
var tool = 'cursor';
var action = null;
var countAsociate = 0;
var tag = "";
var img = '';
var objectActiveLinkInitial = null;
var objectActiveLinkFinal = null;

//Identifica que Herramienta está seleccionada y la fija
$(".mode").click(function () {
  tool = $(this).attr('id');
  activeTool(tool);
});


//Deteccion Doble Click en el Canvas
canvas.on("mouse:dblclick", function (options) {

  switch (tool) {
    case 'cursor':

      //Se lanza el FancyBox Correspondiente del Objeto Activo 

      var objActive = canvas.getActiveObject();
      var divFancy = "";
      action = "visor";

      if (objActive != null) {
        var objId = objActive.id.charAt(0);
        tag = objActive.id;

        $("#labelFancyController").text("Controlador: " + tag);
        if (objId == "c") {

          var type = objActive.type;
          var iPController = objActive.iPController;
          var portController = objActive.portController;
          var protocol = objActive.protocol;

          $("#optionTypeFancyController > option[value='" + type + "']").prop("selected", "selected");
          $('#inputFancyIpController').val(iPController);
          $('#inputFancyPuertoController').val(portController);
          $("#optionProtocolFancyController > option[value='" + protocol + "']").prop("selected", 'selected');

          divFancy = ".divFancyController";

        } else if (objId == "h") {
          $('#labelFancyHost').text('Host: ' + objActive.id);
          var iPHost = objActive.iPHost;
          var sheduler = objActive.sheduler;
          var cpuLimit = objActive.cpuLimit;
          var cpuCores = objActive.cpuCores;

          $('#inputFancyIPHost').val(iPHost);
          $("#optionShedulerFancyHost > option[value='" + sheduler + "']").prop("selected", "selected");
          $('#inputFancyCpuLimitHost').val(cpuLimit);
          $('#inputFancyCPUCoresHost').val(cpuCores);

          divFancy = ".divFancyHost";

        } else if (objId == "s") {

          var type = objActive.type;
          var stp = objActive.stp;
          var stpPriority = objActive.stpPriority;
          var ipSwitch = objActive.ipSwitch;
          var dpctlPort = objActive.dpctlPort;
          var protocol = objActive.protocol;
          var dataPath = objActive.dataPath;
          var dataPathIP = objActive.dataPathIP;
          var dataPathArgs = objActive.dataPathArgs;
          var model = objActive.model;
          var inBand = objActive.inBand;
          var inNameSpace = objActive.inNameSpace;
          var batch = objActive.batch;
          var verbose = objActive.verbose;

          $('#optionTypeFancySwitch option:selected').text(type);
          $('#STPFancySwitch:checkbox:checked').val(stp);
          $('#inputFancySTPPriority').val(stpPriority);
          $('#inputFancyIPSwitch').val(ipSwitch);
          $('#inputFancyDPCTLPort').val(dpctlPort);
          $('#optionProtocolFancySwitch option:selected').text(protocol);
          $('#optionDataPathFancySwitch option:selected').text(dataPath);
          $('#inputFancyDataPathIDSwitch').val(dataPathIP);
          $('#inputFancyOfDataPathArgsSwitch').val(dataPathArgs);
          $('#optionFailModeFancySwitch option:selected').text(model);
          $('#InBandFancySwitch:checkbox:checked').val(inBand);
          $('#InNameSpaceFancySwitch:checkbox:checked').val(inNameSpace);
          $('#BatchFancySwitch:checkbox:checked').val(batch);
          $('#VerboseFancySwitch:checkbox:checked').val(verbose);

          divFancy = ".divFancySwitch";


        }





        //Se lanza el Fancy Box del Elemento Activo
        $.fancybox.open($(divFancy), {
          touch: false,
          modal: true,
          infobar: false,
          clickSlide: false,
          clickOutside: false,
        });

      }

      break;
  }
});

//Deteccion Mouse Object Hover en el Lienzo Canvas
canvas.observe('mouse:over', function (options) {
  var pointer = canvas.getPointer(options.e);
  x0 = pointer.x; //Obtiene la Posición Inicial de x respecto al Mouse
  y0 = pointer.y; //Obtiene la Posición Inicial de y respecto al Mouse

  switch (tool) {

    case 'cursor':
      //Se Identifica el Elemento y Si tiene Características Asignadas las Muestra en un Texto Flotante

      if (options.target != null) {

        var objId = options.target.id.charAt(0);
        var boxWidth = 0;
        var boxHeight = 0;
        var visibility = false;

        if (objId == "c") {

          if (options.target.type == "Por defecto" && options.target.iPController != "") {

            groupLabelController.item(1).set({
              text: options.target.type + "\n" + options.target.iPController,
            });
            boxWidth = groupLabelController.item(1).getScaledWidth();
            boxHeight = groupLabelController.item(1).getScaledHeight();
            visibility = true;

          } else if (options.target.type != "Por defecto" && options.target.iPController == "") {
            var type = options.target.type;
            if (type == "OpenFlow Reference Implementation") {
              type = "OpenFlow R.I."
            }
            groupLabelController.item(1).set({
              text: type,
            });
            boxWidth = groupLabelController.item(1).getScaledWidth();
            boxHeight = groupLabelController.item(1).getScaledHeight();
            visibility = true;
          } else if (options.target.type != "Por defecto" && options.target.iPController != "") {
            var type = options.target.type;
            if (type == "OpenFlow Reference Implementation") {
              type = "OpenFlow R.I."
            }
            groupLabelController.item(1).set({
              text: type + "\n" + options.target.iPController,
            });
            boxWidth = groupLabelController.item(1).getScaledWidth();
            boxHeight = groupLabelController.item(1).getScaledHeight();
            if (options.target.iPController == undefined) {
              visibility = false;
            } else {
              visibility = true;
            }

          }
          groupLabelController.item(0).set({
            width: boxWidth + 10,
            height: boxHeight + 10,
          });
          groupLabelController.set({

            left: x0,
            top: y0,
            visible: visibility,

          });
          canvas.bringToFront(groupLabelController);
          canvas.renderAll();

        } else if (objId == "h") {
          if (options.target.iPHost != "") {
            groupLabelController.item(1).set({
              text: "Ruta: " + options.target.iPHost,
            });
            boxWidth = groupLabelController.item(1).getScaledWidth();
            boxHeight = groupLabelController.item(1).getScaledHeight();

            if (options.target.iPHost == undefined) {
              visibility = false;
            } else {
              visibility = true;
            }

            groupLabelController.item(0).set({
              width: boxWidth + 10,
              height: boxHeight + 10,
            });
            groupLabelController.set({

              left: x0,
              top: y0,
              visible: visibility,

            });
            canvas.bringToFront(groupLabelController);
            canvas.renderAll();
          }
        } else if (objId == "s") {
          if (options.target.type != "Ninguno") {
            groupLabelController.item(1).set({
              text: options.target.type,
            });
            boxWidth = groupLabelController.item(1).getScaledWidth();
            boxHeight = groupLabelController.item(1).getScaledHeight();

            if (options.target.type != "Ninguno" && options.target.type != "IVS Switch"
              && options.target.type != "Linux Brigde" && options.target.type != "OVS Brigde"
              && options.target.type != "OVS Switch" && options.target.type != "User Switch") {
              visibility = false;
            } else {
              visibility = true;
            }

            groupLabelController.item(0).set({
              width: boxWidth + 10,
              height: boxHeight + 10,
            });
            groupLabelController.set({

              left: x0,
              top: y0,
              visible: visibility,

            });
            canvas.bringToFront(groupLabelController);
            canvas.renderAll();
          }
        }/* else if (objId == "l" || objId == "n") {
          options.target.set({
            strokeWidth: 4,

          })
        }*/

      }

      break;

  }
});

canvas.on('mouse:out', function (options) {

  switch (tool) {
    case "cursor":
      groupLabelController.set({
        visible: false,
      })

      break;
  }

});


// Mouse Down Canvas 
canvas.observe('mouse:down', function (options) {
  var pointer = canvas.getPointer(options.e);
  x0 = pointer.x; //get initial starting point of x
  y0 = pointer.y; //get initial starting point of y

  switch (tool) {
    case 'cursor':

      desactiveTool();
      //Si Existe una Asociacion o Link sin Completar, la Elimina
      if (selected != null) {
        canvas.remove(selected);
      }

      canvas.requestRenderAll();

      var objActive = canvas.getActiveObject();

      if (objActive != null) {
        //Reestablece el Libre Movimiento al Elemento Activo
        objActive && objActive.set({
          lockMovementX: false,
          lockMovementY: false,
          lockScalingX: false,
          lockScalingY: false,
          lockUniScaling: false,
          lockRotation: false,
        });

        if (options.button === 3) {
          console.log("right click");
          if (objActive.id.charAt(0) == "h") {
            fancyHostTrafficSpecific();

          }
        }
        //Si el Elemento Activo es una Asociación o Link aumenta su Grosor
        if (objActive.id.charAt(0) == "l" || objActive.id.charAt(0) == "n") {
          objActive && objActive.set({
            strokeWidth: 4,
          });
          canvas.renderAll();
        }
        canvas.forEachObject(function (obj) {
          obj && obj.set({
            opacity: 1,
          });
        });
        objActive.set({
          opacity: 0.7,
        });

      } else {
        canvas.forEachObject(function (obj) {
          if (obj.id.charAt(0) == "l" || obj.id.charAt(0) == "n") {
            obj.set({
              strokeWidth: 2,
            });
          }
          obj.set({
            opacity: 1,
          });
          canvas.renderAll();
        });
      }
      canvas.renderAll();
      break;
    case 'host':

      img = '../static/img/host.png';
      tag = "h" + (tagHost.length + 1);
      frameFancyBoxInsertElement('host', tag, x0, y0, img);
      tool = "cursor";
      desactiveTool();
      activeTool(tool);
      break;
    case 'controller':

      img = '../static/img/controller.png';
      tag = "c" + (tagController.length + 1);
      frameFancyBoxInsertElement('controller', tag, x0, y0, img);
      tool = "cursor";
      desactiveTool();
      activeTool(tool);
      break;
    case 'switch_openflow':

      img = '../static/img/openflow_switch.png';
      tag = "s" + (tagSwitchOF.length + 1);
      frameFancyBoxInsertElement('switch_openflow', tag, x0, y0, img);
      tool = "cursor";
      desactiveTool('switch_openflow');
      activeTool(tool);
      break;
    case 'port':

      img = '../static/img/port.png';
      tag = "eth";
      frameFancyBoxInsertElement('port', tag, x0, y0, img);
      tool = "cursor";
      desactiveTool('port');
      activeTool(tool);
      break;
    case 'label':

      img = '../static/img/';
      tag = "Label1";
      frameFancyBoxInsertElement('label', tag, x0, y0, img);
      tool = "cursor";
      desactiveTool();
      createLabel(x0, y0);
      activeTool(tool);

      break;
    case 'link':

      var activo = canvas.getActiveObject();

      if (activo != null) {

        activo && activo.set({
          lockMovementX: true,
          lockMovementY: true,
          lockScalingX: true,
          lockScalingY: true,
          lockUniScaling: true,
          lockRotation: true,
        });
      }

      if (activo != null && activo.id.charAt(0) == "e") {

        activo.set({
          opacity: 0.7,
        });


        if (objectActiveLinkInitial == null && activo.state != "connected" && objectActiveLinkFinal == null) {

          objectActiveLinkInitial = activo;
          var link = makeLink([objectActiveLinkInitial.connection[0].x2, objectActiveLinkInitial.connection[0].y2, objectActiveLinkInitial.connection[0].x2, objectActiveLinkInitial.connection[0].y2], "link");

          if (objectActiveLinkInitial.elementContainer.charAt('s')) {
            objectActiveLinkInitial.position = "initial";
          }

          selected = link;
          canvas.add(link);

        } else if (objectActiveLinkInitial != null && objectActiveLinkFinal == null && activo.state != "connected") {

          objectActiveLinkFinal = activo;
          //var link = makeLink([objectActiveLinkInitial.connection[0].x2,objectActiveLinkInitial.connection[0].y2, objectActiveLinkInitial.connection[0].x2,objectActiveLinkInitial.connection[0].y2 ], "link");
          if (objectActiveLinkFinal.elementContainer.charAt(0) == 's' && objectActiveLinkInitial.elementContainer.charAt(0) == 's' && objectActiveLinkInitial.elementContainer != objectActiveLinkFinal.elementContainer) {

            selected.set({
              x2: objectActiveLinkFinal.connection[0].x2,
              y2: objectActiveLinkFinal.connection[0].y2,
            });


            objectActiveLinkInitial.state = "connected";
            objectActiveLinkFinal.state = "connected";
            objectActiveLinkInitial.line = selected;
            objectActiveLinkFinal.line = selected;
            objectActiveLinkInitial.connection.push(selected);
            objectActiveLinkFinal.connection.push(selected);
            objectActiveLinkFinal.position = "terminal";
            canvas.sendToBack(selected);


          } else if (objectActiveLinkFinal.elementContainer.charAt(0) == 's' && objectActiveLinkInitial.elementContainer.charAt(0) == 'h') {


            selected.set({
              x2: objectActiveLinkFinal.connection[0].x2,
              y2: objectActiveLinkFinal.connection[0].y2,
            });
            objectActiveLinkInitial.state = "connected";
            objectActiveLinkFinal.state = "connected";
            objectActiveLinkInitial.line = selected;
            objectActiveLinkFinal.line = selected;
            objectActiveLinkInitial.connection.push(selected);
            objectActiveLinkFinal.connection.push(selected);
            canvas.sendToBack(selected);


          } else if (objectActiveLinkFinal.elementContainer.charAt(0) == 's' && objectActiveLinkInitial.elementContainer.charAt(0) == 's' && objectActiveLinkInitial.elementContainer == objectActiveLinkFinal.elementContainer) {

            canvas.remove(selected);
          } else if (objectActiveLinkFinal.elementContainer.charAt(0) == 'h' && objectActiveLinkInitial.elementContainer.charAt(0) == 'h' && objectActiveLinkInitial.elementContainer.charAt(0) == 'h') {

            canvas.remove(selected);
          }

          tool = "cursor";
          desactiveTool();
          activeTool(tool);
          selected = null;
          objectActiveLinkInitial = null;
          objectActiveLinkFinal = null;
        }


      }

      break;
  }
});

//Opciones Cuando El Objeto se Mueve y sus Componentes
canvas.observe('object:moving', function (e) {
  var p = e.target;
  switch (tool) {

    case 'cursor':
      if (p.id.charAt(0) != "e") {
        for (var i = 0; i < p.connection.length; i++) {

          //p.connection[i] && p.connection[i].set({ 'x1': p.left + 30, 'y1': p.top + 35 });


          if (p.id.charAt(0) == "c") {

            p.connection[i] && p.connection[i].set({
              'x2': p.left + 30,
              'y2': p.top + 35
            });
            canvas.renderAll();

          } else {

            p.connection[i] && p.connection[i].set({
              'x1': p.left + 30,
              'y1': p.top + 35
            });
            canvas.renderAll();

          }
        }
        canvas.renderAll();

      } else {
        for (var i = 0; i < p.connection.length; i++) {

          if (p.state == "connected") {

            if (p.connection[i].id == "link") {
              if (p.elementContainer.charAt(0) == "s") {
                if (p.position == "initial") {
                  p.connection[i] && p.connection[i].set({
                    'x2': p.left + 10,
                    'y2': p.top + 7
                  });
                  canvas.renderAll();
                } else if (p.position == "terminal") {
                  p.connection[i] && p.connection[i].set({
                    'x1': p.left + 10,
                    'y1': p.top + 7
                  });
                  canvas.renderAll();

                } else {
                  p.connection[i] && p.connection[i].set({
                    'x1': p.left + 10,
                    'y1': p.top + 7
                  });
                  canvas.renderAll();
                }

              } else {
                p.connection[i] && p.connection[i].set({
                  'x2': p.left + 10,
                  'y2': p.top + 7
                });
                canvas.renderAll();
              }

            } else {
              //muevo la asociasion 
              p.connection[i] && p.connection[i].set({
                'x2': p.left + 10,
                'y2': p.top + 7
              });
              canvas.renderAll();
            }
          } else {
            p.connection[i] && p.connection[i].set({
              'x2': p.left + 10,
              'y2': p.top + 7
            });
            canvas.renderAll();
          }

        }
      }
      break;


  }


});


// Mouse Move Canvas Opciiones
canvas.observe('mouse:move', function (options) {
  var objActive = canvas.getActiveObject();
  var pointer = canvas.getPointer(options.e);
  var x2 = pointer.x; //get the current value of X
  var y2 = pointer.y; //get the current value of Y
  switch (tool) {

    case 'cursor':
      if (options.target != null) {

        groupLabelController.set({
          left: x2,
          top: y2,
        });
        canvas.renderAll();

      } else {

        groupLabelController.set({
          visible: false,
        });

      }

      break;
    case 'link':

      if (selected != null) {

        selected.set({
          x2: x2, //set the line's x2 to the current X value of the mouse
          y2: y2,  //set the line's y2 to the current Y value of the mouse
          selectable: true,
          hasBorders: false,
          hasControls: false,
        });
      }
      canvas.renderAll();
      break;

  }
});

canvas.observe('mouse:up', function (e) {
  switch (tool) {
    case 'cursor':

      break;
  }
});

/*
canvas.observe('selection:created', function (options) {
  console.log('selection created');
  var selected = canvas.getActiveObjects(),
    selGroup = new fabric.ActiveSelection(selected, {
      canvas: canvas
    });

});
*/


//funcion Elimina el elmento seleccionado o el grupo  seleccionado

function createLabel(x0, y0) {
  var label = "Esto es una Etiqueta"
  var labelText = new fabric.IText(label, {
    left: 5,
    top: 5,
    fontFamily: 'Helvetica',
    fill: '#333',
    lineHeight: 1.1,
    fontSize: 18,
  });

  var boxWidth = labelText.getScaledWidth();
  var rectangle = new fabric.Rect({
    left: 0,
    top: 0,
    width: boxWidth + 10,
    height: 25,
    fill: 'white',
    strokeWidth: 2,
    stroke: 'rgba(100,200,200,0.5)'
  });

  var groupLabel = new fabric.Group([rectangle, labelText], {
    left: x0,
    top: y0,
    opacity: 1,
    hasControls: false,
    hasBorders: true,
    transparentCorners: false,
    selectable: true,
    id: "label",
    connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[]))   
  });

  canvas.add(groupLabel);


}

function deleteElement() {

  var selected = canvas.getActiveObjects();

  var selGroup = new fabric.ActiveSelection(selected, {
    canvas: canvas
  });


  if (selGroup != null) {

    selGroup.forEachObject(function (obj) {
      canvas.remove(obj);
    });


  } else {
    $.fancybox.open('<div class="message"><h2>Mensaje</h2><p>Selecciona un Elemento Primero</p></div>');
    return false;
  }
  canvas.discardActiveObject().renderAll();
}


function insertElementClick(x, y, image, tag,) {

  var img = new Image();
  img.src = image;

  var connection = {

    type: "",
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    id: "",
    elementOrigin: "",
    elementFinal: "",

  };

  var elemento = new fabric.Image(img);
  elemento.set({
    scaleX: 0.125,
    scaleY: 0.125,
    padding: 0,
    //id: tag,
    elementConnection: [], // Contiene las conexiones pertenecientes al elmento
    connectionLine: [], // Contiene todos los enlaces (lineas (makeLine())) del elemento
  });

  var text = new fabric.Textbox(tag, {
    top: 62,
    left: 22,
    fontFamily: 'arial',
    fill: '#15435d',
    fontSize: 15,


  });

  if (tag.charAt(0) == 'h') {

    var groupHost = new fabric.Group([elemento, text], {

      left: x,
      top: y,
      opacity: 1,
      hasControls: false,
      hasBorders: false,
      transparentCorners: false,
      selectable: true,
      id: tag,
      connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 

    });

    for (var i = 0; i < 2; i++) {

      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x + 30;
      connection.y1 = y + 35;
      connection.x2 = (x + (i * 65)) - 5;
      connection.y2 = y + 107;
      connection.id = "a" + i;
      elemento.elementConnection.push(connection);

      var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portHost");

      elemento.connectionLine.push(link);
      groupHost.connection.push(link);

    }

    // Asociamos el grupo con cada enlace
    for (var i = 0; i < 2; i++) {

      var line = elemento.connectionLine[i];
      groupHost.line = line;

    }

    var port = new Image();
    port.src = "../static/img/port.png";

    for (var i = 0; i < 2; i++) {

      var asociate = elemento.elementConnection[i].elementOrigin;

      if (asociate.charAt(0) == "h") {

        var pt = new fabric.Image(port);
        pt.set({
          scaleX: 0.035,
          scaleY: 0.035,
          padding: 0,
          id: tag,
          connectionLine: [], // Contenedor de las lineas de conexión.

        });
        // Asignación de lineas por cada puerto  
        pt.connectionLine.push(elemento.connectionLine[i]);

        var label = new fabric.Textbox("eth" + i, {
          top: 22,
          left: -5,
          fontFamily: 'arial',
          fill: '#15435d',
          fontSize: 15

        });

        var groupHostPort = new fabric.Group([pt, label], {

          left: (x + (i * 65)) - 15,
          top: y + 100,
          hasControls: false,
          hasBorders: false,
          transparentCorners: false,
          selectable: true,
          elementContainer: tag,
          identificator: 'Hp',
          id: "eth" + i,
          connection: [], // Contenedor de lineas de conexión del grupo.


        });

        groupHostPort.connection.push(elemento.connectionLine[i]);

        var li = elemento.connectionLine[i];

        // Asignación de lineas por cada puerto en el grupo
        groupHost.li = li;
        canvas.add(groupHost.connection[i]);
        canvas.add(groupHostPort);

      }

    }
    canvas.add(groupHost);

  } else if (tag.charAt(0) == 's') {

    var groupSwitch = new fabric.Group([elemento, text], {

      left: x,
      top: y,
      hasControls: false,
      hasBorders: false,
      transparentCorners: false,
      selectable: true,
      id: tag,
      connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 

    });

    // Creación de lineas por cada enlace
    for (var i = 0; i < 6; i++) {

      connection.type = "association";
      connection.elementOrigin = tag;
      connection.x1 = x + 30;
      connection.y1 = y + 35;
      connection.x2 = (x + (i * 65)) - 130;
      connection.y2 = y + 107;
      connection.id = "a" + i;
      elemento.elementConnection.push(connection);

      var link = makeLink([connection.x1, connection.y1, connection.x2, connection.y2], "portSwitch");

      elemento.connectionLine.push(link);
      groupSwitch.connection.push(link);

    }

    // Asociamos el grupo con cada enlace
    for (var i = 0; i < 6; i++) {

      var line = elemento.connectionLine[i];
      groupSwitch.line = line;
      console.log(groupSwitch.line = line);

    }

    var port = new Image();
    port.src = "../static/img/port.png";

    // Creación de puertos por cada enlace.
    for (var i = 0; i < 6; i++) {

      var asociate = elemento.elementConnection[i].elementOrigin;

      if (asociate.charAt(0) == "s") {

        var pt = new fabric.Image(port);
        pt.set({
          scaleX: 0.035,
          scaleY: 0.035,
          opacity: 1,
          padding: 0,
          id: tag,
          connectionLine: [], // Contenedor de las lineas de conexión.
        });
        // Asignación de lineas por cada puerto  
        pt.connectionLine.push(elemento.connectionLine[i]);

        var label = new fabric.Textbox("eth" + i, {
          top: 22,
          left: -5,
          fontFamily: 'arial',
          fill: '#15435d',
          fontSize: 15
        });

        var groupSwitchPort = new fabric.Group([pt, label], {

          left: (x + (i * 65)) - 143,
          top: y + 100,
          hasControls: false,
          hasBorders: false,
          transparentCorners: false,
          selectable: true,
          elementContainer: tag,
          identificator: 'Sp',
          id: "eth" + i,
          connection: [], // Contenedor de lineas de conexión del grupo.

        });

        groupSwitchPort.connection.push(elemento.connectionLine[i]);

        var li = elemento.connectionLine[i];

        // Asignación de lineas por cada puerto en el grupo
        groupSwitch.li = li;
        canvas.add(groupSwitch.connection[i]);
        canvas.add(groupSwitchPort);
      }

    }

    canvas.add(groupSwitch);

  } else if (tag.charAt(0) == 'c') {

    var groupController = new fabric.Group([elemento, text], {

      left: x,
      top: y,
      hasBorders: false,
      hasControls: false,
      transparentCorners: false,
      selectable: true,
      id: tag,
      connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[])) 
    });
    canvas.add(groupController);
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

function activeTool(id) {
  var activeTool = $("#" + id);

  activeTool.css("backgroundColor", "#a4e7a4ad");

}

function desactiveTool() {
  $("#controller").css("backgroundColor", "#E1F3F1");;
  $("#switch_openflow").css("backgroundColor", "#E1F3F1");;
  $("#host").css("backgroundColor", "#E1F3F1");;
  $("#port").css("backgroundColor", "#E1F3F1");;
  $("#label").css("backgroundColor", "#E1F3F1");;
  $("#link").css("backgroundColor", "#E1F3F1");;



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
    elmt.setControlsVisibility({
      'ml': false,
      'mb': false,
      'mr': false,
      'mt': false
    });

  } else {

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

function frameFancyBoxInsertElement(id, tag, x0, y0, img) {

  var divFancy = "";
  action = "insert";
  if (id == "host") {

    $("#labelFancyHost").text("Host: " + tag);
    console.log("a: " + $("#labelFancyHost").val());
    divFancy = ".divFancyHost";

  } else if (id == "switch_openflow") {
    $("#labelFancySwitch").text("Switch: " + tag);
    divFancy = ".divFancySwitch";

  } else if (id == "controller") {
    $("#labelFancyController").text("Controlador: " + tag);
    divFancy = ".divFancyController";

  } else if (id == "link") {
    divFancy = ".divFancyLink";

  } else if (id == "port") {
    divFancy = ".divFancyPort";

  } else if (id == "label") {
    divFancy = ".divFancyLabel";
  }

  $.fancybox.open($(divFancy), {
    touch: false,
    modal: true,
    infobar: false,
    clickSlide: false,
    clickOutside: false,
  });

}


/*------------------------------------------------------------------------------------------------------*/
/* Parametrización de los elementos de la paleta de herramientas */
/*------------------------------------------------------------------------------------------------------*/
var insert = false;

/* Crear Parametros Elementos  Switch */
$('#GuardarButtonFancySwitch').on('click', function () {
  var type = $('#optionTypeFancySwitch option:selected').text();
  var stp = $('#STPFancySwitch:checkbox:checked').val();
  var stpPriority = $('#inputFancySTPPriority').val();
  var ipSwitch = $('#inputFancyIPSwitch').val();
  var dpctlPort = $('#inputFancyDPCTLPort').val();
  var protocol = $('#optionProtocolFancySwitch option:selected').text();
  var dataPath = $('#optionDataPathFancySwitch option:selected').text();
  var dataPathIP = $('#inputFancyDataPathIDSwitch').val();
  var dataPathArgs = $('#inputFancyOfDataPathArgsSwitch').val();
  var model = $('#optionFailModeFancySwitch option:selected').text();
  var inBand = $('#InBandFancySwitch:checkbox:checked').val();
  var inNameSpace = $('#InNameSpaceFancySwitch:checkbox:checked').val();
  var batch = $('#BatchFancySwitch:checkbox:checked').val();
  var verbose = $('#VerboseFancySwitch:checkbox:checked').val();
  insert = true;

  if (action != "visor") {
    insertElementClick(x0, y0, img, tag);
    tagSwitchOF.push(tag);

    canvas.forEachObject(function (obj) {


      if (obj.id == tag) {

        obj.verbose = verbose;
        obj.batch = batch;
        obj.inNameSpace = inNameSpace;
        obj.inBand = inBand;
        obj.model = model;
        obj.dataPathArgs = dataPathArgs;
        obj.dataPathIP = dataPathIP;
        obj.dataPath = dataPath;
        obj.protocol = protocol;
        obj.dpctlPort = dpctlPort;
        obj.ipSwitch = ipSwitch;
        obj.stpPriority = stpPriority;
        obj.stp = stp;
        obj.type = type;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Select SW
    var selectType = $('#optionTypeFancySwitch');
    selectType.val(selectType.data('default'));
    var selectProtocol = $('#optionProtocolFancySwitch');
    selectProtocol.val(selectProtocol.data('default'));
    var selectDataPath = $('#optionDataPathFancySwitch');
    selectDataPath.val(selectDataPath.data('default'));
    var selectFailMode = $('#optionFailModeFancySwitch');
    selectFailMode.val(selectFailMode.data('default'));

    // Restablecimiento por Defecto de los Input del SW
    $("#inputFancySTPPriority").val(null);
    $("#inputFancyIPSwitch").val(null);
    $("#inputFancyDPCTLPort").val(null);
    $("#inputFancyDataPathIDSwitch").val(null);
    $("#inputFancyOfDataPathArgsSwitch").val(null);

    // Restablecimiento por Defecto de los CheckBox del SW
    $('#STPFancySwitch').prop('checked', false);
    $('#InBandFancySwitch').prop('checked', false);
    $('#InNameSpaceFancySwitch').prop('checked', false);
    $('#BatchFancySwitch').prop('checked', false);
    $('#VerboseFancySwitch').prop('checked', false);

  } else {

    canvas.forEachObject(function (obj) {


      if (obj.id == tag) {

        obj.verbose = verbose;
        obj.batch = batch;
        obj.inNameSpace = inNameSpace;
        obj.inBand = inBand;
        obj.model = model;
        obj.dataPathArgs = dataPathArgs;
        obj.dataPathIP = dataPathIP;
        obj.dataPath = dataPath;
        obj.protocol = protocol;
        obj.dpctlPort = dpctlPort;
        obj.ipSwitch = ipSwitch;
        obj.stpPriority = stpPriority;
        obj.stp = stp;
        obj.type = type;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Select SW
    var selectType = $('#optionTypeFancySwitch');
    selectType.val(selectType.data('default'));
    var selectProtocol = $('#optionProtocolFancySwitch');
    selectProtocol.val(selectProtocol.data('default'));
    var selectDataPath = $('#optionDataPathFancySwitch');
    selectDataPath.val(selectDataPath.data('default'));
    var selectFailMode = $('#optionFailModeFancySwitch');
    selectFailMode.val(selectFailMode.data('default'));

    // Restablecimiento por Defecto de los Input del SW

    $("#inputFancySTPPriority").val(null);
    $("#inputFancyIPSwitch").val(null);
    $("#inputFancyDPCTLPort").val(null);
    $("#inputFancyDataPathIDSwitch").val(null);
    $("#inputFancyOfDataPathArgsSwitch").val(null);

    // Restablecimiento por Defecto de los CheckBox del SW

    $('#STPFancySwitch').prop('checked', false);
    $('#InBandFancySwitch').prop('checked', false);
    $('#InNameSpaceFancySwitch').prop('checked', false);
    $('#BatchFancySwitch').prop('checked', false);
    $('#VerboseFancySwitch').prop('checked', false);

  }

});

/* Cerrar Fancy Parametros Elementos  Switch */
$('#CancelarButtonFancySwitch').on('click', function () {
  parent.jQuery.fancybox.close();
});


/* Crear Parametros Elementos  Port*/
$('#GuardarButtonFancyPort').on('click', function () {
  var iPPort = $('#inputFancyIPPort').val();

  if (action != "visor") {

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.iPPort = iPPort;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Input - Port
    $("#inputFancyIPPort").val(null);

  } else {
    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.iPPort = iPPort;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Input - Port
    $("#inputFancyIPPort").val(null);
  }

});

/* Cerrar Fancy Parametros Elementos  Port */
$('#CancelarButtonFancyPort').on('click', function () {
  parent.jQuery.fancybox.close();
});


/* Crear Parametros Elementos  Link */
$('#GuardarButtonFancyLink').on('click', function () {
  var bW = $('#inputFancyBandWidthLink').val();
  var delay = $('#inputFancyDelayLink').val();
  var jitter = $('#inputFancyJitterLink').val();
  var queue = $('#inputFancyMaxQueueLink').val();
  var loss = $('#inputFancyLossLink').val();

  if (action != "visor") {

    // Bro igual que el Port, el link no tine la funcion que dibuja, pero tambíen realizo el else para la edición.

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.loss = loss;
        obj.queue = queue;
        obj.jitter = jitter;
        obj.delay = delay;
        obj.bW = bW;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Input - Link
    $("#inputFancyBandWidthLink").val(null);
    $("#inputFancyDelayLink").val(null);
    $("#inputFancyJitterLink").val(null);
    $("#inputFancyMaxQueueLink").val(null);
    $("#inputFancyLossLink").val(null);


  } else {

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.loss = loss;
        obj.queue = queue;
        obj.jitter = jitter;
        obj.delay = delay;
        obj.bW = bW;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Input - Link
    $("#inputFancyBandWidthLink").val(null);
    $("#inputFancyDelayLink").val(null);
    $("#inputFancyJitterLink").val(null);
    $("#inputFancyMaxQueueLink").val(null);
    $("#inputFancyLossLink").val(null);

  }
});

/* Cerrar Fancy Parametros Elementos  Link */
$('#CancelarButtonFancyLink').on('click', function () {
  parent.jQuery.fancybox.close();
});

/* Crear Parametros Elementos  Label */
$('#GuardarButtonFancyLabel').on('click', function () {
  var label = $('#inputFancyLabel').val();

  if (action != "visor") {

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.label = label;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Input - Label
    $("#inputFancyLabel").val(null);

  } else {

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.label = label;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Input - Label
    $("#inputFancyLabel").val(null);

  }
});


/* Cerrar Fancy Parametros Elementos  Label */
$('#CancelarButtonFancyLabel').on('click', function () {
  parent.jQuery.fancybox.close();
});


/* Crear Parametros Elementos  Host*/
$('#GuardarButtonFancyHost').on('click', function () {

  var iPHost = $('#inputFancyIPHost').val();
  var sheduler = $('#optionShedulerFancyHost option:selected').text();
  var cpuLimit = $('#inputFancyCpuLimitHost').val();
  var cpuCores = $('#inputFancyCPUCoresHost').val();

  if (action != "visor") {
    insertElementClick(x0, y0, img, tag);
    tagHost.push(tag);

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.iPHost = iPHost;
        obj.sheduler = sheduler;
        obj.cpuLimit = cpuLimit;
        obj.cpuCores = cpuCores;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Select Host
    var selectScheluder = $('#optionShedulerFancyHost');
    selectScheluder.val(selectScheluder.data('default'));

    // Restablecimiento por Defecto de los Input - Host
    $("#inputFancyIPHost").val(null);
    $("#inputFancyCpuLimitHost").val(null);
    $("#inputFancyCPUCoresHost").val(null);


  } else {

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {

        obj.iPHost = iPHost;
        obj.sheduler = sheduler;
        obj.cpuLimit = cpuLimit;
        obj.cpuCores = cpuCores;

      }

      parent.jQuery.fancybox.close();

      // Restablecimiento por Defecto de los Select Host
      var selectScheluder = $('#optionShedulerFancyHost');
      selectScheluder.val(selectScheluder.data('default'));

      // Restablecimiento por Defecto de los Input - Host
      $("#inputFancyIPHost").val(null);
      $("#inputFancyCpuLimitHost").val(null);
      $("#inputFancyCPUCoresHost").val(null);

    });

  }



});

/* Cerrar Fancy Parametros Elementos  Host */
$('#CancelarButtonFancyHost').on('click', function () {
  parent.jQuery.fancybox.close();
});


/* Crear Parametros Elementos  Controller */
$('#GuardarButtonFancyController').on('click', function () {

  var type = $('#optionTypeFancyController option:selected').text();
  var iPController = $('#inputFancyIpController').val();
  var portController = $('#inputFancyPuertoController').val();
  var protocol = $('#optionProtocolFancyController option:selected').text();

  if (action != "visor") {
    insertElementClick(x0, y0, img, tag);
    tagController.push(tag);

    canvas.forEachObject(function (obj) {

      if (obj.id && obj.id === tag) {

        obj.type = type;
        obj.iPController = iPController;
        obj.portController = portController;
        obj.protocol = protocol;
        console.log("Aqui esta el: " + obj.type);
      }

    });

    parent.jQuery.fancybox.close();


    // Restablecimiento por Defecto de los Select - Controller
    var selectType = $('#optionTypeFancyController');
    selectType.val(selectType.data('default'));

    var selectProtocol = $('#optionProtocolFancyController');
    selectProtocol.val(selectProtocol.data('default'));

    // Restablecimiento por Defecto de los Input - Controller
    $("#inputFancyIpController").val(null);
    $("#inputFancyPuertoController").val(null);

  } else {

    canvas.forEachObject(function (obj) {

      if (obj.id && obj.id === tag) {

        obj.type = type;
        obj.iPController = iPController;
        obj.portController = portController;
        obj.protocol = protocol;

      }

    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Select - Controller
    var selectType = $('#optionTypeFancyController');
    selectType.val(selectType.data('default'));

    var selectProtocol = $('#optionProtocolFancyController');
    selectProtocol.val(selectProtocol.data('default'));

    // Restablecimiento por Defecto de los Input - Controller
    $("#inputFancyIpController").val(null);
    $("#inputFancyPuertoController").val(null);

  }

});

/* Cerrar Fancy Parametros Elementos  Controller */
$('#CancelarButtonFancyController').on('click', function () {

  parent.jQuery.fancybox.close();

  var selectType = $('#optionTypeFancyController');
  selectType.val(selectType.data('default'));

  var selectProtocol = $('#optionProtocolFancyController');
  selectProtocol.val(selectProtocol.data('default'));

  $("#inputFancyIpController").val(null);

});

function stopEmulation() {
  console.log("Stop");
  var actionDir = {}
  actionDir['action'] = 'stop'


  $('.playDesp').css({ 'pointer-events': 'visible' });
  $('.stopDesp').css({ 'pointer-events': 'none' });
  $('.wSharkDesp').css({ 'pointer-events': 'none' });
  $('.genTr').css({ 'pointer-events': 'none' });
  $('.grafDesp').css({ 'pointer-events': 'none' });
  $('.odlDesp').css({ 'pointer-events': 'none' });

  $('.play').css({ 'pointer-events': 'visible' });
  $('.stop').css({ 'pointer-events': 'none' });
  $('.generator').css({ 'pointer-events': 'none' });
  $('.wireShark').css({ 'pointer-events': 'none' });
  $('.graphic').css({ 'pointer-events': 'none' });
  $('.opendayligth').css({ 'pointer-events': 'none' });


  // Variables JSON
  var json = JSON.stringify(actionDir);
  //console.log('esto es un json: ' + json);

  //Formato de Petición AJAX
  $.ajax({
    type: "post",//get- consutla post- se actualiza
    url: "http://127.0.0.1:8000/alambric_emulator/",
    dataType: "json",

    contentType: 'application/json; charset=utf-8',
    data: json,
    success: function (data) {
      //alert(JSON.stringify(data));
      $.fancybox.open('<div class="message"><h2>Hello!</h2><p>You are awesome!</p></div>');
    }
  });
  actionDir = {}
}

//Detiene la emulación
$('.stop').on('click', function () {
  stopEmulation();
});
$('.stopDesp').on('click', function () {
  stopEmulation();
});

// Boton WireShark

function openWireshark() {
  console.log("WireShark");
  var actionDir = {}
  actionDir['wireshark'] = 'wireshark'

  // Variables JSON
  var json = JSON.stringify(actionDir);
  //console.log('esto es un json: ' + json);

  //Formato de Petición AJAX
  $.ajax({
    type: "post",//get- consutla post- se actualiza
    url: "http://127.0.0.1:8000/alambric_emulator/",
    dataType: "json",

    contentType: 'application/json; charset=utf-8',
    data: json,
    success: function (data) {
      //alert(JSON.stringify(data));
      $.fancybox.open('<div class="message"><h2>Hello!</h2><p>You are awesome!</p></div>');
    }
  });
  actionDir = {}
}
$('.wireShark').on('click', function () {
  openWireshark();
});

// Fancy Generator Traffic
function fancyTrafficGenerator() {

  var divFancy = ".divTraffic";

  $.fancybox.open($(divFancy), {
    touch: false,
    modal: false,
    infobar: false,
    clickSlide: false,
    clickOutside: false,
  });

}

//Variables para Formulario de Selección de Tráfico
$('#generateBtn').on('click', function () {
  labelsGraphic = [];
  datosY = [];
  var typeTraffic = $('#selectorTraffic option:selected').text();

  // Opcion -i
  var checkBoxRange = $('#checkBoxRange').prop("checked");
  var range = String($('#inputRange').val());

  // Opcion -b
  var checkBoxRate = $('#checkBoxRate').prop("checked");
  var valorRate = String($('#inputRange').val());
  var kUnitRate = $('#radioKBit:radio:checked').val();
  var mUnitRate = $('#radioMBit:radio:checked').val();


  // Opcion -w
  var checkBoxWindow = $('#checkBoxWindow').prop("checked");
  var valorWindow = String($('#inputWindow').val());
  var kUnitWindow = $('#radioKByteW:radio:checked').val();
  var mUnitWindow = $('#radioMByteW:radio:checked').val();

  // Opcion -l
  var checkBoxLong = $('#checkBoxLong').prop("checked");
  var valorLong = String($('#inputLong').val());
  var kUnitLong = $('#radioKByteL:radio:checked').val();
  var mUnitLong = $('#radioMByteL:radio:checked').val();

  // Opcion -t
  var radioTime = $('#radioTime:radio:checked').val();
  var valorTime = String($('#inputTime').val());

  // Opcion -n
  var radioPacket = $('#radioPacket:radio:checked').val();
  var valorPacket = String($('#inputPacket').val());
  var kUnitPacket = $('#radioKByteP:radio:checked').val();
  var mUnitPacket = $('#radioMByteP:radio:checked').val();

  // Opcion -k
  var radioBlock = $('#radioBlock:radio:checked').val();
  var valorBlock = String($('#inputBlock').val());
  var kUnitBlock = $('#radioKByteB:radio:checked').val();
  var mUnitBlock = $('#radioMByteB:radio:checked').val();

  // Opciones de Funcionamiento del Generador
  var radioXtreme = $('#radioXtreme:radio:checked').val();
  var radioGlobal = $('#radioGlobal:radio:checked').val();
  var radioSpecific = $('#radioSpecific:radio:checked').val();

  // Hosts para el modo espeifico
  // Host A Inicial
  var inputHostAS = String($('#inputHostAS').val());
  // Host B Final
  var inputHostBS = String($('#inputHostBS').val());

  // Arreglo para el generador de tráfico
  var trafficDir = {};
  console.log("valores mierditas: " + radioTime + ' l: ' + checkBoxLong + ' i: ' + checkBoxRange + ' bw: ' + checkBoxRate + ' w: ' + checkBoxWindow);

  //Trafico TCP
  if (typeTraffic == 'TCP') {
    trafficDir['TCP'] = 'true';
  } else {
    trafficDir['UDP'] = 'true';
  }
  //Emulacion de trafico por Tiempo
  if (radioTime) {
    console.log("Tiempo");
    trafficDir['t'] = valorTime.toString();
    if (checkBoxRange) {
      trafficDir['i'] = range.toString();
    }

    //Emulacion de trafico por Tamaño de Bloque
  } else if (radioBlock) {

    console.log("bloque");
    if (kUnitBlock) {
      trafficDir['k'] = valorBlock.toString() + 'k';

    } else if (mUnitBlock) {
      trafficDir['k'] = valorBlock.toString() + 'm';
    }

    //Emulacion de trafico por Numero de Paquetes
  } else if (radioPacket) {
    console.log("Pquete");
    if (kUnitPacket) {
      trafficDir['n'] = valorPacket.toString() + 'k';
    } else if (mUnitPacket) {
      trafficDir['n'] = valorPacket.toString() + 'm';
    }
  }

  //Definicion de la Longitud del Packete
  if (checkBoxLong) {
    console.log("Longitud");
    if (!radioPacket && !radioBlock && checkBoxRange) {
      trafficDir['i'] = range.toString();
    }
    if (kUnitLong) {
      trafficDir['l'] = valorLong.toString() + 'k';
    } else if (mUnitLong) {
      trafficDir['l'] = valorLong.toString() + 'm';
    }
  }

  //Definicion del ancho de banda de destino 
  if (checkBoxRate) {
    console.log("BW");
    if (kUnitRate) {
      trafficDir['b'] = valorRate.toString() + 'k';
    } else if (mUnitRate) {
      trafficDir['b'] = valorRate.toString() + 'm';
    }
  }

  //Definicion del tamaño ventana (buffer de socket)
  if (checkBoxWindow) {
    console.log("Windows");
    if (kUnitWindow) {
      trafficDir['w'] = valorWindow.toString() + 'k';
    } else if (mUnitWindow) {
      trafficDir['w'] = valorWindow.toString() + 'k';
    }
  }

  //Definicion modo de emulacion del trafico en la red
  var modeOp = '';
  if (radioXtreme) {
    trafficDir['xtreme'] = 'true';
    modeOp = 'Xtreme';
  } else if (radioSpecific) {
    trafficDir['specific'] = 'true';
    trafficDir['host_client'] = inputHostAS.toString();
    trafficDir['host_server'] = inputHostBS.toString();
    modeOp = 'Speciffic: ' + inputHostAS.toString() + ' to ' + inputHostBS.toString();
  } else if (radioGlobal) {
    console.log("global");
    trafficDir['global'] = 'true';
    modeOp = 'Global';
  }

  parent.jQuery.fancybox.close();

  // Objeto JSON para envio de datos
  var json = JSON.stringify(trafficDir);
  console.log(json)

  //Formato de Petición AJAX
  $.ajax({
    type: "post",//get- consutla post- se actualiza
    url: "http://127.0.0.1:8000/alambric_emulator/",
    dataType: "json",
    contentType: 'application/json; charset=utf-8',
    data: json,
    success: function (data) {
      //alert(JSON.stringify(data));
      $.fancybox.open('<div class="message"><h2>¡Realizado!</h2><p>Tráfico Generado con Éxito.</p></div>');

      var trafficValues = {};
      var counter = 0;
      var interval = 0;
      var protocol = '';
      var time_e = 0;
      var blocks = '';
      var tcpMssDefault = '';
      var blkSize = '';
      var sockBufSize = '';
      var rcvBufActual = '';
      var sndBufActual = '';



      var totalBytesTx = 0;
      var bitsPerSecond = 0;
      var promTotalBytesTx = 0;
      var promBitsPerSecond = 0;
      var sndCwnd = 0;
      var promSndCwnd = 0;
      var rtt = 0;
      var promRtt = 0;
      var retransmits = 0;
      var promRetransmits = 0;
      var rttVar = 0;
      var promRttVar = 0;
      var pmtu = 0;
      var promPmtu = 0;
      var contador = 0;
      var auxList = ['null'];
      //trafficValues['null'] = 'null';


      var claves = Object.keys(data);
      //Obtención de Datos para Analizador Gráfico}
      //*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*--*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
      for (var k in data) {

        for (var t in data[k]['speciffic']) {

          totalBytesTx = totalBytesTx + parseInt(data[k]['speciffic'][t]['n_bytes']);
          bitsPerSecond = bitsPerSecond + parseInt(data[k]['speciffic'][t]['bits_per_second']);
          sndCwnd = sndCwnd + parseInt(data[k]['speciffic'][t]['snd_cwnd']);
          rtt = rtt + parseInt(data[k]['speciffic'][t]['rtt']);
          retransmits = retransmits + parseInt(data[k]['speciffic'][t]['retransmits']);
          rttVar = rttVar + parseInt(data[k]['speciffic'][t]['rttvar']);
          pmtu = pmtu + parseInt(data[k]['speciffic'][t]['pmtu']);
          counter = counter + 1;
          var llave = String(t);

          //console.log('HOST ' + String(k));
          //console.log('Trafico: ' + JSON.stringify(trafficValues));

          //Valores Numero de Bytes
          if (Object.keys(trafficValues).includes(String(t) + '_num_bytes')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_num_bytes']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['n_bytes']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_num_bytes'] = totalNumBytes;

          } else {
            trafficValues[llave + '_num_bytes'] = parseInt(data[k]['speciffic'][t]['n_bytes']);

          }


          //Valores Bits por Segundo
          if (Object.keys(trafficValues).includes(String(t) + '_bits_per_second')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_bits_per_second']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['bits_per_second']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_bits_per_second'] = totalNumBytes;

          } else {
            trafficValues[llave + '_bits_per_second'] = parseInt(data[k]['speciffic'][t]['bits_per_second']);

          }

          //Valores SND CWND
          if (Object.keys(trafficValues).includes(String(t) + '_snd_cwnd')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_snd_cwnd']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['snd_cwnd']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_snd_cwnd'] = totalNumBytes;

          } else {
            trafficValues[llave + '_snd_cwnd'] = parseInt(data[k]['speciffic'][t]['snd_cwnd']);

          }


          //Valores Retransmitidos
          if (Object.keys(trafficValues).includes(String(t) + '_retransmits')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_retransmits']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['retransmits']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_retransmits'] = totalNumBytes;

          } else {
            trafficValues[llave + '_retransmits'] = parseInt(data[k]['speciffic'][t]['retransmits']);

          }
          //Valores RTT
          if (Object.keys(trafficValues).includes(String(t) + '_rtt')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_rtt']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['rtt']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_rtt'] = totalNumBytes;

          } else {
            trafficValues[llave + '_rtt'] = parseInt(data[k]['speciffic'][t]['rtt']);

          }


          //Valores RTTVar
          if (Object.keys(trafficValues).includes(String(t) + '_rttvar')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_rttvar']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['rttvar']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_rttvar'] = totalNumBytes;

          } else {
            trafficValues[llave + '_rttvar'] = parseInt(data[k]['speciffic'][t]['rttvar']);

          }

          //Valores PMTU
          if (Object.keys(trafficValues).includes(String(t) + '_pmtu')) {

            var valActualNumBytes = parseInt(trafficValues[llave + '_pmtu']);
            var valorSumar = parseInt(data[k]['speciffic'][t]['pmtu']);

            var totalNumBytes = valActualNumBytes + valorSumar;
            trafficValues[llave + '_pmtu'] = totalNumBytes;

          } else {
            trafficValues[llave + '_pmtu'] = parseInt(data[k]['speciffic'][t]['pmtu']);

          }



        }

        protocol = String(data[k]['general']['protocol']);
        time_e = data[k]['general']['duration'];
        blocks = String(data[k]['general']['blocks']);
        tcpMssDefault = String(data[k]['general']['tcp_mss_default']);
        blkSize = String(data[k]['general']['blksize']);
        sockBufSize = String(data[k]['general']['sock_bufsize']);
        rcvBufActual = String(data[k]['general']['rcvbuf_actual']);
        sndBufActual = String(data[k]['general']['sndbuf_actual']);

      }


      //Promedio de Bytes Transmitidos en la Emulacion del Trafico
      promTotalBytesTx = totalBytesTx / counter;
      promBitsPerSecond = bitsPerSecond / counter;
      promSndCwnd = sndCwnd / counter;
      promRtt = rtt / counter;
      promRetransmits = retransmits / counter;
      promRttVar = rttVar / counter;
      promPmtu = pmtu / counter;
      interval = range;
      console.log('Trafico Tiempo ' + JSON.stringify(trafficValues));
      //Parametros para la generacion de la grafica 

      //Eje X 
      var numLabels = time_e / interval;


      for (var i = 0; i <= numLabels; i++) {
        labelsGraphic.push('t ' + String(i));
      }

      for (var o in trafficValues) {
        for (var q = 0; q < numLabels; q++) {
          if (String(o) == ('t_' + String(q) + '_num_bytes')) {
            datosYNumBytes[q] = trafficValues[o];
          }
          if (String(o) == ('t_' + String(q) + '_bits_per_second')) {
            datosYBitsPerSecond[q] = trafficValues[o];
          }
          if (String(o) == ('t_' + String(q) + '_snd_cwnd')) {
            datosYSndCwnd[q] = trafficValues[o];
          }
          if (String(o) == ('t_' + String(q) + '_retransmits')) {
            datosYRetransmits[q] = trafficValues[o];
          }
          if (String(o) == ('t_' + String(q) + '_rtt')) {
            datosYRtt[q] = trafficValues[o];
          }
          if (String(o) == ('t_' + String(q) + '_rttvar')) {
            datosYRttVar[q] = trafficValues[o];
          }
          if (String(o) == ('t_' + String(q) + '_pmtu')) {
            datosYPmtu[q] = trafficValues[o];
          }
        }
        //*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*--*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

        //Obtencion datos Trafico Host Individual
        trafficData = data;


      }
      console.log('Datos Bytes: ' + datosYNumBytes);
      $('#modo_op').text(String(modeOp));
      $('#protocol').text(String(protocol));
      $('#duration').text(String(time_e));
      $('#size_block').text(String(blkSize));
      $('#bloque').text(String(blocks));
      $('#tcp_mss').text(String(tcpMssDefault));
      $('#snd_buffer').text(String(sndBufActual));
      $('#rcv_buffer').text(String(rcvBufActual));
      $('#total_bytes').text(String(totalBytesTx));
      $('#prom_tbytes').text(String(promTotalBytesTx));
      $('#prom_bit').text(String(promBitsPerSecond));
      $('#prom_sndcwnd').text(String(promSndCwnd));
      $('#prom_rtt').text(String(promRtt));
      $('#prom_rtx').text(String(promRetransmits));
      $('#prom_rttvar').text(String(promRttVar));
      $('#prom_pmtu').text(String(promPmtu));

    }
  });


  // Restablecimiento por Defecto de los CheckBox

  $('#selectorTraffic').val("TCP");

  $('#radioTime').prop('checked', false);
  $('#inputTime').val(1);

  $('#checkBoxLong').prop('checked', false);
  $('#inputLong').val(1);
  $('#radioKByteL').prop('checked', true);
  $('#radioMByteL').prop('checked', false);

  $('#checkBoxRange').prop('checked', false);
  $('#inputRange').val(1);

  $('#checkBoxRate').prop('checked', false);
  $('#inpuRate').val(1);
  $('#radioKBit').prop('checked', true);
  $('#radioMBit').prop('checked', false);

  $('#checkBoxWindow').prop('checked', false);
  $('#inputWindow').val(1);
  $('#radioKByteW').prop('checked', true);
  $('#radioMByteW').prop('checked', false);

  $('#radioPacket').prop('checked', false);
  $('#inputPacket').val(1);
  $('#radioKByteP').prop('checked', false);
  $('#radioMByteP').prop('checked', false);

  $('#radioBlock').prop('checked', false);
  $('#inputBlock').val(1);
  $('#radioKByteB').prop('checked', false);
  $('#radioMByteB').prop('checked', false);

  $('#radioXtreme').prop('checked', false);
  $('#radioGlobal').prop('checked', true);
  $('#radioSpecific').prop('checked', false);

  $('#inputHostAS').val(null);
  $('#inputHostBS').val(null);

});

$('.generator').on('click', function () {

  console.log("Selector Traffic");
  loadInfoElements();
  // Restablecimiento por Defecto de los CheckBox

  $('#selectorTraffic').val("TCP");

  $('#radioTime').prop('checked', false);
  $('#inputTime').val(1);

  $('#checkBoxLong').prop('checked', false);
  $('#inputLong').val(1);
  $('#radioKByteL').prop('checked', true);
  $('#radioMByteL').prop('checked', false);

  $('#checkBoxRange').prop('checked', false);
  $('#inputRange').val(1);

  $('#checkBoxRate').prop('checked', false);
  $('#inpuRate').val(1);
  $('#radioKBit').prop('checked', true);
  $('#radioMBit').prop('checked', false);

  $('#checkBoxWindow').prop('checked', false);
  $('#inputWindow').val(1);
  $('#radioKByteW').prop('checked', true);
  $('#radioMByteW').prop('checked', false);

  $('#radioPacket').prop('checked', false);
  $('#inputPacket').val(1);
  $('#radioKByteP').prop('checked', false);
  $('#radioMByteP').prop('checked', false);

  $('#radioBlock').prop('checked', false);
  $('#inputBlock').val(1);
  $('#radioKByteB').prop('checked', false);
  $('#radioMByteB').prop('checked', false);

  $('#radioXtreme').prop('checked', false);
  $('#radioGlobal').prop('checked', true);
  $('#radioSpecific').prop('checked', false);

  $('#inputHostAS').val(null);
  $('#inputHostBS').val(null);

  fancyTrafficGenerator();

});



$('.genTr').on('click', function () {

  console.log("Selector Traffic");
  loadInfoElements();
  // Restablecimiento por Defecto de los CheckBox

  $('#selectorTraffic').val("TCP");

  $('#radioTime').prop('checked', false);
  $('#inputTime').val(1);

  $('#checkBoxLong').prop('checked', false);
  $('#inputLong').val(1);
  $('#radioKByteL').prop('checked', true);
  $('#radioMByteL').prop('checked', false);

  $('#checkBoxRange').prop('checked', false);
  $('#inputRange').val(1);

  $('#checkBoxRate').prop('checked', false);
  $('#inpuRate').val(1);
  $('#radioKBit').prop('checked', true);
  $('#radioMBit').prop('checked', false);

  $('#checkBoxWindow').prop('checked', false);
  $('#inputWindow').val(1);
  $('#radioKByteW').prop('checked', true);
  $('#radioMByteW').prop('checked', false);

  $('#radioPacket').prop('checked', false);
  $('#inputPacket').val(1);
  $('#radioKByteP').prop('checked', false);
  $('#radioMByteP').prop('checked', false);

  $('#radioBlock').prop('checked', false);
  $('#inputBlock').val(1);
  $('#radioKByteB').prop('checked', false);
  $('#radioMByteB').prop('checked', false);

  $('#radioXtreme').prop('checked', false);
  $('#radioGlobal').prop('checked', true);
  $('#radioSpecific').prop('checked', false);

  $('#inputHostAS').val(null);
  $('#inputHostBS').val(null);

  fancyTrafficGenerator();

});

// Habilitar Intervalo de tiempo
$('#checkBoxLong').on('click', function () {
  var valTraffic = $('#checkBoxLong').prop('checked');


  if (valTraffic == true) {
    if ($('#inputBlock').prop('checked') == false && $('#inputPacket').prop('checked') == false) {

      $('#inputTime').css({ 'pointer-events': 'visible' });
      $('#checkBoxRange').css({ 'pointer-events': 'visible' }); //Nuevo
      $('#inputRange').css({ 'pointer-events': 'visible' });  // Nuevo
      $('#inputPacket').css({ 'pointer-events': 'none' });
      $('#radioKByteP').css({ 'pointer-events': 'none' });
      $('#radioMByteP').css({ 'pointer-events': 'none' });
      $('#inputBlock').css({ 'pointer-events': 'none' });
      $('#radioKByteB').css({ 'pointer-events': 'none' });
      $('#radioMByteB').css({ 'pointer-events': 'none' });

    } else {
      $('#inputTime').css({ 'pointer-events': 'none' });
      $('#checkBoxRange').css({ 'pointer-events': 'none' }); //Nuevo
      $('#inputRange').css({ 'pointer-events': 'none' });  // Nuevo
      $('#inputPacket').css({ 'pointer-events': 'none' });
      $('#radioKByteP').css({ 'pointer-events': 'none' });
      $('#radioMByteP').css({ 'pointer-events': 'none' });
      $('#inputBlock').css({ 'pointer-events': 'none' });
      $('#radioKByteB').css({ 'pointer-events': 'none' });
      $('#radioMByteB').css({ 'pointer-events': 'none' });
    }

  }
});

// Habilitar Longitud
//Nuevo
$('#checkBoxLong').on('click', function () {
  var valTraffic = $('#checkBoxLong').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");

    $('#inputLong').css({ 'pointer-events': 'visible' });
    $('#radioKByteL').css({ 'pointer-events': 'visible' });
    $('#radioMByteL').css({ 'pointer-events': 'visible' });

  } else {

    $('#inputLong').css({ 'pointer-events': 'none' });
    $('#radioKByteL').css({ 'pointer-events': 'none' });
    $('#radioMByteL').css({ 'pointer-events': 'none' });
  }
});

// Habilitar BW
//Nuevo
$('#checkBoxRate').on('click', function () {
  var valTraffic = $('#checkBoxRate').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");

    $('#inpuRate').css({ 'pointer-events': 'visible' });
    $('#radioKBit').css({ 'pointer-events': 'visible' });
    $('#radioMBit').css({ 'pointer-events': 'visible' });

  } else {

    $('#inpuRate').css({ 'pointer-events': 'none' });
    $('#radioKBit').css({ 'pointer-events': 'none' });
    $('#radioMBit').css({ 'pointer-events': 'none' });
  }
});

// Habilitar Window
//Nuevo
$('#checkBoxWindow').on('click', function () {
  var valTraffic = $('#checkBoxWindow').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");

    $('#inputWindow').css({ 'pointer-events': 'visible' });
    $('#radioKByteW').css({ 'pointer-events': 'visible' });
    $('#radioMByteW').css({ 'pointer-events': 'visible' });

  } else {

    $('#inputWindow').css({ 'pointer-events': 'none' });
    $('#radioKByteW').css({ 'pointer-events': 'none' });
    $('#radioMByteW').css({ 'pointer-events': 'none' });
  }
});

// Habilitar Intervalo
//Nuevo
$('#checkBoxRange').on('click', function () {
  var valTraffic = $('#checkBoxRange').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");

    $('#inputRange').css({ 'pointer-events': 'visible' });


  } else {

    $('#inputRange').css({ 'pointer-events': 'none' });

  }
});

// Display Opciones de los Fancy Generadores de trafico
$('#radioTime').on('click', function () {
  var valTraffic = $('#radioTime').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");
    $('#inputTime').css({ 'pointer-events': 'visible' });
    $('#checkBoxRange').css({ 'pointer-events': 'visible' }); //Nuevo
    $('#inputRange').css({ 'pointer-events': 'visible' });  // Nuevo
    $('#inputPacket').css({ 'pointer-events': 'none' });
    $('#radioKByteP').css({ 'pointer-events': 'none' });
    $('#radioMByteP').css({ 'pointer-events': 'none' });
    $('#inputBlock').css({ 'pointer-events': 'none' });
    $('#radioKByteB').css({ 'pointer-events': 'none' });
    $('#radioMByteB').css({ 'pointer-events': 'none' });

  } else {
    $('#inputTime').css({ 'pointer-events': 'none' });
    $('#checkBoxRange').css({ 'pointer-events': 'none' }); //Nuevo
    $('#inputRange').css({ 'pointer-events': 'none' });  // Nuevo
    $('#inputPacket').css({ 'pointer-events': 'none' });
    $('#radioKByteP').css({ 'pointer-events': 'none' });
    $('#radioMByteP').css({ 'pointer-events': 'none' });
    $('#inputBlock').css({ 'pointer-events': 'none' });
    $('#radioKByteB').css({ 'pointer-events': 'none' });
    $('#radioMByteB').css({ 'pointer-events': 'none' });
  }
});

$('#radioPacket').on('click', function () {
  var valTraffic = $('#radioPacket').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");
    $('#inputTime').css({ 'pointer-events': 'none' });
    $("#checkBoxRange").prop("checked", false); //Nuevo
    $("#radioKByteP").prop("checked", true); //Nuevo
    $('#checkBoxRange').css({ 'pointer-events': 'none' }); //Nuevo
    $('#inputRange').css({ 'pointer-events': 'none' });  // Nuevo
    $('#inputPacket').css({ 'pointer-events': 'visible' });
    $('#radioKByteP').css({ 'pointer-events': 'visible' });
    $('#radioMByteP').css({ 'pointer-events': 'visible' });
    $('#inputBlock').css({ 'pointer-events': 'none' });
    $('#radioKByteB').css({ 'pointer-events': 'none' });
    $('#radioMByteB').css({ 'pointer-events': 'none' });

  } else {
    $('#inputTime').css({ 'pointer-events': 'none' });
    $("#radioKByteP").prop("checked", true); //Nuevo
    $('#checkBoxRange').css({ 'pointer-events': 'none' }); //Nuevo
    $('#inputRange').css({ 'pointer-events': 'none' });  // Nuevo
    $('#inputPacket').css({ 'pointer-events': 'none' });
    $('#radioKByteP').css({ 'pointer-events': 'none' });
    $('#radioMByteP').css({ 'pointer-events': 'none' });
    $('#inputBlock').css({ 'pointer-events': 'none' });
    $('#radioKByteB').css({ 'pointer-events': 'none' });
    $('#radioMByteB').css({ 'pointer-events': 'none' });
  }
});

$('#radioBlock').on('click', function () {
  var valTraffic = $('#radioBlock').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");
    $('#inputTime').css({ 'pointer-events': 'none' });
    $("#radioKByteB").prop("checked", true); //Nuevo
    $("#checkBoxRange").prop("checked", false); //Nuevo
    $('#checkBoxRange').css({ 'pointer-events': 'none' }); //Nuevo
    $('#inputRange').css({ 'pointer-events': 'none' });  // Nuevo
    $('#inputPacket').css({ 'pointer-events': 'none' });
    $('#radioKByteP').css({ 'pointer-events': 'none' });
    $('#radioMByteP').css({ 'pointer-events': 'none' });
    $('#inputBlock').css({ 'pointer-events': 'visible' });
    $('#radioKByteB').css({ 'pointer-events': 'visible' });
    $('#radioMByteB').css({ 'pointer-events': 'visible' });

  } else {
    $('#inputTime').css({ 'pointer-events': 'none' });
    $("#radioKByteB").prop("checked", true); //Nuevo
    $('#checkBoxRange').css({ 'pointer-events': 'none' }); //Nuevo
    $('#inputRange').css({ 'pointer-events': 'none' });  // Nuevo
    $('#inputPacket').css({ 'pointer-events': 'none' });
    $('#radioKByteP').css({ 'pointer-events': 'none' });
    $('#radioMByteP').css({ 'pointer-events': 'none' });
    $('#inputBlock').css({ 'pointer-events': 'none' });
    $('#radioKByteB').css({ 'pointer-events': 'none' });
    $('#radioMByteB').css({ 'pointer-events': 'none' });
  }
});

// Display Opciones de los Fancy Generadores de trafico
$('#radioSpecific').on('click', function () {
  var valTraffic = $('#radioSpecific').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");
    $('#inputHostAS').css({ 'pointer-events': 'visible' });
    $('#inputHostBS').css({ 'pointer-events': 'visible' });
  } else {
    $('#inputHostAS').css({ 'pointer-events': 'none' });
    $('#inputHostBS').css({ 'pointer-events': 'none' });
  }
});
$('#radioXtreme').on('click', function () {
  var valTraffic = $('#radioXtreme').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");
    $('#inputHostAS').css({ 'pointer-events': 'none' });
    $('#inputHostBS').css({ 'pointer-events': 'none' });
  } else {
    $('#inputHostAS').css({ 'pointer-events': 'none' });
    $('#inputHostBS').css({ 'pointer-events': 'none' });
  }
});
$('#radioGlobal').on('click', function () {
  var valTraffic = $('#radioGlobal').prop('checked');
  console.log("estato: " + valTraffic);
  if (valTraffic == true) {
    console.log("Checkbox seleccionado");
    $('#inputHostAS').css({ 'pointer-events': 'none' });
    $('#inputHostBS').css({ 'pointer-events': 'none' });
  } else {
    $('#inputHostAS').css({ 'pointer-events': 'none' });
    $('#inputHostBS').css({ 'pointer-events': 'none' });
  }
});


var ipClient = "";

function clear_variables_action() {
  elemento = {}
  elements = []
  ipClient = ""
}

// Fancy tráfico especifico por Host
function fancyHostTrafficSpecific() {

  var divFancy = ".divTrafficHost";

  $.fancybox.open($(divFancy), {
    touch: false,
    modal: false,
    infobar: false,
    clickSlide: false,
    clickOutside: false,
  });

}
// Función pasar datos al textArea
function copiarTrafficHost(id) {
  
  var tabla = 'Especifico '+'\n'+'Host: '+String('H2')+'\n'+'Tiempo'+'\t\t'+'Bytes'+'\t\t'+'BitRate'+'\t\t'+'Retransmitidos'+'\t\t'+'CWND'+'\t\t'+'RTT'+'\t\t'+'RTTVAR'+'\t\t'+'PMTU';
  
  var prueba = "prueba 2";
  var prueba2 = "contnuacion prueba";
  var txtArea = tabla;
//  var txtArea = prueba + "\t" + prueba2 + "\n" + prueba + "\t" + prueba2;
  $("#txtAreaTrafficSpecific").html(txtArea);
}

$('.copiar').on('click', function () {
  copiarTrafficHost();
  fancyHostTrafficSpecific();
});

// Fancy IP 
function fancyIpClient() {

  var divFancy = ".divIP_xclient";

  $.fancybox.open($(divFancy), {
    touch: false,
    modal: false,
    infobar: false,
    clickSlide: false,
    clickOutside: false,
  });

}

//********************************************************************************************************** */
$('.graphic').on('click', function () {
  var divFancy = ".divFancyGraphic";

  $.fancybox.open($(divFancy), {
    touch: false,
    modal: false,
    infobar: false,
    clickSlide: false,
    clickOutside: false,
  });

  var graph = $('#graphic');

  datosYNumBytes.push(0);
  datosYBitsPerSecond.push(0);
  datosYSndCwnd.push(0);
  datosYRetransmits.push(0);
  datosYRtt.push(0);
  datosYRttVar.push(0);
  datosYPmtu.push(0);


  var graphics = new Chart(graph, {
    type: 'line',
    data: {

      labels: labelsGraphic,
      datasets: [{
        label: 'Total de Bytes Transmitidos',
        data: datosYNumBytes,
        backgroundColor: [

          'rgba(54, 162, 235, 0.2)'

        ],
        borderWidth: 1,
        steppedLine: true
      },
      {
        label: 'Bits por Segundo',
        data: datosYBitsPerSecond,
        backgroundColor: [
          'rgba(111, 194, 63, 0.2)'
        ],
        borderWidth: 1,
        steppedLine: true

      },
      {
        label: 'SND CWND',
        data: datosYSndCwnd,
        backgroundColor: [
          'rgba(226, 33, 33, 0.2)'
        ],
        borderWidth: 1,
        steppedLine: true

      },
      {
        label: 'Bytes Retransmitidos',
        data: datosYRetransmits,
        backgroundColor: [
          'rgba(226, 165, 33, 0.2)'
        ],
        borderWidth: 1,
        steppedLine: true

      },
      {
        label: 'RTT',
        data: datosYRtt,
        backgroundColor: [
          'rgba(33, 226, 226, 0.2)'
        ],
        borderWidth: 1,
        steppedLine: true

      },
      {
        label: 'RTT VAR',
        data: datosYRttVar,
        backgroundColor: [
          'rgba(101, 33, 226, 0.2)'
        ],
        borderWidth: 1,
        steppedLine: true

      },
      {
        label: 'PMTU',
        data: datosYPmtu,
        backgroundColor: [
          'rgba(226, 33, 168, 0.2)'
        ],
        borderWidth: 1,
        steppedLine: true

      }]

    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

});
/*
$('#graf').on('click', function () {
  var divFancy = ".divFancyGraphic";

  $.fancybox.open($(divFancy), {
    touch: false,
    modal: false,
    infobar: false,
    clickSlide: false,
    clickOutside: false,
  });

  var graph = $('#graphic');

  var graphics = new Chart(graph, {
    type: 'line',
    data: {
      labels: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
      datasets: [{
        label: 'Ancho de Banda Entre Host - Servidor',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  });

});*/



//Variables para Formulario IP X Client FancyBox
$('#saveIP_xclient').on('click', function () {
  ipClient = $('#inputIP_xclient').val();
  elemento['IpClient'] = ipClient;
  parent.jQuery.fancybox.close();

  // Restablecimiento por Defecto de los Input - Controller
  $("#inputIP_xclient").val(null);

  //Envío JSON al views 
  console.log(JSON.stringify(elemento));
  // Variables JSON
  var json = JSON.stringify(elemento);
  //console.log('esto es un json: ' + json);

  //Formato de Petición AJAX
  $.ajax({
    type: "post",//get- consutla post- se actualiza
    url: "http://127.0.0.1:8000/alambric_emulator/",
    dataType: "json",
    contentType: 'application/json; charset=utf-8',
    data: json,
    success: function (data) {
      $.fancybox.open('<div class="message"><h2>¡Realizado!</h2><p>Red Emulada con Éxito.</p></div>');
    }
  });

  clear_variables_action();

});

// Inicia la Emulación
function startEmulation() {

  console.log("Play");
  loadInfoElements();
  elemento['items'] = elements;
  fancyIpClient();

  $('.stopDesp').css({ 'pointer-events': 'visible' });
  $('.wSharkDesp').css({ 'pointer-events': 'visible' });
  $('.genTr').css({ 'pointer-events': 'visible' });
  $('.grafDesp').css({ 'pointer-events': 'visible' });
  $('.odlDesp').css({ 'pointer-events': 'visible' });

  $('.stop').css({ 'pointer-events': 'visible' });
  $('.generator').css({ 'pointer-events': 'visible' });
  $('.wireShark').css({ 'pointer-events': 'visible' });
  $('.graphic').css({ 'pointer-events': 'visible' });
  $('.opendayligth').css({ 'pointer-events': 'visible' });

}

$('.play').on('click', function () {
  $('.play').css({ 'pointer-events': 'none' });
  $('.playDesp').css({ 'pointer-events': 'none' });
  startEmulation()
});

$('.playDesp').on('click', function () {
  $('.playDesp').css({ 'pointer-events': 'none' });
  $('.play').css({ 'pointer-events': 'none' });
  startEmulation()
});

/*------------------------------------------------------------------------------------------------------*/
/* Parametrización de los tipos de Red */
/*------------------------------------------------------------------------------------------------------*/

/* Envio parametros (FancyBox) para crear Topologia */
$('#createButtonTemplate').on('click', function () {
  console.log('enter');
  var templateForm = document.forms['formulario'];
  var value = templateForm['inputHostTemplate'].value;
  numHostTemplate = parseInt(value);

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
  numDepthTemplate = parseInt(dp);
  numFanoutTemplate = parseInt(fn);
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

function xSelect() {
  $("#xCloseSelect").css({ "display": "flex", "margin-top": "-22px" });
  console.log("Cerrar ");
}
