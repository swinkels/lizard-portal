/**
 * Created by PyCharm.
 * User: bastiaanroos
 * Date: 24-10-11
 * Time: 8:13
 * To change this template use File | Settings | File Templates.
 */
{
	itemId: 'aan_afvoergebied_selectie',
    title: 'Overzicht aan/afvoergebied',
    xtype: 'portalpanel',
	items: [{
		flex: 1,
		items: [{
			title: 'Selecteer een aan/afvoer gebied',
            flex: 1,
            xtype: "gx_mappanel",
            options: {
                projection: new OpenLayers.Projection("EPSG:900913"),
                units: "m"
            },
            controls: [new OpenLayers.Control.LayerSwitcher()
            ],
            onMapClick: function(event, lonlat) {
                Ext.Ajax.request({
                    url: '/layers/wms/?',
                    reader:{
                        type: 'xml'
                    },
                    params: {
                      REQUEST: "GetFeatureInfo",
                      EXCEPTIONS: "application/vnd.ogc.se_xml",
                      BBOX: this.map.getExtent().toBBOX(),
                      X: event.xy.x,
                      Y: event.xy.y,
                      //INFO_FORMAT: 'application/vnd.ogc.gml',
                      INFO_FORMAT: 'application/vnd.ogc.gml',
                      QUERY_LAYERS: event.object.layers[1].params.LAYERS,
                      LAYERS: event.object.layers[1].params.LAYERS,
                      FEATURE_COUNT: 1,
                      WIDTH: this.map.size.w,
                      HEIGHT: this.map.size.h,
                      SRS: event.object.layers[1].projection.projCode
                    },
                    method: 'GET',
                    success: function(xhr, request) {
                        gml_text = xhr.responseText;
                        format = new OpenLayers.Format.GML.v3();
                        gml = format.read(gml_text)
                        Ext.getCmp('portalWindow').linkTo({
                          object: {
                              id: gml[0].data.ident,
                              name: gml[0].data.name,
                              type: 'aan_afvoergebied'
                              }
                        });
                    },
                    failure: function(xhr) {
                        alert('failure');

                    }

                });
            },
            extent: new OpenLayers.Bounds(500043, 6824175, 600557, 6871566),
            //(4.7221503096837303, 52.097418937370598, 5.3054492200965404, 52.431493172200199)
            layers: [
                new OpenLayers.Layer.OSM(),
                new OpenLayers.Layer.WMS(
                  'Gebieden',
                  '/layers/wms/?',
                  {
                    layers:['vss:aan_afvoergebieden'],
                    transparent: true,
                    format: 'image/png'
                  },
                  {
                    singleTile: false,
                    opacity: 1.0,
                    transitionEffect: 'resize',
                    singleTile: true,
                    displayOutsideMaxExtent: true,
                    projection: new OpenLayers.Projection("EPSG:900913")
                  }
                )
            ]
	}]
    }]
}
