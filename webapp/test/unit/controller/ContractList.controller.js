/*global QUnit*/

sap.ui.define([
	"com/sodexo/zo2crep044/controller/ContractList.controller"
], function (Controller) {
	"use strict";

	QUnit.module("ContractList Controller");

	QUnit.test("I should test the ContractList controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
