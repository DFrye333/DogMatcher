@isTest
public class DogStub implements System.StubProvider {
    public Object handleMethodCall(Object stubbedObject, String stubbedMethodName, Type returnType, List<Type> listOfParamTypes, List<String> listOfParamNames, List<Object> listOfArgs) {
        String requestEndpoint = ((HttpRequest)listOfArgs[0]).getEndpoint();
        Integer dogQuantity = Integer.valueOf(requestEndpoint.substringAfterLast('/'));

        System.assert(1 <= dogQuantity && dogQuantity <= 50);

        HttpResponse response = new HttpResponse();

        String responseMessage = 'https://www.example.com/test_dog.jpg';
        String responseBody = 
            '{ ' +
                '"status" : "success",' +
                '"message" : ["' + responseMessage + '"';
        
        for (Integer i = 1; i < dogQuantity; ++i) {
            responseBody += ', "' + responseMessage + '"';
        }

        responseBody += '] }';
        response.setBody(responseBody);
        response.setStatusCode(200);

        return response;
    }
}
