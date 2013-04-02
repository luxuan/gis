dojo.declare(
    "BaseLayer", // 类名
    null, // 无父类，使用null
    {    
        _map: null,
        _url: "",
        _color: "#ffff00",
        _graphics: [],
        
        constructor: function(map, url, color) {
            this._map = map;
            this._url = url;
            this._color = color;
        },

        hide: function() {
            var map = this._map;
            dojo.forEach(this._graphics, function(entry, i){
                map.graphics.remove(entry);
            });
        },
        show: function() {
            var symbol = new esri.symbol.SimpleMarkerSymbol();
            symbol.setColor(new dojo.Color(this._color));
            console.log('_url', this._url);
            console.log('_color', this._color);
            console.log('this', this);
            var store = new dojo.data.ItemFileReadStore({ url: this._url });
            var graphics = this._graphics;
            var map = this._map;
            var gotList = function(items, request) {
                for (var i = 0; i < items.length; i++) {
                    // getValue用于得到某个item的某个属性名称的值
                    var attr = {
                        "name": store.getValue(items[i], "name"),
                        "url": store.getValue(items[i], "url")
                    };
                    var loc = new esri.geometry.Point(store.getValue(items[i], "x"), store.getValue(items[i], "y"), { wkid: 4326 });
                    var graphic = new esri.Graphic(loc, symbol, attr, new esri.InfoTemplate("${name}", "${url}"));
                    graphics.push(graphic);
                    map.graphics.add(graphic);
                }
            };
            // 自定义函数，用于异常处理
            var gotError = function(error, request) {
                console.error("读文件请求失败！" + error);
            };
            store.fetch({ onComplete: gotList, onError: gotError, query: { id: "*"} });

            dojo.connect(this._map.graphics, "onMouseOver", this.gOnMouseOverHandler);
            dojo.connect(this._map.graphics, "onMouseOut", this.gOnMouseOutHandler);
        },
        
        gOnMouseOutHandler: function(evt) {
            this._map.infoWindow.hide();
        },

        gOnMouseOverHandler: function(evt) {
            this._map.infoWindow.setTitle(evt.graphic.attributes.name);
            this._map.infoWindow.setContent(evt.graphic.attributes.url);
            this._map.infoWindow.show(evt.screenPoint);
        }

    }
);
