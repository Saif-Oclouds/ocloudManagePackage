public with sharing class ObjectMetadataController {
    @AuraEnabled(cacheable=true)
    public static List<ObjectMetadata> getStandardObjects() {
        List<ObjectMetadata> objectList = new List<ObjectMetadata>();

        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();

        for (String objectName : gd.keySet()) {
            Schema.SObjectType objectType = gd.get(objectName);
            Schema.DescribeSObjectResult describeResult = objectType.getDescribe();

            if (describeResult.isCustom() == false) {
                ObjectMetadata metadata = new ObjectMetadata();
                metadata.apiName = describeResult.getName();
                metadata.label = describeResult.getLabel();

                objectList.add(metadata);
            }
        }

        return objectList;
    }

    @AuraEnabled(cacheable=true)
    public static List<ObjectFieldMetadata> fetchFields(String objectApiName) {
        List<ObjectFieldMetadata> fieldList = new List<ObjectFieldMetadata>();

        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
        Schema.DescribeSObjectResult describeResult = objectType.getDescribe();

        for (Schema.SObjectField field : describeResult.fields.getMap().values()) {
            Schema.DescribeFieldResult fieldResult = field.getDescribe();

            ObjectFieldMetadata fieldMetadata = new ObjectFieldMetadata();
            fieldMetadata.apiName = fieldResult.getName();
            fieldMetadata.label = fieldResult.getLabel();
            fieldMetadata.dataType = String.valueOf(fieldResult.getType());
            fieldMetadata.required = fieldResult.isNillable();

            System.debug(fieldMetadata.apiName);

            fieldList.add(fieldMetadata);
        }

        return fieldList;
    }

    public class ObjectMetadata {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;
    }

    public class ObjectFieldMetadata {
        @AuraEnabled public String apiName;
        @AuraEnabled public String label;
        @AuraEnabled public String dataType;
        @AuraEnabled public Boolean required;
    }
}