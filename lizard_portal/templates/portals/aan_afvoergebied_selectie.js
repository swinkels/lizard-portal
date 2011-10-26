/**
 * Created by PyCharm.
 * User: bastiaanroos
 * Date: 24-10-11
 * Time: 8:13
 * To change this template use File | Settings | File Templates.
 */
{
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

            extent: new OpenLayers.Bounds(560169.88665341539, 6826897.476821214, 566537.70563144214, 6831609.8270714562),
            //(4.7221503096837303, 52.097418937370598, 5.3054492200965404, 52.431493172200199)
            layers: [
                new OpenLayers.Layer.OSM(),
                new OpenLayers.Layer.WMS('gebieden', '/fewsnorm/workspace/1/wms/',
                    {layers:'basic'}, {singleTile: true, displayOutsideMaxExtent: true, projection: new OpenLayers.Projection("EPSG:900913")})
            ]
		}]
    }]
}