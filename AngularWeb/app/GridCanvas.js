angular.module('canvasGrid', ['angularMoment']).factory("Canvas", function (moment, $rootScope, $http) {
    var main = this;
    main.$table = $("#tableCanvas");
    var nodeData = function (time, value, min, max) {
        var self = this;
        self.time = time;
        self.value = value;
        self.path = function () {

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
            self.initYAxis();
        }
        self.initYAxis = function () {
            var index = main.nodes.length;
            var rows = main.tableRow.length;
            var itemY = (self.maxValue - self.minValue) / rows;
            var itemHeight = main.height / rows;
            var itemIndex = 0;
            var tempX = $("tr", main.$table).offset().left - 80;
            for (var i = rows - 1; i >= 0; i--) {
                var tempY = $("tr:eq(" + i + ")", main.$table).offset().top + itemHeight - index * main.labelHeight;
                console.log("Y=" + tempY);
                self.axisYPosition.push(new position(tempX, tempY, itemIndex * itemY + self.minValue, self.color));
                itemIndex++;
            }
            //var lastY = self.axisYPosition[rows-1].y - self.axisYPosition[0].y + self.axisYPosition[1].y;
            //self.axisYPosition.push(new position(tempX,lastY,self.maxValue,self.color));
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
    var position = function (x, y, value, color) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.color = color;
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

    main.nodes = [];  //line 集合


    main.offsetTop = 0;
    main.offsetLeft = 0;
    main.axisXPosition = [];
    main.axisYPosition = [];
    main.tableRow = [1, 2, 3, 4, 5, 6, 7, 8];  //Table Row
    main.tableRowHeight = 60; //Table　row height

    main.offsetTime = 3600;  //起始结束相隔时间 秒
    main.offsetValue = 80;  //Y坐标值
    main.labelWidth = 72; //标签实际长度的1/2
    main.labelHeight = 10; //标签实际高度的1/2
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

        console.log("hegiht=" + main.height + " width=" + main.width);
        main.loadAxis();



    }
    main.loadAxis = function () {

        var date = main.endDate.diff(main.startDate, 'seconds', true) / 4;
        var temp = main.startDate.format();
        var offsetTop = $("tr:last", main.$table).offset().top + $("tr:last", main.$table).height() + 20;
        console.log(date + "时间间隔");
        var index = 0;
        for (var i = 0; i < 8; i += 2) {
            var left = $("tr:last td:eq(" + i + ")", main.$table).offset().left - main.labelWidth;  //减去标签长度
            var node = new position(left, offsetTop, moment(temp).add(index * date, 'seconds'), "");
            index++;
            main.axisXPosition.push(node);
        }
        var tempLeft = $("tr:last td:last", main.$table).offset().left - main.labelWidth + main.width / 8;

        var node = new position(tempLeft, offsetTop, moment(temp).add(index * date, 'seconds'), "");

        main.axisXPosition.push(node);
    }



    main.initLineData = function (array) {

        for (var c in array) {

            var node = new lineNode(array[c].TagName, array[c].Color, [], "", array[c].MinValue, array[c].MaxValue);

            main.nodes.push(node);
            node.init(array[c].Data);
        }

        //var getArr = function (len) {

        //    for (var i = 0; i < len; i++) {
        //        main.tableRow.push(i);
        //    }

        //}
        //if (main.nodes.length <= 3) {
        //    getArr(8);
        //    main.tableRowHeight = 60;
        //} else if (main.nodes.length < 8) {
        //    getArr(5);
        //    main.tableRowHeight = 80;
        //} else {
        //    getArr(3);
        //    main.tableRowHeight = 130;
        //}

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