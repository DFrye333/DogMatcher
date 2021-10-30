@isTest
public class DogMock implements HttpCalloutMock {
    private String body;
    private Integer statusCode;

    public DogMock(String body, Integer statusCode) {
        this.body = body;
        this.statusCode = statusCode;
    }

    public HttpResponse respond(HttpRequest request) {
        HttpResponse response = new HttpResponse();
        response.setBody(this.body);
        response.setStatusCode(this.statusCode);

        return response;
    }
}