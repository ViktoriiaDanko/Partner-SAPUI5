jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"Partner/BusinessPartner/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"Partner/BusinessPartner/test/integration/pages/App",
	"Partner/BusinessPartner/test/integration/pages/Browser",
	"Partner/BusinessPartner/test/integration/pages/Master",
	"Partner/BusinessPartner/test/integration/pages/Detail",
	"Partner/BusinessPartner/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "Partner.BusinessPartner.view."
	});

	sap.ui.require([
		"Partner/BusinessPartner/test/integration/NavigationJourneyPhone",
		"Partner/BusinessPartner/test/integration/NotFoundJourneyPhone",
		"Partner/BusinessPartner/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});