var app= angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http, $interval){
    $interval(function(){
      $http.get('http://localhost:8080/update').then(function(response){
        var result= response.data;
            if(document.getElementById('name').value=="")
            {
              document.getElementById('name').value= result.Name;
            }
            if(document.getElementById('age').value== "")
            {
              document.getElementById('age').value= result.Age;
            }
            if(document.getElementById('zipcode').value=="")
            {
              document.getElementById('zipcode').value= result.Zipcode; 
            }
            if(document.getElementById('gender').value=="")
            {
              document.getElementById('gender').value = result.Gender;
            }
            
            if(result.Enroll == "Enroll")
            {
              document.getElementById('enroll_button').click();
            }

      });

    },2000);
});