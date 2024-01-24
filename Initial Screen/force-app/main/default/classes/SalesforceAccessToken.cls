public with sharing class SalesforceAccessToken {
    


    @AuraEnabled(cacheable=true)
    public static Boolean checkMWTokenRecord() {
        Boolean recordExists = false;

        try {
            MWToken__c mwToken = [SELECT Id FROM MWToken__c LIMIT 1];
            recordExists = mwToken != null;
        } catch (Exception e) {
            System.debug('## Exception occurred: ' + e.getMessage());
        }

        return recordExists;
    }


    public static Map<String, String> parseAccessTokenResponse(String accessTokenResponse) {
        Map<String, Object> responseMap = (Map<String, Object>) JSON.deserializeUntyped(accessTokenResponse);
    
        String accessToken = (String) responseMap.get('access_token');
        String instanceUrl = (String) responseMap.get('instance_url');
    
        Map<String, String> tokenInfo = new Map<String, String>{
            'accessToken' => accessToken,
            'instanceUrl' => instanceUrl 
        };
    
        return tokenInfo;
    }

    @AuraEnabled(cacheable=true)
    public static String getAccessToken(String clientId, String clientSecret) {
        String result = '';
        try {
            Http httpCls = new Http();
            HttpRequest request = new HttpRequest();
            
            String endpoint = 'https://resilient-hawk-jxsp1o-dev-ed.trailblaze.my.salesforce.com'; // This line of code will be replaced by the getDomainURL at the time of deployment or managing the package
            endpoint = endpoint + '/services/oauth2/token';
            String queryString = 'grant_type=client_credentials' +
                                '&client_id=' + clientId +
                                '&client_secret=' + clientSecret;
            
            
            request.setEndpoint(endpoint + '?' + queryString);
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/json');

            HttpResponse response = httpCls.send(request);

            if (response.getStatusCode() == 200) {
                System.debug('## Successfully retrieving access token');
                System.debug('## Response status: ' + response.getStatus());
                System.debug('## Response headers: ' + response.getHeaderKeys());
                System.debug('## Response body: ' + response.getBody());
                result = response.getBody();

            } else {
                System.debug('## Could not retrieve the access token');
                System.debug('## Response status :' + response.getStatus());
                System.debug('## Response message :' + response.getBody());
            }
        } catch (Exception e) {
            System.debug('## Exception occurred: ' + e.getMessage());
        }
        
        return result;
    }


    @AuraEnabled(cacheable=false)
    public static void ProcessAccessToken(String clientId, String clientSecret, String IntegrationID){
        System.debug('Inside ProcessAccessToken');
        String accessInfo = getAccessToken(clientId, clientSecret);
        Map<String, String> tokenInfo = parseAccessTokenResponse(accessInfo);

        ExternalApiCall.postDataToMiddleware(tokenInfo.get('accessToken'), tokenInfo.get('instanceUrl'), IntegrationID);
    }
}