# SVGViewer Widget Documentation
**Architecture, Configuration and Usage Guide**

## Contents
1. [General Description and Purpose](#1-general-description-and-purpose)
2. [Properties](#2-properties)
3. [Code Analysis: How It Works](#3-code-analysis-how-it-works)
    - [A. Design Time (ide.js)](#a-design-time-idejs)
    - [B. Runtime (runtime.js)](#b-runtime-runtimejs)
    - [C. CSS Styles](#c-css-styles)
4. [File Structure](#4-file-structure)
5. [How to Use in ThingWorx](#5-how-to-use-in-thingworx)
6. [Customization: How to Modify the Code](#6-customization-how-to-modify-the-code)
7. [Common Issues](#7-common-issues)
8. [Quick Reference](#8-quick-reference)

---

## 1. General Description and Purpose
SVGViewer is a lightweight and flexible widget that dynamically renders any SVG content (raw SVG markup) in ThingWorx mashups.

### What does it do?
- Accepts an SVG string from an external source (service, parameter, or another widget) and draws it on screen.
- Automatically updates itself whenever the SVG content changes.
- Has no manual size configuration — the SVG always fills 100% of the widget boundaries.

---

## 2. Properties
The widget has a single configuration property:

| Property Name | Data Type | Binding | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| SVG | STRING | Target | "" (empty) | The raw SVG markup code to be rendered on screen. |

**Note:** The `SVG` property is defined as `defaultBindingTargetProperty`. This means that when you drag and drop a data connection from another widget or service, it will automatically map to this field.

### Events
This widget has no user-triggered events. SVGViewer is for display purposes only.

### Services
This widget has no externally callable custom services.

---

## 3. Code Analysis: How It Works
The widget consists of two separate JavaScript files: `ide.js` (design time) and `runtime.js` (runtime).

### A. Design Time (ide.js)
This file defines the widget in the Composer environment. It contains the following critical settings:

```javascript
// SVGViewer.ide.js — Summary     
this.widgetProperties = function() {     
    return {     
        'name': 'SVGViewer',     
        'defaultBindingTargetProperty': 'SVG', // Default target for drag-drop binding     
        'supportsAutoResize': true,             // Widget supports automatic resizing     
        'properties': {     
            'SVG': {     
                'isBindingTarget': true,        // This field is open to data binding     
                'baseType': 'STRING',     
                'defaultValue': '',     
                'isLocalizable': false          // Localization/translation is not supported     
            }     
        }     
    };     
};
```

- **supportsAutoResize: true** → The widget automatically scales according to its container size in the mashup.
- **isLocalizable: false** → SVG content is not included in the translation mechanism; this is expected behavior.

#### Design-time preview (`renderHtml`):
```javascript
this.renderHtml = function() {     
    var svg = thisWidget.getProperty('SVG') || '';     
    return '<div class="widget-content widget-SVGViewer">' + svg + '</div>';     
};
```
In Composer, if an SVG is defined, it is immediately displayed on screen. It uses the same render logic as runtime.

### B. Runtime (runtime.js)
This is the actual widget code that runs when the mashup is published.

#### Configuration (`runtimeProperties`):
```javascript
this.runtimeProperties = function() {     
    return {     
        'supportsTooltip': false,          // Tooltip feature is disabled     
        'needsDataLoadingAndError': false, // No data loading/error indicator     
        'propertyAttributes': {     
            'SVG': {     
                'isLocalizable': false     
            }     
        }     
    };     
};
```

#### Initial render (`renderHtml`):
```javascript
this.renderHtml = function() {     
    var svg = thisWidget.getProperty('SVG') || '';     
    return '<div class="widget-content widget-SVGViewer">' + svg + '</div>';     
};
```

#### Dynamic update (`updateProperty`):
```javascript
this.updateProperty = function(updatePropertyInfo) {     
    if (updatePropertyInfo.TargetProperty === 'SVG') {     
        // 1. Update the internal property value     
        thisWidget.setProperty('SVG', updatePropertyInfo.SinglePropertyValue);     
      
        // 2. Redraw the DOM (strip the outer div, inject only the SVG content)     
        thisWidget.jqElement.html(     
            thisWidget.renderHtml().replace(/^<div[^>]*>|<\/div>$/g, '')     
        );     
      
        // 3. Call the post-render hook (currently empty, open for extension)     
        thisWidget.afterRender();     
    }     
};
```

**Important Technical Detail:** Inside `updateProperty`, the outer `<div>` tag produced by `renderHtml()` is stripped using a regex before being inserted via `jqElement.html()`. This prevents a double-wrapping conflict with ThingWorx's widget container. Instead of rebuilding the entire page, only the inner HTML is updated — ensuring no performance loss.

### C. CSS Styles
Both CSS files (`ide.css` and `runtime.css`) contain the same rules:

```css
.widget-SVGViewer {     
    width: 100%;     
    height: 100%;     
    display: block;     
    overflow: hidden; /* Hides SVG content that exceeds the boundaries */     
}     

.widget-SVGViewer svg {     
    width: 100% !important;  /* SVG always fills the full width */     
    height: 100% !important; /* SVG always fills the full height */     
}
```

**Note:** The `!important` rules override any `width`/`height` values that may be defined within the SVG file itself. This ensures the SVG always adapts to the widget's size. To change this behavior, see the **Customization** section below.

---

## 4. File Structure
```
SVGViewer/     
├── metadata.xml                    ← Package/widget definition (for ThingWorx import)     
├── SVGViewer_Documentation.md      ← This document     
├── SVGViewer_1.0.1.zip             ← Distribution package     
└── ui/     
    └── SVGViewer/     
        ├── SVGViewer.ide.js        ← Composer (design-time) logic     
        ├── SVGViewer.ide.css       ← Composer preview styles     
        ├── SVGViewer.runtime.js    ← Runtime logic     
        └── SVGViewer.runtime.css   ← Runtime styles
```

### metadata.xml Details
```xml
<ExtensionPackage     
    name="SVGViewer"     
    packageVersion="1.0.1"     
    minimumThingWorxVersion="9.0.0"     
    vendor="CanOtrus"     
/>
```

---

## 5. How to Use in ThingWorx

### Scenario 1: Displaying an SVG from a Service
If a ThingWorx service (Thing Service) dynamically generates an SVG:
1. Add the SVGViewer widget to your mashup.
2. Bind the service to the mashup's `Loaded` event or any other trigger.
3. Bind the SVG string output of the service to the `SVGViewer.SVG` property.

```
Thing Service (OUTPUT: STRING 'svgData')     
    └─── Bind ──→ SVGViewer.SVG     
```
The widget will automatically update the SVG content every time the service runs.

### Scenario 2: Switching SVGs via a Mashup Parameter
If you want to show different SVGs based on a parameter:
1. Create a String type parameter in the mashup (e.g., `CurrentSVG`).
2. Bind this parameter to `SVGViewer.SVG`.
3. Update the parameter from a button click or any other event.

```
Mashup Parameter: CurrentSVG (STRING)     
    └─── Bind ──→ SVGViewer.SVG     
```

### Scenario 3: Real-Time Equipment Dashboard
To dynamically display equipment values (temperature, pressure, etc.) on an SVG:
1. A Thing Service runs periodically and builds an SVG string based on live values.
2. That SVG string is bound to `SVGViewer.SVG`.
3. The SVG automatically refreshes as equipment status changes.

#### Example service (JavaScript):
```javascript
// ThingWorx Thing Service (Result type: STRING)     
var temperature = Things["SensorThing"].GetTemperature();     
var color = temperature > 80 ? 'red' : 'green';     
      
var result = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +     
    '<circle cx="50" cy="50" r="40" fill="' + color + '"/>' +     
    '<text x="50" y="55" text-anchor="middle" fill="white" font-size="14">' + temperature + '°C</text>' +     
    '</svg>';
```

### Scenario 4: Displaying a Static SVG Icon
To show a fixed SVG icon without any dynamic data:
1. Add the SVGViewer widget to your mashup.
2. In Composer, select the widget → paste your SVG code directly into the `SVG` field in the Properties panel.
3. No data binding is required.

#### Example to paste into the SVG field:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">     
  <path d="M12 2L2 7l10 5 10-5-10-5z"/>     
  <path d="M2 17l10 5 10-5"/>     
  <path d="M2 12l10 5 10-5"/>     
</svg>
```

---

## 6. Customization: How to Modify the Code

### 6.1 Changing SVG Sizing Behavior
Default: The SVG always fills 100% of the widget area.

If you want the SVG to preserve its aspect ratio and fit within the widget (`contain` behavior), modify both `SVGViewer.ide.css` and `SVGViewer.runtime.css`:

```css
/* Change to → SVG preserves aspect ratio and fits inside the widget */     
.widget-SVGViewer svg {     
    max-width: 100% !important;     
    max-height: 100% !important;     
    width: auto !important;     
    height: auto !important;     
}
```

### 6.2 Adding a New Property (e.g., Title / Tooltip)
1. Add the new property in `widgetProperties` (`ide.js`):
```javascript
'Title': {     
    'isBindingTarget': true,     
    'baseType': 'STRING',     
    'defaultValue': '',     
    'description': 'Tooltip text shown when hovering over the SVG area'     
}
```

2. Add to `runtimeProperties.propertyAttributes` (`runtime.js`):
```javascript
'Title': {     
    'isLocalizable': true     
}
```

3. Update `renderHtml`:
```javascript
this.renderHtml = function() {     
    var svg = thisWidget.getProperty('SVG') || '';     
    var title = thisWidget.getProperty('Title') || '';     
    return '<div class="widget-content widget-SVGViewer" title="' + title + '">' + svg + '</div>';     
};
```

4. Add the new property to `updateProperty`:
```javascript
this.updateProperty = function(updatePropertyInfo) {     
    if (updatePropertyInfo.TargetProperty === 'SVG' || updatePropertyInfo.TargetProperty === 'Title') {     
        thisWidget.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.SinglePropertyValue);     
        thisWidget.jqElement.html(     
            thisWidget.renderHtml().replace(/^<div[^>]*>|<\/div>$/g, '')     
        );     
        thisWidget.afterRender();     
    }     
};
```

### 6.3 Validating / Sanitizing SVG Content
For security or format validation, you can add sanitization inside `updateProperty`:

```javascript
this.updateProperty = function(updatePropertyInfo) {     
    if (updatePropertyInfo.TargetProperty === 'SVG') {     
        var rawSvg = updatePropertyInfo.SinglePropertyValue || '';     
      
        // Only accept content that starts with <svg     
        if (rawSvg.trim().startsWith('<svg')) {     
            thisWidget.setProperty('SVG', rawSvg);     
        } else {     
            console.warn('SVGViewer: Invalid SVG content was rejected.');     
            thisWidget.setProperty('SVG', '');     
        }     
      
        thisWidget.jqElement.html(     
            thisWidget.renderHtml().replace(/^<div[^>]*>|<\/div>$/g, '')     
        );     
        thisWidget.afterRender();     
    }     
};
```

---

## 7. Common Issues

| Issue | Likely Cause | Solution |
| :--- | :--- | :--- |
| SVG is not displayed | SVG property is empty or no binding exists | Check the binding; manually fill the SVG field in Properties |
| SVG overflows the widget | The SVG has no viewBox attribute | Add `viewBox="0 0 W H"` to the SVG element |
| SVG colors appear flat | SVG uses `fill="currentColor"` | Add `.widget-SVGViewer svg { color: #YOUR_COLOR; }` in CSS |
| SVG not updating at runtime | Bound service output type is not STRING | Ensure the service result type is STRING |
| Widget icon not showing in Composer | `widgetIconUrl` points to a wrong path | Verify the icon path in `ide.js` |
| SVG is clipped due to `overflow: hidden` | Widget size is smaller than the SVG content | Enlarge the widget or remove the `overflow: hidden` rule from CSS |

---

## 8. Quick Reference
```
┌─────────────────────────────────────────┐     
│              SVGViewer Widget           │     
│─────────────────────────────────────────│     
│  Property: SVG (STRING, Binding Target) │     
│  Events  : None                         │     
│  Services: None                         │     
│─────────────────────────────────────────│     
│  CSS Behavior:                          │     
│    .widget-SVGViewer → 100% w/h, hidden │     
│    .widget-SVGViewer svg → 100% w/h     │     
│─────────────────────────────────────────│     
│  updateProperty → Listens for 'SVG'only │     
│  afterRender    → Empty (extensible)    │     
└─────────────────────────────────────────┘     
```
