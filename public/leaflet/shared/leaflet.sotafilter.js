L.Control.SotaFilter = L.Control.extend({
    options: {
        position: "topleft",
        title: "",
        collapsible: false,
    },
    initialize: function(options) {
        L.Util.setOptions(this, options);
        this._model = {
            selectedCategory: null,
            customText: null,
            activMin: 0,
            activMax: null,
            pointMin: 0,
            pointMax: 10,
        };
    },
    onAdd: function(map) {
        this._map = map;
        this._container || this._initLayout();
        return this._container;
    },
    onRemove: function(map) {
    },

    _initLayout: function() {
        this._buildContainer();
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.disableScrollPropagation(this._container);
        /*
        if (this.options.collapsible) {
            L.DomEvent.on(
                this._container,
                {mouseenter: this._expand, mouseleave: this._collapse},
                this
            );
        } else {
            this._expand();
        }
        */
    },
    _buildContainer: function() {
        this._container = L.DomUtil.create("div", "leaflet-control leaflet-bar leaflet-control-sotafilter");
        if (this.options.title) {
            var title = L.DomUtil.create("h3", "", this._container);
            title.innerText = this.options.title;
        }
        let presetsInput = L.DomUtil.create("input", null, this._container);
        presetsInput.type = "radio";
        presetsInput.name = "filter-category";
        presetsInput.id = "preset-radio";
        presetsInput.value = "presets";
        L.DomEvent.on(presetsInput, "change", this._handleCategoryRadio, this);

        let presetsLabel = L.DomUtil.create("label", null, this._container);
        presetsLabel.for = "presets";
        presetsLabel.innerText = "Presets";

        L.DomUtil.create("br", null, this._container);

        let customInput = L.DomUtil.create("input", null, this._container);
        customInput.type = "radio";
        customInput.name = "filter-category";
        customInput.id = "custom-radio";
        customInput.value = "custom";
        L.DomEvent.on(customInput, "change", this._handleCategoryRadio, this);

        let customLabel = L.DomUtil.create("label", null, this._container);
        customLabel.for = "custom";
        customLabel.innerText = "Custom";

        L.DomUtil.create("br", null, this._container);

        this._presets = L.DomUtil.create("div", "filter-category", this._container);
        this._presets.id = "presets-div";
        this._presets.innerText = "Presets";
        this._buildPresets();
        this._custom = L.DomUtil.create("div", "filter-category", this._container);
        this._custom.id = "custom-div";
        this._custom.innerText = "Custom";
        this._buildCustom();

        let clearButton = L.DomUtil.create("button", "", this._container);
        clearButton.id = "filterclear";
        clearButton.innerText = "Clear";
        let updateButton = L.DomUtil.create("button", "", this._container);
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
        if (this._model.selectedCategory == "presets") {
            console.log("applying presets");
        } else {
            console.log("applying custom");
        }
        console.log(this._model);
    },
    _buildPresets: function() {
        let filterActivations = L.DomUtil.create("div", "filter-criterion", this._presets);
        let activMinLabel = L.DomUtil.create("label", "", filterActivations);
        activMinLabel.for = "activation-min";
        activMinLabel.innerText = "Activations";
        let activMinInput = L.DomUtil.create("input", "", filterActivations);
        activMinInput.type = "number";
        activMinInput.id = "activation-min";
        activMinInput.min = 0;
        L.DomEvent.on(activMinInput, "change", function(e){this._model.activMin = e.target.value;}, this);

        L.DomUtil.create("br", "", filterActivations);
        let activMaxLabel = L.DomUtil.create("label", "", filterActivations);
        activMaxLabel.for = "activation-max";
        activMaxLabel.innerText = "to";
        let activMaxInput = L.DomUtil.create("input", "", filterActivations);
        activMaxInput.type = "number";
        activMaxInput.id = "activation-max";
        activMaxInput.min = 0;
        L.DomEvent.on(activMaxInput, "change", function(e){this._model.activMax = e.target.value;}, this);



        let filterPoints = L.DomUtil.create("div", "filter-criterion", this._presets);
        let pointMinLabel = L.DomUtil.create("label", "", filterPoints);
        pointMinLabel.for = "point-min";
        pointMinLabel.innerText = "Points";
        let pointMinInput = L.DomUtil.create("input", "", filterPoints);
        pointMinInput.type = "number";
        pointMinInput.id = "point-min";
        pointMinInput.min = 0;
        pointMinInput.max = 10;
        L.DomEvent.on(pointMinInput, "change", function(e){this._model.pointMin = e.target.value;}, this);

        L.DomUtil.create("br", "", filterActivations);
        let pointMaxLabel = L.DomUtil.create("label", "", filterPoints);
        pointMaxLabel.for = "point-max";
        pointMaxLabel.innerText = "to";
        let pointMaxInput = L.DomUtil.create("input", "", filterPoints);
        pointMaxInput.type = "number";
        pointMaxInput.id = "point-max";
        pointMaxInput.min = 0;
        pointMaxInput.max = 10;
        L.DomEvent.on(pointMaxInput, "change", function(e){this._model.pointMax = e.target.value;}, this);
    },
    _buildCustom: function() {
        let filterCustom = L.DomUtil.create("div", "filter-criterion", this._custom);
        let customInput = L.DomUtil.create("input", "", filterCustom);
        customInput.type = "text";
        customInput.id = "customfilter";
        L.DomEvent.on(customInput, "change", function(e){this._model.customText = e.target.value;}, this);
    },
});
L.control.sotaFilter = function(opts) {
    return new L.Control.SotaFilter(opts);
};
