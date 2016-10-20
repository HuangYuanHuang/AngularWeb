angular.module('canvasGrid', ['angularMoment']).factory("Canvas", function (moment, $rootScope,$http) {
    var main = this;
    main.$table = $(".table-responsive");
    var nodeData = function (time, value, min, max) {
        var self = this;
        self.time = time;
        self.value = value;
        self.path = function () {
            console.log((moment(time).diff(main.startDate, 'seconds', true)));
            var X = (moment(time).diff(main.startDate, 'seconds', true) * 1.0 / main.offsetTime) * main.width;
            var Y = main.height - ((self.value - min) * 1.0 / (max - min)) * main.height;

            return { X: X, Y: Y };
        };

    }
    var lineNode = function (name, color, data, style, min, max) {
        var self = this;
        self.name = name;
        self.color = color;
        self.data = data || [];
        self.minValue = min;
        self.maxValue = max;
        self.axisYPosition = [];
        self.style = style;
        self.addData = function (item) {
            self.data.push(item);
        }
        self.init = function (array) {


            for (var i = 0; i < array.length; i++) {
                self.data.push(new nodeData(array[i].Time, array[i].Value, self.minValue, self.maxValue));

            }
        }
        self.clearData = function () {

        }
        self.draw = function () {

            if (self.data.length > 0) {
                main.canvasContext.beginPath();
                main.canvasContext.strokeStyle = self.color;
                main.canvasContext.lineWidth = 2;
                main.canvasContext.moveTo(self.data[0].path().X, self.data[0].path().Y);
                for (var i = 1; i < self.data.length; i++) {
                    main.canvasContext.lineTo(self.data[i].path().X, self.data[i].path().Y);

                }

            }


            main.canvasContext.stroke();
            main.canvasContext.closePath();

        }
    }
    var position = function (x, y, value, width, h) {
        this.x = x - width / 2;
        this.y = y - h / 2;
        this.value = value;
    }

    //竖直分割线模型
    var splitNode = function (id, x, y) {
        var self = this;
        self.id = id;
        this.X = x;
        this.Y = y;
        self.contextMenu = false;
        self.selectClick = function (e) {

            main.currSelectSplit = self;
        }
        self.mouseRightClick = function (e) {
            console.log("right Click" + e.clientX);
            main.splitLines.forEach(function (item) {

                item.contextMenu = false;
            });
            self.contextMenu = true;
            self.Y = e.clientY;
        }
        self.remove = function () {
            var index = -1;
            for (var i = 0; i < main.splitLines.length ; i++) {
                if (main.splitLines[i].id == self.id) {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                main.splitLines.splice(index, 1);
            }

        };
        self.clear = function () {
            while (main.splitLines.length > 0) {
                main.splitLines.pop();

            }
        }
        self.selectMouseUp = function (e) {

            main.currSelectSplit = null;
        }

    }
    main.width = 1000;
    main.height = 400;
    main.startDate = null;
    main.endDate = null;
    main.minValue = 0;
    main.maxValue = 80;
    main.nodes = [];

    main.offsetTop = 0;
    main.offsetLeft = 0;
    main.axisXPosition = [];
    main.axisYPosition = [];

    main.offsetTime = 3600;  //起始结束相隔时间 秒
    main.offsetValue = 80;  //Y坐标值
    main.canvasContext = null;
    main.splitLines = [];
    main.splitIndex = 0;
    main.init = function () {
        main.startDate = moment("2016-10-19 08:00:00");
        main.endDate = moment("2016-10-19 08:00:00").add(1, 'hours');
        main.width = main.$table.width();
        main.height = main.$table.height();
        main.offsetTop = main.$table.offset().top;
        main.offsetLeft = main.$table.offset().left;
        console.log(main.startDate);
        console.log(main.endDate);
        console.log("hegiht" + main.height);
        main.loadAxis();


    }
    main.loadAxis = function () {
        var itemX = main.width * 1.0 / 4;
        var date = main.endDate.diff(main.startDate, 'seconds', true) / 4;
        var temp = main.startDate.format();
        console.log(date + "时间间隔");
        for (var i = 0; i < 5; i++) {
            var node = new position(main.offsetLeft + i * itemX, main.offsetTop + 10 + main.height, moment(temp).add(i * date, 'seconds'), 120, 0);
            main.axisXPosition.push(node);
        }

        var itemY = (main.height * 1.0 / 8);
        for (var i = 0; i < 8; i++) {
            var node = new position(main.offsetLeft - 20, main.offsetTop + (i * itemY) - i, main.maxValue - i * 10, 0, 12);
            main.axisYPosition.push(node);
        }
        console.log(main.endDate.format());
    }
    main.initLineData = function (array) {

        for (var c in array) {

            var node = new lineNode(array[c].TagName, array[c].Color, [], "", array[c].MinValue, array[c].MaxValue);
            node.init(array[c].Data);
            main.nodes.push(node);
        }


    }
    main.draw = function () {
        var canvas = document.getElementById("canvas");
        if (canvas.getContext) {
            console.log("main drawing");
            main.canvasContext = canvas.getContext("2d");

            main.canvasContext.clearRect(0, 0, main.width, main.height);
            main.nodes.forEach(function (item) {
                console.log(item.name + "begin draw");
                item.draw();

            });

        }
    }
    main.currMousePageX = 0;
    main.currMousePageY = 0;
    main.currSelectSplit = null;
    main.mouserOverEvent = function (e) {
        main.currMousePageX = e.clientX;
        main.currMousePageY = e.clientY;
        if (main.currSelectSplit != null) {
            main.currSelectSplit.X = e.clientX;

        }

    }
    //鼠标双击 竖直分割线
    main.mouseDbClick = function () {
        main.splitLines.push(new splitNode(main.splitIndex, main.currMousePageX, main.currMousePageY));
        main.splitIndex++;
    }


    return main;


});