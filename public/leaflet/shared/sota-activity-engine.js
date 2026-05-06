(function (global) {
  const DEFAULT_FIELD_LETTERS = "ABCDEFGHIJKLMNOPQR";
  const DEFAULT_LOG_FORMAT_INDICES = {
    activatorSummitIndex: 2,
    chaserSummitIndex: 8,
  };

  function parseCsv(text) {
    const source = String(text ?? "");
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      const nextChar = source[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && char === ",") {
        row.push(field);
        field = "";
        continue;
      }

      if (!inQuotes && (char === "\n" || char === "\r")) {
        if (char === "\r" && nextChar === "\n") {
          index += 1;
        }
        row.push(field);
        field = "";
        if (row.length > 1 || row[0] !== "") {
          rows.push(row);
        }
        row = [];
        continue;
      }

      field += char;
    }

    row.push(field);
    if (row.length > 1 || row[0] !== "") {
      rows.push(row);
    }
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows.length) {
      return [];
    }
    const [header, ...body] = rows;
    return body.map((values) => {
      const entry = {};
      header.forEach((key, index) => {
        entry[key] = values[index] ?? "";
      });
      return entry;
    });
  }

  function parseSotaDate(rawValue) {
    if (!rawValue) {
      return null;
    }
    const [day, month, year] = String(rawValue).split("/").map(Number);
    if (!day || !month || !year) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  function formatDisplayDate(rawValue) {
    const date = parseSotaDate(rawValue);
    if (!date) {
      return rawValue;
    }
    const year = date.getFullYear();
    const month = date.toLocaleString("en-US", {month: "short"});
    const day = String(date.getDate()).padStart(2, "0");
    return `${year} ${month} ${day}`;
  }

  function summitIsCurrent(row, today) {
    const validFrom = parseSotaDate(row.ValidFrom);
    const validTo = parseSotaDate(row.ValidTo);
    if (validFrom && today < validFrom) {
      return false;
    }
    if (validTo && today > validTo) {
      return false;
    }
    return true;
  }

  function maidenhead4FromLatLon(latitude, longitude, fieldLetters = DEFAULT_FIELD_LETTERS) {
    let lat = Number(latitude);
    let lon = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("Invalid latitude or longitude");
    }
    if (lat === 90) {
      lat = 89.999999999;
    }
    if (lon === 180) {
      lon = 179.999999999;
    }

    const normalizedLon = lon + 180;
    const normalizedLat = lat + 90;
    const fieldLonIndex = Math.floor(normalizedLon / 20);
    const fieldLatIndex = Math.floor(normalizedLat / 10);
    const squareLonIndex = Math.floor((normalizedLon % 20) / 2);
    const squareLatIndex = Math.floor(normalizedLat % 10);

    return (
      fieldLetters[fieldLonIndex]
      + fieldLetters[fieldLatIndex]
      + String(squareLonIndex)
      + String(squareLatIndex)
    );
  }

  function deriveRegionIdentifier(summitCode) {
    const normalizedSummitCode = String(summitCode || "").trim().toUpperCase();
    if (!normalizedSummitCode) {
      return "";
    }
    const dashIndex = normalizedSummitCode.lastIndexOf("-");
    if (dashIndex === -1) {
      return normalizedSummitCode;
    }
    return normalizedSummitCode.slice(0, dashIndex);
  }

  function looksLikeSummitCode(value) {
    return /^[A-Z0-9]{1,4}\/[A-Z]{2,3}-\d{2,3}$/i.test((value || "").trim());
  }

  function detectLogFormat(text, options = {}) {
    const activatorSummitIndex = options.activatorSummitIndex ?? DEFAULT_LOG_FORMAT_INDICES.activatorSummitIndex;
    const chaserSummitIndex = options.chaserSummitIndex ?? DEFAULT_LOG_FORMAT_INDICES.chaserSummitIndex;
    const rows = parseCsv(text)
      .filter((row) => row.length > 0)
      .slice(0, 25);

    if (!rows.length) {
      return "unknown";
    }

    let activatorMatches = 0;
    let chaserMatches = 0;
    for (const row of rows) {
      if (looksLikeSummitCode(row[activatorSummitIndex])) {
        activatorMatches += 1;
      }
      if (looksLikeSummitCode(row[chaserSummitIndex])) {
        chaserMatches += 1;
      }
    }

    if (activatorMatches > 0 && chaserMatches === 0) {
      return "activator";
    }
    if (chaserMatches > 0 && activatorMatches === 0) {
      return "chaser";
    }
    if (activatorMatches > chaserMatches * 2) {
      return "activator";
    }
    if (chaserMatches > activatorMatches * 2) {
      return "chaser";
    }
    return "unknown";
  }

  function validateLogFormat(text, expectedFormat, label, options = {}) {
    if (!text) {
      return;
    }

    const detectedFormat = detectLogFormat(text, options);
    if (detectedFormat === "unknown" || detectedFormat === expectedFormat) {
      return;
    }

    if (expectedFormat === "activator" && detectedFormat === "chaser") {
      throw new Error(`The ${label} looks like a chaser CSV, not an activator CSV. Check whether the activator and chaser inputs were swapped.`);
    }
    if (expectedFormat === "chaser" && detectedFormat === "activator") {
      throw new Error(`The ${label} looks like an activator CSV, not a chaser CSV. Check whether the activator and chaser inputs were swapped.`);
    }
  }

  function parseLogTimestamp(rawDate, rawTime) {
    if (!rawDate) {
      return null;
    }

    const [day, month, year] = String(rawDate).split("/").map(Number);
    if (!day || !month || !year) {
      return null;
    }

    let hours = 0;
    let minutes = 0;
    const normalizedTime = String(rawTime || "").trim();
    if (normalizedTime) {
      if (normalizedTime.includes(":")) {
        const [hourPart, minutePart] = normalizedTime.split(":").map(Number);
        hours = Number.isFinite(hourPart) ? hourPart : 0;
        minutes = Number.isFinite(minutePart) ? minutePart : 0;
      } else {
        const digitsOnly = normalizedTime.replaceAll(/\D/g, "");
        if (digitsOnly.length >= 3) {
          hours = Number(digitsOnly.slice(0, -2)) || 0;
          minutes = Number(digitsOnly.slice(-2)) || 0;
        }
      }
    }

    return new Date(year, month - 1, day, hours, minutes).getTime();
  }

  function loadLoggedSummitsFromText(text, options) {
    const rows = parseCsv(text);
    const summits = new Set();
    const details = new Map();
    for (const row of rows) {
      if (row.length <= options.summitIndex) {
        continue;
      }
      const summitCode = (row[options.summitIndex] || "").trim();
      if (!summitCode) {
        continue;
      }

      summits.add(summitCode);
      const timestamp = parseLogTimestamp(row[options.dateIndex], row[options.timeIndex]);
      const existing = details.get(summitCode);
      if (!existing || (timestamp !== null && (existing.timestamp === null || timestamp < existing.timestamp))) {
        details.set(summitCode, {
          date: (row[options.dateIndex] || "").trim(),
          callsign: options.callsignIndex === undefined ? "" : (row[options.callsignIndex] || "").trim(),
          timestamp,
        });
      }
    }
    return {summits, details};
  }

  function normalizeToday(today) {
    const normalizedToday = today ? new Date(today) : new Date();
    normalizedToday.setHours(0, 0, 0, 0);
    return normalizedToday;
  }

  function defaultGridContainer(row, context) {
    const containerName = maidenhead4FromLatLon(row.Latitude, row.Longitude, context.fieldLetters);
    return {
      containerName,
      detailFields: {
        gridName: containerName,
        regionIdentifier: deriveRegionIdentifier(row.SummitCode),
      },
    };
  }

  function normalizeContainerAssignment(assignment, row, context) {
    if (typeof assignment === "string") {
      return {
        containerName: assignment,
        detailFields: {},
      };
    }

    if (!assignment || typeof assignment.containerName !== "string") {
      throw new Error(`Container assignment failed for summit ${row.SummitCode || "(unknown)"}.`);
    }

    return {
      containerName: assignment.containerName,
      detailFields: assignment.detailFields || {},
    };
  }

  function loadSummitsDataFromText(text, options = {}) {
    const today = normalizeToday(options.today);
    const fieldLetters = options.fieldLetters ?? DEFAULT_FIELD_LETTERS;
    const rows = rowsToObjects(parseCsv(text));
    const assignContainer = options.assignContainer || defaultGridContainer;

    const summitToContainer = new Map();
    const summitDetails = new Map();
    const validContainers = new Set();
    const containersWithActivations = new Set();

    let loadedSummits = 0;
    for (const row of rows) {
      const summitCode = (row.SummitCode || "").trim();
      if (!summitCode || !summitIsCurrent(row, today)) {
        continue;
      }

      const longitude = Number(row.Longitude);
      const latitude = Number(row.Latitude);
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        continue;
      }

      const assignment = normalizeContainerAssignment(assignContainer({
        ...row,
        Latitude: latitude,
        Longitude: longitude,
        SummitCode: summitCode,
      }, {fieldLetters}), row, {fieldLetters});
      const containerName = assignment.containerName.trim();
      if (!containerName) {
        continue;
      }

      summitToContainer.set(summitCode, containerName);
      summitDetails.set(summitCode, {
        code: summitCode,
        name: (row.SummitName || "").trim(),
        association: (row.AssociationName || row.Association || "").trim(),
        region: (row.RegionName || row.Region || "").trim(),
        latitude,
        longitude,
        ...assignment.detailFields,
      });
      validContainers.add(containerName);

      const activationCount = Number.parseInt(row.ActivationCount || "0", 10);
      if (Number.isFinite(activationCount) && activationCount > 0) {
        containersWithActivations.add(containerName);
      }
      loadedSummits += 1;
    }

    return {
      loadedSummits,
      summitToContainer,
      summitDetails,
      validContainers,
      containersWithActivations,
    };
  }

  function buildContainerSetsFromLogs(summitToContainer, activatorText, chaserText, options = {}) {
    const result = {
      activatedSummits: new Set(),
      chasedSummits: new Set(),
      activationDetails: new Map(),
      chaseDetails: new Map(),
      activatedContainers: new Set(),
      chasedContainers: new Set(),
    };

    if (activatorText) {
      const activatorData = loadLoggedSummitsFromText(activatorText, options.activatorLog);
      result.activatedSummits = activatorData.summits;
      result.activationDetails = activatorData.details;
      for (const summitCode of result.activatedSummits) {
        if (summitToContainer.has(summitCode)) {
          result.activatedContainers.add(summitToContainer.get(summitCode));
        }
      }
    }

    if (chaserText) {
      const chaserData = loadLoggedSummitsFromText(chaserText, options.chaserLog);
      result.chasedSummits = chaserData.summits;
      result.chaseDetails = chaserData.details;
      for (const summitCode of result.chasedSummits) {
        if (summitToContainer.has(summitCode)) {
          result.chasedContainers.add(summitToContainer.get(summitCode));
        }
      }
    }

    return result;
  }

  function classifyContainer(containerName, state) {
    if (!state.validContainers.has(containerName)) {
      return "empty";
    }
    if (!state.containersWithActivations.has(containerName)) {
      return "neveractivated";
    }
    const activated = state.activatedContainers.has(containerName);
    const chased = state.chasedContainers.has(containerName);
    if (activated && chased) {
      return "both";
    }
    if (activated) {
      return "activated";
    }
    if (chased) {
      return "chased";
    }
    return "unstyled";
  }

  function classifySummit(summitCode, state) {
    const activated = state.activatedSummits.has(summitCode);
    const chased = state.chasedSummits.has(summitCode);
    if (activated && chased) {
      return "both";
    }
    if (activated) {
      return "activated";
    }
    if (chased) {
      return "chased";
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  global.SotaActivityEngine = Object.freeze({
    buildContainerSetsFromLogs,
    classifyContainer,
    classifySummit,
    detectLogFormat,
    deriveRegionIdentifier,
    escapeHtml,
    formatDisplayDate,
    loadLoggedSummitsFromText,
    loadSummitsDataFromText,
    looksLikeSummitCode,
    maidenhead4FromLatLon,
    parseCsv,
    parseLogTimestamp,
    parseSotaDate,
    rowsToObjects,
    summitIsCurrent,
    validateLogFormat,
  });
})(window);