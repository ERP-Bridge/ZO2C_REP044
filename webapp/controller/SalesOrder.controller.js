sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
    "sap/m/VBox",
    "sap/m/MessageToast"
], function (Controller, Dialog, Button, Text, VBox, MessageToast) {
    "use strict";
return Controller.extend("com.sodexo.zo2crep044.controller.SalesOrder", {
onInit: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
if (oModel) {
                this.getView().setModel(oModel, "appModel");
if (!oModel.getProperty("/salesOrder")) {
                    oModel.setProperty("/salesOrder", {
                        isSaved: false,
                        isConfirmed: false,
                        showAddressDetails: true,
                        addressToggleIcon: "sap-icon://hide",
                        showAttachments: true,
                        attachmentsToggleIcon: "sap-icon://hide",
                        uploadFileName: ""
                    });
                }
            }
        },
onBack: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
if (!oModel) {
                this._navigateBackToContractList();
                return;
            }
var bIsSaved = oModel.getProperty("/salesOrder/isSaved");
if (bIsSaved) {
                this._navigateBackToContractList();
            } else {
                this._openReturnToPreviousScreenDialog();
            }
        },
onSave: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
oModel.setProperty("/salesOrder/isSaved", true);
            oModel.setProperty("/salesOrder/isConfirmed", false);
MessageToast.show("Sales order saved");
        },
onConfirmSalesOrder: function () {
            this._openConfirmPostingDialog();
        },
onDeleteSalesOrder: function () {
            this._openDeleteSalesOrderDialog();
        },
onToggleAddressDetails: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
            var bShowAddressDetails = oModel.getProperty("/salesOrder/showAddressDetails");
oModel.setProperty("/salesOrder/showAddressDetails", !bShowAddressDetails);
            oModel.setProperty(
                "/salesOrder/addressToggleIcon",
                bShowAddressDetails ? "sap-icon://show" : "sap-icon://hide"
            );
        },
onToggleAttachments: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
            var bShowAttachments = oModel.getProperty("/salesOrder/showAttachments");
oModel.setProperty("/salesOrder/showAttachments", !bShowAttachments);
            oModel.setProperty(
                "/salesOrder/attachmentsToggleIcon",
                bShowAttachments ? "sap-icon://show" : "sap-icon://hide"
            );
        },
onShipToChange: function (oEvent) {
            var sSelectedShipToId = oEvent.getSource().getSelectedKey();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aShipToOptions = oModel.getProperty("/shipToOptions") || [];
var oSelectedShipTo = aShipToOptions.find(function (oShipTo) {
                return oShipTo.shipToId === sSelectedShipToId;
            });
if (oSelectedShipTo) {
                oModel.setProperty("/salesOrder/selectedShipToId", oSelectedShipTo.shipToId);
                oModel.setProperty("/salesOrder/shipToAddressLine1", oSelectedShipTo.shipToAddressLine1);
                oModel.setProperty("/salesOrder/shipToAddressLine2", oSelectedShipTo.shipToAddressLine2);
                oModel.setProperty("/salesOrder/shipToAddressLine3", oSelectedShipTo.shipToAddressLine3);
                oModel.setProperty("/salesOrder/isSaved", false);
            }
        },
onCategoryChange: function (oEvent) {
            var sSelectedCategoryKey = oEvent.getSource().getSelectedKey();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aCategoryOptions = oModel.getProperty("/categoryOptions") || [];
var oSelectedCategory = aCategoryOptions.find(function (oCategory) {
                return oCategory.key === sSelectedCategoryKey;
            });
if (oSelectedCategory) {
                oModel.setProperty("/salesOrder/category", oSelectedCategory.key);
                oModel.setProperty("/salesOrder/description", oSelectedCategory.defaultDescription);
            }
oModel.setProperty("/salesOrder/isSaved", false);
        },
onSalesOrderFieldChange: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
if (oModel) {
                oModel.setProperty("/salesOrder/isSaved", false);
            }
        },
