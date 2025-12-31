L.Control.SotaFilter = L.Control.extend({
    options: {
        position: "topleft",
        title: "",
        collapsible: false,
    },
    initialize: function(options) {
        L.Util.setOptions(this, options);
        this._map = null;
        this._layer = null;
        this._hydrateFunc = null;
        this._view = {
            container: null,
            presets: null,
            custom: null,
        };
        this._model = {
            selectedCategory: null,
            customText: null,
            activMin: 0,
            activMax: NaN,
            pointMin: 0,
            pointMax: 10,
        };
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
        /*
        if (this.options.collapsible) {
            L.DomEvent.on(
                this._view.container,
                {mouseenter: this._expand, mouseleave: this._collapse},
                this
            );
        } else {
            this._expand();
        }
        */
    },
    _buildContainer: function() {
        this._view.container = L.DomUtil.create("div", "leaflet-control leaflet-bar leaflet-control-sotafilter");
        if (this.options.title) {
            var title = L.DomUtil.create("h3", "", this._view.container);
            title.innerText = this.options.title;
        }
        let presetsInput = L.DomUtil.create("input", null, this._view.container);
        presetsInput.type = "radio";
        presetsInput.name = "filter-category";
        presetsInput.id = "preset-radio";
        presetsInput.value = "presets";
        L.DomEvent.on(presetsInput, "change", this._handleCategoryRadio, this);

        let presetsLabel = L.DomUtil.create("label", null, this._view.container);
        presetsLabel.for = "presets";
        presetsLabel.innerText = "Presets";

        L.DomUtil.create("br", null, this._view.container);

        let customInput = L.DomUtil.create("input", null, this._view.container);
        customInput.type = "radio";
        customInput.name = "filter-category";
        customInput.id = "custom-radio";
        customInput.value = "custom";
        L.DomEvent.on(customInput, "change", this._handleCategoryRadio, this);

        let customLabel = L.DomUtil.create("label", null, this._view.container);
        customLabel.for = "custom";
        customLabel.innerText = "Custom";

        L.DomUtil.create("br", null, this._view.container);

        this._view.presets = L.DomUtil.create("div", "filter-category", this._view.container);
        this._view.presets.id = "presets-div";
        this._view.presets.innerText = "Presets";
        this._buildPresets();
        this._view.custom = L.DomUtil.create("div", "filter-category", this._view.container);
        this._view.custom.id = "custom-div";
        this._view.custom.innerText = "Custom";
        this._buildCustom();

        let clearButton = L.DomUtil.create("button", "", this._view.container);
        clearButton.id = "filterclear";
        clearButton.innerText = "Clear";
        let updateButton = L.DomUtil.create("button", "", this._view.container);
        updateButton.id = "filterupdate";
        updateButton.innerText = "Apply";
        L.DomEvent.on(updateButton, "click", this._applyFilters, this);
    },
    _handleCategoryRadio: function(e) {
        var val = e.target.checked;
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
        let pointMin = this._model.pointMin;
        let pointMax = this._model.pointMax;
        let activMin = this._model.activMin;
        let activMax = this._model.activMax;
        return function(feature) {
            if ((!isNaN(pointMin) && feature.properties.Points < pointMin) || (!isNaN(pointMax) && feature.properties.Points > pointMax)) {
                return false;
            }
            if ((!isNaN(activMin) && feature.properties.ActivationCount < activMin) || (!isNaN(activMax) && feature.properties.ActivationCount > activMax)) {
                return false;
            }
            return true;
        };
    },
    _buildCustomFilter: function() {
        let func = new Function("feature", this._model.customText);
        return func;
    },
    _buildPresets: function() {
        let filterActivations = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        let activMinLabel = L.DomUtil.create("label", "", filterActivations);
        activMinLabel.for = "activation-min";
        activMinLabel.innerText = "Activations";
        let activMinInput = L.DomUtil.create("input", "", filterActivations);
        activMinInput.type = "number";
        activMinInput.id = "activation-min";
        activMinInput.min = 0;
        L.DomEvent.on(activMinInput, "change", function(e){this._model.activMin = parseInt(e.target.value);}, this);

        L.DomUtil.create("br", "", filterActivations);
        let activMaxLabel = L.DomUtil.create("label", "", filterActivations);
        activMaxLabel.for = "activation-max";
        activMaxLabel.innerText = "to";
        let activMaxInput = L.DomUtil.create("input", "", filterActivations);
        activMaxInput.type = "number";
        activMaxInput.id = "activation-max";
        activMaxInput.min = 0;
        L.DomEvent.on(activMaxInput, "change", function(e){this._model.activMax = parseInt(e.target.value);}, this);



        let filterPoints = L.DomUtil.create("div", "filter-criterion", this._view.presets);
        let pointMinLabel = L.DomUtil.create("label", "", filterPoints);
        pointMinLabel.for = "point-min";
        pointMinLabel.innerText = "Points";
        let pointMinInput = L.DomUtil.create("input", "", filterPoints);
        pointMinInput.type = "number";
        pointMinInput.id = "point-min";
        pointMinInput.min = 0;
        pointMinInput.max = 10;
        L.DomEvent.on(pointMinInput, "change", function(e){this._model.pointMin = parseInt(e.target.value);}, this);

        L.DomUtil.create("br", "", filterActivations);
        let pointMaxLabel = L.DomUtil.create("label", "", filterPoints);
        pointMaxLabel.for = "point-max";
        pointMaxLabel.innerText = "to";
        let pointMaxInput = L.DomUtil.create("input", "", filterPoints);
        pointMaxInput.type = "number";
        pointMaxInput.id = "point-max";
        pointMaxInput.min = 0;
        pointMaxInput.max = 10;
        L.DomEvent.on(pointMaxInput, "change", function(e){this._model.pointMax = parseInt(e.target.value);}, this);
    },
    _buildCustom: function() {
        let filterCustom = L.DomUtil.create("div", "filter-criterion", this._view.custom);
        let customTextLabel = L.DomUtil.create("label", "", filterCustom);
        customTextLabel.for = "customtext";
        customTextLabel.innerText = 'let func = Function("feature", ...);';
        let customTextInput = L.DomUtil.create("input", "", filterCustom);
        customTextInput.type = "text";
        customTextInput.id = "customtext";
        customTextInput.placeholder = 'return (feature.properties.RegionName == "WA-Central Washington" && feature.properties.ActivationCount == 0);';
        L.DomEvent.on(customTextInput, "change", function(e){this._model.customText = e.target.value;}, this);
    },
});
L.control.sotaFilter = function(opts) {
    return new L.Control.SotaFilter(opts);
};
