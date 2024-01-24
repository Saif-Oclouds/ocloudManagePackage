public with sharing class ExternalApiCall {

    public static String MiddleWareAccessToken;

    // @AuraEnabled(cacheable=true)
    // public static void insertTokenRecords(){
        
    // }

    public static void postDataToMiddleware(String accessToken, String instanceUrl, String IntegrationID) {
        // Define the endpoint URL
        String endpointUrl = 'https://c527-2407-aa80-116-3894-8dad-2af6-c7e6-44fd.ngrok-free.app/api/integration';
    
        // Create the JSON payload with the access token and instance URL
        String jsonPayload = '{"accessToken": "' + accessToken + '", "instanceUrl": "' + instanceUrl + '", "IntegrationID": "' + IntegrationID + '"}';

    
        // Create the HTTP request
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpointUrl);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(jsonPayload);
    
        // Create the HTTP instance and send the request
        Http http = new Http();
        System.debug('Request Positing: ');
        Integer response = 200;
        System.debug('Check Start: ');
        //System.debug(response.getBody());
        System.debug('Check End: ');
       
        //response.setStatusCode(200);
    
        if (response == 200) {
            //System.debug('Middleware response: ' + response.getBody());
            //MiddleWareAccessToken = response.get('Access_Token');
            MiddleWareAccessToken = 'IAmMiddleWare';
            System.debug(MiddleWareAccessToken);
            MWToken__c TokenToMiddleWare = new MWToken__c(Token__c = MiddleWareAccessToken);
            insert TokenToMiddleWare;
            System.debug('Insertion Done');
        } else {
            // Error handling for unsuccessful response
            //System.debug('Error: ' + response.getStatusCode() + ' ' + response.getStatus());
            //System.debug('Response Body: ' + response.getBody());
        }    
    }

    // @AuraEnabled(cacheable=true)
    // public static string getMiddleWareAccessToken(){
    //     System.debug('inside getMiddleWareAccessToken');
    //     System.debug(MiddleWareAccessToken);
    //     return MiddleWareAccessToken;
    // }


    // @AuraEnabled(cacheable=true)
    // public static string methodName(){
    //     try {
            
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }
}