@isTest
public with sharing class DogTest {
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
    public static void test_GetDog_success() {
        String expectedStatus = 'success';
        String expectedMessage = 'https://www.example.com/test_dog.jpg';
        Integer expectedStatusCode = 200;

        Test.setMock(HttpCalloutMock.class, constructDogMock(expectedStatus, expectedMessage, expectedStatusCode));

        Test.startTest();

            DogService.Dog dog = null;
            try {
                dog = DogService.getDog();
            } catch (Exception e) {
                System.assert(false, 'No exceptions should be thrown.');
            }

        Test.stopTest();

        System.assertNotEquals(null, dog);
        System.assertEquals(expectedMessage, dog.imageUrl);
    }

    @isTest
    public static void test_GetDog_failure() {
        String expectedStatus = 'failure';
        String expectedMessage = 'Uh oh...';
        Integer expectedStatusCode = 404;

        Test.setMock(HttpCalloutMock.class, constructDogMock(expectedStatus, expectedMessage, expectedStatusCode));

        Test.startTest();

            try {
                DogService.Dog dog = DogService.getDog();

                System.assert(false, 'A DogException should be thrown.');
            } catch (DogService.DogException rde) {
                System.assert(rde.getMessage().contains(String.valueOf(expectedStatusCode)));
            }

        Test.stopTest();
    }
}