dojo.declare(
    "SpotLayer", // 类名
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
            //console.log('spot update');
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
                        graphic.spotTag = true; //graphic.geometry.type=="point"
                        graphics.push(graphic);
                    }
                    me.loadedShow();
                };
                me.load(gotList);
            }
            else this.loadedShow();

        },

        hide: function() {
            this._isShow = false;
            var map = this._map;
            dojo.forEach(this._graphics, function(graphic, i){
                map.graphics.remove(graphic); //graphic.hide()
            });
        },
        loadedShow: function() {
            var map = this._map;
            dojo.forEach(this._graphics, function(entry, i){
                map.graphics.add(entry);
            });
        },
        setInfoWindow: function(evt, infoWindow) {
            if(evt.graphic.spotTag) { //创建时标记过：graphic.spotTag = true;
                infoWindow.setTitle(evt.graphic.attributes.name);
                infoWindow.setContent(evt.graphic.attributes.url);
                return true;
            } else return false;
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
        }


    }
);
