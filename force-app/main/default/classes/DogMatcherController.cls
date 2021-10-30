public with sharing class DogMatcherController {
    @AuraEnabled
    public static String getDogs(Integer quantity) {
        List<DogService.Dog> dogs = DogService.getDogs(quantity);
        return (dogs != null ? JSON.serialize(dogs) : null);
    }

    @AuraEnabled
    public static Integer getCurrentPlayerHighScore() {
        List<Dog_Matcher_Save__c> gameSaves = queryDogMatcherSave(UserInfo.getUserId());
        return ((gameSaves != null && !gameSaves.isEmpty()) ? Integer.valueOf(gameSaves[0].High_Score__c) : 0);
    }

    @AuraEnabled
    public static void setCurrentPlayerHighScore(Integer highScore) {
        List<Dog_Matcher_Save__c> gameSaves = queryDogMatcherSave(UserInfo.getUserId());

        try {
            Dog_Matcher_Save__c gameSave = (gameSaves != null && !gameSaves.isEmpty()) ? gameSaves[0] : new Dog_Matcher_Save__c();
            gameSave.High_Score__c = highScore;

            upsert gameSave;
        } catch (Exception e) {
            // For some reason, the new AuraHandledException's message isn't set properly upon construction, hence the call to setMessage().
            AuraHandledException ahe = new AuraHandledException(e.getMessage());
            ahe.setMessage(e.getMessage());
            throw ahe;
        }
    }

    private static List<Dog_Matcher_Save__c> queryDogMatcherSave(Id userId) {
        return [SELECT High_Score__c FROM Dog_Matcher_Save__c WHERE OwnerId = :userId];
    }
}