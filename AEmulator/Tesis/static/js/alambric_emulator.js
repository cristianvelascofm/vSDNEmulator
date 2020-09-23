var labelText = new fabric.IText("label", {
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

var groupLabelController = new fabric.Group([rectangle, labelText], {
  left: 30,
  top: 30,
  opacity: 1,
  hasControls: false,
  hasBorders: true,
  transparentCorners: false,
  selectable: false,
  visible: false,
  id: "label",
  connection: [], // Contiene todos los enlaces del grupo (son los mismos enlaces del elemento (connectionLine[]))   
});



window.onload = function () {
  canvas.add(groupLabelController);
}



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
var tagController = []; // Contiene las Etiquetas(C1, C2, C3..) de los Controladores de Red 
var link = []; //Contiene el Arreglo de Links de la Red
var flag = true; //Control de Uso del Zoom
var topologyType = "";



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

// Crea un Grupo con el Elemento y su Etiqueta Respectíva
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
      evented: false,
      id: "normal",
    });
  } else if (linkType == "portHost") {

    return new fabric.Line(coords, {
      fill: 'yellow',
      stroke: '#E1B13C',
      strokeWidth: 2,
      selectable: true,
      evented: false,
      id: "portHost",
    });
  } else if (linkType == "link") {

    return new fabric.Line(coords, {
      fill: 'green',
      stroke: '#2AFE00',
      strokeWidth: 2,
      selectable: true,
      evented: false,
      id: "link",
    });

  } else if (linkType == "portSwitch") {

    return new fabric.Line(coords, {
      fill: 'yellow',
      stroke: '#57E3EC',
      strokeWidth: 2,
      selectable: true,
      evented: false,
      id: "portSwitch",
    });

  } else {

    return new fabric.Line(coords, {
      strokeDashArray: [5, 5],
      stroke: 'blue',
      strokeWidth: 2,
      selectable: true,
      evented: false,
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
          value: tagHost[r + 1],
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

      // Agrega el Link del Controller
      //canvas.add(makeLink([pSX + 33, pSY + 20, pCX + 35, pCY + 20], "cont"));

      // Insertar Elementos de Red
      for (var a = 0; a < h.length; a++) {

        insertElement(h[a].rX, h[a].rY, "../static/img/host.png", "h" + (tagHost.length + 1), numHost, topologyType);
      }

      //Inserta el SwithcOF de la Red Single
      insertElement(101, pSY, '../static/img/openflow_switch.png', "s" + (tagSwitchOF.length + 1), numHost, topologyType);

      //Inserta el Controller de la Red Single
      insertElement(pCX, pCY, '../static/img/controller.png', 'c' + (tagController.length + 1), numHost, topologyType);

      // 
      var id0 = [];
      var id1 = "";
      var posX1 = [];
      var posY1 = [];
      var posX2 = [];
      var posY2 = [];
      var objHost = [];
      var objSwitch = [];
      var objController = [];

      for (var i = (tagHost.length) - numHost; i <= tagHost.length; i++) {

        id0.push("h" + (i + 1));
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

      }

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
        // url: "../static/py/algo.py",
        dataType: "json",
        contentType: 'application/json; charset=utf-8',
        data: json,
        //headers: { 'X-CSRFToken': csrftoken },

        success: function (data) {
          alert(JSON.stringify(data));
        }
      });

    }

  }
  // Creador Topología Linear - N Conmutador Conectado a N Host
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




var insertOP = false;
var imgUrl = "";
var selected = null;
var x0, y0;
var tool = 'cursor';
var action = null;
var countAsociate = 0;
var tag = "";
var img = '';


$(".mode").click(function () {
  tool = $(this).attr('id');
  console.log(tool);
  activeTool(tool);
  canvas.isDrawingMode = false; //don't draw until "Freeline" is clicked
});

