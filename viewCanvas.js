var _width;
var _height;
var _playerScale;


var _infoWindowW;
var _infoWindowH;
var _infoScale;
var _infoPaddingX;
var _infoPaddingY;


var _timeline;
var _drawer = {};
var _shape;

var _objectArray = [];
var _Array = [];

var _soundW;

var _playerWidth;
var _playerHeight;

var getImage;
var getBase64;

function getNewPage() {


    if (getImage != null) {
        getImage.abort();

    }

    if (getBase64 != null) {
        getBase64.abort();
    }

    _swfPath = _swfArray[_selectedIndex];

    getImage = $.get(api_get_size + _swfPath, function (data) {

    }).done(function (data) {

        data = JSON.parse(data);
        _questionW = data[0];
        _questionH = data[1];

        loadBG();

    });

}


function loadBG() {


    _infoWindowW = _info[0];
    _infoWindowH = _info[1];


    _playerWidth = $("#player").width();
    _playerHeight = $("#player").height();
    _playerScale = Math.min((_playerWidth / _infoWindowW), (_playerHeight / _infoWindowH));
    _infoPaddingX = _info[3] * _playerScale;
    _infoPaddingY = _info[4] * _playerScale;
    _width = _infoWindowW * _playerScale;
    _height = _infoWindowH * _playerScale;
    _soundW = $("#player").height();

    var margin_x = (_playerWidth - _width) / 2
    var margin_y = (_playerHeight - _height) / 2

    $("canvas").attr({"width": _width, "height": _height});

    $("canvas").css('margin-left', margin_x);
    $("canvas").css('margin-right', margin_x);


    var image_x = (_questionW * _infoScale) * _playerScale * 1.5;
    var image_y = (_questionH * _infoScale) * _playerScale * 1.5;


    var _x = (_questionW * _infoScale) * _playerScale;
    var _y = (_questionH * _infoScale) * _playerScale;

    var _imageURL = api_pdf2jpg + _pdfArray[_selectedIndex] + '&x=' + image_x + '&y=' + image_y;


    getBase64 = $.ajax({
        type: 'GET',
        url: _imageURL,
        async: false,
        success: function (data) {
            $("#canvas").css('background-size', '0px 0px');
            //$("#canvas").css({"background-image":"url('data:image/png;base64,"+ data +"')","background-position":_infoPaddingX+"px "+ _infoPaddingY+"px","background-size":_x+"px"+" "+_y+"px"});
            $("#canvas").css({
                "background-image": "url('" + data + "')",
                "background-position": _infoPaddingX + "px " + _infoPaddingY + "px",
                "background-size": _x + "px" + " " + _y + "px"
            });


        }
    });


    _shape = _canvas.getContext("2d");
    _shape.save();
    _shape.scale(_playerScale, _playerScale);
    $('#player').css('height', _height);
    $('#player').css('margin-top', ($(window).height() - $('#player').height()) / 2);
}


function canvas_addNewProcess(_object, _status, _addObject) {
    if (_timeline) {
        _timeline.clear();
        _timeline.kill();
        _timeline = null;
    }
    switch (_object.type) {
        case "line":
            addLine(_object, _status);
            //console.log('line');
            break;
        case "eraser":
            addEraser(_object, _status);
            //console.log('eraser');
            break;
        case "arrow":
            addArrow(_object, _status);
            //console.log(_object);
            break;
        case "triangle":
            addTriangle(_object, _status);
            //console.log('triangle');
            break;
        case "rectangle":
            addRectangle(_object, _status);
            //console.log('rectangle');
            break;
        case "circle":
            addCircle(_object, _status);
            //console.log('circle');
            break;
        case "delete":
            removeShape(_object);
            //console.log('delete');
            break;
        case "add":
            fastShape(_addObject, _status);
            //console.log(_addObject,1);
            break;
        case "scale":
            changeScale(_object);
            break;
        case "swf":
            changeSWF(_object);
            break;
    }

}

