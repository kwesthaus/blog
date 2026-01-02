L.Control.SotaFilter = L.Control.extend({
    options: {
        position: "topleft",
        title: "Summit Filter",
        collapsible: true,
    },
    _defaultModel: {
        selectedCategory: "presets",
        customText: 'return (feature.properties.CurrentlyActive == "TRUE");',
        activMin: 0,
        activMax: NaN,
        pointMin: 0,
        pointMax: 10,
        altMin: 0,
        altMax: NaN,
        regions: {
            "WA-Northern Olympics": [true, "NO"],
            "WA-Southern Olympics": [true, "SO"],
            "WA-Pacific-Lewis":     [true, "PL"],
            "WA-Lower Columbia":    [true, "LC"],
            "WA-Middle Columbia":   [true, "MC"],
            "WA-Rainier-Salish":    [true, "RS"],
            "WA-King":              [true, "KG"],
            "WA-Snohomish":         [true, "SN"],
            "WA-Skagit":            [true, "SK"],
            "WA-Whatcom":           [true, "WH"],
            "WA-Central Washington":[true, "CW"],
            "WA-Chelan":            [true, "CH"],
            "WA-Okanogan":          [true, "OK"],
            "WA-Ferry":             [true, "FR"],
            "WA-Stevens":           [true, "ST"],
            "WA-Pend Oreille":      [true, "PO"],
            "WA-Washington East":   [true, "WE"],
        },
        actives: {
            "TRUE": [true,  "Valid"],
            "FALSE":[false, "Invalid"],
        },
        access: {
            "Open":                 [true, "open"],
            "Open (seasonal)":      [true, "seasonal"],
            "Open (special care)":  [true, "care"],
            "Permit (Paid)":        [true, "paidpermit"],
            "Permit (Free)":        [true, "freepermit"],
            "Permit (unk)":         [true, "unkpermit"],
            "Request":              [true, "request"],
            "Unstated":             [true, "unstated"],
            "Restricted":           [true, "restricted"],
            "Changing":             [true, "changing"],
            "Unsure":               [true, "unsure"],
            "Multiple":             [true, "multiple"],
            "Blank":                [true, "blank"],
        },
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);
        this._map = null;
        this._layer = null;
        this._hydrateFunc = null;
        this._view = {
            container: null,
            anchor: null,
            contents: null,
            presets: null,
            custom: null,
        };
        this._model = this._defaultModel;
    },
    onAdd: function(map) {
        this._map = map;
        this._view.container || this._initLayout();
        return this._view.container;
    },
    onRemove: function(map) {
    },
    setLayer: function (layer, hydrateFunc) {
        this._layer = layer;
        this._hydrateFunc = hydrateFunc;
    },


    _initLayout: function() {
        this._buildContainer();
        L.DomEvent.disableClickPropagation(this._view.container);
        L.DomEvent.disableScrollPropagation(this._view.container);
        if (this.options.collapsible) {
            L.DomEvent.on(
                this._view.container,
                {mouseenter: this._expand, mouseleave: this._collapse},
                this
            );
            this._collapse();
        } else {
            this._expand();
        }
    },
    _buildContainer: function() {
        this._view.container = L.DomUtil.create("div", "leaflet-control leaflet-bar leaflet-control-sotafilter");

        // anchor shown when collapsed
        this._view.anchor = L.DomUtil.create("a", "leaflet-sotafilter-toggle", this._view.container);
        this._view.anchor.href = "#";
        this._view.anchor.title = this.options.title;
        this._view.anchor.role = "button";

        // contents shown when expanded
        this._view.contents = L.DomUtil.create("div", "leaflet-sotafilter-contents", this._view.container);

        var title = L.DomUtil.create("h3", "", this._view.contents);
        title.innerText = this.options.title;

        let presetsInput = L.DomUtil.create("input", null, this._view.contents);
        presetsInput.type = "radio";
        presetsInput.name = "filter-category";
        presetsInput.id = "preset-radio";
        presetsInput.value = "presets";
        presetsInput.checked = (this._model.selectedCategory == presetsInput.value);
        L.DomEvent.on(presetsInput, "change", this._handleCategoryRadio, this);

        let presetsLabel = L.DomUtil.create("label", null, this._view.contents);
        presetsLabel.htmlFor = "presets";
        presetsLabel.innerText = "Presets";

        L.DomUtil.create("br", null, this._view.contents);

        let customInput = L.DomUtil.create("input", null, this._view.contents);
        customInput.type = "radio";
        customInput.name = "filter-category";
        customInput.id = "custom-radio";
        customInput.value = "custom";
        customInput.checked = (this._model.selectedCategory == customInput.value);
        L.DomEvent.on(customInput, "change", this._handleCategoryRadio, this);

        let customLabel = L.DomUtil.create("label", null, this._view.contents);
        customLabel.htmlFor = "custom";
        customLabel.innerText = "Custom";

        L.DomUtil.create("br", null, this._view.contents);

        this._view.presets = L.DomUtil.create("div", "filter-category", this._view.contents);
        this._view.presets.id = "presets-div";
        this._view.presets.innerText = "Presets";
        if (this._model.selectedCategory == "presets") {
            this._view.presets.style.display = "block";
        } else {
            this._view.presets.style.display = "none";
        }
        this._buildPresetsView();
        this._view.custom = L.DomUtil.create("div", "filter-category", this._view.contents);
        this._view.custom.id = "custom-div";
        this._view.custom.innerText = "Custom";
        if (this._model.selectedCategory == "custom") {
            this._view.custom.style.display = "block";
        } else {
            this._view.custom.style.display = "none";
        }
        this._buildCustomView();

        let clearButton = L.DomUtil.create("button", "", this._view.contents);
        clearButton.id = "filterclear";
        clearButton.innerText = "Clear";
        let updateButton = L.DomUtil.create("button", "", this._view.contents);
        updateButton.type = "button";
        updateButton.id = "filterupdate";
        updateButton.innerText = "Apply";
        L.DomEvent.on(updateButton, "click", this._applyFilters, this);
    },
    _expand: function() {
        this._view.anchor.style.display = "none";
        this._view.contents.style.display = "block";
    },
    _collapse: function() {
        this._view.anchor.style.display = "block";
        this._view.contents.style.display = "none";
    },
    _handleCategoryRadio: function(e) {
        this._model.selectedCategory = e.target.value;
        let categoryContainers = document.getElementsByClassName("filter-category");
        for (let div of categoryContainers) {
            div.style.display = "none";
        }
        selectedId = this._model.selectedCategory + "-div";
        let selectedDiv = document.getElementById(selectedId);
        selectedDiv.style.display = "block";
    },
    _applyFilters: function(e) {
        let filterFunc = null;
        if (this._model.selectedCategory == "presets") {
            filterFunc = this._buildPresetsFilter();
            console.log("applying presets");
        } else {
            filterFunc = this._buildCustomFilter();
            console.log("applying custom");
        }
        this._layer.options.filter = filterFunc;
        this._layer.clearLayers();
        this._hydrateFunc(this._layer);
    },
    _buildPresetsFilter: function() {
        console.log(this._model);
        let actives = this._model.actives;
        let pointMin = this._model.pointMin;
        let pointMax = this._model.pointMax;
        let activMin = this._model.activMin;
        let activMax = this._model.activMax;
        let altMin = this._model.altMin;
        let altMax = this._model.altMax;
        let regions = this._model.regions;
        let access = this._model.access;
        return function(feature) {
            let summitActive = feature.properties.CurrentlyActive;
            if (!actives[summitActive][0]) {
                return false;
            }
            if ((!isNaN(pointMin) && feature.properties.Points < pointMin) || (!isNaN(pointMax) && feature.properties.Points > pointMax)) {
                return false;
            }
            if ((!isNaN(activMin) && feature.properties.ActivationCount < activMin) || (!isNaN(activMax) && feature.properties.ActivationCount > activMax)) {
                return false;
            }
            if ((!isNaN(altMin) && feature.properties.AltFt < altMin) || (!isNaN(altMax) && feature.properties.AltFt > altMax)) {
                return false;
            }
            let region = feature.properties.RegionName;
            if (!regions[region][0]) {
                return false;
            }
            let summitAccess = feature.properties.ComputedAccess;
            if (!summitAccess) {
                summitAccess = "Blank";
            }
            if (summitAccess.includes("?")) {
                summitAccess = "Unsure";
            }
            if (summitAccess.includes("/")) {
                summitAccess = "Multiple";
            }
            if (!access[summitAccess][0]) {
                return false;
            }
            return true;
        };
    },
    _buildCustomFilter: function() {
        if (this._model.customText) {
            let func = new Function("feature", this._model.customText);
        } else {
            let func = new Function("feature", this._defaultModel.customText);
        }
        return func;
    },
    _buildPresetsView: function() {
        let filterActive = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        filterActive.innerText = "Summit Current Status";
        for (let activeType in this._model.actives) {
            let aId = `active-${activeType}`;
            L.DomUtil.create("br", "", filterActive);
            let itmInput = L.DomUtil.create("input", "", filterActive);
            itmInput.type = "checkbox";
            itmInput.checked = (activeType == "TRUE");
            itmInput.id = aId;
            let itmLabel = L.DomUtil.create("label", "", filterActive);
            itmLabel.htmlFor = aId;
            itmLabel.innerText = this._model.actives[activeType][1];
            L.DomEvent.on(itmInput, "change", this._handleActive, this);
        }



        let filterActivations = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        let activMinLabel = L.DomUtil.create("label", "", filterActivations);
        activMinLabel.htmlFor = "activation-min";
        activMinLabel.innerText = "Activations";
        let activMinInput = L.DomUtil.create("input", "", filterActivations);
        activMinInput.type = "number";
        activMinInput.id = "activation-min";
        activMinInput.min = 0;
        activMinInput.placeholder = this._defaultModel.activMin;
        activMinInput.value = this._model.activMin;
        L.DomEvent.on(activMinInput, "change", function(e){this._model.activMin = parseInt(e.target.value);}, this);

        L.DomUtil.create("br", "", filterActivations);
        let activMaxLabel = L.DomUtil.create("label", "", filterActivations);
        activMaxLabel.htmlFor = "activation-max";
        activMaxLabel.innerText = "to";
        let activMaxInput = L.DomUtil.create("input", "", filterActivations);
        activMaxInput.type = "number";
        activMaxInput.id = "activation-max";
        activMaxInput.min = 0;
        activMaxInput.placeholder = "(max)";
        activMaxInput.value = this._model.activMax;
        L.DomEvent.on(activMaxInput, "change", function(e){this._model.activMax = parseInt(e.target.value);}, this);



        let filterPoints = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        let pointMinLabel = L.DomUtil.create("label", "", filterPoints);
        pointMinLabel.htmlFor = "point-min";
        pointMinLabel.innerText = "Points";
        let pointMinInput = L.DomUtil.create("input", "", filterPoints);
        pointMinInput.type = "number";
        pointMinInput.id = "point-min";
        pointMinInput.min = 0;
        pointMinInput.max = 10;
        pointMinInput.placeholder = this._defaultModel.pointMin;
        pointMinInput.value = this._model.pointMin;
        L.DomEvent.on(pointMinInput, "change", function(e){this._model.pointMin = parseInt(e.target.value);}, this);

        L.DomUtil.create("br", "", filterPoints);
        let pointMaxLabel = L.DomUtil.create("label", "", filterPoints);
        pointMaxLabel.htmlFor = "point-max";
        pointMaxLabel.innerText = "to";
        let pointMaxInput = L.DomUtil.create("input", "", filterPoints);
        pointMaxInput.type = "number";
        pointMaxInput.id = "point-max";
        pointMaxInput.min = 0;
        pointMaxInput.max = 10;
        pointMaxInput.placeholder = this._defaultModel.pointMax;
        pointMaxInput.value = this._model.pointMax;
        L.DomEvent.on(pointMaxInput, "change", function(e){this._model.pointMax = parseInt(e.target.value);}, this);



        let filterElevation = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        let elevMinLabel = L.DomUtil.create("label", "", filterElevation);
        elevMinLabel.htmlFor = "elev-min";
        elevMinLabel.innerText = "Elevation";
        let elevMinInput = L.DomUtil.create("input", "", filterElevation);
        elevMinInput.type = "number";
        elevMinInput.id = "elev-min";
        elevMinInput.min = 0;
        elevMinInput.placeholder = this._defaultModel.altMin;
        elevMinInput.value = this._model.altMin;
        L.DomEvent.on(elevMinInput, "change", function(e){this._model.altMin = parseInt(e.target.value);}, this);

        L.DomUtil.create("br", "", filterElevation);
        let elevMaxLabel = L.DomUtil.create("label", "", filterElevation);
        elevMaxLabel.htmlFor = "elev-max";
        elevMaxLabel.innerText = "to";
        let elevMaxInput = L.DomUtil.create("input", "", filterElevation);
        elevMaxInput.type = "number";
        elevMaxInput.id = "elev-max";
        elevMaxInput.min = 0;
        elevMaxInput.placeholder = "(max)";
        elevMaxInput.value = this._model.altMax;
        L.DomEvent.on(elevMaxInput, "change", function(e){this._model.altMax = parseInt(e.target.value);}, this);

        

        let filterRegion = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        filterRegion.innerText = "Region";
        for (let regionName in this._model.regions) {
            let rId = this._model.regions[regionName][1];
            rId = `region-${rId}`;
            L.DomUtil.create("br", "", filterRegion);
            let itmInput = L.DomUtil.create("input", "", filterRegion);
            itmInput.type = "checkbox";
            itmInput.checked = this._model.regions[regionName][0];
            itmInput.id = rId;
            let itmLabel = L.DomUtil.create("label", "", filterRegion);
            itmLabel.htmlFor = rId;
            itmLabel.innerText = regionName;
            L.DomEvent.on(itmInput, "change", this._handleRegion, this);
        }



        let filterAccess = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        filterAccess.innerText = "Access";
        for (let accessType in this._model.access) {
            let aId = this._model.access[accessType][1];
            L.DomUtil.create("br", "", filterAccess);
            let itmInput = L.DomUtil.create("input", "", filterAccess);
            itmInput.type = "checkbox";
            itmInput.checked = this._model.access[accessType][0];
            itmInput.id = aId;
            let itmLabel = L.DomUtil.create("label", "", filterAccess);
            itmLabel.htmlFor = aId;
            itmLabel.innerText = accessType;
            L.DomEvent.on(itmInput, "change", this._handleAccess, this);
        }
    },
    _handleActive: function(e) {
        var val = e.target.checked;
        var key = e.target.id.split("-")[1];
        this._model.actives[key][0] = val;
    },
    _handleRegion: function(e) {
        var val = e.target.checked;
        var key = document.querySelector(`label[for="${e.target.id}"]`).innerText;
        this._model.regions[key][0] = val;
    },
    _handleAccess: function(e) {
        var val = e.target.checked;
        var key = document.querySelector(`label[for="${e.target.id}"]`).innerText;
        this._model.access[key][0] = val;
    },
    _buildCustomView: function() {
        let filterCustom = L.DomUtil.create("div", "filter-criterion", this._view.custom);
        let customTextLabel = L.DomUtil.create("label", "", filterCustom);
        customTextLabel.htmlFor = "customtext";
        customTextLabel.innerText = 'let func = Function("feature", ...);';
        L.DomUtil.create("br", "", filterCustom);
        let customTextInput = L.DomUtil.create("textarea", "", filterCustom);
        customTextInput.id = "customtext";
        customTextInput.cols = 50;
        customTextInput.rows = 10;
        customTextInput.placeholder = this._defaultModel.customText;
        customTextInput.value = this._model.customText;
        L.DomEvent.on(customTextInput, "change", function(e){this._model.customText = e.target.value;}, this);
    },
});
L.control.sotaFilter = function(opts) {
    return new L.Control.SotaFilter(opts);
};
