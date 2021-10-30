@isTest
public with sharing class DogMatcherControllerTest {
    private static DogMock constructDogMock(String expectedStatus, String expectedMessage, Integer expectedStatusCode) {
        return new DogMock(
            '{ ' +
                '"status" : "' + expectedStatus + '",' +
                '"message" : ["' + expectedMessage + '"]' +
            ' }',
            expectedStatusCode
        );
    }

    @isTest
    public static void test_getDogs_success_withinValidRange() {
        String expectedStatus = 'success';
        String expectedMessage = 'https://www.example.com/test_dog.jpg';
        Integer expectedStatusCode = 200;
        Integer dogQuantityWithinValidRange = 1;

        Test.setMock(HttpCalloutMock.class, constructDogMock(expectedStatus, expectedMessage, expectedStatusCode));

        Test.startTest();

            List<DogService.Dog> dogs = null;
            try {
                dogs = (List<DogService.Dog>)JSON.deserialize(DogMatcherController.getDogs(dogQuantityWithinValidRange), List<DogService.Dog>.class);
            } catch (Exception e) {
                System.assert(false, 'No exceptions should be thrown.');
            }

        Test.stopTest();

        System.assertNotEquals(null, dogs);
        System.assertEquals(dogQuantityWithinValidRange, dogs.size());
        System.assertEquals(expectedMessage, dogs[0].imageUrl);
    }

    @isTest
    public static void test_getDogs_success_belowValidRange() {
        Integer dogQuantityBelowValidRange = DogService.Dog_API_RANDOM_MIN - 1;

        Test.setMock(HttpCalloutMock.class, Test.createStub(DogMock.class, new DogStub()));

        Test.startTest();

            List<DogService.Dog> dogs = null;
            try {
                dogs = (List<DogService.Dog>)JSON.deserialize(DogMatcherController.getDogs(dogQuantityBelowValidRange), List<DogService.Dog>.class);
            } catch (Exception e) {
                System.assert(false, 'No exceptions should be thrown.');
            }

        Test.stopTest();

        System.assertNotEquals(null, dogs);
        System.assertEquals(DogService.Dog_API_RANDOM_MIN, dogs.size());
    }

    @isTest
    public static void test_getDogs_success_aboveValidRange() {
        Integer dogQuantityAboveValidRange = DogService.Dog_API_RANDOM_MAX + 1;

        Test.setMock(HttpCalloutMock.class, Test.createStub(DogMock.class, new DogStub()));

        Test.startTest();

            List<DogService.Dog> dogs = null;
            try {
                dogs = (List<DogService.Dog>)JSON.deserialize(DogMatcherController.getDogs(dogQuantityAboveValidRange), List<DogService.Dog>.class);
            } catch (Exception e) {
                System.assert(false, 'No exceptions should be thrown.');
            }

        Test.stopTest();

        System.assertNotEquals(null, dogs);
        System.assertEquals(DogService.Dog_API_RANDOM_MAX, dogs.size());
    }

    @isTest
    public static void test_getDogs_failure() {
        String expectedStatus = 'failure';
        String expectedMessage = 'Uh oh...';
        Integer expectedStatusCode = 404;

        Test.setMock(HttpCalloutMock.class, constructDogMock(expectedStatus, expectedMessage, expectedStatusCode));

        Test.startTest();

            try {
                List<DogService.Dog> dogs =
                    (List<DogService.Dog>)JSON.deserialize(DogMatcherController.getDogs(1), List<DogService.Dog>.class);

                System.assert(false, 'A DogException should be thrown.');
            } catch (DogService.DogException rde) {
                System.assert(rde.getMessage().contains(String.valueOf(expectedStatusCode)));
            }

        Test.stopTest();
    }

    @isTest
    public static void test_getCurrentPlayerHighScore_success_noRecord() {
        Integer expectedHighScore = 0;
        Test.startTest();

            Integer actualHighScore = DogMatcherController.getCurrentPlayerHighScore();

        Test.stopTest();

        System.assertEquals(expectedHighScore, actualHighScore);
    }

    @isTest
    public static void test_getCurrentPlayerHighScore_success_existingRecord_otherUser() {
        Integer expectedHighScore = 0;
        Id otherUserId = [SELECT Id FROM User WHERE Id != :UserInfo.getUserId() LIMIT 1].Id;
        Integer otherUserHighScore = 42;

        insert new Dog_Matcher_Save__c(
            OwnerId = otherUserId,
            High_Score__c = otherUserHighScore
        );
        Test.startTest();

            Integer actualHighScore = DogMatcherController.getCurrentPlayerHighScore();

        Test.stopTest();

        System.assertEquals(expectedHighScore, actualHighScore);

        List<Dog_Matcher_Save__c> otherGameSaves = [SELECT High_Score__c FROM Dog_Matcher_Save__c WHERE OwnerId = :otherUserId];

        System.assertNotEquals(null, otherGameSaves);
        System.assert(!otherGameSaves.isEmpty());
        System.assertEquals(otherUserHighScore, otherGameSaves[0].High_Score__c);
    }

    @isTest
    public static void test_getCurrentPlayerHighScore_success_existingRecord_currentUser() {
        Integer expectedHighScore = 5678;

        insert new Dog_Matcher_Save__c(
            OwnerId = UserInfo.getUserId(),
            High_Score__c = expectedHighScore
        );
        Test.startTest();

            Integer actualHighScore = DogMatcherController.getCurrentPlayerHighScore();

        Test.stopTest();

        System.assertEquals(expectedHighScore, actualHighScore);
    }

    @isTest
    public static void test_setCurrentPlayerHighScore_success_noRecord() {
        Integer expectedHighScore = 5678;

        Test.startTest();

            DogMatcherController.setCurrentPlayerHighScore(expectedHighScore);

        Test.stopTest();

        List<Dog_Matcher_Save__c> gameSaves = [SELECT High_Score__c FROM Dog_Matcher_Save__c WHERE OwnerId = :UserInfo.getUserId()];

        System.assertNotEquals(null, gameSaves);
        System.assert(!gameSaves.isEmpty());
        System.assertEquals(expectedHighScore, gameSaves[0].High_Score__c);
    }

    @isTest
    public static void test_setCurrentPlayerHighScore_success_existingRecord_otherUser() {
        Integer expectedHighScore = 5678;
        Id otherUserId = [SELECT Id FROM User WHERE Id != :UserInfo.getUserId() LIMIT 1].Id;
        Integer otherUserHighScore = 42;

        insert new Dog_Matcher_Save__c(
            OwnerId = otherUserId,
            High_Score__c = otherUserHighScore
        );

        Test.startTest();

            DogMatcherController.setCurrentPlayerHighScore(expectedHighScore);

        Test.stopTest();

        List<Dog_Matcher_Save__c> gameSaves = [SELECT High_Score__c FROM Dog_Matcher_Save__c WHERE OwnerId = :UserInfo.getUserId()];
        List<Dog_Matcher_Save__c> otherGameSaves = [SELECT High_Score__c FROM Dog_Matcher_Save__c WHERE OwnerId = :otherUserId];

        System.assertNotEquals(null, gameSaves);
        System.assert(!gameSaves.isEmpty());
        System.assertEquals(expectedHighScore, gameSaves[0].High_Score__c);

        System.assertNotEquals(null, otherGameSaves);
        System.assert(!otherGameSaves.isEmpty());
        System.assertEquals(otherUserHighScore, otherGameSaves[0].High_Score__c);
    }

    @isTest
    public static void test_setCurrentPlayerHighScore_success_existingRecord_currentUser() {
        Integer expectedHighScore = 5678;

        insert new Dog_Matcher_Save__c(
            OwnerId = UserInfo.getUserId(),
            High_Score__c = 0
        );

        Test.startTest();

            DogMatcherController.setCurrentPlayerHighScore(expectedHighScore);

        Test.stopTest();

        List<Dog_Matcher_Save__c> gameSaves = [SELECT High_Score__c FROM Dog_Matcher_Save__c WHERE OwnerId = :UserInfo.getUserId()];

        System.assertNotEquals(null, gameSaves);
        System.assert(!gameSaves.isEmpty());
        System.assertEquals(expectedHighScore, gameSaves[0].High_Score__c);
    }

    @isTest
    public static void test_setCurrentPlayerHighScore_failure_highScoreOutOfBounds() {
        Integer expectedHighScore = 1000000000;

        Test.startTest();

            try {
                DogMatcherController.setCurrentPlayerHighScore(expectedHighScore);

                System.assert(false, 'An exception should be thrown.');
            } catch (Exception e) {
                System.assert(e.getMessage().contains('NUMBER_OUTSIDE_VALID_RANGE'));
            }
    }
}