function pauseTween() {
    if (_timeline) _timeline.pause();
}

function playTween() {
    if (_timeline) _timeline.play();
}


function drawLine() {

    _shape.lineTo(_drawer.x, _drawer.y);
    _shape.stroke();
}


function changeScale(_object) {

    var _s = _object.objectID.substr(2, _object.objectID.length);
    _infoScale = _s;

    var image_x = (_questionW * _infoScale) * _playerScale;
    var image_y = (_questionH * _infoScale) * _playerScale;

    $("canvas").css('background-size', image_x + 'px ' + image_y + 'px');
    getNewPage();

}

function changeSWF(_object) {

    var _str = _object.objectID.substr(2, String(_object.objectID).length);
    var _i = _str.split("-")[0];
    var _s = _str.split("-")[1];

    _selectedIndex = _i;
    _infoScale = _s;
    getNewPage();
    /*
    if (this.contains(this._layerSWF)) this.removeChild(this._layerSWF);
    this._layerSWF.scaleX=1;
    this._layerSWF.scaleY=1;
    this._layerSWF=null;
    this._layerSWF=this._swfList[_i].swf;
    this._layerSWF.x=this._padding.x;
    this._layerSWF.y=this._padding.y;
    this._layerSWF.scaleX=_s;
    this._layerSWF.scaleY=_s;
    this.addChild(this._layerSWF);
    this.addChild(this._layerDrawing);
    */
}

//line
function addLine(_object, _status) {

    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineJoin = "round";
    _shape.lineCap = "round";
    _shape.fillStyle = "none";
    _shape.moveTo(_drawer.x, _drawer.y);

    if (!_status) {
        _timeline = new TimelineLite();
        _timeline.add(TweenLite.to(_drawer, _object.duration, {
            bezier: {
                curviness: 0,
                values: _object.points,
                autoRotate: false
            }, ease: Linear.easeNone, onUpdate: drawLine, onComplete: completeLine, onCompleteParams: [_object, true]
        }));
        _objectArray.push(_object);
    } else {

        fastShape(_object, false);
    }
}

//circle
function addCircle(_object, _status) {
    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.lineJoin = "round";
    _shape.lineCap = "round";
    _shape.fillStyle = "none";
    var cicle_value = _object.rectangle;
    //_shape.arc(cicle_value.x+cicle_value.width/2,cicle_value.y+cicle_value.height/2,cicle_value.height/2,0,2 * Math.PI,false);
    _shape.ellipse(cicle_value.x + cicle_value.width / 2, cicle_value.y + cicle_value.height / 2, cicle_value.width / 2, cicle_value.height / 2, 0, 0, 2 * Math.PI);
    _shape.stroke();
    _objectArray.push(_object);

}

//eraser
function addEraser(_object, _status) {

    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;
    _shape.beginPath();
    _shape.canvas = _canvas;
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalCompositeOperation = "destination-out";
    _shape.moveTo(_object.points[0].x, _object.points[0].y);

    if (!_status) {
        _timeline = new TimelineLite();
        _timeline.add(TweenLite.to(_drawer, _object.duration, {
            bezier: {
                curviness: 0,
                values: _object.points,
                autoRotate: false
            }, ease: Linear.easeNone, onUpdate: drawLine, onComplete: completeLine, onCompleteParams: [_object, true]
        }));
    } else {
        fastShape(_object);
    }
    _objectArray.push(_object);

}

//triangle
function addTriangle(_object, _status) {
    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineJoin = "miter";
    _shape.lineCap = "butt";
    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;
    _shape.moveTo(_drawer.x, _drawer.y);

    if (!_status) {
        _timeline = new TimelineLite();
        _timeline.add(TweenLite.to(_drawer, _object.duration, {
            bezier: {
                curviness: 0,
                values: _object.points,
                autoRotate: false
            }, ease: Linear.easeNone, onUpdate: drawLine, onComplete: completeLine, onCompleteParams: [_object, true]
        }));
    } else {
        afterTriangle(_object);
    }
    _objectArray.push(_object);

}

