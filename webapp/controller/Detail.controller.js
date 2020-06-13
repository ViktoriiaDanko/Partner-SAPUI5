/*global location */
sap.ui.define([
	"Partner/BusinessPartner/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"Partner/BusinessPartner/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/TextArea"

], function (BaseController, JSONModel, formatter, MessageBox, MessageToast, Button, Dialog, Input, Label, StandardListItem, Text, TextArea) {
	"use strict";

	return BaseController.extend("Partner.BusinessPartner.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				view: true,
				edit: false,
				icon: "sap-icon://edit",
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");

			 var oViewModel = new JSONModel({
				City: "",
				Street: "",
				House: "",
				Room: ""
			});
			this.setModel(oViewModel, "addAddress");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();
		},
		
	

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function (oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");

			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		/**
		 * Event handler (attached declaratively) for the view delete button. Deletes the selected item. 
		 * @function
		 * @public
		 */
		onDelete: function () {
			var that = this;
			var oViewModel = this.getModel("detailView"),
				sPath = oViewModel.getProperty("/sObjectPath"),
				sObjectHeader = this._oODataModel.getProperty(sPath + "/Firstname"),
				sQuestion = this._oResourceBundle.getText("deleteText", sObjectHeader),
				sSuccessMessage = this._oResourceBundle.getText("deleteSuccess", sObjectHeader);

			var fnMyAfterDeleted = function () {
				MessageToast.show(sSuccessMessage);
				oViewModel.setProperty("/busy", false);
				var oNextItemToSelect = that.getOwnerComponent().oListSelector.findNextItem(sPath);
				that.getModel("appView").setProperty("/itemToSelect", oNextItemToSelect.getBindingContext().getPath()); //save last deleted
			};
			this._confirmDeletionByUser({
				question: sQuestion
			}, [sPath], fnMyAfterDeleted);
		},

		/**
		 * Event handler (attached declaratively) for the view edit button. Open a view to enable the user update the selected item. 
		 * @function
		 * @public
		 */
		onEdit: function () {
			this.getModel("appView").setProperty("/addEnabled", false);
			var sObjectPath = this.getView().getElementBinding().getPath();
			this.getRouter().getTargets().display("create", {
				mode: "update",
				objectPath: sObjectPath
			});
		},

		onEditAddress: function (oEvent) {
			if (this.getView().getModel("detailView").getProperty("/view") === true) {
				this.getView().getModel("detailView").setProperty("/view", false);
				this.getView().getModel("detailView").setProperty("/edit", true);
				this.getView().getModel("detailView").setProperty("/icon", "sap-icon://save");
			} else {
				this.onUpdateAddress(oEvent);
				this.getView().getModel("detailView").setProperty("/view", true);
				this.getView().getModel("detailView").setProperty("/edit", false);
				this.getView().getModel("detailView").setProperty("/icon", "sap-icon://edit");
			}

		},
		
		//popup
		onAddAddress: function (oEvent) {
			var that = this;
			if (!this.pressDialog) {
				this.pressDialog = new Dialog({
					title: "{i18n>dialogTitle}",
					content: [
						new Label({
							width: '10%',
							text: "{i18n>dialogCity}",
							labelFor: 'City'
						}),
						new Input('City', {
							width: '90%',
							placeholder: 'Add city',
							value: "{addAddress>/City}"
						}),
						new Label({
							width: '10%',
							text: "{i18n>dialogStreet}",
							labelFor: 'Street'
						}),
						new Input('Street', {
							width: '90%',
							value: "{addAddress>/Street}",
							placeholder: 'Add street'
						}),
						new Label({
							width: '10%',
							text: "{i18n>dialogHouse}",
							labelFor: 'House'
						}),
						new Input('House', {
							width: '90%',
							value: "{addAddress>/House}",
							placeholder: 'Add house'
						}),
						new Label({
							width: '10%',
							text: "{i18n>dialogRoom}",
							labelFor: 'Room'
						}),
						new Input('Room', {
							width: '90%',
							value: "{addAddress>/Room}",
							placeholder: 'Add room'
						})
					],
					beginButton: new Button({
						text: "{i18n>buttonSave}",
						press: function () {
							that.onCreateAddress();
							that.pressDialog.close();
						}
					}),
					endButton: new Button({
						text: "{i18n>buttonCancel}",
						press: function () {
							that.pressDialog.close();
							that._onClearAddress();
						}
					})

				});

				//to get access to the global model
				this.getView().addDependent(this.pressDialog);
			}
			this.pressDialog.open();
		},

		onCreateAddress: function (oEvent) {
			var Address = this.getView().getModel("addAddress").getProperty("/");
			var partnerId = this.getView().getModel("detailView").getProperty("/sObjectId");
			var sPath = "/PartnerSet('" + partnerId + "')/PartnerToAddressNav";

			this.getModel().create(sPath, Address, {
				success: jQuery.proxy(function (oData, oResponse) {
					this._onClearAddress();
				}, this),
				error: jQuery.proxy(function (oError) {
					this._onClearAddress();
				}, this)
			});

		},
		
		_onClearAddress: function () {
			this.getModel("addAddress").setProperty("/", {});
		},

		onUpdateAddress: function (oEvent) {
			var oModel = this.getModel("detailView");
			var oList = oEvent.getSource().getBindingContext().getObject();
			oModel.setProperty("/busy", true);
			var sObjectPath = this.getModel().createKey("AddressSet", {
				Partnerid: oEvent.getSource().getBindingContext().getProperty("Partnerid"),
				Addressid: oEvent.getSource().getBindingContext().getProperty("Addressid")
			});
			this.getModel().update("/" + sObjectPath, oList, {
				success: jQuery.proxy(function (oData, oResponse) {
					this.byId("lineItemsList").getBinding("items").refresh(true);
					oModel.setProperty("/busy", false);
				}, this),
				error: jQuery.proxy(function (oError) {
					oModel.setProperty("/busy", false);
				}, this)

			});
		},
		
		onDeleteAddress: function (oEvent) {
			var oModel = this.getModel("detailView");

			oModel.setProperty("/busy", true);
			var sObjectPath = this.getModel().createKey("AddressSet", {
				Partnerid: oEvent.getSource().getBindingContext().getProperty("Partnerid"),
				Addressid: oEvent.getSource().getBindingContext().getProperty("Addressid")
			});
			this.getModel().remove("/" + sObjectPath, {
				success: jQuery.proxy(function (oData, oResponse) {

					this.byId("lineItemsList").getBinding("items").refresh(true);
					oModel.setProperty("/busy", false);

				}, this),
				error: jQuery.proxy(function (oError) {
					oModel.setProperty("/busy", false);
				}, this)

			});
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var oParameter = oEvent.getParameter("arguments");
			for (var value in oParameter) {
				oParameter[value] = decodeURIComponent(oParameter[value]);
			}
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("PartnerSet", oParameter);
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		/**
		 * Event handler for binding change event
		 * @function
		 * @private
		 */

		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding(),
				oViewModel = this.getModel("detailView"),
				oAppViewModel = this.getModel("appView");

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getBoundContext().getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Partnerid,
				sObjectName = oObject.Firstname;

			oViewModel.setProperty("/sObjectId", sObjectId);
			oViewModel.setProperty("/sObjectPath", sPath);
			oAppViewModel.setProperty("/itemToSelect", sPath);
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		/**
		 * Event handler for metadata loaded event
		 * @function
		 * @private
		 */

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView"),
				oLineItemTable = this.byId("lineItemsList"),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Opens a dialog letting the user either confirm or cancel the deletion of a list of entities
		 * @param {object} oConfirmation - Possesses up to two attributes: question (obligatory) is a string providing the statement presented to the user.
		 * title (optional) may be a string defining the title of the popup.
		 * @param {object} oConfirmation - Possesses up to two attributes: question (obligatory) is a string providing the statement presented to the user.
		 * @param {array} aPaths -  Array of strings representing the context paths to the entities to be deleted. Currently only one is supported.
		 * @param {callback} fnAfterDeleted (optional) - called after deletion is done. 
		 * @param {callback} fnDeleteCanceled (optional) - called when the user decides not to perform the deletion
		 * @param {callback} fnDeleteConfirmed (optional) - called when the user decides to perform the deletion. A Promise will be passed
		 * @function
		 * @private
		 */
		/* eslint-disable */ // using more then 4 parameters for a function is justified here
		_confirmDeletionByUser: function (oConfirmation, aPaths, fnAfterDeleted, fnDeleteCanceled, fnDeleteConfirmed) {
			/* eslint-enable */
			// Callback function for when the user decides to perform the deletion
			var fnDelete = function () {
				// Calls the oData Delete service
				this._callDelete(aPaths, fnAfterDeleted);
			}.bind(this);

			// Opens the confirmation dialog
			MessageBox.show(oConfirmation.question, {
				icon: oConfirmation.icon || MessageBox.Icon.WARNING,
				title: oConfirmation.title || this._oResourceBundle.getText("delete"),
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						fnDelete();
					} else if (fnDeleteCanceled) {
						fnDeleteCanceled();
					}
				}
			});
		},

		/**
		 * Performs the deletion of a list of entities.
		 * @param {array} aPaths -  Array of strings representing the context paths to the entities to be deleted. Currently only one is supported.
		 * @param {callback} fnAfterDeleted (optional) - called after deletion is done. 
		 * @return a Promise that will be resolved as soon as the deletion process ended successfully.
		 * @function
		 * @private
		 */
		_callDelete: function (aPaths, fnAfterDeleted) {
			var oViewModel = this.getModel("detailView");
			oViewModel.setProperty("/busy", true);
			var fnFailed = function () {
				this._oODataModel.setUseBatch(true);
			}.bind(this);
			var fnSuccess = function () {
				if (fnAfterDeleted) {
					fnAfterDeleted();
					this._oODataModel.setUseBatch(true);
				}
				oViewModel.setProperty("/busy", false);
			}.bind(this);
			return this._deleteOneEntity(aPaths[0], fnSuccess, fnFailed);
		},

		/**
		 * Deletes the entity from the odata model
		 * @param {array} aPaths -  Array of strings representing the context paths to the entities to be deleted. Currently only one is supported.
		 * @param {callback} fnSuccess - Event handler for success operation.
		 * @param {callback} fnFailed - Event handler for failure operation.
		 * @function
		 * @private
		 */
		_deleteOneEntity: function (sPath, fnSuccess, fnFailed) {
			var oPromise = new Promise(function (fnResolve, fnReject) {
				this._oODataModel.setUseBatch(false);
				this._oODataModel.remove(sPath, {
					success: fnResolve,
					error: fnReject,
					async: true
				});
			}.bind(this));
			oPromise.then(fnSuccess, fnFailed);
			return oPromise;
		}

	});
});