//docs https://media.3ds.com/support/documentation/developer/Cloud/en/DSDocNS.htm?show=../generated/js/_index/WebappsUtils.htm#function
//CPE Euromed - bootstrap

var myWidget = {
  activeProduct : null,
  DSCPEEMEDUtils : null,
  endEdit: function () {
    console.log("3DX Custom Widget endEdit called");
  },
  onEdit: function () {
    console.log("3DX Custom Widget onEdit called");
  },
  onKeyboardAction: function (key) {
    console.log("3DX Custom Widget onKeyboardAction called with key '" + key + "'");
  },
  onLoad: function () {
    console.log("3DX Custom Widget OnLoad called");
  },
  onRefresh: function () {
    console.log("3DX Custom Widget OnRefresh called");
  },
  onResize: function () {
    console.log("3DX Custom Widget onResize called");
  },
  onViewChange: function (event) {
    console.log("3DX Custom Widget onViewChange called with event.type ='" + event.type + "'");
  },
  onSearch: function (searchQuery) {
    console.log("3DX Custom Widget onSearch called with searchQuery ='" + searchQuery + "'");
  },
  onResetSearch: function () {
    console.log("3DX Custom Widget onResetSearch called.");
  },
  drop: function (data) {
        
    console.log(data);
    console.log("widgetCredentials");
    console.log(widget.getPreference("widgetCredentials"));

    const dropData = JSON.parse(data);

    const securityContext = widget.getPreference("widgetCredentials").value;
    
    //input validation
    if (dropData == null) return;
    if (!dropData.hasOwnProperty('protocol')) return;
    if ((dropData.protocol != "3DXContent") && (dropData.version !="1.1")) return;

    if (dropData.data.items.length != 1) return;

    const dataItem = dropData.data.items[0];

    if (dataItem.objectType != "VPMReference") 
    {
      console.log ("Expecting a VPMReference instead got a '" + dataItem.objectType + "' type" );
      return;
    };
    
    const oid = dataItem.objectId;

    //execute get Item details fetch here

    const getEngItemDetailsUrl = "/resources/v1/modeler/dseng/dseng:EngItem/" + oid ;

    const getEngItemDetails = { URL: getEngItemDetailsUrl,  method: "GET", type: "json", mask : "dsmveng:EngItemMask.Details", headers : { SecurityContext : securityContext } };

    myWidget.DSCPEEMEDUtils.invoke3DSpace ( getEngItemDetails,  myWidget.getVPMReferenceDetailsCallback, myWidget.getVPMReferenceError, false);

  }, //end of drop
  getVPMReferenceDetailsCallback : (dataResp, xdata) => {
    
    console.log("Testing from the Rocketsan workshop");
    console.log(dataResp);

    // input validation ----
    if (dataResp==null) return;

    if (!dataResp.hasOwnProperty("totalItems")) return;
    if (dataResp.totalItems != 1) return;
    
    if (!dataResp.hasOwnProperty("member")) return;
    if (!Array.isArray(dataResp.member)) return;
    if (dataResp.member.length != 1) return;

    // process
    // retrieving data
    const prodData = dataResp.member[0];
    myWidget.activeProduct = prodData;

    // Set the title in the UI
    const prodDataTitle = prodData.title;
    widget.body.querySelector("#vpmReferenceTitle").value = prodDataTitle;
    
  },
  getVPMReferenceError : (err) =>{
    console.log(err);
  },
  updateTitle : (newTitle) =>
  {  
    if (myWidget.activeProduct == null)
    {
      console.log("activeProduct is null");
      return;
    }

    const securityContext = widget.getPreference("widgetCredentials").value;

    const patchEngItemDetailsUrl = "/resources/v1/modeler/dseng/dseng:EngItem/" + myWidget.activeProduct.id ;

    const patchEngItemDetails = { URL: patchEngItemDetailsUrl,  method: "PATCH", type: "json",
      mask : "dsmveng:EngItemMask.Details", data : "{ \"title\" : \"" + newTitle + "\" , \"cestamp\" : \"" + myWidget.activeProduct.cestamp + "\"}", headers : { "content-type" : "application/json;charset=UTF-8", "SecurityContext" : securityContext } };

    myWidget.DSCPEEMEDUtils.invoke3DSpace ( patchEngItemDetails,  myWidget.patchVPMReferenceDetailsCallback, myWidget.patchVPMReferenceError, true);

  },
  patchVPMReferenceDetailsCallback : (dataResp, xdata) => {

    // debug logging
    console.log("Physical Product updated");
    console.log(dataResp);

    // input validation ----
    if (dataResp==null) return;

    if (!dataResp.hasOwnProperty("totalItems")) return;
    if (dataResp.totalItems != 1) return;
    
    if (!dataResp.hasOwnProperty("member")) return;
    if (!Array.isArray(dataResp.member)) return;
    if (dataResp.member.length != 1) return;

    // process
    // parsing retrieved data
    const prodData = dataResp.member[0];
    myWidget.activeProduct = prodData;

    // Get the new title
    const prodDataTitle = prodData.title;
    
    alert ("Physical Product Title updated to : '" + prodDataTitle + "'");

  },
  patchVPMReferenceError : err =>
  {
    console.log("Erro updating Physical Product");
    console.log(err);

    alert ("Error Updating Physical Product Title - check the console log for details'");
  }
};


function executeInitWidget(w) {
  
  require(["DS/DataDragAndDrop/DataDragAndDrop", "DS/DSCPEEMEDUtils/DSCPEEMEDUtils"], function (DataDragAndDrop, DSCPEEMEDUtils) {

    myWidget.DSCPEEMEDUtils = DSCPEEMEDUtils;

    w.addEvent("endEdit",          myWidget.endEdit);
    w.addEvent("onEdit",           myWidget.onEdit);
    w.addEvent("onKeyboardAction", myWidget.onKeyboardAction);
    w.addEvent("onLoad",           myWidget.onLoad);
    w.addEvent("onRefresh",        myWidget.onRefresh);
    w.addEvent("onResize",         myWidget.onResize);
    w.addEvent("onViewChange",     myWidget.onViewChange);

    w.addEvent("onSearch",         myWidget.onSearch);
    w.addEvent("onResetSearch",    myWidget.onResetSearch);

    DataDragAndDrop.droppable(w.body.querySelector("#myWidgetApp"), {
      drop : myWidget.drop
    });
     
  }); // require
} // executeInitWidget