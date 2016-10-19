angular.module('canvasGrid', ['angularMoment']).factory("Canvas", function (moment) {
    var main = this;
    main.$table = $(".table-responsive");
    var nodeData = function (time, value) {
        var self = this;
        self.time = time;
        self.value = value;
        self.path = function () {
            var X = (moment(time).diff(main.startDate, 'seconds', true) * 1.0 / main.offsetTime) * main.width;
            var Y = main.height - ((self.value - main.minValue) * 1.0 / main.offsetValue) * main.height;
          
            return { X: X, Y: Y };
        };

    }
    var lineNode = function (name, color, data, style) {
        var self = this;
        self.name = name;
        self.color = color;
        self.data = data || [];
        self.style = style;
        self.addData = function (item) {
            self.data.push(item);
        }
        self.init = function (array) {


            for (var i = 0; i < array.length; i++) {
                self.data.push(new nodeData(array[i].t, array[i].v));

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
                for (var i = 1; i < self.data.length - 1; i++) {
                    main.canvasContext.lineTo(self.data[i].path().X, self.data[i].path().Y);

                }
                var len = self.data.length - 1;
                main.canvasContext.lineTo(self.data[len].path().X, self.data[len].path().Y);
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
    main.initLineData = function () {
        var line = new lineNode("Lin1", "#0000ff", [], "");
        var array = [{ t: '2016-10-19 08:00:00', v: 30 }, { t: '2016-10-19 08:10:00', v: 50 }, { t: '2016-10-19 08:15:00', v: 5 }, { t: '2016-10-19 08:16:00', v: 65 }
        , { t: '2016-10-19 08:20:00', v: 5 }, { t: '2016-10-19 08:27:00', v: 13 }, { t: '2016-10-19 08:33:00', v: 52 }
        , { t: '2016-10-19 08:40:00', v: 31 }, { t: '2016-10-19 08:43:00', v: 68 }, { t: '2016-10-19 08:55:00', v: 42 }];

        line.init(array);
        main.nodes.push(line);

        line = new lineNode("Lin1", "red", [], "");
        var array = [{ t: '2016-10-19 08:06:00', v: 10 }, { t: '2016-10-19 08:10:00', v: 70 }, { t: '2016-10-19 08:13:00', v: 12 }, { t: '2016-10-19 08:16:00', v: 65 }
        , { t: '2016-10-19 08:23:00', v: -20 }, { t: '2016-10-19 08:27:00', v: 23 }, { t: '2016-10-19 08:39:00', v: 2 }
        , { t: '2016-10-19 08:43:00', v: 54 }, { t: '2016-10-19 08:50:00', v: 40 }, { t: '2016-10-19 09:00:00', v: 80 }];

        line.init(array);
        main.nodes.push(line);
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


    return main;


});