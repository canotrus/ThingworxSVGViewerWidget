(function() {
	TW.Runtime.Widgets.SVGViewer = function() {
		var thisWidget = this;

		this.runtimeProperties = function() {
			return {
				'supportsTooltip': false,
				'needsDataLoadingAndError': false,
				'propertyAttributes': {
					'SVG': {
						'isLocalizable': false
					}
				}
			};
		};

		this.renderHtml = function() {
			var svg = thisWidget.getProperty('SVG') || '';
			return '<div class="widget-content widget-SVGViewer">' + svg + '</div>';
		};

		this.renderStyles = function() {
		};

		this.afterRender = function() {
		};

		this.updateProperty = function(updatePropertyInfo) {
			if (updatePropertyInfo.TargetProperty === 'SVG') {
				thisWidget.setProperty('SVG', updatePropertyInfo.SinglePropertyValue);
				thisWidget.jqElement.html(thisWidget.renderHtml().replace(/^<div[^>]*>|<\/div>$/g, ''));
				thisWidget.afterRender();
			}
		};
	}
}());