onAttachmentSelect: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
if (oModel) {
                oModel.setProperty("/salesOrder/isSaved", false);
            }
        },
onViewAttachment: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("appModel");
if (!oContext) {
                MessageToast.show("No attachment selected");
                return;
            }
var oAttachment = oContext.getObject();
MessageToast.show("Viewing " + oAttachment.fileName);
        },
onDeleteAttachment: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("appModel");
if (!oContext) {
                MessageToast.show("No attachment selected");
                return;
            }
var oAttachment = oContext.getObject();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aAttachments = oModel.getProperty("/attachments") || [];
var aUpdatedAttachments = aAttachments.filter(function (oItem) {
                return oItem.attachmentId !== oAttachment.attachmentId;
            });
oModel.setProperty("/attachments", aUpdatedAttachments);
            oModel.setProperty("/salesOrder/isSaved", false);
MessageToast.show("Deleted " + oAttachment.fileName);
        },
onFileSelected: function (oEvent) {
            var oFileUploader = oEvent.getSource();
            var aFiles = oEvent.getParameter("files");
            var sFileName = "";
if (aFiles && aFiles.length > 0) {
                sFileName = aFiles[0].name;
            } else {
                sFileName = oFileUploader.getValue();
            }
if (!sFileName) {
                MessageToast.show("No file selected");
                return;
            }
sFileName = sFileName.split("\\").pop();
var oModel = this.getOwnerComponent().getModel("appModel");
            var aAttachments = oModel.getProperty("/attachments") || [];
aAttachments.push({
                attachmentId: "ATT_" + new Date().getTime(),
                selected: false,
                fileName: sFileName
            });
oModel.setProperty("/attachments", aAttachments);
            oModel.setProperty("/salesOrder/uploadFileName", sFileName);
            oModel.setProperty("/salesOrder/isSaved", false);
oFileUploader.clear();
MessageToast.show("Uploaded " + sFileName);
        },
onItemFieldChange: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
if (oModel) {
                oModel.setProperty("/salesOrder/isSaved", false);
                this._calculateItemTotals();
            }
        },
onCopyItem: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("appModel");
if (!oContext) {
                MessageToast.show("No item selected");
                return;
            }
var oModel = this.getOwnerComponent().getModel("appModel");
            var aItems = oModel.getProperty("/items") || [];
            var oSelectedItem = oContext.getObject();
var oCopiedItem = Object.assign({}, oSelectedItem);

oCopiedItem.itemId = "ITEM_" + new Date().getTime();
            oCopiedItem.quantity = "";
            oCopiedItem.poItem = "";
            oCopiedItem.additionalDescription = "";

aItems.push(oCopiedItem);

oModel.setProperty("/items", aItems);
            oModel.setProperty("/salesOrder/isSaved", false);

this._calculateItemTotals();

MessageToast.show("Item copied");
        },

_calculateItemTotals: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aItems = oModel.getProperty("/items") || [];

var fTotalNet = 0;
            var fTotalGross = 0;
            var fVat = 0;

aItems.forEach(function (oItem) {
                var fNet = parseFloat(oItem.totalNet) || 0;
                var fGross = parseFloat(oItem.gross) || 0;
                var fItemVat = parseFloat(oItem.vat) || 0;

fTotalNet += fNet;
                fTotalGross += fGross;
                fVat = fItemVat;
            });

oModel.setProperty("/itemTotals/totalNet", fTotalNet.toFixed(2));
            oModel.setProperty("/itemTotals/vat", fVat.toString());
            oModel.setProperty("/itemTotals/totalGross", fTotalGross.toFixed(2));
        },