canvas.on("mouse:dblclick", function (options) {

  switch (tool) {
    case 'cursor':

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
          var protocol = objActive.protocol;

          $("#optionTypeFancyController > option[value='" + type + "']").prop("selected", "selected");
          $('#inputFancyIpController').val(iPController);
          $("#optionProtocolFancyController > option[value='" + protocol + "']").prop("selected", 'selected');

          divFancy = ".divFancyController";

        } else if (objId == "h") {

          var iPHost = objActive.iPHost;
          var sheduler = objActive.sheduler;
          var cpuCores = objActive.cpuCores;

          $('#inputFancyIPHost').val(iPHost);
          $("#optionShedulerFancyHost > option[value='" + sheduler + "']").prop("selected", "selected");
          $('#inputFancyCPUCoresHost').val(cpuCores);

          divFancy = ".divFancyHost";

        }

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

// Mouse Obj Hover
canvas.observe('mouse:over', function (options) {
  var pointer = canvas.getPointer(options.e);
  x0 = pointer.x; //get initial starting point of x
  y0 = pointer.y; //get initial starting point of y

  switch (tool) {
    case 'cursor':
      if (options.target != null) {
        console.log(options.target.type);

        var objId = options.target.id.charAt(0);

        if (objId == "c") {

          var ipController = options.target.iPController;
          groupLabelController.set({

            left: x0,
            top: y0,
            visible: true,

          });
          canvas.renderAll();
        }

      } else {

        console.log("aqui esta el grupo ");
        groupLabelController.set({
          visible: false,
        });
        canvas.renderAll();
      }

      break;
  }
});

function labelOver(label) {


  return groupLabel;

}


// Mouse Down Canvas Opciones
canvas.observe('mouse:down', function (options) {
  var pointer = canvas.getPointer(options.e);
  x0 = pointer.x; //get initial starting point of x
  y0 = pointer.y; //get initial starting point of y

  switch (tool) {
    case 'cursor':

      var objActive = canvas.getActiveObject();

      if (objActive != null) {
        console.log("id: " + objActive.type);
        console.log("id: " + objActive.stp);
        console.log("id: " + objActive.iPPort);
        console.log("id: " + objActive.bW);
        console.log("id: " + objActive.label);
        console.log("id: " + objActive.iPHost);

        canvas.forEachObject(function (obj) {

          // console.log("propiedades: "+obj.type);
          obj.set({
            opacity: 1,
          })

        });
        objActive.set({
          opacity: 0.7,
        });
      } else {
        canvas.forEachObject(function (obj) {
          obj.set({
            opacity: 1,
          })

        });


      }
      canvas.renderAll();
      break;
    case 'host':
      img = '../static/img/host.png';
      tag = "h" + (tagHost.length + 1);
      frameFancyBoxInsertElement('host', tag, x0, y0, img);
      tool = "cursor";
      desactiveTool('host');
      activeTool(tool);

      break;
    case 'controller':
      img = '../static/img/controller.png';
      tag = "c" + (tagController.length + 1);
      frameFancyBoxInsertElement('controller', tag, x0, y0, img);

      tool = "cursor";
      desactiveTool('controller');
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
      desactiveTool('label');
      createLabel(x0, y0);
      activeTool(tool);

      break;

    case 'link':
      img = '../static/img/';
      tag = "Link1";
      frameFancyBoxInsertElement('link', tag, x0, y0, img);
      var asociate = [];
      /*do {
        var objActive = canvas.getActiveObject();
        if (objActive != null) {
          asociate.push(objActive);
          countAsociate = countAsociate + 1;






        }

      } while (countAsociate <= 2);

      var coordinates = [asociate[0].x2, asociate[0].y2, asociate[1].x2, asociate[1].y2]; //set initial coordinates of straight line to the mouse point
      // if (objActive.id.charAt(0) == "e") {
      var line = new fabric.Line(coordinates, options = {
        strokeWidth: 3,
        stroke: 'red',
      });
      selected = line;
      canvas.add(line);
      canvas.setActiveObject(line);
      //  }




      //frameFancyBoxInsertElement('link', tag, x0, y0, img);
      //tool = "cursor";
      //desactiveTool('link');
      //activeTool(tool);
      */
      break;
  }
});

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

          } else {

            p.connection[i] && p.connection[i].set({
              'x1': p.left + 30,
              'y1': p.top + 35
            });

          }
        }

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
                } else if (p.position == "terminal") {
                  p.connection[i] && p.connection[i].set({
                    'x1': p.left + 10,
                    'y1': p.top + 7
                  });

                } else {
                  p.connection[i] && p.connection[i].set({
                    'x1': p.left + 10,
                    'y1': p.top + 7
                  });
                }

              } else {
                p.connection[i] && p.connection[i].set({
                  'x2': p.left + 10,
                  'y2': p.top + 7
                });
              }

            } else {
              //muevo la asociasion 
              p.connection[i] && p.connection[i].set({
                'x2': p.left + 10,
                'y2': p.top + 7
              });
            }
          } else {
            p.connection[i] && p.connection[i].set({
              'x2': p.left + 10,
              'y2': p.top + 7
            });
          }

        }
      }
      break;
    case 'link':
      tool = null;




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


      break;

    case 'link':
      if (selected != null) {
        if (objActive != null) {
          objActive.set({
            lockMovementX: true,
            lockMovementY: true,
          });

        }
        selected.set({
          x2: x2, //set the line's x2 to the current X value of the mouse
          y2: y2,  //set the line's y2 to the current Y value of the mouse
          selectable: true,
          hasBorders: false,
          hasControls: false,
        })
      }
      canvas.setActiveObject(selected);


      canvas.renderAll();
      break;

  }
});

