Ext.define('Lizard.portlet.MultiImagePortlet', {
    # extend: 'Lizard.portlet.MultiGraphStore'
    extend: 'Lizard.portlet.Portlet'
    alias: 'widget.multiimageportlet'
    layout:
        type: 'vboxscroll'
        align: 'stretch'
    autoScroll:true
    items: [{
        tpl: Ext.XTemplate(
            '<tpl for=".">',
                '<div style="margin-bottom: 10px;" class="thumb-wrap">',
                  '<img src="{src}" />',
                  '<br/><span>bladibla</span>',
                '</div>',
            '</tpl>'
        )
    }]

    initComponent: () ->
        me = @
        @callParent(arguments)
})
