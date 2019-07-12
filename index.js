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
var pr_plan = "";
var pr_enroll = "";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'))

app.get('/update', function(req, res){
  var result={"Name":pr_name, "Age":pr_age, "Zipcode":pr_zipcode, "Gender":pr_gender,"medc_num":pr_medicare, "datea":pr_datea.slice(0,10), "dateb":pr_dateb.slice(0,10), "Plan":pr_plan, "Enroll":pr_enroll};
  
  res.send(result);

});

app.post('/', function(req, res){
    //console.log(JSON.stringify(req.body));
    var result= JSON.stringify(req.body);
    
    res.send(result);
    
});

app.post('/dialogflow', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function help_func(agent)
  {
    if (pr_name == "")
    {
      agent.add('Please provide your full name as written on your Medicare Health Insurance Card.');
    }

    else if(pr_age == null)
    {
      agent.add('M&R plans are for members who are 65 or older. Please provide your age to continue.' );
    }

    else if(pr_gender=="")
    {
      agent.add('Male/Female');
    }

    else if(pr_medicare=="")
    {
      agent.add('Medicare number is an alpha-numeric unique ID written on your Medicare Health Insurance Card. Please provide your medicare number in the format ####-XXXX');
    }

    else if(pr_datea=="" || pr_dateb=="")
    {
      agent.add('It is mandatory to have PART A and Part B plan before enrolling in a Medicare Advantage Plan. You can check for their effective dates on your Medicare Health Insurance Card.');
    }

    else if(pr_zipcode==null)
    {
      agent.add('Please provide your current zipcode to continue.')
    }

    else if(pr_plan==null)
    {
      agent.add('Select a plan from the available list of plans.')
    }

    else if(pr_enroll=="")
    {
      agent.add('Do you want to enroll in the chosen plan ?')
    }
    
  }

  function welcome () {
    agent.add('Hi! I will assist you in enrolling for the medicare advantage plan. \n Let\'s start by introducing ourselves. I am Krista ! What\'s your good name ?')
  }

  function fall_func(agent)
  {
    //check_next();
    
    agent.add('Sorry I missed that ! Can you please repeat ??');
  }

  function name_fun (agent)
  {
      var person_name = agent.parameters["given-name"] + ' ' + agent.parameters["last-name"];
      pr_name = person_name;
      //console.log('Name : ' + person_name);
      const person_age = agent.parameters["age"];
      //console.log(person_age)
      if(!person_age){
        agent.add('Hi ' + agent.parameters["given-name"] + '. What is your age ?');
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
    agent.add('What is your Medicare Number (Format : ####-XXXX)?');
  }

  function medicare_func(agent)
  {
    var person_medicare = agent.parameters["custom-medicare"];
    pr_medicare = person_medicare;
    agent.add('What is the PART A effective date ?');
  }

  function date_func(agent)
  {
    if (pr_datea == "")
    {
      person_date = agent.parameters["date"];
      pr_datea = person_date;
      agent.add('What is the PART B effective date ?');
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
      agent.add('The following plans are available for the zipcode ' + person_zip + '. \nChoose from the available plans.')
  }

  function plan_func(agent)
  {
    var person_plan = agent.parameters["custom-plan"];
    pr_plan = person_plan;
    console.log(pr_plan);
    agent.add('Do you want to submit the application?');
  }

  function enroll_func(agent)
  {
    var person_enroll = agent.parameters["custom-enroll"];
    
    if (pr_name == "")
    {
      agent.add('Please provide your full name as written on your Medicare Health Insurance Card.');
    }

    else if(pr_age == null)
    {
      agent.add('M&R plans are for members who are 65 or older. Please provide your age to continue.' );
    }

    else if(pr_gender=="")
    {
      agent.add('Male/Female');
    }

    else if(pr_medicare=="")
    {
      agent.add('Medicare number is an alpha-numeric unique ID written on your Medicare Health Insurance Card. Please provide your medicare number in the format ####-XXXX');
    }

    else if(pr_datea=="" || pr_dateb=="")
    {
      agent.add('It is mandatory to have PART A and Part B plan before enrolling in a Medicare Advantage Plan. You can check for their effective dates on your Medicare Health Insurance Card.');
    }

    else if(pr_zipcode==null)
    {
      agent.add('Please provide your current zipcode to continue.')
    }

    else if(pr_plan==null)
    {
      agent.add('Select a plan from the available list of plans.')
    }
    else
    {
      pr_enroll = person_enroll;
      if (person_enroll=="Enroll" || person_enroll=="Submit")
      {
        agent.add('Congrats !');
      }
      else{
        agent.add('Your feedback is valuable to us. Contact customer care for any help.');
      }
    }

  }

  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fall_func);
  intentMap.set('Name_Intent', name_fun);
  intentMap.set('Age_Intent', age_fun);
  intentMap.set('Zipcode_Intent', zip_func)
  intentMap.set('Gender_Intent', gender_func);
  intentMap.set('Enroll_Intent', enroll_func);
  intentMap.set('Medicare_Number_Intent', medicare_func);
  intentMap.set('Date_Intent', date_func);
  intentMap.set('Select_Plan_Intent', plan_func);
  intentMap.set('Help_Intent', help_func);
  agent.handleRequest(intentMap)
})








app.listen(process.env.PORT || 8080)