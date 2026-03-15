TW.IDE.Widgets.SVGViewer = function() {
	this.widgetIconUrl = function() {
		return "'../Common/extensions/SVGViewer/ui/SVGButton/default_widget_icon.ide.png'";
	};

	var thisWidget = this;

	this.widgetProperties = function() {
		return {
			'name': 'SVGViewer',
			'description': '',
			'category': ['Common'],
			'defaultBindingTargetProperty': 'SVG',
			'supportsAutoResize': true,
			'properties': {
				'SVG': {
					'isBindingTarget': true,
					'baseType': 'STRING',
					'defaultValue': '',
					'isLocalizable': false,
					'description': 'Raw SVG markup to render'
				}
			}
		}
	};

	this.afterSetProperty = function(name, value) {
		switch (name) {
			case 'SVG':
				return true;
		}
		return true;
	};

	this.renderHtml = function() {
		var svg = thisWidget.getProperty('SVG') || '';
		return '<div class="widget-content widget-SVGViewer">' + svg + '</div>';
	};

	this.afterRender = function() {
	};
};


