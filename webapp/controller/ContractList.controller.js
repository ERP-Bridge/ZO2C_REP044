sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.sodexo.zo2crep044.controller.ContractList", {

        onInit: function () {
            var oModel = new JSONModel();

            this.getOwnerComponent().setModel(oModel, "appModel");

            oModel.attachRequestCompleted(function () {
                this._filterContractsByCustomer();
                this._ensureSalesOrderDefaults();
            }.bind(this));

            oModel.attachRequestFailed(function () {
                MessageToast.show("Mock data failed to load");
            });

            oModel.loadData(
                sap.ui.require.toUrl("com/sodexo/zo2crep044/model/mockData.json"),
                null,
                true
            );
        },

        onCustomerChange: function (oEvent) {
            var sSelectedCustomerId = oEvent.getSource().getSelectedKey();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var oSelectedCustomer = this._getCustomerById(sSelectedCustomerId);

            if (oSelectedCustomer) {
                oModel.setProperty("/filters/soldToCustomerId", oSelectedCustomer.customerId);
                oModel.setProperty("/filters/soldToAddressData", oSelectedCustomer.soldToAddressData);
            }

            this._filterContractsByCustomer();
        },

        onContractCheckBoxSelect: function (oEvent) {
            var bSelected = oEvent.getParameter("selected");
            var oContext = oEvent.getSource().getBindingContext("appModel");

            if (!oContext) {
                return;
            }

            var oSelectedContract = oContext.getObject();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aVisibleContracts = oModel.getProperty("/visibleContracts") || [];
            var aAllContracts = oModel.getProperty("/contracts") || [];

            this._clearContractSelections(aVisibleContracts);
            this._clearContractSelections(aAllContracts);

            if (bSelected) {
                oSelectedContract.selected = true;

                aAllContracts.forEach(function (oContract) {
                    if (oContract.contractNum === oSelectedContract.contractNum) {
                        oContract.selected = true;
                    }
                });

                oModel.setProperty("/selectedContract", oSelectedContract);
            } else {
                oModel.setProperty("/selectedContract", {});
            }

            oModel.refresh(true);
        },

        onOpenContract: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("appModel");

            if (!oContext) {
                MessageToast.show("No contract selected");
                return;
            }

            var oSelectedContract = oContext.getObject();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var oSelectedCustomer = this._getCustomerById(oSelectedContract.customerId);

            oModel.setProperty("/selectedContract", oSelectedContract);

            if (oSelectedCustomer) {
                this._applyCustomerDetailsToSalesOrder(oSelectedCustomer);
            } else {
                this._clearCustomerDetailsFromSalesOrder();
            }

            this._applySelectedContractToSalesOrder(oSelectedContract);
            this._resetSalesOrderStatus();

            oModel.refresh(true);

            this.getOwnerComponent().getRouter().navTo("RouteSalesOrder", {
                contractNum: oSelectedContract.contractNum
            });
        },

        _filterContractsByCustomer: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");

            if (!oModel) {
                return;
            }

            var sSelectedCustomerId = oModel.getProperty("/filters/soldToCustomerId");
            var aContracts = oModel.getProperty("/contracts") || [];

            var aVisibleContracts = aContracts.filter(function (oContract) {
                return oContract.customerId === sSelectedCustomerId;
            });

            oModel.setProperty("/visibleContracts", aVisibleContracts);
        },

        _ensureSalesOrderDefaults: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");

            if (!oModel.getProperty("/salesOrder")) {
                oModel.setProperty("/salesOrder", {
                    isSaved: false,
                    isConfirmed: false,
                    showAddressDetails: true,
                    addressToggleIcon: "sap-icon://hide"
                });
            }
        },

        _getCustomerById: function (sCustomerId) {
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aCustomers = oModel.getProperty("/customers") || [];

            return aCustomers.find(function (oCustomer) {
                return oCustomer.customerId === sCustomerId;
            });
        },

        _clearContractSelections: function (aContracts) {
            aContracts.forEach(function (oContract) {
                oContract.selected = false;
            });
        },

        _applyCustomerDetailsToSalesOrder: function (oCustomer) {
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aShipToOptions = oCustomer.shipToOptions || [];

            oModel.setProperty("/salesOrder/billToCustomer", oCustomer.billToCustomer);

            oModel.setProperty("/salesOrder/soldToAddressLine1", oCustomer.soldToAddressLine1);
            oModel.setProperty("/salesOrder/soldToAddressLine2", oCustomer.soldToAddressLine2);
            oModel.setProperty("/salesOrder/soldToAddressLine3", oCustomer.soldToAddressLine3);

            oModel.setProperty("/salesOrder/billToAddressLine1", oCustomer.billToAddressLine1);
            oModel.setProperty("/salesOrder/billToAddressLine2", oCustomer.billToAddressLine2);
            oModel.setProperty("/salesOrder/billToAddressLine3", oCustomer.billToAddressLine3);

            oModel.setProperty("/shipToOptions", aShipToOptions);

            if (aShipToOptions.length > 0) {
                this._applyShipToDetailsToSalesOrder(aShipToOptions[0]);
            } else {
                this._clearShipToDetailsFromSalesOrder();
            }
        },

        _applyShipToDetailsToSalesOrder: function (oShipTo) {
            var oModel = this.getOwnerComponent().getModel("appModel");

            oModel.setProperty("/salesOrder/selectedShipToId", oShipTo.shipToId);
            oModel.setProperty("/salesOrder/shipToAddressLine1", oShipTo.shipToAddressLine1);
            oModel.setProperty("/salesOrder/shipToAddressLine2", oShipTo.shipToAddressLine2);
            oModel.setProperty("/salesOrder/shipToAddressLine3", oShipTo.shipToAddressLine3);
        },

        _clearCustomerDetailsFromSalesOrder: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");

            oModel.setProperty("/shipToOptions", []);
            oModel.setProperty("/salesOrder/billToCustomer", "");

            oModel.setProperty("/salesOrder/soldToAddressLine1", "");
            oModel.setProperty("/salesOrder/soldToAddressLine2", "");
            oModel.setProperty("/salesOrder/soldToAddressLine3", "");

            oModel.setProperty("/salesOrder/billToAddressLine1", "");
            oModel.setProperty("/salesOrder/billToAddressLine2", "");
            oModel.setProperty("/salesOrder/billToAddressLine3", "");

            this._clearShipToDetailsFromSalesOrder();
        },

        _clearShipToDetailsFromSalesOrder: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");

            oModel.setProperty("/salesOrder/selectedShipToId", "");
            oModel.setProperty("/salesOrder/shipToAddressLine1", "");
            oModel.setProperty("/salesOrder/shipToAddressLine2", "");
            oModel.setProperty("/salesOrder/shipToAddressLine3", "");
        },

        _applySelectedContractToSalesOrder: function (oSelectedContract) {
            var oModel = this.getOwnerComponent().getModel("appModel");

            oModel.setProperty("/salesOrder/customerPoNumber", oSelectedContract.poNumber);
        },

        _resetSalesOrderStatus: function () {
            var oModel = this.getOwnerComponent().getModel("appModel");

            oModel.setProperty("/salesOrder/isSaved", false);
            oModel.setProperty("/salesOrder/isConfirmed", false);
            oModel.setProperty("/salesOrder/showAddressDetails", true);
            oModel.setProperty("/salesOrder/addressToggleIcon", "sap-icon://hide");
        }

    });
});