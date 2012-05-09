/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.ux.CheckColumn
 * @extends Ext.grid.column.Column
 * <p>A Header subclass which renders a checkbox in each column cell which toggles the truthiness of the associated data field on click.</p>
 * <p><b>Note. As of ExtJS 3.3 this no longer has to be configured as a plugin of the GridPanel.</b></p>
 * <p>Example usage:</p>
 * <pre><code>
// create the grid
var grid = Ext.create('Ext.grid.Panel', {
    ...
    columns: [{
           text: 'Foo',
           ...
        },{
           xtype: 'checkcolumn',
           text: 'Indoor?',
           dataIndex: 'indoor',
           width: 55
        }
    ]
    ...
});
 * </code></pre>
 * In addition to toggling a Boolean value within the record data, this
 * class adds or removes a css class <tt>'x-grid-checked'</tt> on the td
 * based on whether or not it is checked to alter the background image used
 * for a column.
 */
Ext.define('Lizard.ux.LoadingBalk', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.loadingcolumn',
    config: {
        class_checked: 'grid-loadingbalk-checked',
        class_unchecked: 'grid-loadingbalk-unchecked',
        class_null: 'grid-loadingbalk-null'
    },
    constructor: function(config) {
        this.callParent(arguments);
    },


    // Note: class names are not placed on the prototype bc renderer scope
    // is not in the header.
    renderer : function(value){
        if (value) {
            return '<img src="/static_media/lizard_portal/images/ajax-loader.gif"></img>';
        }
        else {
            return ''
        }
    }
});


