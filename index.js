const express = require('express');
const bodyParser = require('body-parser');
const { WebhookClient } = require('dialogflow-fulfillment');
const app = express();

var pr_name = "";
var pr_age = null;
var pr_gender = "";
var pr_zipcode = null;
var pr_medicare = "";
var pr_datea = "";
var pr_dateb = "";
var pr_enroll = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/update', function(req, res){
  var result={"Name":pr_name, "Age":pr_age, "Zipcode":pr_zipcode, "Gender":pr_gender,"medc_num":pr_medicare, "datea":pr_datea.slice(0,10), "dateb":pr_dateb.slice(0,10),"Enroll":pr_enroll};
  
  res.send(result);

});

app.post('/', function(req, res){
    //console.log(JSON.stringify(req.body));
    var result= JSON.stringify(req.body);
    
    res.send(result);
    
});

app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function welcome () {
    agent.add('Hi, WWhat is your name?')
  }

  function name_fun (agent)
  {
      var person_name = agent.parameters["given-name"];
      pr_name = person_name;
      //console.log('Name : ' + person_name);
      const person_age = agent.parameters["age"];
      //console.log(person_age)
      if(!person_age){
        agent.add('Hi ' + person_name + '. What is your age ?');
      }
      else{
        agent.add('Hi ' + person_name + '.');
      }
  }

  function age_fun (agent)
  {
      const person_age = (agent.parameters["age"]).amount;
      pr_age = person_age;
      //console.log('Age : '+ person_age)
      const person_gender = agent.parameters["custom-gender"];
      //console.log(person_age)
      if(person_age<65)
      {
        agent.add('You are not eligible for enrolling in this plan');
      }
      else{
        if(!person_gender)
        {
            agent.add('You are eligible for enrolling in this plan. What is your gender ?');
        }
        else{
            agent.add('You are eligible for enrolling in this plan');
        }       
      }
  }

  function gender_func(agent)
  {
    var person_gender = agent.parameters["custom-gender"];
    pr_gender = person_gender;
    agent.add('What is your Medicare Number ?')
  }

  function medicare_func(agent)
  {
    var person_medicare = agent.parameters["custom-medicare"];
    pr_medicare = person_medicare;
    agent.add('What is PART A effective date ?');
  }

  function date_func(agent)
  {
    if (pr_datea == "")
    {
      person_date = agent.parameters["date"];
      pr_datea = person_date;
      agent.add('What is PART B effective date ?');
    }
    else
    {
      person_date = agent.parameters["date"];
      pr_dateb = person_date;
      agent.add('What is the Zip Code of your place of residence ?');

    }
  }

  function zip_func(agent)
  {
      const person_zip = agent.parameters["zip-code"];
      pr_zipcode = person_zip;
      //console.log('Zip Code : '+person_zip);
      agent.add('The following plans are available for the zipcode ' + person_zip + '. Enroll after choosing the plan of your choice. Thank you for choosing UnitedHealth Care.')
  }

  function enroll_func(agent)
  {
    var person_enroll = agent.parameters["custom-enroll"];
    pr_enroll = person_enroll;

    
    if (person_enroll=="Enroll" || person_enroll=="Submit")
    {
      agent.add('Congrats !');
    }
    else{
      agent.add('Your feedback is valuable to us. Contact customer care for any help.');
    }
  }

  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Name_Intent', name_fun);
  intentMap.set('Age_Intent', age_fun);
  intentMap.set('Zipcode_Intent', zip_func)
  intentMap.set('Gender_Intent', gender_func);
  intentMap.set('Enroll_Intent', enroll_func);
  intentMap.set('Medicare_Number_Intent', medicare_func);
  intentMap.set('Date_Intent', date_func);
  agent.handleRequest(intentMap)
})


app.listen(process.env.PORT || 8080)