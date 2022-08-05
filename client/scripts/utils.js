
define('DS/DSCPEEMEDUtils/DSCPEEMEDUtils', ["DS/WAFData/WAFData", "DS/i3DXCompassServices/i3DXCompassServices"], 
  
function (WAFData, i3DXCompassServices) {

    function call3DSpace (baseServiceUrl, options, onSuccessCallback = (response)=>{}, onErrorCallback = (error)=>{})  {
        
        const url = options.URL;
        const tenantId = options.tenantId;

        let methodUrl = baseServiceUrl + url + "?tenant=" + tenantId ; 

        if (options.mask) {
            methodUrl += "&$mask=" + options.mask;
        }        

        //console.log("calling 3DSpace service with URL = '" + methodUrl + "'" );
   
        //docs: https://media.3ds.com/support/documentation/developer/Cloud/en/DSDocNS.htm?show=../generated/js/WebAppsFoundations-WAFData/module-DS_WAFData_WAFData.htm
        WAFData.authenticatedRequest(methodUrl, {
          method: options.method,                        
          headers: options.headers,
          type: options.type,
          data: options.data,
          onComplete: function (methodResponse) {
            onSuccessCallback(methodResponse, options.xdata);                        
          },
          //TODO : Handle failure or other cases                            
          onFailure: function (err) {
            onErrorCallback(err)
          },
          onPassportError: function (err)
          {
            onErrorCallback(err)
          },
          onTimeout: function ()
          {
            onErrorCallback("timeout")
          },                  
          timeout: (options.timeout ? options.timeout : 25000)
        })
    };

  // Utils that Invokes a 3DSpace function returning a success call or an error callback 
  function invoke3DSpace (methodOptions, onSuccessCallback = (response)=>{}, onErrorCallback = (error)=>{}, newCSRFToken = true)
  {
    const tenantId = widget.getValue("x3dPlatformId");
    methodOptions.tenantId = tenantId;

    i3DXCompassServices.getServiceUrl({
      
      serviceName: "3DSpace",
      
      platformId: tenantId,
    
      onComplete: serviceUrl => {
    
        if (newCSRFToken) {

            console.log("retrieving CSRF Token");
          // --------------------
          const getCSRFTokenUrl = serviceUrl + "/resources/v1/application/CSRF?tenant=" + tenantId ;    

          //docs: https://media.3ds.com/support/documentation/developer/Cloud/en/DSDocNS.htm?show=../generated/js/WebAppsFoundations-WAFData/module-DS_WAFData_WAFData.htm
          WAFData.authenticatedRequest(getCSRFTokenUrl, {
            method: "GET",                        
            type: "json", 
            onComplete: function (enoCSRFTokenResponse) {

              const enoCSRFToken = enoCSRFTokenResponse.csrf.value;
              
              if (!methodOptions.headers) methodOptions.headers = {} ;
    
              methodOptions.headers.ENO_CSRF_TOKEN = enoCSRFToken;
              
              call3DSpace(serviceUrl, methodOptions, onSuccessCallback, onErrorCallback);  
            },              
          })
        }
        else {
            call3DSpace(serviceUrl, methodOptions, onSuccessCallback, onErrorCallback);
        }
    }
    })
  };
  return {invoke3DSpace}; //require exports
});