canvas.observe('mouse:up', function (options) {
  switch (tool) {
    case 'link':
      x0 = 0;
      y0 = 0;
      selected = null;
      tool = 'cursor';
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
/*canvas.remove(object);
insertOp = false;
activeTool(selector);*/





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
    fontSize: 15
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

function desactiveTool(id) {
  var activeTool = $("#" + id);

  activeTool.css("backgroundColor", "#E1F3F1");
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

function resetVariables() {


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
  var ipSw = $('#inputFancyIPSwitch').val();
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


  insertElementClick(x0, y0, img, tag);
  tagSwitchOF.push(tag);

  canvas.forEachObject(function (obj) {


    if (obj.id == tag) {

      if (verbose != null) {
        obj.verbose = verbose;
      }

      if (batch != null) {
        obj.batch = batch;
      }

      if (inNameSpace != null) {
        obj.inNameSpace = inNameSpace;
      }

      if (inBand != null) {
        obj.inBand = inBand;
      }

      if (model != "Ninguno") {
        obj.model = model;
      }

      if (dataPathArgs != null) {
        obj.dataPathArgs = dataPathArgs;
      }

      if (dataPathIP != null) {
        obj.dataPathIP = dataPathIP;
      }

      if (dataPath != "Ninguno") {
        obj.dataPath = dataPath;
      }

      if (protocol != "OpenFlow 1.0") {
        obj.protocol = protocol;
      }

      if (dpctlPort != null) {
        obj.dpctlPort = dpctlPort;
      }

      if (ipSw != null) {
        obj.ipSw = ipSw;
      }

      if (stpPriority != null) {
        obj.stpPriority = stpPriority;
      }

      if (stp != null) {
        obj.stp = stp;
      }

      if (type != "Ninguno") {
        obj.type = type;
      }

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
});

/* Cerrar Fancy Parametros Elementos  Switch */
$('#CancelarButtonFancySwitch').on('click', function () {
  parent.jQuery.fancybox.close();
});


/* Crear Parametros Elementos  Port*/
$('#GuardarButtonFancyPort').on('click', function () {
  var iPPort = $('#inputFancyIPPort').val();

  canvas.forEachObject(function (obj) {

    if (obj.id == tag) {

      if (iPPort != null) {
        obj.iPPort = iPPort;
      }
    }
  });

  parent.jQuery.fancybox.close();
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

  canvas.forEachObject(function (obj) {

    if (obj.id == tag) {

      if (loss != null) {
        obj.loss = loss;
      }

      if (queue != null) {
        obj.queue = queue;
      }

      if (jitter != null) {
        obj.jitter = jitter;
      }

      if (delay != null) {
        obj.delay = delay;
      }

      if (bW != null) {
        obj.bW = bW;
      }

    }
  });

  parent.jQuery.fancybox.close();

});

/* Cerrar Fancy Parametros Elementos  Link */
$('#CancelarButtonFancyLink').on('click', function () {
  parent.jQuery.fancybox.close();
});

/* Crear Parametros Elementos  Label */
$('#GuardarButtonFancyLabel').on('click', function () {
  var label = $('#inputFancyLabel').val();

  canvas.forEachObject(function (obj) {

    if (obj.id == tag) {

      if (label != null) {
        obj.label = label;
      }

    }
  });

  parent.jQuery.fancybox.close();

});


/* Cerrar Fancy Parametros Elementos  Label */
$('#CancelarButtonFancyLabel').on('click', function () {
  parent.jQuery.fancybox.close();
});


/* Crear Parametros Elementos  Host*/
$('#GuardarButtonFancyHost').on('click', function () {

  var iPHost = $('#inputFancyIPHost').val();
  var sheduler = $('#optionShedulerFancyHost option:selected').text();
  var cpuCores = $('#inputFancyCPUCoresHost').val();

  if (action != "visor") {
    insertElementClick(x0, y0, img, tag);
    tagHost.push(tag);

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {


        obj.iPHost = iPHost;



        obj.sheduler = sheduler;


        obj.cpuCores = cpuCores;

      }
    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto de los Select Host
    var selectScheluder = $('#optionShedulerFancyHost');
    selectScheluder.val(selectScheluder.data('default'));

  } else {

    canvas.forEachObject(function (obj) {

      if (obj.id == tag) {


        obj.iPHost = iPHost;
        obj.sheduler = sheduler;
        obj.cpuCores = cpuCores;

      }

      parent.jQuery.fancybox.close();

      // Restablecimiento por Defecto de los Select Host
      var selectScheluder = $('#optionShedulerFancyHost');
      selectScheluder.val(selectScheluder.data('default'));

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
  var protocol = $('#optionProtocolFancyController option:selected').text();

  if (action != "visor") {
    insertElementClick(x0, y0, img, tag);
    tagController.push(tag);


    canvas.forEachObject(function (obj) {

      if (obj.id && obj.id === tag) {

        obj.type = type;
        obj.iPController = iPController;
        obj.protocol = protocol;

      }

    });

    parent.jQuery.fancybox.close();

    // Restablecimiento por Defecto los Select - Controller
    var selectType = $('#optionTypeFancyController');
    selectType.val(selectType.data('default'));

    var selectProtocol = $('#optionProtocolFancyController');
    selectProtocol.val(selectProtocol.data('default'));

    $("#inputFancyIpController").val(null);

  } else {

    canvas.forEachObject(function (obj) {

      if (obj.id && obj.id === tag) {

        obj.type = type;
        obj.iPController = iPController;
        obj.protocol = protocol;

      }

    });

    parent.jQuery.fancybox.close();

    var selectType = $('#optionTypeFancyController');
    selectType.val(selectType.data('default'));

    var selectProtocol = $('#optionProtocolFancyController');
    selectProtocol.val(selectProtocol.data('default'));

    $("#inputFancyIpController").val(null);

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