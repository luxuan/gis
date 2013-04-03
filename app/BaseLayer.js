dojo.declare(
    "BaseLayer", // 类名
    null, // 无父类，使用null
    {    
        _map: null,
        _url: "",
        _color: "#ffff00",
        _graphics: [],
        _xmin: -1,
        _xmax: -1,
        _ymin: -1,
        _ymax: -1,
        _isShow: false,
        _isUpdate: true,
        
        constructor: function(map, url, color) {
            this._map = map;
            this._url = url;
            this._color = color;
        },

        update: function(extent){
            this._xmin = extent.xmin;
            this._xmax = extent.xmax;
            this._ymin = extent.ymin;
            this._ymax = extent.ymax;
            this._isUpdate = true;
            if(this._isShow) { //刷新显示
                this.hide();
                this.show();
            }
        },

        load: function(gotList) { //gotList = function(items, request)
            //ItemFileReadStore有缓存，只要是使用过的url均从url中取
            var url = this._url + '?xmin=' + this._xmin + '&xmax=' + this._xmax
                + '&ymin=' + this._ymin + '&ymax=' + this._ymax;
            var store = new dojo.data.ItemFileReadStore({ url: url });
            // 自定义函数，用于异常处理
            var gotError = function(error, request) {
                console.error("读文件请求失败！" + error);
            };
            store.fetch({ onComplete: gotList, onError: gotError, query: { id: "*"} });
        },

        hide: function() {
            this._isShow = false;
            var map = this._map;
            dojo.forEach(this._graphics, function(entry, i){
                map.graphics.remove(entry);
            });
        },
        loadedShow: function() {
            var map = this._map;
            dojo.forEach(this._graphics, function(entry, i){
                map.graphics.add(entry);
            });
            this.addMouseListener();    //增加鼠标监听
        },
        show: function() {
            this._isShow = true;
            if(this._isUpdate) {
                this._isUpdate = false;
                var symbol = new esri.symbol.SimpleMarkerSymbol();
                symbol.setColor(new dojo.Color(this._color));

                var me = this;
                var graphics = this._graphics;
                var map = this._map;
                var gotList = function(items, request) {
                    //console.log('gotList');
                    for (var i = 0; i < items.length; i++) {
                        // getValue用于得到某个item的某个属性名称的值
                        var attr = {
                            "name": items[i].name[0],//store.getValue(items[i], "name"),
                            "url": items[i].url[0]//store.getValue(items[i], "url")
                        };
                        var loc = new esri.geometry.Point(items[i].x[0], items[i].y[0], { wkid: 4326 });
                        var graphic = new esri.Graphic(loc, symbol, attr, new esri.InfoTemplate("${name}", "${url}"));
                        graphics.push(graphic);
                    }
                    me.loadedShow();
                };
                me.load(gotList);
            }
            else this.loadedShow();

        },

        addMouseListener: function() {
            var map = this._map;
            var gOnMouseOutHandler = function(evt) {
                map.infoWindow.hide();
            };
            var gOnMouseOverHandler = function(evt) {
                map.infoWindow.setTitle(evt.graphic.attributes.name);
                map.infoWindow.setContent(evt.graphic.attributes.url);
                map.infoWindow.show(evt.screenPoint);
            };

            dojo.connect(map.graphics, "onMouseOver", gOnMouseOverHandler);
            dojo.connect(map.graphics, "onMouseOut", gOnMouseOutHandler);




        }

    }
);