function addRectangle(_object, _status) {

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineJoin = "miter";
    _shape.lineCap = "square";

    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;
    _shape.moveTo(_drawer.x, _drawer.y);


    if (!_status) {
        _timeline = new TimelineLite();
        _timeline.add(TweenLite.to(_drawer, _object.duration, {
            bezier: {
                curviness: 0,
                values: _object.points,
                autoRotate: false
            }, ease: Linear.easeNone, onUpdate: drawLine, onComplete: completeLine, onCompleteParams: [_object, true]
        }));
    } else {
        afterRectangle(_object);
    }

    _objectArray.push(_object);

}

function drawArrow(_object) {

    var fromx = _object.points[0].x
    var fromy = _object.points[0].y;
    var tox = _object.points[1].x;
    var toy = _object.points[1].y;

    var headlen = _object.size;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    _shape.beginPath();
    _shape.moveTo(tox, toy);
    _shape.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
    _shape.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));
    _shape.lineTo(tox, toy);
    _shape.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

    _shape.strokeStyle = _object.color;
    _shape.lineWidth = _object.size;
    _shape.stroke();
    _shape.fillStyle = _object.color;
    _shape.fill();


}

//arrow
function addArrow(_object, _status) {

    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineCap = "butt";
    _shape.lineJoin = "miter";
    _shape.fillStyle = "none";
    _shape.moveTo(_drawer.x, _drawer.y);

    if (!_status) {
        _timeline = new TimelineLite();
        _timeline.add(TweenLite.to(_drawer, _object.duration, {
            bezier: {values: _object.points},
            ease: Linear.easeNone,
            onUpdate: drawLine,
            onComplete: drawArrow,
            onCompleteParams: [_object, true]
        }));
    } else {

        fastShape(_object, false);
    }
    _objectArray.push(_object);

}

function completeLine(_object) {
    _shape.closePath();
    _shape.stroke();
    _shape.clearRect(0, 0, _width / _playerScale, _height / _playerScale);
    removeAfter(_objectArray);

}

function removeShape(_object) {

    _shape.clearRect(0, 0, _width / _playerScale, _height / _playerScale);
    _objectArray = jQuery.grep(_objectArray, function (value) {
        return value.id != _object.objectID;
    });
    removeAfter(_objectArray);
}

function clearAllShapes() {
    _objectArray = [];
    _shape.clearRect(0, 0, _width / _playerScale, _height / _playerScale);
}


function removeAfter(_objectArray) {

    $.map(_objectArray, function (_object) {

        switch (_object.type) {
            case "line":
                afterLine(_object);
                break;
            case "eraser":
                afterEraser(_object);
                break;
            case "arrow":
                afterArrow(_object);
                break;
            case "triangle":
                afterTriangle(_object);
                break;
            case "rectangle":
                afterRectangle(_object);
                break;
            case "circle":
                afterCircle(_object);
                break;
            case "delete":
                //removeShape(_object);
                //console.log('after');
                break;
            case "add":
                fastShape(_addObject);
                break;
        }

    });


}

function afterLine(_object) {

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineJoin = "round";
    _shape.lineCap = "round";
    _shape.fillStyle = "none";
    _shape.moveTo(_object.points[0].x, _object.points[0].y);
    $.map(_object.points, function (k) {
        _shape.lineTo(k.x, k.y);
    });
    _shape.stroke();

}

function afterEraser(_object) {

    _shape.beginPath();
    _shape.lineWidth = _object.size;
    _shape.globalCompositeOperation = "destination-out";
    _shape.moveTo(_object.points[0].x, _object.points[0].y);
    $.map(_object.points, function (k) {
        _shape.lineTo(k.x, k.y);
    });
    _shape.stroke();
}

