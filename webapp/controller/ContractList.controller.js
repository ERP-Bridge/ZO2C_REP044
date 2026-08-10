sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.sodexo.zo2crep044.controller.ContractList", {

        onInit: function () {
            var oModel = new JSONModel();

            oModel.loadData(
                sap.ui.require.toUrl("com/sodexo/zo2crep044/model/mockData.json"),
                null,
                true
            );

            oModel.attachRequestCompleted(function () {
                this._filterContractsByCustomer();

                if (!oModel.getProperty("/salesOrder")) {
                    oModel.setProperty("/salesOrder", {
                        isSaved: false,
                        isConfirmed: false,
                        showAddressDetails: true,
                        addressToggleIcon: "sap-icon://hide"
                    });
                }
            }.bind(this));

            oModel.attachRequestFailed(function () {
                MessageToast.show("Mock data failed to load");
            });

            this.getOwnerComponent().setModel(oModel, "appModel");
        },

        onCustomerChange: function (oEvent) {
            var sSelectedCustomerId = oEvent.getSource().getSelectedKey();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aCustomers = oModel.getProperty("/customers") || [];

            var oSelectedCustomer = aCustomers.find(function (oCustomer) {
                return oCustomer.customerId === sSelectedCustomerId;
            });

            if (oSelectedCustomer) {
                oModel.setProperty("/filters/soldToCustomerId", oSelectedCustomer.customerId);
                oModel.setProperty("/filters/soldToAddressData", oSelectedCustomer.soldToAddressData);
            }

            this._filterContractsByCustomer();
        },

        onContractCheckBoxSelect: function (oEvent) {
            var oSelectedCheckBox = oEvent.getSource();
            var bSelected = oEvent.getParameter("selected");
            var oContext = oSelectedCheckBox.getBindingContext("appModel");

            if (!oContext) {
                return;
            }

            var oSelectedContract = oContext.getObject();
            var oModel = this.getOwnerComponent().getModel("appModel");
            var aVisibleContracts = oModel.getProperty("/visibleContracts") || [];
            var aAllContracts = oModel.getProperty("/contracts") || [];

            aVisibleContracts.forEach(function (oContract) {
                oContract.selected = false;
            });

            aAllContracts.forEach(function (oContract) {
                oContract.selected = false;
            });

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

            oModel.setProperty("/selectedContract", oSelectedContract);

            var aCustomers = oModel.getProperty("/customers") || [];

            var oSelectedCustomer = aCustomers.find(function (oCustomer) {
                return oCustomer.customerId === oSelectedContract.customerId;
            });

            if (oSelectedCustomer) {
                oModel.setProperty("/salesOrder/billToCustomer", oSelectedCustomer.billToCustomer);

                oModel.setProperty("/salesOrder/soldToAddressLine1", oSelectedCustomer.soldToAddressLine1);
                oModel.setProperty("/salesOrder/soldToAddressLine2", oSelectedCustomer.soldToAddressLine2);
                oModel.setProperty("/salesOrder/soldToAddressLine3", oSelectedCustomer.soldToAddressLine3);

                oModel.setProperty("/salesOrder/billToAddressLine1", oSelectedCustomer.billToAddressLine1);
                oModel.setProperty("/salesOrder/billToAddressLine2", oSelectedCustomer.billToAddressLine2);
                oModel.setProperty("/salesOrder/billToAddressLine3", oSelectedCustomer.billToAddressLine3);

                var aShipToOptions = oSelectedCustomer.shipToOptions || [];
                oModel.setProperty("/shipToOptions", aShipToOptions);

                if (aShipToOptions.length > 0) {
                    var oDefaultShipTo = aShipToOptions[0];

                    oModel.setProperty("/salesOrder/selectedShipToId", oDefaultShipTo.shipToId);
                    oModel.setProperty("/salesOrder/shipToAddressLine1", oDefaultShipTo.shipToAddressLine1);
                    oModel.setProperty("/salesOrder/shipToAddressLine2", oDefaultShipTo.shipToAddressLine2);
                    oModel.setProperty("/salesOrder/shipToAddressLine3", oDefaultShipTo.shipToAddressLine3);
                } else {
                    oModel.setProperty("/salesOrder/selectedShipToId", "");
                    oModel.setProperty("/salesOrder/shipToAddressLine1", "");
                    oModel.setProperty("/salesOrder/shipToAddressLine2", "");
                    oModel.setProperty("/salesOrder/shipToAddressLine3", "");
                }
            } else {
                oModel.setProperty("/shipToOptions", []);

                oModel.setProperty("/salesOrder/billToCustomer", "");

                oModel.setProperty("/salesOrder/soldToAddressLine1", "");
                oModel.setProperty("/salesOrder/soldToAddressLine2", "");
                oModel.setProperty("/salesOrder/soldToAddressLine3", "");

                oModel.setProperty("/salesOrder/billToAddressLine1", "");
                oModel.setProperty("/salesOrder/billToAddressLine2", "");
                oModel.setProperty("/salesOrder/billToAddressLine3", "");

                oModel.setProperty("/salesOrder/selectedShipToId", "");
                oModel.setProperty("/salesOrder/shipToAddressLine1", "");
                oModel.setProperty("/salesOrder/shipToAddressLine2", "");
                oModel.setProperty("/salesOrder/shipToAddressLine3", "");
            }

            oModel.setProperty("/salesOrder/customerPoNumber", oSelectedContract.poNumber);
            oModel.setProperty("/salesOrder/isSaved", false);
            oModel.setProperty("/salesOrder/isConfirmed", false);

            oModel.setProperty("/salesOrder/showAddressDetails", true);
            oModel.setProperty("/salesOrder/addressToggleIcon", "sap-icon://hide");

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
        }
    });
});