_openReturnToPreviousScreenDialog: function () {
            var that = this;

if (!this._oReturnDialog) {
                this._oReturnDialog = new Dialog({
                    title: "Return to previous screen ?",
                    contentWidth: "32rem",
                    content: [
                        new VBox({
                            items: [
                                new Text({
                                    text: "If you return to previous screen without saving data, you will loose the information entered for this document."
                                })
                            ]
                        }).addStyleClass("sapUiSmallMargin")
                    ],
                    buttons: [
                        new Button({
                            text: "Cancel",
                            type: "Transparent",
                            press: function () {
                                that._oReturnDialog.close();
                            }
                        }),
                        new Button({
                            text: "Discard and leave",
                            type: "Default",
                            press: function () {
                                var oModel = that.getOwnerComponent().getModel("appModel");

oModel.setProperty("/salesOrder/isSaved", false);
                                oModel.setProperty("/salesOrder/isConfirmed", false);

that._oReturnDialog.close();
                                that._navigateBackToContractList();
                            }
                        }),
                        new Button({
                            text: "Save and leave",
                            type: "Emphasized",
                            press: function () {
                                var oModel = that.getOwnerComponent().getModel("appModel");

oModel.setProperty("/salesOrder/isSaved", true);
                                oModel.setProperty("/salesOrder/isConfirmed", false);

MessageToast.show("Sales order saved");

that._oReturnDialog.close();
                                that._navigateBackToContractList();
                            }
                        })
                    ]
                });

this.getView().addDependent(this._oReturnDialog);
            }

this._oReturnDialog.open();
        },

_openConfirmPostingDialog: function () {
            var that = this;

if (!this._oConfirmPostingDialog) {
                this._oConfirmPostingDialog = new Dialog({
                    title: "Confirm Posting",
                    contentWidth: "32rem",
                    content: [
                        new VBox({
                            items: [
                                new Text({
                                    text: "You won't be allowed to edit the document after confirmation."
                                }),
                                new Text({
                                    text: "You can take time to review the document before publishing the order."
                                })
                            ]
                        }).addStyleClass("sapUiSmallMargin")
                    ],
                    buttons: [
                        new Button({
                            text: "Cancel",
                            type: "Transparent",
                            press: function () {
                                that._oConfirmPostingDialog.close();
                            }
                        }),
                        new Button({
                            text: "Save and post",
                            type: "Emphasized",
                            press: function () {
                                var oModel = that.getOwnerComponent().getModel("appModel");

oModel.setProperty("/salesOrder/isSaved", true);
                                oModel.setProperty("/salesOrder/isConfirmed", true);

that._oConfirmPostingDialog.close();

MessageToast.show("Sales order saved and posted");
                            }
                        })
                    ]
                });

this.getView().addDependent(this._oConfirmPostingDialog);
            }

this._oConfirmPostingDialog.open();
        },

_openDeleteSalesOrderDialog: function () {
            var that = this;

if (!this._oDeleteSalesOrderDialog) {
                this._oDeleteSalesOrderDialog = new Dialog({
                    title: "Cancel the sales order ?",
                    contentWidth: "32rem",
                    content: [
                        new VBox({
                            items: [
                                new Text({
                                    text: "This action can't be undone."
                                })
                            ]
                        }).addStyleClass("sapUiSmallMargin")
                    ],
                    buttons: [
                        new Button({
                            text: "Cancel",
                            type: "Transparent",
                            press: function () {
                                that._oDeleteSalesOrderDialog.close();
                            }
                        }),
                        new Button({
                            text: "Confirm",
                            type: "Emphasized",
                            press: function () {
                                var oModel = that.getOwnerComponent().getModel("appModel");

oModel.setProperty("/salesOrder/isSaved", false);
                                oModel.setProperty("/salesOrder/isConfirmed", false);
                                oModel.setProperty("/selectedContract", {});

that._oDeleteSalesOrderDialog.close();

MessageToast.show("Sales order cancelled");

that._navigateBackToContractList();
                            }
                        })
                    ]
                });

this.getView().addDependent(this._oDeleteSalesOrderDialog);
            }

this._oDeleteSalesOrderDialog.open();
        },

_navigateBackToContractList: function () {
            this.getOwnerComponent().getRouter().navTo("RouteContractList");
        }

});
});

