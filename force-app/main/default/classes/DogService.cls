public without sharing class DogService {
    public static final Integer DOG_API_RANDOM_MIN = 1;
    public static final Integer DOG_API_RANDOM_MAX = 50;

    private static final Integer HTTP_STATUS_CODE_OK = 200;

    public static Dog getDog() {
        List<Dog> dogs = getDogs(1);
        return (dogs != null && !dogs.isEmpty()) ? dogs[0] : null;
    }

    public static List<Dog> getDogs(Integer quantity) {
        if (quantity < DOG_API_RANDOM_MIN) {
            quantity = DOG_API_RANDOM_MIN;
        } else if (quantity > DOG_API_RANDOM_MAX) {
            quantity = DOG_API_RANDOM_MAX;
        }

        HttpRequest httpRequest = new HttpRequest();
        httpRequest.setHeader('Accept', 'application/json');
        httpRequest.setTimeout(120 * 1000);
        httpRequest.setMethod('GET');
        httpRequest.setEndpoint('https://dog.ceo/api/breeds/image/random/' + quantity);

        HttpResponse httpResponse = (new Http()).send(httpRequest);
        String body = httpResponse.getBody();
        Integer statusCode = httpResponse.getStatusCode();

        if (statusCode == HTTP_STATUS_CODE_OK) {
            List<Dog> dogs = new List<Dog>();

            Map<String, Object> dogsResponse = (Map<String, Object>)JSON.deserializeUntyped(body);
            String status = (String)dogsResponse.get('status');
            for (Object dogMessage : (List<Object>)dogsResponse.get('message')) {
                dogs.add(new Dog(String.valueOf(dogMessage)));
            }

            return dogs;
        } else {
            throw new DogException('Failed to access the API! Status: ' + statusCode);
        }

    }

    public class Dog {
        public String imageUrl {get;set;}

        public Dog(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    public class DogException extends Exception {}
}