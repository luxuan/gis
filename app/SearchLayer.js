dojo.declare(
    "SearchLayer", // 类名
    null, // 无父类，使用null
    {    
        _map: null,
        _url: "",
        _graphics: [],
        _xmin: -1,
        _xmax: -1,
        _ymin: -1,
        _ymax: -1,
        _isShow: false,
        _isUpdate: true,
        _findTask: null,
        _findParams: null,
        
        constructor: function(map, url) {
            this._map = map;
            this._url = url;

            dojo.require("esri.tasks.find");
            this._findTask = new esri.tasks.FindTask(url);
            this._findParams = new esri.tasks.FindParameters();
            this._findParams.returnGeometry = true;
            this._findParams.layerIds = [0, 1, 2, 3, 4, 5];    //必须指定
            this._findParams.searchFields = ["NAME", "PINYIN", "NAME99"];
        },



        positionFeature: function (id) {
            var sGrapphic;
            //遍历地图的图形查找FID和点击行的FID相同的图形
            for (var i = 0; i < map.graphics.graphics.length; i++) {
                var cGrapphic = map.graphics.graphics[i];
                if ((cGrapphic.attributes) && cGrapphic.attributes.FID == id) {
                    sGrapphic = cGrapphic;
                    break;
                }
            }

            var sGeometry = sGrapphic.geometry;
            // 当点击的名称对应的图形为点类型时进行地图中心定位显示
            if (sGeometry.type == "point") {
                var cPoint = new esri.geometry.Point();
                cPoint.x = sGeometry.x;
                cPoint.y = sGeometry.y;
                map.centerAt(cPoint);

                var p = map.toScreen(sGrapphic.geometry);
                var iw = map.infoWindow;
                iw.setTitle(sGrapphic.getTitle());
                iw.setContent(sGrapphic.getContent());
                iw.show(p, map.getInfoWindowAnchor(p));
            }
            //当点击的名称对应的图形为线或面类型时获取其范围进行放大显示
            else {
                var sExtent = sGeometry.getExtent();
                sExtent = sExtent.expand(2);
                map.setExtent(sExtent);
            }
        },

        update: function(extent){
            //console.log('search update');
            this._xmin = extent.xmin;
            this._xmax = extent.xmax;
            this._ymin = extent.ymin;
            this._ymax = extent.ymax;
            this._isUpdate = true;
            if(this._isShow) { //刷新显示
//                this.hide();
//                this.show();
            }
        },

        hide: function() {
            this._isShow = false;

            var me = this;
            dojo.forEach(me._graphics, function(graphic, i){
                me._map.graphics.remove(graphic);//graphic.hide();
            });
        },

        show: function(keyword) {
            this._isShow = true;

            var me = this;
            //重新绘制
            me.hide();
            me._graphics = [];
            //显示findTask的结果
            var showResults = function (results) {
                if(results.length == 0) {
                    console.log('no data');
                    return;
                }
                var ptSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
                var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
                var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                var symbol;
                for (var i = 0; i < results.length; i++) {
                    var graphic = results[i].feature;//results[i].layerId

                    switch (graphic.geometry.type) {
                        case "point":
                            symbol = ptSymbol;
                            break;
                        case "polyline":
                            var symbol = lineSymbol;
                            break;
                        case "polygon":
                            var symbol = polygonSymbol;
                            break;
                    }
                    graphic.searchTag = true;
                    graphic.setSymbol(symbol);
                    me._graphics.push(graphic);
                    me._map.graphics.add(graphic);

                    console.log('searched',graphic.geometry.type,graphic.attributes);
                }
            };
            this._findParams.searchText = keyword;
            this._findTask.execute(this._findParams, showResults);
            //this.addMouseListener();
        },

        setInfoWindow: function(evt, infoWindow) {
            if(evt.graphic.searchTag) { //创建时标记过：graphic.spotTag = true;
                //console.log('SearchLayer',evt.graphic.attributes.NAME, evt.graphic.attributes);
                var title, content;
                var attributes = evt.graphic.attributes;
                switch (evt.graphic.geometry.type) {
                    case "point":
                        title = attributes.NAME;
                        content = '名称：' + attributes.NAME + '<br/>'
                            +'拼音：' + attributes.PINYIN;
                        break;
                    case "polyline":

                        break;
                    case "polygon":
                        title = attributes.NAME ||attributes.NAME99;
                        content = '名称：' + title + '<br/>'
                            + '面积：' + attributes.Shape_Area + '<br/>'
                            + '周长：' + attributes.Shape_Length;
                        break;
                }
                infoWindow.setTitle(title);
                infoWindow.setContent(content);
                return true;
            } else return false;
        }

    }
);