function afterTriangle(_object) {

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineJoin = "miter";
    _shape.lineCap = "butt";
    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;
    _shape.moveTo(_drawer.x, _drawer.y);

    $.map(_object.points, function (k) {
        _shape.lineTo(k.x, k.y);
    });
    _shape.closePath();
    _shape.stroke();
}

function afterRectangle(_object) {

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.globalCompositeOperation = "source-over";
    _shape.lineJoin = "miter";

    var _rectGenislik = _object.points[1].x - _object.points[0].x;
    var _rectYukseklik = _object.points[2].y - _object.points[1].y;
    _shape.rect(_object.points[0].x, _object.points[0].y, _rectGenislik, _rectYukseklik);
    _shape.stroke();
}

function afterCircle(_object) {

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.lineJoin = "round";
    _shape.lineCap = "round";
    _shape.fillStyle = "none";
    var cicle_value = _object.rectangle;
    _shape.ellipse(cicle_value.x + cicle_value.width / 2, cicle_value.y + cicle_value.height / 2, cicle_value.width / 2, cicle_value.height / 2, 0, 0, 2 * Math.PI);
    _shape.stroke();
}

function fastShape(_object) {

    _shape.beginPath();

    _drawer.x = _object.points[0].x;
    _drawer.y = _object.points[0].y;

    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.strokeStyle = _object.color;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    if (_object.type == 'eraser') {
        _shape.globalCompositeOperation = "destination-out";
    } else {
        _shape.globalCompositeOperation = "source-over";
    }

    _shape.lineJoin = "round";
    _shape.lineCap = "round";
    _shape.fillStyle = "none";
    _shape.moveTo(_drawer.x, _drawer.y);

    $.map(_object.points, function (k) {
        _shape.lineTo(k.x, k.y);
    });
    _shape.stroke();
    _objectArray.push(_object);
}


function afterArrow(_object) {


    _shape.beginPath();
    _shape.name = _object.id;
    _shape.lineWidth = _object.size;
    _shape.globalAlpha = _object.highlight == "false" ? 1 : 0.5;
    _shape.lineJoin = "miter";
    _shape.lineCap = "butt";
    _shape.globalCompositeOperation = "source-over";

    var fromx = _object.points[0].x
    var fromy = _object.points[0].y;
    var tox = _object.points[1].x;
    var toy = _object.points[1].y;


    var headlen = 10;
    var angle = Math.atan2(toy - fromy, tox - fromx);

    _shape.beginPath();
    _shape.moveTo(fromx, fromy);
    _shape.lineTo(tox, toy);
    _shape.strokeStyle = _object.color;
    _shape.lineWidth = _object.size;
    _shape.stroke();

    _shape.beginPath();
    _shape.moveTo(tox, toy);
    _shape.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));
    _shape.lineTo(tox - headlen * Math.cos(angle + Math.PI / 7), toy - headlen * Math.sin(angle + Math.PI / 7));
    _shape.lineTo(tox, toy);
    _shape.lineTo(tox - headlen * Math.cos(angle - Math.PI / 7), toy - headlen * Math.sin(angle - Math.PI / 7));

    _shape.strokeStyle = _object.color;
    _shape.lineWidth = _object.size;
    _shape.stroke();
    _shape.fillStyle = _object.color;
    _shape.fill();
}


/*

			
				
		private function completeLine(_highlight:String,_points:Array,_size:Number,_color:uint):void {			
			_points=simplify(_points);
			this._shape.graphics.clear();
			this._shape.graphics.lineStyle(_size,_color, _highlight=="true"?0.5:1,false, LineScaleMode.NORMAL, CapsStyle.ROUND, JointStyle.ROUND);					
			this._shape.graphics.moveTo(_points[0].x, _points[0].y);			
			for ( var _i:int = 1; _i < _points.length; _i++ ){		
				this._shape.graphics.lineTo(_points[_i].x,_points[_i].y);				
			}			
		}
		*/