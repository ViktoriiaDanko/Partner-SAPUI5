jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 PartnerSet in the list
// * All 3 PartnerSet have at least one PartnerToAddressNav

sap.ui.require([
	"sap/ui/test/Opa5",
	"Partner/BusinessPartner/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"Partner/BusinessPartner/test/integration/pages/App",
	"Partner/BusinessPartner/test/integration/pages/Browser",
	"Partner/BusinessPartner/test/integration/pages/Master",
	"Partner/BusinessPartner/test/integration/pages/Detail",
	"Partner/BusinessPartner/test/integration/pages/Create",
	"Partner/BusinessPartner/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "Partner.BusinessPartner.view."
	});

	sap.ui.require([
		"Partner/BusinessPartner/test/integration/MasterJourney",
		"Partner/BusinessPartner/test/integration/NavigationJourney",
		"Partner/BusinessPartner/test/integration/NotFoundJourney",
		"Partner/BusinessPartner/test/integration/BusyJourney",
		"Partner/BusinessPartner/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});