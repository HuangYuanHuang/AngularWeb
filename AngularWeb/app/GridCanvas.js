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
                var tempY = main.offsetTop + (i + 1) * itemHeight - index * main.labelHeight;

                self.axisYPosition.push(new position(tempX, tempY, itemIndex * itemY + self.minValue, self.color));
                itemIndex++;
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
    var position = function (x, y, value, color) {
        var self = this;
        self.x = x;
        self.y = y;
        self.value = value;
        self.color = color;
        self.style = {
            position: 'absolute',
            left: self.x + "px",
            top: self.y + "px",
            color: self.color
        }
    }

    //竖直分割线模型
    var splitNode = function (id, x, y) {
        var self = this;
        self.id = id;
        this.X = x;
        this.Y = y;
        this.poverY = y;
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
        self.style = function () {
            return {
                height: main.height + "px",
                "z-index": 12,
                position: "absolute",
                top: main.offsetTop + "px",
                left: self.X + "px"
            }
        }
        self.menuStyle = function () {
            return {
                position: 'absolute',
                "z-index": 1200,
                top: self.Y + "px",
                left: self.X + "px"
            }
        }
        self.poverStyle = function () {
            return {
                top: self.poverY + "px",
                left: self.X + "px",
                display: "block"
            }
        }
        self.time = "";
        self.compTimeValue = function (value) {

            var seconds = ((value - main.offsetLeft + 1) / main.width) * main.offsetTime;
            self.time = moment(main.startDate).add(seconds, 'seconds');
            console.log(self.time.format());
            self.compValue(self.time);
        }
        self.compValue = function (time) {

            for (var c in main.nodes) {
                var arr = main.nodes[c].data;
                var date = moment(time);
                var node = null;
                if (self.poperNodes.length > c) {
                    node = self.poperNodes[c];
                    node.value = "NaN";
                } else {
                    node = new poperNode("NaN", main.nodes[c].color);
                    self.poperNodes.push(node);
                }
              

                if (arr.length > 1 && date.isAfter(arr[0].time) && date.isBefore(arr[arr.length - 1].time)) {
                    for (var i = 0; i < arr.length - 1; i++) {
                        var isFind = false;
                        var findValue = 0;
                        if (date.isAfter(arr[i].time) && date.isBefore(arr[i + 1].time)) {
                            var tempX = moment(arr[i + 1].time).diff(arr[i].time, "seconds", true);
                            var tempTime = moment(time).diff(arr[i].time, "seconds", true);

                            findValue = arr[i].value + (arr[i + 1].value - arr[i].value) * (tempTime / tempX);

                            isFind = true;

                        } else if (date.isSame(arr[i].time)) {
                            findValue = arr[i].value;
                            isFind = true;
                        }

                        if (isFind) {
                           
                            node.value = findValue;
                        }
                    }
                }
                if (date.isSame(arr[0].time)) {
                    node.value = arr[0].value;
                } else if (date.isSame(arr[arr.length - 1].time)) {
                    node.value = arr[arr.length - 1].value;
                }

            }
        }
        self.poperNodes = [];
        var poperNode = function (value, color) {
            this.value = value;
            this.color = color;
            var node = this;
            this.style = {
                "color": node.color
            }
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
    main.tableRow = [1, 2, 3, 4, 5, 6, 7, 8];  //Table MaxRow


    main.offsetTime = 3600;  //起始结束相隔时间 秒
    main.offsetValue = 80;  //Y坐标值
    main.labelWidth = 72; //标签实际长度的1/2
    main.labelHeight = 10; //标签实际高度的1/2

    main.canvasStyle = function () {
        return {
            "z-index": 10,
            position: 'absolute',

            top: main.offsetTop + "px",

        }
    };
    main.canvasContext = null;
    main.splitLines = [];
    main.splitIndex = 0;
    main.init = function () {
        main.startDate = moment("2016-10-19 08:00:00");
        main.endDate = moment("2016-10-19 08:00:00").add(1, 'hours');
        main.width = main.$table.width();
        main.height = $(document).height() * 0.7;// main.$table.height();
        main.$table.height(main.height);
        main.offsetTop = main.$table.offset().top;
        main.offsetLeft = main.$table.offset().left;

        console.log("hegiht=" + main.height + " width=" + main.width);
        main.loadAxis();



    }
    main.loadAxis = function () {
        main.offsetTime = main.endDate.diff(main.startDate, 'seconds', true);
        var date = main.offsetTime / 4;
        var temp = main.startDate.format();
        var offsetTop = main.offsetTop + main.height + 20;
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
    main.axixYAxix = function (len) {
        while (main.tableRow.length > 0) {
            main.tableRow.pop();
        }
        var getArr = function (len) {
            for (var i = 0; i < len; i++) {
                main.tableRow.push(i);
            }
        }
        if (len <= 3) {
            getArr(8);

        } else if (len <= 10) {
            getArr(4);

        } else {
            getArr(2);

        }
    }


    main.initLineData = function (array) {

        for (var c in array) {

            var node = new lineNode(array[c].TagName, array[c].Color, [], "", array[c].MinValue, array[c].MaxValue);

            main.nodes.push(node);
            node.init(array[c].Data);
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
            main.currSelectSplit.compTimeValue(e.clientX);

        }

    }
    //鼠标双击 竖直分割线
    main.mouseDbClick = function () {
        var node = new splitNode(main.splitIndex, main.currMousePageX, main.currMousePageY);
        node.compTimeValue(main.currMousePageX);
        main.splitLines.push(node);
        main.splitIndex++;
    }


    return main;


});